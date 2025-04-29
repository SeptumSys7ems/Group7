import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './mainlayout.css';
import FashionLogo from '../assets/FashionLogo';

function MainLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <div className="main-layout">
      <header className="main-header">
        <div className="header-left">
          <Link to="/" className="logo-container">
            <FashionLogo />
          </Link>
          <div className="search-container">
            <input type="text" placeholder="Search..." className="search-input" />
          </div>
        </div>

        <nav className="main-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          {!currentUser ? (
            <Link to="/login" className="nav-link">Sign in</Link>
          ) : (
            <button onClick={handleLogout} className="nav-link signout-button">Sign out</button>
          )}
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;