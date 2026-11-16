
import React, { useState } from "react";
import "./Login.css";

const API_URL = "http://127.0.0.1:5001";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);
  };

  // STEP 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      setOtpSent(true);
      showMessage("Verification code sent! Check your inbox.", "success");

    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp.trim())) {
      showMessage("Please enter a valid six-digit OTP.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed.");
      }

      showMessage("Email verified successfully!", "success");

      // Continue to the existing MediAssist dashboard
      const user = {
        email: data.user.email,
        name: data.user.email.split("@")[0]
      };

      onLogin(user);

    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Request another OTP
  const handleResendOTP = async () => {
    setOtp("");
    setOtpSent(false);
    setMessage("");

    // Reuse the same email-sending function
    const fakeEvent = {
      preventDefault: () => {}
    };

    await handleSendOTP(fakeEvent);
  };

  return (
    <div className="login-page">

      <div className="login-decoration decoration-one"></div>
      <div className="login-decoration decoration-two"></div>

      <div className="login-card">

        <div className="login-logo">✚</div>

        <h1>MediAssist AI</h1>

        <p className="login-subtitle">
          Your personal health companion
        </p>

        <div className="login-heading">
          <h2>
            {otpSent ? "Verify your email" : "Welcome to MediAssist!"}
          </h2>

          <p>
            {otpSent
              ? `Enter the six-digit code sent to ${email}.`
              : "Sign in securely using your email address."}
          </p>
        </div>

        {!otpSent ? (

          <form onSubmit={handleSendOTP}>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP →"}
            </button>

          </form>

        ) : (

          <form onSubmit={handleVerifyOTP}>

            <div className="form-group">
              <label>Six-Digit Verification Code</label>

              <input
                type="text"
                inputMode="numeric"
                maxLength="6"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Continue →"}
            </button>

            <div className="otp-actions">

              <button
                type="button"
                className="resend-button"
                onClick={handleResendOTP}
                disabled={loading}
              >
                Resend OTP
              </button>

              <button
                type="button"
                className="resend-button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setMessage("");
                }}
                disabled={loading}
              >
                Change email
              </button>

            </div>

          </form>

        )}

        {message && (
          <p className={`login-message ${messageType}`}>
            {message}
          </p>
        )}

        <div className="login-footer">
          Your health information deserves care and privacy.
        </div>

      </div>
    </div>
  );
}

export default Login;
