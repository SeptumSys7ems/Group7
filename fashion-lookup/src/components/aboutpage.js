import React from 'react';
import './aboutpage.css';

function AboutPage() {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About Fashion Lookup</h1>
        <p className="about-tagline">
          Find affordable alternatives to any fashion item you love
        </p>
      </div>

      <div className="about-section">
        <h2>Our Mission</h2>
        <p>
          Fashion Lookup is dedicated to making fashion accessible to everyone. 
          Our AI-powered platform helps you find affordable alternatives to 
          high-end fashion items, allowing you to express your style without 
          breaking the bank.
        </p>
      </div>

      <div className="about-section">
        <h2>How It Works</h2>
        <div className="how-it-works">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload</h3>
            <p>Upload a photo of any fashion item or outfit you like</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Analyze</h3>
            <p>Our AI technology analyzes each piece in the outfit</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Discover</h3>
            <p>Get affordable alternatives across multiple price points</p>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2>Our Technology</h2>
        <p>
          Fashion Lookup combines advanced computer vision with AI-powered 
          fashion analysis to identify items in your images. We use Google's 
          Vision API to detect clothing items and Gemini AI to find similar 
          alternatives at different price points.
        </p>
      </div>

      <div className="about-section">
        <h2>Meet the Team</h2>
        <div className="team-placeholder">
          <p>
            Founded by fashion enthusiasts and AI specialists, our team is 
            committed to making style accessible for everyone.
          </p>
          <p className="team-note">
            Team member profiles coming soon.
          </p>
        </div>
      </div>

      <div className="about-section">
        <h2>Privacy & Ethics</h2>
        <p>
          We take your privacy seriously. Uploaded images are processed 
          securely and only used to provide our service. We do not sell 
          user data or images to third parties.
        </p>
      </div>
    </div>
  );
}

export default AboutPage;