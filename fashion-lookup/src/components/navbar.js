
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './navbar.css';

function Navbar() {
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
        <nav className="navbar">
            <div className="navbar-brand">Fashion Lookup</div>

            {currentUser && (
                <div className="navbar-user">
                    {currentUser.photoURL && (
                        <img
                            src={currentUser.photoURL}
                            alt="User"
                            className="user-avatar"
                        />
                    )}
                    <span className="user-name">
                        {currentUser.displayName || currentUser.email}
                    </span>
                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}

export default Navbar;