
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import "./App.css";
import Welcome from "./Welcome";
import Login from "./Login";

// ========================================
// HEALTH LIBRARY DATA
// ========================================

const healthCategories = [
  { name: "All", icon: "🌿" },
  { name: "Nutrition", icon: "🥗" },
  { name: "Sleep", icon: "🌙" },
  { name: "Wellness", icon: "🧘" },
  { name: "Fitness", icon: "🏃" },
  { name: "Mental Health", icon: "🧠" },
  { name: "Preventive Healthcare", icon: "🩺" }
];

const healthArticles = [
  {
    id: 1,
    category: "Nutrition",
    icon: "🥗",
    title: "Building a Balanced Plate",
    readTime: "4 min read",
    description: "Understand how to create balanced and nourishing meals.",
    content: `
## What is a balanced plate?

A balanced plate includes a variety of foods that provide energy and essential nutrients.

### What should your plate include?

- **Vegetables and fruits:** Add variety and colour to your meals.
- **Whole grains:** Foods such as oats, whole wheat and brown rice provide fibre.
- **Protein:** Include dal, beans, paneer, eggs, fish or other protein sources.
- **Healthy fats:** Nuts, seeds and suitable cooking oils can be part of a balanced diet.

### Simple healthy habits

1. Try to include different coloured vegetables.
2. Drink water regularly.
3. Eat a variety of foods instead of relying on just one food group.
4. Pay attention to hunger and fullness.

**Remember:** Nutritional needs vary from person to person. There is no single perfect plate for everyone.
`
  },
  {
    id: 2,
    category: "Sleep",
    icon: "🌙",
    title: "How to Improve Your Sleep Quality",
    readTime: "5 min read",
    description: "Learn simple habits that can support a healthier sleep routine.",
    content: `
## Why does sleep matter?

Sleep supports physical recovery, memory, concentration and everyday functioning.

### Habits for better sleep

- Maintain a consistent sleep and wake-up time.
- Keep your bedroom quiet, comfortable and dark.
- Reduce screen use before bedtime.
- Avoid heavy meals close to bedtime if they disturb your sleep.
- Create a relaxing bedtime routine.

### How much sleep do you need?

Most adults need around 7–9 hours of sleep per night. Individual needs can vary.

**Remember:** Persistent sleep difficulties deserve attention from a healthcare professional.
`
  },
  {
    id: 3,
    category: "Wellness",
    icon: "🧘",
    title: "Small Daily Habits for Better Wellbeing",
    readTime: "4 min read",
    description: "Build realistic habits that support your everyday wellbeing.",
    content: `
## What does wellbeing mean?

Wellbeing includes physical, emotional and social aspects of everyday life.

### Five habits to try

1. Start your day with a simple routine.
2. Take short breaks during long periods of work or study.
3. Spend some time outdoors when possible.
4. Stay connected with people you trust.
5. Make time for activities you enjoy.

### Keep it realistic

You do not need to change your entire lifestyle overnight. Small, consistent habits can be easier to maintain.

**Remember:** Self-care is not a replacement for professional support when you need it.
`
  },
  {
    id: 4,
    category: "Fitness",
    icon: "🏃",
    title: "Getting Started with Physical Activity",
    readTime: "5 min read",
    description: "Explore simple ways to add movement to your daily routine.",
    content: `
## Why is physical activity important?

Regular movement can support cardiovascular health, strength, mobility, mood and general wellbeing.

### Beginner-friendly activities

- Walking
- Gentle stretching
- Cycling
- Dancing
- Beginner strength exercises

### Build a routine

1. Start at a comfortable level.
2. Increase activity gradually.
3. Include rest and recovery.
4. Choose activities you enjoy.
5. Pay attention to pain, dizziness or unusual breathlessness.

### General guideline

Adults are generally advised to aim for 150–300 minutes of moderate-intensity aerobic activity per week, alongside muscle-strengthening activities on at least two days, when appropriate.

**Remember:** Adapt activity to your abilities and health needs.
`
  },
  {
    id: 5,
    category: "Mental Health",
    icon: "🧠",
    title: "Understanding Stress and Emotional Wellbeing",
    readTime: "5 min read",
    description: "Understand everyday stress and explore supportive coping habits.",
    content: `
## What is stress?

Stress is the body's response to challenging or demanding situations. Some stress is temporary, but ongoing stress can affect wellbeing.

### Common ways to manage everyday stress

- Try slow, comfortable breathing.
- Break large tasks into smaller steps.
- Take short breaks.
- Maintain social connections.
- Make time for activities that help you relax.

### When should you seek help?

Consider speaking with a qualified mental health professional if distress is persistent, overwhelming or affecting daily life.

If you feel at risk of harming yourself, seek immediate support from local emergency services or a trusted person.

**Remember:** Asking for support is a healthy step, not a weakness.
`
  },
  {
    id: 6,
    category: "Preventive Healthcare",
    icon: "🩺",
    title: "Why Regular Health Checkups Matter",
    readTime: "4 min read",
    description: "Learn how preventive care can help you stay informed about your health.",
    content: `
## What is preventive healthcare?

Preventive healthcare focuses on reducing health risks and identifying potential concerns early.

### Useful preventive habits

- Attend health checkups appropriate for your age and health history.
- Keep recommended vaccinations up to date.
- Follow dental and eye-care recommendations.
- Discuss family health history with your healthcare professional.
- Seek advice when new or persistent symptoms appear.

### Prepare for an appointment

1. Write down your concerns.
2. List medicines and supplements you take.
3. Bring relevant medical reports.
4. Ask questions if something is unclear.

**Remember:** The right screening schedule depends on your age, health history and individual risk factors. Your healthcare professional can guide you.
`
  }
];

const dailyHealthTips = [
  "Add a variety of fruits and vegetables to your meals today.",
  "Take a short movement break during long study or work sessions.",
  "Try keeping a consistent bedtime tonight.",
  "Make time for a relaxing activity you enjoy.",
  "Keep a water bottle nearby and drink regularly.",
  "Take a moment to check in with how you are feeling.",
  "Include a source of protein in your meals."
];

// ========================================
// MAIN APP
// ========================================

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mediassistCurrentUser")) || null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("Overview");

  // AI ASSISTANT STATES
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm MediAssist AI. How can I help you today?"
    }
  ]);

  // SYMPTOM CHECKER STATES
  const [symptomText, setSymptomText] = useState("");
  const [symptomDuration, setSymptomDuration] = useState("");
  const [symptomSeverity, setSymptomSeverity] = useState("Mild");
  const [symptomResult, setSymptomResult] = useState("");
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomError, setSymptomError] = useState("");

  // AI DIET PLANNER STATES
  const [dietForm, setDietForm] = useState({
    age: "",
    goal: "Healthy eating",
    diet: "Vegetarian",
    activity: "Moderately active",
    cuisine: "Indian",
    meals: "3 meals + 1 snack",
    allergies: "",
    medical_conditions: ""
  });

  const [dietPlan, setDietPlan] = useState(null);
  const [dietLoading, setDietLoading] = useState(false);
  const [dietError, setDietError] = useState("");
  const [selectedDay, setSelectedDay] = useState(0);

  // LEFTOVER RECIPE ASSISTANT STATES
  const [lunchboxOpen, setLunchboxOpen] = useState(false);
  const [leftoverIngredients, setLeftoverIngredients] = useState("");
  const [leftoverCuisine, setLeftoverCuisine] = useState("Indian");
  const [leftoverMealType, setLeftoverMealType] = useState("Any meal");
  const [leftoverServings, setLeftoverServings] = useState("2");
  const [leftoverRecipes, setLeftoverRecipes] = useState("");
  const [leftoverLoading, setLeftoverLoading] = useState(false);
  const [leftoverError, setLeftoverError] = useState("");

  // HEALTH LIBRARY STATES
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryCategory, setLibraryCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const [savedArticles, setSavedArticles] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("mediassistSavedArticles")
      ) || [];
    } catch {
      return [];
    }
  });

  const [articleExplanation, setArticleExplanation] = useState("");
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const displayName =
    currentUser?.name ||
    currentUser?.email?.split("@")[0] ||
    "User";

  // ========================================
  // LOGIN
  // ========================================

  const handleLogin = (user) => {
    localStorage.setItem(
      "mediassistCurrentUser",
      JSON.stringify(user)
    );
    setCurrentUser(user);
  };

  // ========================================
  // RESET LEFTOVER RECIPE ASSISTANT
  // ========================================

  const resetLeftoverRecipes = () => {
    setLeftoverIngredients("");
    setLeftoverCuisine("Indian");
    setLeftoverMealType("Any meal");
    setLeftoverServings("2");
    setLeftoverRecipes("");
    setLeftoverError("");
  };

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem("mediassistCurrentUser");

    setCurrentUser(null);
    setShowWelcome(true);
    setActiveTab("Overview");
    setMessage("");
    setIsLoading(false);

    setMessages([
      {
        sender: "bot",
        text: "Hello! I'm MediAssist AI. How can I help you today?"
      }
    ]);

    setSymptomText("");
    setSymptomDuration("");
    setSymptomSeverity("Mild");
    setSymptomResult("");
    setSymptomError("");
    setSymptomLoading(false);

    setDietPlan(null);
    setDietError("");
    setDietLoading(false);
    setSelectedDay(0);

    setDietForm({
      age: "",
      goal: "Healthy eating",
      diet: "Vegetarian",
      activity: "Moderately active",
      cuisine: "Indian",
      meals: "3 meals + 1 snack",
      allergies: "",
      medical_conditions: ""
    });

    resetLeftoverRecipes();
    setLunchboxOpen(false);

    setSelectedArticle(null);
    setArticleExplanation("");
    setExplanationError("");
    setLibrarySearch("");
    setLibraryCategory("All");
    setShowSavedOnly(false);
  };

  // ========================================
  // AI ASSISTANT CHAT
  // ========================================

  const sendMessage = async () => {
    const userMessage = message.trim();

    if (!userMessage || isLoading) return;

    setMessages((previous) => [
      ...previous,
      { sender: "user", text: userMessage }
    ]);

    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/ai-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage })
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Unable to get an AI response.");
      }

      setMessages((previous) => [
        ...previous,
        { sender: "bot", text: data.reply }
      ]);
    } catch (error) {
      console.error("AI Assistant Error:", error);

      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: "I'm sorry, I couldn't connect to the AI service right now. Please check that the MediAssist backend is running and try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // SYMPTOM CHECKER
  // ========================================

  const checkSymptoms = async () => {
    if (!symptomText.trim() || !symptomDuration.trim()) {
      setSymptomError("Please enter your symptoms and their duration.");
      return;
    }

    if (symptomLoading) return;

    setSymptomLoading(true);
    setSymptomError("");
    setSymptomResult("");

    const prompt = `
You are MediAssist AI, an educational health information assistant.

Symptoms: ${symptomText}
Duration: ${symptomDuration}
Severity: ${symptomSeverity}

Provide an educational response using these sections:

**Your Health Insights**

**1. Understanding the symptoms**
Explain what the reported symptoms may indicate.

**2. Possible common explanations**
Mention possible common causes without claiming a diagnosis.

**3. Safe self-care**
Suggest general and safe supportive care where appropriate.

**4. When to consult a doctor**
Explain when professional medical advice is recommended.

**5. Warning signs**
Mention symptoms that require urgent medical attention.

IMPORTANT:
- Do not provide a definitive diagnosis.
- Do not prescribe medicines or dosages.
- Do not assume the user's age or medical history.
- Do not falsely reassure the user.
- Use simple, understandable language.
- Use proper Markdown headings and bullet points.
- Make it clear that this is educational information, not a substitute for a qualified healthcare professional.
`;

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/ai-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt })
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Unable to analyze symptoms.");
      }

      setSymptomResult(data.reply);
    } catch (error) {
      console.error("Symptom Checker Error:", error);

      setSymptomError(
        "Unable to connect to MediAssist AI. Please check your connection and try again."
      );
    } finally {
      setSymptomLoading(false);
    }
  };

  const resetSymptomChecker = () => {
    setSymptomText("");
    setSymptomDuration("");
    setSymptomSeverity("Mild");
    setSymptomResult("");
    setSymptomError("");
  };

  // ========================================
  // DIET PLANNER
  // ========================================

  const updateDietField = (event) => {
    const { name, value } = event.target;

    setDietForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const generateDietPlan = async (event) => {
    event.preventDefault();

    if (
      !dietForm.age ||
      Number(dietForm.age) < 13 ||
      Number(dietForm.age) > 100
    ) {
      setDietError("Please enter a valid age between 13 and 100.");
      return;
    }

    if (dietLoading) return;

    setDietLoading(true);
    setDietError("");
    setDietPlan(null);
    setSelectedDay(0);

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/generate-diet-plan",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...dietForm,
            age: Number(dietForm.age),
            allergies: dietForm.allergies.trim() || "None",
            medical_conditions:
              dietForm.medical_conditions.trim() || "None"
          })
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(
          data.message || "Unable to generate your diet plan."
        );
      }

      if (!data.plan || !Array.isArray(data.plan.days)) {
        throw new Error("The AI returned an incomplete diet plan. Please try again.");
      }

      if (data.plan.days.length !== 7) {
        throw new Error("The AI did not return all seven days. Please try again.");
      }

      setDietPlan(data.plan);
    } catch (error) {
      console.error("Diet Planner Error:", error);

      setDietError(
        error.message || "Unable to generate your diet plan. Please try again."
      );
    } finally {
      setDietLoading(false);
    }
  };

  const resetDietPlanner = () => {
    setDietPlan(null);
    setDietError("");
    setSelectedDay(0);

    setDietForm({
      age: "",
      goal: "Healthy eating",
      diet: "Vegetarian",
      activity: "Moderately active",
      cuisine: "Indian",
      meals: "3 meals + 1 snack",
      allergies: "",
      medical_conditions: ""
    });
  };

  // ========================================
  // LEFTOVER RECIPE GENERATOR
  // ========================================

  const generateLeftoverRecipes = async (event) => {
    event.preventDefault();

    if (!leftoverIngredients.trim()) {
      setLeftoverError("Please enter the ingredients you have.");
      return;
    }

    if (leftoverLoading) return;

    setLeftoverLoading(true);
    setLeftoverError("");
    setLeftoverRecipes("");

    const prompt = `
You are MediAssist AI's Leftover Recipe Assistant.

Suggest exactly 3 practical recipes using the ingredients listed below.

AVAILABLE INGREDIENTS:
${leftoverIngredients}

PREFERRED CUISINE: ${leftoverCuisine}
MEAL TYPE: ${leftoverMealType}
NUMBER OF SERVINGS: ${leftoverServings}

For EACH recipe, provide:

## Recipe name
- A short description
- Preparation time
- Cooking time
- Number of servings
- Ingredients with quantities
- Clearly identify additional ingredients the user may need
- Step-by-step cooking instructions
- Approximate calories per serving
- Approximate protein per serving
- Possible ingredient substitutions

IMPORTANT RULES:
1. Prioritize the ingredients the user already has.
2. Do not assume the user has ingredients they did not mention.
3. Keep the recipes practical and easy to prepare.
4. Adjust quantities for the requested servings.
5. Clearly label additional ingredients.
6. Nutrition values must be approximate estimates, not guarantees.
7. Never suggest using spoiled food.
8. Food safety matters: advise discarding food if storage history is uncertain or it has been left at unsafe temperatures.
9. Do not recommend tasting food to determine whether it is safe.
10. Do not make medical or therapeutic nutrition claims.
11. Use clear headings, numbered instructions and readable Markdown.
12. If the ingredients are insufficient for three different recipes, explain what additional ingredients would be needed.
`;

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/ai-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt })
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Unable to generate recipes.");
      }

      setLeftoverRecipes(data.reply);
    } catch (error) {
      console.error("Leftover Recipe Error:", error);

      setLeftoverError(
        error.message || "Unable to generate recipes. Please try again."
      );
    } finally {
      setLeftoverLoading(false);
    }
  };

  // ========================================
  // HEALTH LIBRARY FUNCTIONS
  // ========================================

  const filteredArticles = healthArticles.filter((article) => {
    const matchesCategory =
      libraryCategory === "All" ||
      article.category === libraryCategory;

    const search = librarySearch.toLowerCase().trim();

    const matchesSearch =
      article.title.toLowerCase().includes(search) ||
      article.description.toLowerCase().includes(search) ||
      article.category.toLowerCase().includes(search) ||
      article.content.toLowerCase().includes(search);

    const matchesSaved =
      !showSavedOnly || savedArticles.includes(article.id);

    return matchesCategory && matchesSearch && matchesSaved;
  });

  // SAVE OR REMOVE BOOKMARK
  const toggleArticleBookmark = (articleId) => {
    setSavedArticles((previous) => {
      const updated = previous.includes(articleId)
        ? previous.filter((id) => id !== articleId)
        : [...previous, articleId];

      localStorage.setItem(
        "mediassistSavedArticles",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  // OPEN ARTICLE
  const openHealthArticle = (article) => {
    setSelectedArticle(article);
    setArticleExplanation("");
    setExplanationError("");
  };

  // EXPLAIN ARTICLE WITH AI
  const explainHealthArticle = async () => {
    if (!selectedArticle || explanationLoading) return;

    setExplanationLoading(true);
    setArticleExplanation("");
    setExplanationError("");

    const prompt = `
You are MediAssist AI, an educational health information assistant.

Explain the following health article in simple, beginner-friendly language.

ARTICLE TITLE:
${selectedArticle.title}

ARTICLE CONTENT:
${selectedArticle.content}

Instructions:
- Explain the main ideas clearly.
- Use simple examples where helpful.
- Organize the response with headings and bullet points.
- Do not add unsupported medical claims.
- Do not diagnose, prescribe medicines or recommend dosages.
- Mention when someone should consult a qualified healthcare professional.
- Keep the explanation informative and easy to understand.
- This is educational information, not personal medical advice.
`;

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/ai-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt })
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Unable to explain this article.");
      }

      setArticleExplanation(data.reply);
    } catch (error) {
      console.error("Article Explanation Error:", error);

      setExplanationError(
        error.message || "Unable to connect to MediAssist AI."
      );
    } finally {
      setExplanationLoading(false);
    }
  };

  // ========================================
  // PDF HELPERS
  // ========================================

  const cleanPdfText = (value) => {
    return String(value ?? "")
      .replace(/[^\x20-\x7E]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const addPdfText = (doc, value, x, y, maxWidth = 175) => {
    const lines = doc.splitTextToSize(cleanPdfText(value), maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * 6;
  };

  // ========================================
  // DOWNLOAD COMPLETE SEVEN-DAY PDF
  // ========================================

  const downloadDietPDF = () => {
    if (!dietPlan) return;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const left = 17;
      const right = pageWidth - 17;
      const maxWidth = right - left;
      let y = 20;

      const addPageIfNeeded = (requiredSpace = 15) => {
        if (y + requiredSpace > pageHeight - 18) {
          doc.addPage();
          y = 20;
        }
      };

      const heading = (text, size = 15) => {
        addPageIfNeeded(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(size);
        doc.text(cleanPdfText(text), left, y);
        y += 9;
      };

      const paragraph = (text, fontSize = 10) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);

        const lines = doc.splitTextToSize(
          cleanPdfText(text),
          maxWidth
        );

        const required = lines.length * 5 + 3;
        addPageIfNeeded(required);
        doc.text(lines, left, y);
        y += required;
      };

      doc.setFillColor(244, 237, 250);
      doc.rect(0, 0, pageWidth, 48, "F");

      doc.setTextColor(91, 64, 120);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(23);
      doc.text("MediAssist AI", left, 20);

      doc.setFontSize(15);
      doc.text("Your Personalized 7-Day Diet Plan", left, 32);

      doc.setTextColor(45, 45, 55);
      y = 59;

      heading(dietPlan.plan_title || "Your Diet Plan", 16);
      paragraph(dietPlan.summary || "A meal plan prepared from your selected preferences.");

      heading("Your Preferences", 13);
      paragraph(`Age: ${dietForm.age}`);
      paragraph(`Diet: ${dietForm.diet}`);
      paragraph(`Goal: ${dietForm.goal}`);
      paragraph(`Activity: ${dietForm.activity}`);
      paragraph(`Cuisine: ${dietForm.cuisine}`);
      paragraph(`Meals: ${dietForm.meals}`);
      paragraph(`Allergies / foods to avoid: ${dietForm.allergies || "None"}`);
      paragraph(`Medical conditions disclosed: ${dietForm.medical_conditions || "None"}`);

      (dietPlan.days || []).forEach((day, index) => {
        doc.addPage();
        y = 20;

        heading(day.day || `Day ${index + 1}`, 17);

        (day.meals || []).forEach((meal) => {
          addPageIfNeeded(28);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);

          y = addPdfText(
            doc,
            `${meal.meal_type || "Meal"}: ${meal.name || "Meal"}`,
            left,
            y,
            maxWidth
          ) + 2;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);

          if (meal.description) {
            y = addPdfText(doc, meal.description, left, y, maxWidth) + 2;
          }

          if (meal.portion) {
            y = addPdfText(
              doc,
              `Portion: ${meal.portion}`,
              left,
              y,
              maxWidth
            ) + 2;
          }

          const nutrition = meal.nutrition_estimate;

          if (nutrition) {
            const details = [
              nutrition.calories != null ? `${nutrition.calories} kcal` : null,
              nutrition.protein_g != null ? `Protein: ${nutrition.protein_g}g` : null,
              nutrition.carbs_g != null ? `Carbs: ${nutrition.carbs_g}g` : null,
              nutrition.fat_g != null ? `Fat: ${nutrition.fat_g}g` : null
            ].filter(Boolean).join(" | ");

            if (details) {
              y = addPdfText(
                doc,
                `Estimated nutrition: ${details}`,
                left,
                y,
                maxWidth
              ) + 3;
            }
          }

          y += 3;
          addPageIfNeeded(5);
        });
      });

      doc.addPage();
      y = 20;
      heading("Your Complete Grocery List", 17);

      (dietPlan.grocery_list || []).forEach((group) => {
        heading(group.category || "Items", 12);

        (group.items || []).forEach((item) => {
          paragraph(`• ${item}`);
        });

        y += 3;
      });

      if (Array.isArray(dietPlan.general_tips) && dietPlan.general_tips.length) {
        heading("Helpful Nutrition Tips", 15);

        dietPlan.general_tips.forEach((tip) => {
          paragraph(`• ${tip}`);
        });
      }

      heading("Important Health Note", 14);

      paragraph(
        dietPlan.disclaimer ||
        "This AI-generated plan is general educational information, not medical or dietetic advice. Nutrition estimates are approximate."
      );

      paragraph(
        "Review all ingredients and portions, especially if you have allergies, medical conditions or specific nutritional needs. Consult a registered dietitian or qualified healthcare professional for individual guidance."
      );

      const totalPages = doc.internal.getNumberOfPages();

      for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);

        doc.text(
          `MediAssist AI | Page ${page} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 9,
          { align: "center" }
        );
      }

      doc.save("MediAssist_Complete_7_Day_Diet_Plan.pdf");
    } catch (error) {
      console.error("PDF Download Error:", error);
      setDietError("Unable to create the PDF. Please try again.");
    }
  };

  // ========================================
  // SIDEBAR MENU
  // ========================================

  const menuItems = [
    { name: "Overview", icon: "⌂" },
    { name: "AI Assistant", icon: "✧" },
    { name: "Symptom Checker", icon: "♡" },
    { name: "AI Diet Planner", icon: "🥗" },
    { name: "Health Library", icon: "▤" },
    { name: "Chat History", icon: "◷" }
  ];

  // ========================================
  // WELCOME SCREEN
  // ========================================

  if (!currentUser && showWelcome) {
    return <Welcome onGetStarted={() => setShowWelcome(false)} />;
  }

  // ========================================
  // LOGIN SCREEN
  // ========================================

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // ========================================
  // MAIN DASHBOARD
  // ========================================

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✚</div>
          <div>
            <h2>MediAssist</h2>
            <span>YOUR HEALTH COMPANION</span>
          </div>
        </div>

        <p className="menu-label">MENU</p>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={
                activeTab === item.name
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => setActiveTab(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{displayName}</strong>
              <span>Personal account</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        <header className="topbar">
          <div>
            <span className="welcome">
              WELCOME, {displayName.toUpperCase()}
            </span>
            <h1>{activeTab}</h1>
          </div>

          <div className="topbar-actions">
            <div className="status">
              <span className="status-dot"></span>
              AI Assistant Online
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* ========================================
            OVERVIEW
        ======================================== */}

        {activeTab === "Overview" && (
          <>
            <section className="hero">
              <div>
                <span className="hero-tag">
                  ✧ YOUR PERSONAL HEALTH COMPANION
                </span>

                <h2>
                  Healthcare that<br />
                  understands you.
                </h2>

                <p>
                  Explore health information, understand your symptoms
                  and take a more informed approach to your wellbeing.
                </p>

                <button
                  className="primary-btn"
                  onClick={() => setActiveTab("AI Assistant")}
                >
                  Chat with AI Assistant →
                </button>
              </div>

              <div className="hero-art">✚</div>
            </section>

            <section className="section-heading">
              <div>
                <span className="welcome">YOUR HEALTH SPACE</span>
                <h2>What would you like to explore?</h2>
              </div>
            </section>

            <section className="feature-grid">
              <div
                className="feature-card pink"
                onClick={() => setActiveTab("AI Assistant")}
              >
                <div className="feature-icon">✧</div>
                <h3>AI Health Assistant</h3>
                <p>Ask general health questions and explore reliable information.</p>
                <span>Explore assistant →</span>
              </div>

              <div
                className="feature-card purple"
                onClick={() => setActiveTab("Symptom Checker")}
              >
                <div className="feature-icon">♡</div>
                <h3>Symptom Checker</h3>
                <p>Learn about common symptoms and possible causes.</p>
                <span>Explore symptoms →</span>
              </div>

              <div
                className="feature-card green"
                onClick={() => setActiveTab("AI Diet Planner")}
              >
                <div className="feature-icon">🥗</div>
                <h3>AI Diet Planner</h3>
                <p>Generate a personalized seven-day meal plan based on your preferences.</p>
                <span>Create a meal plan →</span>
              </div>

              <div
                className="feature-card green"
                onClick={() => setActiveTab("Health Library")}
              >
                <div className="feature-icon">▤</div>
                <h3>Health Library</h3>
                <p>Discover educational articles and wellness resources.</p>
                <span>Browse library →</span>
              </div>
            </section>

            <div className="info-card">
              <span>♡</span>
              <div>
                <strong>Your health matters</strong>
                <p>
                  MediAssist AI provides educational information,
                  not a medical diagnosis.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ========================================
            AI ASSISTANT
        ======================================== */}

        {activeTab === "AI Assistant" && (
          <section className="chat-card">
            <div className="chat-heading">
              <div className="feature-icon pink-icon">✧</div>
              <div>
                <h2>MediAssist AI</h2>
                <p>Your general health information assistant</p>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender}`}
                >
                  {msg.sender === "bot" ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="message bot">
                  MediAssist AI is thinking...
                </div>
              )}
            </div>

            <div className="chat-input">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="Ask a general health question..."
                disabled={isLoading}
              />

              <button
                onClick={sendMessage}
                disabled={isLoading || !message.trim()}
              >
                {isLoading ? "Sending..." : "Send ↑"}
              </button>
            </div>

            <p className="disclaimer">
              For educational purposes only. Not a substitute for professional medical advice.
            </p>
          </section>
        )}

        {/* ========================================
            SYMPTOM CHECKER
        ======================================== */}

        {activeTab === "Symptom Checker" && (
          <section className="content-card symptom-checker">
            <h2>Understand your symptoms</h2>

            <p>
              Share what you are experiencing to receive general health information and guidance.
            </p>

            <div className="symptom-box">
              <label htmlFor="symptomText">
                Describe your symptoms
              </label>

              <textarea
                id="symptomText"
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                placeholder="For example: headache, tiredness, nausea..."
                rows={4}
                disabled={symptomLoading}
              />

              <label htmlFor="symptomDuration">
                How long have you experienced these symptoms?
              </label>

              <input
                id="symptomDuration"
                type="text"
                value={symptomDuration}
                onChange={(e) => setSymptomDuration(e.target.value)}
                placeholder="For example: 2 hours, 3 days..."
                disabled={symptomLoading}
              />

              <label htmlFor="symptomSeverity">
                How severe are your symptoms?
              </label>

              <select
                id="symptomSeverity"
                value={symptomSeverity}
                onChange={(e) => setSymptomSeverity(e.target.value)}
                disabled={symptomLoading}
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>

              {symptomError && (
                <p className="error-message" role="alert">
                  {symptomError}
                </p>
              )}

              <button
                className="primary-btn"
                onClick={checkSymptoms}
                disabled={symptomLoading}
              >
                {symptomLoading
                  ? "Analyzing symptoms..."
                  : "Check My Symptoms →"}
              </button>

              {symptomLoading && (
                <p>
                  Please wait while MediAssist AI prepares your response.
                </p>
              )}

              {symptomResult && (
                <div className="symptom-result">
                  <h3>Your Health Insights</h3>

                  <div className="symptom-result-text">
                    <ReactMarkdown>{symptomResult}</ReactMarkdown>
                  </div>

                  <button
                    className="primary-btn"
                    onClick={resetSymptomChecker}
                  >
                    Check New Symptoms
                  </button>
                </div>
              )}
            </div>

            <p className="disclaimer">
              Educational information only. This tool does not provide a medical diagnosis and cannot replace professional medical advice.
            </p>
          </section>
        )}

        {/* ========================================
            AI DIET PLANNER
        ======================================== */}

        {activeTab === "AI Diet Planner" && (
          <section className="content-card diet-planner">

            <div className="diet-intro">
              <div className="diet-intro-icon">🥗</div>

              <div>
                <span className="welcome">
                  PERSONALIZED NUTRITION
                </span>

                <h2>Your AI-powered diet planner</h2>

                <p>
                  Tell us about your lifestyle and food preferences.
                  MediAssist AI will create a seven-day meal plan for you.
                </p>
              </div>
            </div>

            {/* LEFTOVER RECIPE ASSISTANT */}

            <section className="lunchbox-section">
              <div className="lunchbox-intro">
                <span className="welcome">
                  A LITTLE KITCHEN MAGIC
                </span>

                <h2>What's inside your fridge today? 🍓</h2>

                <p>
                  Open your lunchbox and let AI turn your leftover
                  ingredients into something delicious!
                </p>
              </div>

              <div className={`lunchbox-scene ${lunchboxOpen ? "is-open" : ""}`}>
                <div className="lunchbox">
                  <div className="lunchbox-handle"></div>

                  <div className="lunchbox-lid">
                    <div className="lunchbox-lid-inner">
                      <span className="lunchbox-sticker">♡</span>
                      <span className="lunchbox-lid-title">MediMeals</span>
                      <span className="lunchbox-lid-subtitle">
                        made with love
                      </span>
                    </div>
                  </div>

                  <div className="lunchbox-base">
                    <div className="lunchbox-food">
                      <span>🥑</span>
                      <span>🍓</span>
                      <span>🥕</span>
                    </div>

                    <div className="lunchbox-base-label">
                      <span>YOUR LITTLE RECIPE BOX</span>
                      <strong>Fresh ideas inside!</strong>
                    </div>
                  </div>

                  <div className="lunchbox-clasp">♡</div>
                </div>

                {!lunchboxOpen && (
                  <div className="lunchbox-callout">
                    <span>✨</span>
                    <p>Psst... I have recipe ideas for you!</p>
                  </div>
                )}

                <button
                  type="button"
                  className="lunchbox-open-btn"
                  onClick={() => {
                    setLunchboxOpen((previous) => !previous);
                    setLeftoverError("");
                  }}
                >
                  {lunchboxOpen
                    ? "Close my lunchbox ♡"
                    : "Open my lunchbox ✨"}
                </button>
              </div>

              {lunchboxOpen && (
                <div className="lunchbox-inside">

                  <div className="lunchbox-inside-heading">
                    <span className="lunchbox-sparkle">✦</span>

                    <div>
                      <span className="welcome">
                        YOUR RECIPE WORKSHOP
                      </span>

                      <h3>Let's cook with what you have!</h3>

                      <p>
                        No need for a fancy grocery trip. Tell us what's
                        already in your kitchen.
                      </p>
                    </div>
                  </div>

                  <form
                    className="leftover-form"
                    onSubmit={generateLeftoverRecipes}
                  >
                    <div className="leftover-ingredient-field">
                      <label htmlFor="leftoverIngredients">
                        🥕 Ingredients in your kitchen
                      </label>

                      <textarea
                        id="leftoverIngredients"
                        value={leftoverIngredients}
                        onChange={(e) => setLeftoverIngredients(e.target.value)}
                        placeholder="Example: leftover rice, potatoes, onions, tomatoes, paneer, spinach..."
                        rows={4}
                        disabled={leftoverLoading}
                        required
                      />

                      <small>
                        Separate ingredients with commas. Include leftovers
                        and fresh ingredients you want to use.
                      </small>
                    </div>

                    <div className="leftover-options">

                      <div className="diet-field">
                        <label htmlFor="leftoverCuisine">
                          🌎 Cuisine
                        </label>

                        <select
                          id="leftoverCuisine"
                          value={leftoverCuisine}
                          onChange={(e) => setLeftoverCuisine(e.target.value)}
                          disabled={leftoverLoading}
                        >
                          <option value="Indian">Indian</option>
                          <option value="Continental">Continental</option>
                          <option value="Chinese">Chinese</option>
                          <option value="Italian">Italian</option>
                          <option value="Any cuisine">Surprise me!</option>
                        </select>
                      </div>

                      <div className="diet-field">
                        <label htmlFor="leftoverMealType">
                          🍽️ Meal type
                        </label>

                        <select
                          id="leftoverMealType"
                          value={leftoverMealType}
                          onChange={(e) => setLeftoverMealType(e.target.value)}
                          disabled={leftoverLoading}
                        >
                          <option value="Any meal">Any meal</option>
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                          <option value="Snack">Snack</option>
                        </select>
                      </div>

                      <div className="diet-field">
                        <label htmlFor="leftoverServings">
                          👨‍👩‍👧 Servings
                        </label>

                        <select
                          id="leftoverServings"
                          value={leftoverServings}
                          onChange={(e) => setLeftoverServings(e.target.value)}
                          disabled={leftoverLoading}
                        >
                          <option value="1">1 person</option>
                          <option value="2">2 people</option>
                          <option value="3">3 people</option>
                          <option value="4">4 people</option>
                          <option value="5">5 people</option>
                        </select>
                      </div>
                    </div>

                    {leftoverError && (
                      <p className="error-message" role="alert">
                        {leftoverError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="leftover-generate-btn"
                      disabled={leftoverLoading}
                    >
                      {leftoverLoading
                        ? "🥣 Cooking up ideas..."
                        : "✨ Whip up my recipes!"}
                    </button>

                    {leftoverLoading && (
                      <p className="leftover-loading">
                        Your AI chef is checking the fridge and creating
                        something delicious...
                      </p>
                    )}
                  </form>

                  {leftoverRecipes && (
                    <div className="leftover-results">
                      <div className="leftover-results-heading">
                        <div>
                          <span className="welcome">
                            FRESH FROM YOUR AI CHEF
                          </span>

                          <h3>Your recipes are ready! 🍽️</h3>
                        </div>

                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={resetLeftoverRecipes}
                        >
                          Start Again
                        </button>
                      </div>

                      <div className="leftover-recipe-content">
                        <ReactMarkdown>
                          {leftoverRecipes}
                        </ReactMarkdown>
                      </div>

                      <p className="disclaimer">
                        Nutrition values are estimates. Only use leftovers
                        that have been stored and handled safely.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* DIET FORM */}

            {!dietPlan && (
              <form className="diet-form" onSubmit={generateDietPlan}>
                <div className="diet-form-grid">

                  <div className="diet-field">
                    <label htmlFor="dietAge">Your age</label>

                    <input
                      id="dietAge"
                      type="number"
                      name="age"
                      min="13"
                      max="100"
                      value={dietForm.age}
                      onChange={updateDietField}
                      placeholder="Enter your age"
                      required
                      disabled={dietLoading}
                    />
                  </div>

                  <div className="diet-field">
                    <label htmlFor="dietGoal">Your goal</label>

                    <select
                      id="dietGoal"
                      name="goal"
                      value={dietForm.goal}
                      onChange={updateDietField}
                      disabled={dietLoading}
                    >
                      <option value="Healthy eating">Healthy eating</option>
                      <option value="Weight management">Weight management</option>
                      <option value="Muscle gain">Muscle gain</option>
                      <option value="Weight maintenance">Weight maintenance</option>
                    </select>
                  </div>

                  <div className="diet-field">
                    <label htmlFor="dietPreference">Diet preference</label>

                    <select
                      id="dietPreference"
                      name="diet"
                      value={dietForm.diet}
                      onChange={updateDietField}
                      disabled={dietLoading}
                    >
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Eggetarian">Eggetarian</option>
                      <option value="Non-vegetarian">Non-vegetarian</option>
                    </select>
                  </div>

                  <div className="diet-field">
                    <label htmlFor="dietActivity">Activity level</label>

                    <select
                      id="dietActivity"
                      name="activity"
                      value={dietForm.activity}
                      onChange={updateDietField}
                      disabled={dietLoading}
                    >
                      <option value="Sedentary">Sedentary</option>
                      <option value="Lightly active">Lightly active</option>
                      <option value="Moderately active">Moderately active</option>
                      <option value="Very active">Very active</option>
                    </select>
                  </div>

                  <div className="diet-field">
                    <label htmlFor="dietCuisine">Food preference</label>

                    <select
                      id="dietCuisine"
                      name="cuisine"
                      value={dietForm.cuisine}
                      onChange={updateDietField}
                      disabled={dietLoading}
                    >
                      <option value="Indian">Indian</option>
                      <option value="Continental">Continental</option>
                      <option value="Mixed">Mixed cuisine</option>
                    </select>
                  </div>

                  <div className="diet-field">
                    <label htmlFor="dietMeals">Daily meal frequency</label>

                    <select
                      id="dietMeals"
                      name="meals"
                      value={dietForm.meals}
                      onChange={updateDietField}
                      disabled={dietLoading}
                    >
                      <option value="3 meals">3 meals</option>
                      <option value="3 meals + 1 snack">3 meals + 1 snack</option>
                      <option value="3 meals + 2 snacks">3 meals + 2 snacks</option>
                    </select>
                  </div>

                  <div className="diet-field full-width">
                    <label htmlFor="dietAllergies">
                      Food allergies or foods to avoid
                    </label>

                    <input
                      id="dietAllergies"
                      type="text"
                      name="allergies"
                      value={dietForm.allergies}
                      onChange={updateDietField}
                      placeholder="For example: peanuts, lactose, none"
                      disabled={dietLoading}
                    />
                  </div>

                  <div className="diet-field full-width">
                    <label htmlFor="dietMedical">
                      Relevant medical conditions (optional)
                    </label>

                    <textarea
                      id="dietMedical"
                      name="medical_conditions"
                      value={dietForm.medical_conditions}
                      onChange={updateDietField}
                      placeholder="Mention any relevant conditions, or leave blank."
                      rows={3}
                      disabled={dietLoading}
                    />

                    <small>
                      This planner is for general wellness. It cannot create therapeutic diets for medical conditions.
                    </small>
                  </div>
                </div>

                {dietError && (
                  <p className="error-message" role="alert">
                    {dietError}
                  </p>
                )}

                <button
                  type="submit"
                  className="primary-btn diet-generate-btn"
                  disabled={dietLoading}
                >
                  {dietLoading
                    ? "Creating your 7-day plan..."
                    : "✧ Generate My Diet Plan"}
                </button>

                {dietLoading && (
                  <p className="diet-loading-note">
                    MediAssist AI is preparing your meals. This may take a little while.
                  </p>
                )}
              </form>
            )}

            {/* GENERATED DIET PLAN */}

            {dietPlan && (
              <div className="generated-diet-plan">

                <div className="diet-plan-heading">
                  <div>
                    <span className="welcome">
                      YOUR PERSONALIZED PLAN
                    </span>

                    <h2>
                      {dietPlan.plan_title || "Your 7-Day Diet Plan"}
                    </h2>

                    <p>{dietPlan.summary}</p>
                  </div>

                  <button
                    className="secondary-btn"
                    onClick={resetDietPlanner}
                  >
                    Create New Plan
                  </button>
                </div>

                <div className="diet-plan-tags">
                  <span>{dietForm.diet}</span>
                  <span>{dietForm.goal}</span>
                  <span>{dietForm.cuisine} cuisine</span>
                  <span>{dietForm.meals}</span>
                </div>

                <section className="diet-day-selector">
                  <div className="diet-selector-heading">
                    <div>
                      <span className="welcome">
                        YOUR WEEK AT A GLANCE
                      </span>

                      <h3>Select a day to view its meals</h3>
                    </div>

                    <span className="day-count">
                      {dietPlan.days.length} DAYS
                    </span>
                  </div>

                  <div className="diet-day-flashcards">
                    {dietPlan.days.map((day, index) => (
                      <button
                        type="button"
                        key={`${day.day || "day"}-${index}`}
                        className={
                          selectedDay === index
                            ? "diet-flashcard selected"
                            : "diet-flashcard"
                        }
                        onClick={() => setSelectedDay(index)}
                        aria-pressed={selectedDay === index}
                      >
                        <span className="flashcard-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="flashcard-day">
                          {day.day || `Day ${index + 1}`}
                        </span>

                        <span className="flashcard-caption">
                          {(day.meals || []).length} meals
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                {dietPlan.days[selectedDay] && (
                  <section className="selected-diet-day">

                    <div className="selected-day-heading">
                      <div>
                        <span className="welcome">
                          YOUR DAILY MEAL PLAN
                        </span>

                        <h2>
                          {dietPlan.days[selectedDay].day || `Day ${selectedDay + 1}`}
                        </h2>
                      </div>

                      <span className="selected-day-badge">
                        Day {selectedDay + 1} of 7
                      </span>
                    </div>

                    <div className="diet-meals-list">
                      {(dietPlan.days[selectedDay].meals || []).map((meal, mealIndex) => (
                        <article
                          className="diet-meal"
                          key={`${meal.meal_type || "meal"}-${mealIndex}`}
                        >
                          <div className="meal-type">
                            {meal.meal_type || "Meal"}
                          </div>

                          <div className="meal-details">
                            <h4>{meal.name || "Meal"}</h4>
                            <p>{meal.description}</p>

                            {meal.portion && (
                              <p className="meal-portion">
                                <strong>Portion:</strong> {meal.portion}
                              </p>
                            )}

                            {meal.nutrition_estimate && (
                              <div className="nutrition-tags">
                                {meal.nutrition_estimate.calories != null && (
                                  <span>
                                    {meal.nutrition_estimate.calories} kcal
                                  </span>
                                )}

                                {meal.nutrition_estimate.protein_g != null && (
                                  <span>
                                    Protein: {meal.nutrition_estimate.protein_g}g
                                  </span>
                                )}

                                {meal.nutrition_estimate.carbs_g != null && (
                                  <span>
                                    Carbs: {meal.nutrition_estimate.carbs_g}g
                                  </span>
                                )}

                                {meal.nutrition_estimate.fat_g != null && (
                                  <span>
                                    Fat: {meal.nutrition_estimate.fat_g}g
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="day-navigation">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() =>
                          setSelectedDay((day) => Math.max(0, day - 1))
                        }
                        disabled={selectedDay === 0}
                      >
                        ← Previous Day
                      </button>

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() =>
                          setSelectedDay((day) => Math.min(6, day + 1))
                        }
                        disabled={selectedDay === 6}
                      >
                        Next Day →
                      </button>
                    </div>
                  </section>
                )}

                <section className="diet-pdf-section">
                  <div className="pdf-icon">📄</div>

                  <div className="pdf-description">
                    <h3>Your complete weekly diet report</h3>

                    <p>
                      Download all seven days, meal details, nutrition estimates,
                      grocery list and helpful tips in one PDF.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="primary-btn diet-pdf-btn"
                    onClick={downloadDietPDF}
                  >
                    ↓ Download Complete PDF
                  </button>
                </section>

                {Array.isArray(dietPlan.grocery_list) &&
                  dietPlan.grocery_list.length > 0 && (
                    <section className="diet-extra-section">
                      <h2>🛒 Your Grocery List</h2>

                      <div className="grocery-grid">
                        {dietPlan.grocery_list.map((group, index) => (
                          <div className="grocery-card" key={index}>
                            <h3>{group.category}</h3>

                            <ul>
                              {(group.items || []).map((item, itemIndex) => (
                                <li key={itemIndex}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                {Array.isArray(dietPlan.general_tips) &&
                  dietPlan.general_tips.length > 0 && (
                    <section className="diet-extra-section">
                      <h2>💡 Helpful Nutrition Tips</h2>

                      <ul className="diet-tips-list">
                        {dietPlan.general_tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                <div className="diet-disclaimer">
                  <strong>Important health note</strong>

                  <p>
                    {dietPlan.disclaimer ||
                      "This AI-generated plan is general educational information, not medical or dietetic advice. Nutrition estimates are approximate. Consult a registered dietitian or qualified healthcare professional for individual needs."}
                  </p>

                  <p>
                    Please review ingredients and portions, especially if you have allergies,
                    medical conditions or specific nutritional needs.
                  </p>
                </div>

                <button
                  className="primary-btn"
                  onClick={resetDietPlanner}
                >
                  Generate Another Diet Plan →
                </button>
              </div>
            )}
          </section>
        )}

        {/* ========================================
            HEALTH LIBRARY
        ======================================== */}

        {activeTab === "Health Library" && (
          <section className="content-card health-library">

            {!selectedArticle ? (
              <>

                {/* LIBRARY INTRODUCTION */}

                <div className="library-hero">
                  <span className="welcome">
                    YOUR KNOWLEDGE, YOUR WELLBEING
                  </span>

                  <h2>Explore your Health Library 🌿</h2>

                  <p>
                    Discover simple, useful information to help you
                    understand your health and build healthier habits.
                  </p>
                </div>

                {/* DAILY HEALTH TIP */}

                <div className="daily-tip-card">
                  <div className="daily-tip-icon">💡</div>

                  <div>
                    <span>YOUR DAILY HEALTH TIP</span>

                    <p>
                      {dailyHealthTips[
                        new Date().getDay() % dailyHealthTips.length
                      ]}
                    </p>
                  </div>
                </div>

                {/* SEARCH AND SAVED FILTER */}

                <div className="library-search-area">
                  <div className="library-search">
                    <span>⌕</span>

                    <input
                      type="text"
                      placeholder="Search health articles..."
                      value={librarySearch}
                      onChange={(e) => setLibrarySearch(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className={
                      showSavedOnly
                        ? "saved-filter active"
                        : "saved-filter"
                    }
                    onClick={() => setShowSavedOnly((previous) => !previous)}
                  >
                    ♡ Saved ({savedArticles.length})
                  </button>
                </div>

                {/* CATEGORIES */}

                <div className="library-category-area">
                  <h3>Explore Categories</h3>

                  <div className="library-categories">
                    {healthCategories.map((category) => (
                      <button
                        type="button"
                        key={category.name}
                        className={
                          libraryCategory === category.name
                            ? "library-category active"
                            : "library-category"
                        }
                        onClick={() => setLibraryCategory(category.name)}
                      >
                        <span>{category.icon}</span>
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ARTICLE HEADING */}

                <div className="library-articles-heading">
                  <div>
                    <span className="welcome">
                      LEARN SOMETHING NEW
                    </span>

                    <h3>
                      {showSavedOnly
                        ? "Your Saved Articles"
                        : libraryCategory === "All"
                          ? "Featured Health Articles"
                          : `${libraryCategory} Articles`}
                    </h3>
                  </div>

                  <span className="article-count">
                    {filteredArticles.length} articles
                  </span>
                </div>

                {/* ARTICLE CARDS */}

                {filteredArticles.length > 0 ? (
                  <div className="library-articles-grid">
                    {filteredArticles.map((article) => (
                      <article
                        className="library-article-card"
                        key={article.id}
                      >
                        <div className="article-card-top">
                          <span className="article-icon">
                            {article.icon}
                          </span>

                          <button
                            type="button"
                            className={
                              savedArticles.includes(article.id)
                                ? "bookmark-btn saved"
                                : "bookmark-btn"
                            }
                            onClick={() =>
                              toggleArticleBookmark(article.id)
                            }
                            aria-label={
                              savedArticles.includes(article.id)
                                ? "Remove bookmark"
                                : "Save article"
                            }
                          >
                            {savedArticles.includes(article.id) ? "♥" : "♡"}
                          </button>
                        </div>

                        <span className="article-category">
                          {article.category}
                        </span>

                        <h3>{article.title}</h3>

                        <p>{article.description}</p>

                        <div className="article-card-footer">
                          <span>◷ {article.readTime}</span>

                          <button
                            type="button"
                            onClick={() => openHealthArticle(article)}
                          >
                            Read Article →
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="library-empty">
                    <span>🔎</span>

                    <h3>No articles found</h3>

                    <p>
                      Try another search or select a different category.
                    </p>

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => {
                        setLibrarySearch("");
                        setLibraryCategory("All");
                        setShowSavedOnly(false);
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                )}

                {/* LIBRARY DISCLAIMER */}

                <div className="library-disclaimer">
                  <strong>Health information notice</strong>

                  <p>
                    These articles are for general educational purposes.
                    They do not provide a diagnosis or replace advice from
                    qualified healthcare professionals.
                  </p>
                </div>
              </>
            ) : (

              /* ARTICLE READING VIEW */

              <div className="library-article-detail">

                <button
                  type="button"
                  className="article-back-btn"
                  onClick={() => {
                    setSelectedArticle(null);
                    setArticleExplanation("");
                    setExplanationError("");
                  }}
                >
                  ← Back to Health Library
                </button>

                <div className="article-detail-header">
                  <span className="article-detail-icon">
                    {selectedArticle.icon}
                  </span>

                  <span className="article-category">
                    {selectedArticle.category}
                  </span>

                  <h2>{selectedArticle.title}</h2>

                  <p>{selectedArticle.description}</p>

                  <span className="article-read-time">
                    ◷ {selectedArticle.readTime}
                  </span>
                </div>

                <div className="article-reading-content">
                  <ReactMarkdown>
                    {selectedArticle.content}
                  </ReactMarkdown>
                </div>

                {/* ARTICLE ACTIONS */}

                <div className="article-action-area">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() =>
                      toggleArticleBookmark(selectedArticle.id)
                    }
                  >
                    {savedArticles.includes(selectedArticle.id)
                      ? "♥ Remove Bookmark"
                      : "♡ Save Article"}
                  </button>

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={explainHealthArticle}
                    disabled={explanationLoading}
                  >
                    {explanationLoading
                      ? "AI is explaining..."
                      : "✧ Explain This Article with AI"}
                  </button>
                </div>

                {/* AI LOADING */}

                {explanationLoading && (
                  <p className="article-ai-loading">
                    MediAssist AI is preparing a simple explanation...
                  </p>
                )}

                {/* AI ERROR */}

                {explanationError && (
                  <p className="error-message" role="alert">
                    {explanationError}
                  </p>
                )}

                {/* AI EXPLANATION */}

                {articleExplanation && (
                  <div className="article-ai-explanation">
                    <span className="welcome">
                      YOUR AI EXPLANATION
                    </span>

                    <h3>Let's make it easier to understand ✨</h3>

                    <ReactMarkdown>
                      {articleExplanation}
                    </ReactMarkdown>
                  </div>
                )}

                <div className="library-disclaimer">
                  <strong>Important health note</strong>

                  <p>
                    This article and its AI explanation provide general
                    educational information only. Consult a qualified
                    healthcare professional for personal medical advice.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ========================================
            CHAT HISTORY
        ======================================== */}

        {activeTab === "Chat History" && (
          <section className="content-card">
            <h2>Chat History</h2>

            <p>
              Your current conversation is available in the AI Assistant.
            </p>

            <button
              className="primary-btn"
              onClick={() => setActiveTab("AI Assistant")}
            >
              Open conversation →
            </button>
          </section>
        )}

      </main>
    </div>
  );
}

export default App;
