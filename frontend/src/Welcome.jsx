
import React from "react";
import "./Welcome.css";

function Welcome({ onGetStarted }) {
  return (
    <div className="welcome-screen">

      <video
        className="welcome-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/welcome.mp4" type="video/mp4" />
      </video>

      <div className="welcome-overlay"></div>

      <div className="welcome-content">
        <p className="welcome-tag">YOUR PERSONAL AI HEALTH COMPANION</p>

        <h1>
          Welcome to
          <br />
          <span>MediAssist AI</span>
        </h1>

        <p className="welcome-description">
          A smarter way to understand your health,
          explore wellness and find reliable health information.
        </p>

        <button
          className="welcome-button"
          onClick={onGetStarted}
        >
          Get Started <span>→</span>
        </button>

        <p className="welcome-footer">
          Your health journey begins here.
        </p>
      </div>

    </div>
  );
}

export default Welcome;
