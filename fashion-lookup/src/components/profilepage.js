import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import './profilepage.css';

function ProfilePage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('info');

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-container">
          {currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt="Profile" 
              className="profile-avatar" 
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{currentUser.displayName || 'Fashion User'}</h1>
          <p className="profile-email">{currentUser.email}</p>
          <p className="profile-member-since">
            Member since: {currentUser.metadata.creationTime 
              ? new Date(currentUser.metadata.creationTime).toLocaleDateString() 
              : 'Recently'}
          </p>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Account Info
        </button>
        <button 
          className={`profile-tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Style Preferences
        </button>
        <button 
          className={`profile-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Analysis History
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'info' && (
          <div className="profile-section">
            <h2>Account Information</h2>
            <div className="info-group">
              <label>Display Name</label>
              <p>{currentUser.displayName || 'Not provided'}</p>
            </div>
            <div className="info-group">
              <label>Email</label>
              <p>{currentUser.email}</p>
            </div>
            <div className="info-group">
              <label>Account Created</label>
              <p>{currentUser.metadata.creationTime 
                ? new Date(currentUser.metadata.creationTime).toLocaleDateString() 
                : 'Recently'}</p>
            </div>
            <div className="info-group">
              <label>Last Sign In</label>
              <p>{currentUser.metadata.lastSignInTime 
                ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() 
                : 'Recently'}</p>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="profile-section">
            <h2>Style Preferences</h2>
            <p className="coming-soon">Style preference settings coming soon!</p>
            <div className="placeholder-preferences">
              <div className="preference-category">
                <h3>Favorite Styles</h3>
                <ul className="style-tags">
                  <li>Casual</li>
                  <li>Minimalist</li>
                  <li>Streetwear</li>
                  <li>+ Add more</li>
                </ul>
              </div>
              <div className="preference-category">
                <h3>Price Range</h3>
                <div className="price-slider">
                  <div className="price-range-track">
                    <div className="price-range-fill"></div>
                  </div>
                  <div className="price-labels">
                    <span>$</span>
                    <span>$$$</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="profile-section">
            <h2>Analysis History</h2>
            <p>View all your previous outfit analyses here.</p>
            <button className="view-history-button">
              View Full History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;