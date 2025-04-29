// src/components/FashionPost.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './post.css';

function FashionPost({ analysis }) {
  const [expanded, setExpanded] = useState(false);
  const { currentUser } = useAuth();
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div className="fashion-post">
      <div className="post-header">
        {currentUser?.photoURL ? (
          <img 
            src={currentUser.photoURL} 
            alt={currentUser.displayName || 'User'} 
            className="user-avatar" 
          />
        ) : (
          <div className="user-avatar-placeholder">
            {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'F'}
          </div>
        )}
        <div className="post-user-info">
          <h3 className="username">{currentUser?.displayName || 'Fashion User'}</h3>
          <p className="post-time">
            {formatDate(analysis.timestamp)}
          </p>
        </div>
      </div>
      
      <div className="post-caption">
        <p>Check out my latest fashion find!</p>
      </div>
      
      <div className="post-content">
        <div className={`fashion-card ${expanded ? 'expanded' : ''}`}>
          <div className="fashion-heading">
            FashionThief
          </div>
          
          <div className="original-outfit">
            <img 
              src={analysis.imageUrl} 
              alt="Original outfit" 
              className="outfit-image" 
            />
            <div className="outfit-label">Original Outfit</div>
          </div>
          
          {expanded && (
            <div className="similar-fits">
              <h3>Similar Fits</h3>
              <div className="fits-grid">
                {analysis.detectedItems && Array.isArray(analysis.detectedItems) && 
                  analysis.detectedItems.map((item, index) => (
                    <div key={index} className="similar-fit-item">
                      <div className="placeholder-image"></div>
                      <p>{item.type}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          <div className="fashion-actions">
            <Link to={`/results/${analysis.id}`} className="view-button">
              Open FashionThief
            </Link>
          </div>
        </div>
      </div>
      
      <div className="post-footer">
        <button className="post-action like-button">
          <span className="action-icon" role="img" aria-label="heart">❤️</span> Like
        </button>
        <button className="post-action comment-button">
          <span className="action-icon" role="img" aria-label="comment">💬</span> Comment
        </button>
        <button className="post-action share-button">
          <span className="action-icon" role="img" aria-label="share">🔄</span> Share
        </button>
        <button className="post-action expand-button" onClick={toggleExpand}>
          <span className="action-icon" role="img" aria-label={expanded ? "collapse" : "expand"}>
            {expanded ? '🔼' : '🔽'}
          </span> 
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
    </div>
  );
}

export default FashionPost;