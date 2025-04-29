import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/login';
import MainLayout from './components/mainlayout';
import FeedPage from './components/feedpage';
import ResultsPage from './components/results';
import ProfilePage from './components/profilepage';
import AboutPage from './components/aboutpage';
import ContactPage from './components/contactpage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<FeedPage />} />
            <Route path="results/:analysisId" element={<ResultsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;