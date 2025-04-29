// src/components/contactpage.js

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './contactpage.css'; // Import custom styling

function ContactPage() {
  const { currentUser } = useAuth(); // Get the logged-in user (if any)

  // Form state, pre-filled with user's name and email if logged in
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false); // Track if form was submitted
  const [error, setError] = useState(''); // Track validation errors

  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple client-side validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Simulate sending the message (replace this with backend call)
    console.log('Form submitted:', formData);

    // Mark as submitted
    setSubmitted(true);
    setError('');
  };

  // Show success message after form submission
  if (submitted) {
    return (
      <div className="contact-container">
        <div className="contact-success">
          <h2>Thank You!</h2>
          <p>Your message has been sent. We'll get back to you as soon as possible.</p>
          <button
            className="send-another-button"
            onClick={() => {
              setSubmitted(false);
              setFormData({
                name: currentUser?.displayName || '',
                email: currentUser?.email || '',
                subject: '',
                message: ''
              });
            }}
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  // Main contact form UI
  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Have questions or feedback? We'd love to hear from you!</p>
      </div>

      <div className="contact-content">
        {/* Contact form section */}
        <div className="contact-form-container">
          <form className="contact-form" onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className="submit-button">
              Send Message
            </button>
          </form>
        </div>

        {/* Static contact info */}
        <div className="contact-info">
          <div className="info-section">
            <h3>Email Us</h3>
            <p>support@fashionlookup.com</p>
          </div>

          <div className="info-section">
            <h3>Social Media</h3>
            <div className="social-links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">Instagram</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">Twitter</a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="social-link">Pinterest</a>
            </div>
          </div>

          <div className="info-section">
            <h3>Office</h3>
            <p>
              Fashion District<br />
              123 Style Avenue<br />
              New York, NY 10001
            </p>
          </div>

          <div className="info-section">
            <h3>Hours</h3>
            <p>
              Monday - Friday: 9am - 6pm<br />
              Saturday: 10am - 4pm<br />
              Sunday: Closed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
