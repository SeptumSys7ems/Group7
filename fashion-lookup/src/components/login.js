
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './login.css';

function Login() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    async function handleGoogleSignIn() {
        try {
            setError('');
            setLoading(true);
            await signInWithGoogle();
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            setError('Failed to sign in');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Fashion Lookup</h1>
                <p className="login-subtitle">Find affordable versions of fashion items</p>

                {error && <p className="login-error">{error}</p>}

                <button
                    className="login-button google-button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Sign in with Google'}
                </button>

                <button
                    className="login-button pinterest-button"
                    disabled={true}
                >
                    Sign in with Pinterest (Coming Soon)
                </button>
            </div>
        </div>
    );
}

export default Login;