import React, { useState, useEffect } from 'react';
import { getUserAnalyses } from '../services/api';
import ImageUpload from './imageupload';
import FashionPost from './post';
import './feedpage.css';
import ReactGA from 'react-ga4';


function FeedPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  useEffect(() => {
    
    ReactGA.initialize(process.env.REACT_APP_GA_MEASUREMENT_ID);
 
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);
  useEffect(() => {
    async function fetchAnalyses() {
      try {
        setLoading(true);
        const data = await getUserAnalyses();
        setAnalyses(data.analyses || []);
        ReactGA.event({
          category: 'Feed',
          action: 'Load',
          label: 'Success',
          value: data.analyses?.length || 0
        });
      } catch (error) {
        console.error('Feed fetch error:', error);
        setError('Failed to load fashion feed');
        ReactGA.event({
          category: 'Error',
          action: 'Feed Load',
          label: error.message || 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchAnalyses();
  }, []);

  const toggleUpload = () => {
    setShowUpload(!showUpload);
    ReactGA.event({
      category: 'Interaction',
      action: 'Toggle Upload',
      label: showUpload ? 'Close' : 'Open'
    });
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
          {showUpload && <ImageUpload
            onSuccess={() => {
              setShowUpload(false);
              // Track successful upload
              ReactGA.event({
                category: 'Upload',
                action: 'Success',
                label: 'Image Upload'
              });
            }} />}
        </div>
      </div>

      <div className="feed-main">
        {error && <div className="feed-error">{error}</div>}
        
        {analyses.length === 0 ? (
          <div className="no-posts">
            <h2>No fashion posts yet</h2>
            <p>Upload an outfit to get started!</p>
            <button className="upload-button" onClick={() => {
              toggleUpload();
              // Track empty state upload click
              ReactGA.event({
                category: 'Interaction',
                action: 'Empty State Upload Click',
                label: 'First Upload'
              });
            }}>
              Upload your first outfit
            </button>
          </div>
        ) : (
          <div className="posts-container">
            {analyses.map(analysis => (
              <FashionPost 
                key={analysis.id} 
                analysis={analysis} 
                onView={() => {
                  // Track post view
                  ReactGA.event({
                    category: 'Content',
                    action: 'View Post',
                    label: analysis.id
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="feed-right-sidebar">
        <div className="sidebar-content">
          <h3>Trending Styles</h3>
          <ul className="trending-list">
            {['Summer Casual', 'Business Casual', 'Streetwear', 'Minimalist'].map(style => (
              <li
                key={style}
                onClick={() => {
                  // Track trending style click
                  ReactGA.event({
                    category: 'Interaction',
                    action: 'Trending Style Click',
                    label: style
                  });
                }}
              >
                {style}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FeedPage;