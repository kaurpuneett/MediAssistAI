
import os
import re
import json
import hmac
import hashlib
import secrets
import smtplib
import mysql.connector

from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq


# =====================================================
# CONFIGURATION
# =====================================================

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv(
    "FLASK_SECRET_KEY",
    "mediassist-development-key"
)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ]
        }
    }
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "openai/gpt-oss-120b"

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


# =====================================================
# DATABASE CONNECTION
# =====================================================

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT", 3306))
    )


# =====================================================
# OTP FUNCTIONS
# =====================================================

def hash_otp(otp):
    secret = os.getenv(
        "FLASK_SECRET_KEY",
        "mediassist-development-key"
    )

    return hmac.new(
        secret.encode(),
        otp.encode(),
        hashlib.sha256
    ).hexdigest()


def send_email_otp(email, otp):
    mail_username = os.getenv("MAIL_USERNAME")
    mail_password = os.getenv("MAIL_PASSWORD")
    mail_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    mail_port = int(os.getenv("MAIL_PORT", 587))

    if not mail_username or not mail_password:
        raise ValueError("Email credentials are missing")

    message = MIMEMultipart()
    message["From"] = mail_username
    message["To"] = email
    message["Subject"] = "MediAssist AI Verification Code"

    body = f"""
Hello,

Your MediAssist AI verification code is:

{otp}

This code expires in 5 minutes.

MediAssist AI Team
"""

    message.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(mail_server, mail_port) as server:
        server.starttls()
        server.login(mail_username, mail_password)
        server.send_message(message)


# =====================================================
# HOME
# =====================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "success",
        "message": "MediAssist AI Backend is running"
    })


# =====================================================
# DATABASE TEST
# =====================================================

@app.route("/api/db-test", methods=["GET"])
def db_test():
    try:
        connection = get_db_connection()
        connection.close()

        return jsonify({
            "status": "success",
            "message": "Database connected successfully"
        })

    except Exception as e:
        print("DATABASE ERROR:", str(e))

        return jsonify({
            "status": "error",
            "message": "Database connection failed"
        }), 500


# =====================================================
# SEND OTP
# =====================================================

@app.route("/api/send-otp", methods=["POST"])
def send_otp():
    connection = None
    cursor = None

    try:
        data = request.get_json(silent=True) or {}
        email = data.get("email", "").strip().lower()

        if not email or not re.match(
            r"^[\w.+-]+@[\w-]+\.[\w.-]+$",
            email
        ):
            return jsonify({
                "status": "error",
                "message": "Please enter a valid email address"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT created_at
            FROM email_otps
            WHERE email = %s
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (email,)
        )

        previous_otp = cursor.fetchone()

        if previous_otp:
            if (
                datetime.now() - previous_otp["created_at"]
                < timedelta(seconds=60)
            ):
                return jsonify({
                    "status": "error",
                    "message": "Please wait 60 seconds before requesting another OTP"
                }), 429

        otp = str(secrets.randbelow(900000) + 100000)
        otp_hash = hash_otp(otp)
        expires_at = datetime.now() + timedelta(minutes=5)

        cursor.execute(
            """
            INSERT INTO email_otps
            (email, otp_hash, expires_at, attempts, created_at)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                email,
                otp_hash,
                expires_at,
                0,
                datetime.now()
            )
        )

        connection.commit()

        send_email_otp(email, otp)

        return jsonify({
            "status": "success",
            "message": "OTP sent successfully"
        })

    except Exception as e:
        if connection:
            connection.rollback()

        print("SEND OTP ERROR:", str(e))

        return jsonify({
            "status": "error",
            "message": "Unable to send OTP. Please try again."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =====================================================
# VERIFY OTP
# =====================================================

@app.route("/api/verify-otp", methods=["POST"])
def verify_otp():
    connection = None
    cursor = None

    try:
        data = request.get_json(silent=True) or {}

        email = data.get("email", "").strip().lower()
        otp = str(data.get("otp", "")).strip()

        if not email or not otp:
            return jsonify({
                "status": "error",
                "message": "Email and OTP are required"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, otp_hash, expires_at, attempts
            FROM email_otps
            WHERE email = %s
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (email,)
        )

        record = cursor.fetchone()

        if not record:
            return jsonify({
                "status": "error",
                "message": "OTP not found"
            }), 404

        if record["expires_at"] < datetime.now():
            return jsonify({
                "status": "error",
                "message": "OTP has expired"
            }), 400

        if record["attempts"] >= 5:
            return jsonify({
                "status": "error",
                "message": "Too many attempts. Request a new OTP."
            }), 429

        if not hmac.compare_digest(
            record["otp_hash"],
            hash_otp(otp)
        ):
            cursor.execute(
                """
                UPDATE email_otps
                SET attempts = attempts + 1
                WHERE id = %s
                """,
                (record["id"],)
            )

            connection.commit()

            return jsonify({
                "status": "error",
                "message": "Incorrect OTP"
            }), 400

        cursor.execute(
            """
            INSERT INTO users (email, is_verified)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE is_verified = %s
            """,
            (email, 1, 1)
        )

        cursor.execute(
            "DELETE FROM email_otps WHERE email = %s",
            (email,)
        )

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Email verified successfully",
            "user": {"email": email}
        })

    except Exception as e:
        if connection:
            connection.rollback()

        print("VERIFY OTP ERROR:", str(e))

        return jsonify({
            "status": "error",
            "message": "Unable to verify OTP"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =====================================================
# AI ASSISTANT
# =====================================================

@app.route("/api/ai-chat", methods=["POST"])
def ai_chat():
    try:
        if not client:
            return jsonify({
                "status": "error",
                "message": "Groq API key is missing"
            }), 500

        data = request.get_json(silent=True) or {}
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({
                "status": "error",
                "message": "Please enter a message"
            }), 400

        emergency_phrases = [
            "chest pain",
            "can't breathe",
            "cannot breathe",
            "difficulty breathing",
            "unconscious",
            "severe bleeding",
            "suicidal",
            "overdose"
        ]

        if any(
            phrase in user_message.lower()
            for phrase in emergency_phrases
        ):
            return jsonify({
                "status": "success",
                "reply": (
                    "Your symptoms may require urgent medical attention. "
                    "Please contact emergency services immediately. "
                    "In India, call 112 or visit the nearest emergency department. "
                    "Do not rely on an AI chatbot for emergencies."
                )
            })

        system_prompt = """
You are MediAssist AI, a health education assistant.

Explain health topics in simple language.
Provide general health information and safe self-care suggestions.
Never claim to diagnose diseases.
Never prescribe medication.
Mention warning signs that require medical attention.
Encourage users to consult qualified healthcare professionals.

You are an educational assistant, not a doctor.
"""

        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            temperature=0.4,
            max_tokens=650
        )

        reply = completion.choices[0].message.content

        return jsonify({
            "status": "success",
            "reply": reply
        })

    except Exception as e:
        print("AI CHAT ERROR:", str(e))

        return jsonify({
            "status": "error",
            "message": "AI assistant is temporarily unavailable"
        }), 500


# =====================================================
# HELPER: EXTRACT JSON FROM AI RESPONSE
# =====================================================

def extract_json(text):
    if not text:
        raise ValueError("AI returned an empty response")

    text = text.strip()

    # Remove Markdown code fences
    text = re.sub(
        r"^```(?:json)?\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(r"\s*```$", "", text)

    # Find the JSON object in the response
    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in AI response")

    json_text = text[start:end + 1]

    return json.loads(json_text)


# =====================================================
# AI DIET PLAN GENERATOR
# =====================================================

@app.route("/api/generate-diet-plan", methods=["POST"])
def generate_diet_plan():
    try:
        if not client:
            return jsonify({
                "status": "error",
                "message": "Groq API key is missing in .env"
            }), 500

        data = request.get_json(silent=True) or {}

        age = data.get("age")
        goal = data.get("goal", "").strip()
        diet = data.get("diet", "").strip()
        activity = data.get("activity", "").strip()
        cuisine = data.get("cuisine", "").strip()
        meals = data.get("meals", "").strip()
        allergies = data.get("allergies", "None").strip()
        medical_conditions = data.get(
            "medical_conditions",
            "None"
        ).strip()

        try:
            age = int(age)
        except (ValueError, TypeError):
            return jsonify({
                "status": "error",
                "message": "Please enter a valid age"
            }), 400

        if age < 13 or age > 100:
            return jsonify({
                "status": "error",
                "message": "Age must be between 13 and 100"
            }), 400

        valid_goals = [
            "Weight management",
            "Muscle gain",
            "Healthy eating",
            "Weight maintenance"
        ]

        valid_diets = [
            "Vegetarian",
            "Vegan",
            "Eggetarian",
            "Non-vegetarian"
        ]

        valid_activity = [
            "Sedentary",
            "Lightly active",
            "Moderately active",
            "Very active"
        ]

        valid_cuisine = [
            "Indian",
            "Continental",
            "Mixed"
        ]

        valid_meals = [
            "3 meals",
            "3 meals + 1 snack",
            "3 meals + 2 snacks"
        ]

        if goal not in valid_goals:
            return jsonify({
                "status": "error",
                "message": "Select a valid goal"
            }), 400

        if diet not in valid_diets:
            return jsonify({
                "status": "error",
                "message": "Select a valid diet preference"
            }), 400

        if activity not in valid_activity:
            return jsonify({
                "status": "error",
                "message": "Select a valid activity level"
            }), 400

        if cuisine not in valid_cuisine:
            return jsonify({
                "status": "error",
                "message": "Select a valid cuisine"
            }), 400

        if meals not in valid_meals:
            return jsonify({
                "status": "error",
                "message": "Select a valid meal frequency"
            }), 400

        if age < 18 and goal == "Weight management":
            return jsonify({
                "status": "error",
                "message": (
                    "For users under 18, weight-loss planning "
                    "should be guided by a qualified healthcare "
                    "professional. Select Healthy eating instead."
                )
            }), 400

        medical_keywords = [
            "diabetes",
            "kidney",
            "renal",
            "heart disease",
            "heart failure",
            "liver disease",
            "pregnancy",
            "pregnant",
            "eating disorder",
            "coeliac",
            "celiac"
        ]

        if any(
            keyword in medical_conditions.lower()
            for keyword in medical_keywords
        ):
            return jsonify({
                "status": "error",
                "message": (
                    "This condition may require an individually "
                    "supervised diet. Please consult a registered "
                    "dietitian or healthcare professional."
                )
            }), 400

        prompt = f"""
Create a balanced 7-day general wellness meal plan.

USER DETAILS:
Age: {age}
Goal: {goal}
Diet preference: {diet}
Activity level: {activity}
Cuisine: {cuisine}
Meal frequency: {meals}
Allergies and food restrictions: {allergies}
Medical conditions: {medical_conditions}

INSTRUCTIONS:
1. Generate exactly 7 days.
2. Include breakfast, lunch and dinner every day.
3. Include snacks according to the selected meal frequency.
4. Respect the user's diet and food restrictions.
5. Include realistic portions and household measurements.
6. Include approximate calories, protein, carbohydrates and fat per meal.
7. Use practical, affordable ingredients.
8. Include a grocery list grouped by category.
9. Include useful general nutrition tips.
10. Do not recommend extreme calorie restriction.
11. Do not claim the plan treats medical conditions.
12. Do not invent precise nutritional requirements.

RETURN ONLY A VALID JSON OBJECT.
No Markdown. No introductory text.

Follow this structure:

{{
  "plan_title": "7-Day Meal Plan",
  "summary": "Short plan summary",
  "days": [
    {{
      "day": "Day 1",
      "meals": [
        {{
          "meal_type": "Breakfast",
          "name": "Meal name",
          "description": "Meal description",
          "portion": "Portion size",
          "nutrition_estimate": {{
            "calories": 350,
            "protein_g": 15,
            "carbs_g": 45,
            "fat_g": 12
          }}
        }}
      ]
    }}
  ],
  "grocery_list": [
    {{
      "category": "Vegetables",
      "items": ["Item 1", "Item 2"]
    }}
  ],
  "general_tips": [
    "Tip 1",
    "Tip 2"
  ],
  "disclaimer": "General wellness disclaimer"
}}

The days array must contain exactly 7 objects.
"""

        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a careful nutrition meal-planning "
                        "assistant. Return a valid JSON object only. "
                        "Never give medical treatment or extreme dieting advice."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=6000
        )

        ai_response = completion.choices[0].message.content

        # Print response for debugging in Backend CMD
        print("\n========== GROQ DIET RESPONSE ==========")
        print(repr(ai_response))
        print("========================================\n")

        diet_plan = extract_json(ai_response)

        # Validate the generated plan
        if not isinstance(diet_plan, dict):
            raise ValueError("AI response is not a JSON object")

        days = diet_plan.get("days")

        if not isinstance(days, list) or len(days) != 7:
            raise ValueError("AI did not generate exactly 7 days")

        for day in days:
            if not isinstance(day, dict):
                raise ValueError("Invalid day format")

            if not isinstance(day.get("meals"), list):
                raise ValueError("Meals are missing for a day")

        if not isinstance(diet_plan.get("grocery_list"), list):
            raise ValueError("Grocery list is missing")

        if not isinstance(diet_plan.get("general_tips"), list):
            diet_plan["general_tips"] = []

        if not diet_plan.get("disclaimer"):
            diet_plan["disclaimer"] = (
                "This is general nutrition information, not "
                "individualised medical dietary advice."
            )

        return jsonify({
            "status": "success",
            "message": "Your 7-day diet plan has been generated!",
            "plan": diet_plan
        })

    except json.JSONDecodeError as e:
        print("DIET JSON ERROR:", str(e))

        return jsonify({
            "status": "error",
            "message": (
                "The AI returned an invalid or incomplete JSON response. "
                "Please try again."
            )
        }), 500

    except Exception as e:
        print("DIET PLAN ERROR:", str(e))

        return jsonify({
            "status": "error",
            "message": (
                "Unable to generate your diet plan right now. "
                "Please try again."
            )
        }), 500


# =====================================================
# START SERVER
# =====================================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=False,
        use_reloader=False
    )
