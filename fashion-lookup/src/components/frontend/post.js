// src/components/FashionPost.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './post.css';

function FashionPost({ analysis }) {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  // Random username for demo purposes
  const usernames = ['FashionLover', 'StyleGuru', 'MrAnimal', 'TrendSetter', 'FashionThief'];
  const randomUsername = usernames[Math.floor(Math.random() * usernames.length)];
  
  return (
    <div className="fashion-post">
      <div className="post-header">
        <div className="user-avatar" style={{ backgroundColor: '#e74c3c' }}>
          {randomUsername.charAt(0)}
        </div>
        <div className="post-user-info">
          <h3 className="username">{randomUsername}</h3>
          <p className="post-time">
            {analysis.timestamp ? new Date(analysis.timestamp).toLocaleDateString() : 'Recently'}
          </p>
        </div>
      </div>
      
      <div className="post-caption">
        <p>Check out my new fit!</p>
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
          <span className="action-icon">❤️</span> Like
        </button>
        <button className="post-action comment-button">
          <span className="action-icon">💬</span> Comment
        </button>
        <button className="post-action share-button">
          <span className="action-icon">🔄</span> Share
        </button>
        <button className="post-action expand-button" onClick={toggleExpand}>
          <span className="action-icon">{expanded ? '🔼' : '🔽'}</span> 
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
    </div>
  );
}

export default FashionPost;