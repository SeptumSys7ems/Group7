import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserAnalyses } from '../services/api';
import ImageUpload from './imageupload';
import FashionPost from './post';
import './feedpage.css';

function FeedPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    async function fetchAnalyses() {
      try {
        setLoading(true);
        const data = await getUserAnalyses();
        setAnalyses(data.analyses || []);
      } catch (error) {
        console.error('Feed fetch error:', error);
        setError('Failed to load fashion feed');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalyses();
  }, []);

  const toggleUpload = () => {
    setShowUpload(!showUpload);
  };

  if (loading) {
    return <div className="feed-loading">Loading fashion feed...</div>;
  }

  return (
    <div className="feed-container">
      <div className="feed-sidebar">
        <div className="sidebar-content">
          <button className="upload-button" onClick={toggleUpload}>
            Upload Image
          </button>
          {showUpload && <ImageUpload onSuccess={() => setShowUpload(false)} />}
        </div>
      </div>

      <div className="feed-main">
        {error && <div className="feed-error">{error}</div>}
        
        {analyses.length === 0 ? (
          <div className="no-posts">
            <h2>No fashion posts yet</h2>
            <p>Upload an outfit to get started!</p>
            <button className="upload-button" onClick={toggleUpload}>
              Upload your first outfit
            </button>
          </div>
        ) : (
          <div className="posts-container">
            {analyses.map(analysis => (
              <FashionPost 
                key={analysis.id} 
                analysis={analysis} 
              />
            ))}
          </div>
        )}
      </div>

      <div className="feed-right-sidebar">
        <div className="sidebar-content">
          <h3>Trending Styles</h3>
          <ul className="trending-list">
            <li>Summer Casual</li>
            <li>Business Casual</li>
            <li>Streetwear</li>
            <li>Minimalist</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FeedPage;