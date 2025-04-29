import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './results.css';

function ResultsPage() {
  const { analysisId } = useParams();
  const { currentUser } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('premium');

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setLoading(true);
        const token = await currentUser.getIdToken();
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/analysis/${analysisId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setResults(response.data);
      } catch (error) {
        console.error('Analysis fetch error:', error);
        setError('Failed to load analysis results');
      } finally {
        setLoading(false);
      }
    }
    
    if (analysisId) {
      fetchAnalysis();
    }
  }, [analysisId, currentUser]);
  
  if (loading) {
    return <div className="results-loading">Loading results...</div>;
  }
  
  if (error) {
    return <div className="results-error">{error}</div>;
  }
  
  if (!results) {
    return <div className="no-results">Analysis not found</div>;
  }
  
  const { imageUrl, detectedItems, expensiveOptions, affordableOptions } = results;
  const options = activeTab === 'premium' ? expensiveOptions : affordableOptions;

  // Create placeholder fashion items if data is missing
  const placeholderItems = [
    {
      brand: 'FashionBrand',
      name: activeTab === 'premium' ? 'Luxury Item' : 'Budget Item',
      price: activeTab === 'premium' ? 129.99 : 49.99,
      imageUrl: `https://via.placeholder.com/300x400?text=${activeTab === 'premium' ? 'Premium' : 'Affordable'}+Fashion`,
      productUrl: `https://example.com/${activeTab === 'premium' ? 'premium' : 'affordable'}-fashion`,
      type: 'Fashion Item'
    },
    {
      brand: activeTab === 'premium' ? 'Gucci' : 'H&M',
      name: activeTab === 'premium' ? 'Designer Top' : 'Casual Top',
      price: activeTab === 'premium' ? 249.99 : 29.99,
      imageUrl: `https://via.placeholder.com/300x400?text=${activeTab === 'premium' ? 'Designer' : 'Casual'}+Top`,
      productUrl: `https://example.com/${activeTab === 'premium' ? 'designer' : 'casual'}-top`,
      type: 'Top'
    }
  ];
  
  // Use our options data if available, otherwise use placeholder data
  const displayOptions = (Array.isArray(options) && options.length > 0) ? options : placeholderItems;
  
  return (
    <div className="results-page">
      <div className="results-header">
        <h1>FashionThief Results</h1>
        <Link to="/" className="back-button">Back to Feed</Link>
      </div>
      
      <div className="results-container">
        <div className="original-outfit-section">
          <div className="outfit-card">
            <div className="outfit-header">Original Outfit</div>
            <div className="outfit-image-container">
              <img src={imageUrl} alt="Original outfit" className="outfit-image" />
            </div>
            
            <div className="detected-items">
              <h3>Detected Items</h3>
              <ul>
                {detectedItems && detectedItems.length > 0 ? (
                  detectedItems.map((item, index) => (
                    <li key={index} className="detected-item">
                      <span className="item-type">{item.type}:</span> {item.description}
                    </li>
                  ))
                ) : (
                  <li className="detected-item">
                    <span className="item-type">Item:</span> No items detected
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="alternatives-section">
          <div className="alternatives-tabs">
            <button 
              className={`tab-button ${activeTab === 'premium' ? 'active' : ''}`}
              onClick={() => setActiveTab('premium')}
            >
              Premium Options
            </button>
            <button 
              className={`tab-button ${activeTab === 'affordable' ? 'active' : ''}`}
              onClick={() => setActiveTab('affordable')}
            >
              Affordable Options
            </button>
          </div>
          
          <div className="alternatives-grid">
            {displayOptions.map((item, index) => (
              <div key={index} className="product-card">
                <div className="product-image-container">
                  <img 
                    src={item.imageUrl || `https://via.placeholder.com/300x400?text=${item.name || 'Fashion Item'}`} 
                    alt={item.name || 'Fashion item'} 
                    className="product-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://via.placeholder.com/300x400?text=${item.name || 'Fashion Item'}`;
                    }} 
                  />
                </div>
                <div className="product-details">
                  <h4 className="product-name">{item.name || 'Fashion Item'}</h4>
                  <p className="product-brand">{item.brand || 'Brand'}</p>
                  <p className={`product-price ${activeTab === 'premium' ? 'premium' : 'affordable'}`}>
                    ${typeof item.price === 'number' ? item.price.toFixed(2) : '99.99'}
                  </p>
                  <a 
                    href={item.productUrl && item.productUrl !== '#' ? item.productUrl : `https://www.google.com/search?q=${encodeURIComponent(item.brand + ' ' + item.name)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="product-button"
                  >
                    View Product
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="sharing-options">
            <h3>Share your fashion find</h3>
            <div className="share-buttons">
              <button className="share-button">
                <span className="share-icon" role="img" aria-label="smartphone">📱</span> Share to Instagram
              </button>
              <button className="share-button">
                <span className="share-icon" role="img" aria-label="bird">🐦</span> Share to Twitter
              </button>
              <button className="share-button">
                <span className="share-icon" role="img" aria-label="pin">📌</span> Save to Pinterest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;