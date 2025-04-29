// src/contexts/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';

// Create context object
const AuthContext = createContext();

// Custom hook for accessing auth context
export function useAuth() {
    return useContext(AuthContext);
}

// AuthProvider wraps the entire app and provides auth state + actions
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);  // Firebase user object
    const [loading, setLoading] = useState(true);          // Prevents UI flickering on initial load

    /**
     * Sign in with Google using a popup
     */
    function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }

    function currentUser() {
        return auth.currentUser;
    }

    /**
     * Sign out the current user
     */
    function logout() {
        return signOut(auth);
    }

    /**
     * Listen for auth state changes (login/logout)
     */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        // Clean up the listener on unmount
        return unsubscribe;
    }, []);

    // Provide auth data and actions to the rest of the app
    const value = {
        currentUser,
        signInWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} {/* Avoid rendering children until auth state is determined */}
        </AuthContext.Provider>
    );
}
