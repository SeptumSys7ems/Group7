// Import core libraries
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import global CSS
import './index.css';

// Import the main App component
import App from './App';

// Import reportWebVitals for measuring performance
import reportWebVitals from './reportWebVitals';

// Create the root of the React application and attach it to the 'root' div in public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component inside <React.StrictMode> for highlighting potential problems
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Measure and report performance metrics
// You can log them to the console or send them to an analytics service
reportWebVitals();
