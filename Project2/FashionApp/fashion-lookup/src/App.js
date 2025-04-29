// Import necessary React and routing libraries
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import authentication context provider
import { AuthProvider } from './contexts/AuthContext';

// Import page and layout components
import Login from './components/login';
import MainLayout from './components/mainlayout';
import FeedPage from './components/feedpage';
import ResultsPage from './components/results';
import ProfilePage from './components/profilepage';
import AboutPage from './components/aboutpage';
import ContactPage from './components/contactpage';

// Import global CSS
import './App.css';

// Main App component
function App() {
  return (
    // Wrap entire app with AuthProvider so all components can access auth state
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route for login */}
          <Route path="/login" element={<Login />} />

          {/* Protected app layout with nested routes */}
          <Route path="/" element={<MainLayout />}>
            {/* Default route → FeedPage */}
            <Route index element={<FeedPage />} />

            {/* Dynamic route for viewing results by analysisId */}
            <Route path="results/:analysisId" element={<ResultsPage />} />

            {/* Static pages */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          {/* Catch-all fallback → redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
