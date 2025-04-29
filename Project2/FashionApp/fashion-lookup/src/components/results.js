import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAnalysis } from '../services/api';
import './results.css';

function ResultsPage() {
  const { analysisId } = useParams();
  const { currentUser } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('premium');
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setLoading(true);

        if (!analysisId) {
          setError('No analysis ID provided');
          setLoading(false);
          return;
        }

        const data = await getAnalysis(analysisId);
        console.log('Fetched analysis data:', data);
        setResults(data);
      } catch (error) {
        console.error('Analysis fetch error:', error);
        setError('Failed to load analysis results');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [analysisId]);

  const handleImageError = (index) => {
    console.log(`Image at index ${index} failed to load`);
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  const getPlaceholderImage = (item, isPremium) => {
    let text = item.brand && item.name ? `${item.brand} ${item.name}` : item.type || 'Fashonista';
    const bgColor = isPremium ? '3e4095' : '4CAF50';
    const textColor = 'ffffff';
    return `https://via.placeholder.com/500x600/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
  };

  const handleBackClick = () => {
    navigate('/');
  };

  if (loading) {
    return <div className="results-loading">Loading results...</div>;
  }

  if (error) {
    return (
      <div className="results-error">
        <p>{error}</p>
        <button onClick={handleBackClick} className="back-button">Back to Feed</button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="no-results">
        <p>Analysis not found</p>
        <button onClick={handleBackClick} className="back-button">Back to Feed</button>
      </div>
    );
  }

  const { imageUrl, detectedItems, expensiveOptions, affordableOptions } = results;
  const options = activeTab === 'premium' ? (expensiveOptions || []) : (affordableOptions || []);

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
              <img 
                src={imageUrl} 
                alt="Original outfit" 
                className="outfit-image"
                onError={(e) => {
                  console.log('Original image failed to load');
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/600x800/888888/ffffff?text=Original+Outfit';
                }} 
              />
            </div>

            <div className="detected-items">
              <h3>Detected Items</h3>
              <ul>
                {detectedItems && detectedItems.length > 0 ? (
                  detectedItems.map((item, index) => (
                    <li key={index} className="detected-item">
                      <span className="item-type">{item.type || 'Item'}:</span> {item.description || 'No description available'}
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

          {options.length === 0 ? (
            <div className="no-options">
              <p>No {activeTab} options found for this outfit.</p>
            </div>
          ) : (
            <div className="alternatives-grid">
              {options.map((item, index) => {
                const isPremium = activeTab === 'premium';
                const placeholderSrc = getPlaceholderImage(item, isPremium);
                let imageSrc = item.imageUrl;

                if (imageErrors[index] || !imageSrc || imageSrc.includes('placeholder.jpg') || imageSrc === '#') {
                  imageSrc = placeholderSrc;
                }

                return (
                  <div key={index} className="product-card">
                    <div className="product-image-container">
                      <img 
                        src={imageSrc}
                        alt={item.name || item.description || 'Decourm Garnment'} 
                        className="product-image"
                        onError={() => handleImageError(index)}
                      />
                    </div>
                    <div className="product-details">
                      <h4 className="product-name">
                        {(item.name && item.name !== 'placeholder.jpg') 
                          ? item.name 
                          : (item.description || item.type || 'Clothing Option')}
                      </h4>
                      <p className="product-brand">{item.brand || 'Unknown Brand'}</p>
                      <p className={`product-price ${isPremium ? 'premium' : 'affordable'}`}>
                        {item.price && typeof item.price === 'string' && item.price.includes('$')
                          ? item.price
                          : (typeof item.price === 'number' 
                            ? `$${item.price.toFixed(2)}` 
                            : 'Price Unavailable')}
                      </p>
                      <a 
                        href={item.productUrl && item.productUrl !== '#' ? item.productUrl : `https://www.google.com/search?q=${encodeURIComponent((item.brand || '') + ' ' + (item.name || item.description || 'fashion item'))}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="product-button"
                      >
                        View Product
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
