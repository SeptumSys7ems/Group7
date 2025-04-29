// src/api.js

import axios from 'axios';
import { auth } from '../firebase';

// Base API URL from environment
const API_URL = process.env.REACT_APP_API_URL;

// Create an Axios instance for consistent config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Attach Firebase ID token to each outgoing request
api.interceptors.request.use(async (config) => {
    if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Analyze an image using the backend (Vision + Gemini)
 */
export const analyzeImage = async (imageUrl) => {
    try {
        const response = await api.post('/api/analysis', { imageUrl });
        return response.data;
    } catch (error) {
        console.error('Error analyzing image:', error);
        throw error;
    }
};

/**
 * Fetch latest 10 analyses for the current user
 */
export const getUserAnalyses = async () => {
    try {
        const response = await api.get('/api/analysis');
        return response.data;
    } catch (error) {
        console.error('Error fetching analyses:', error);
        return { analyses: [] }; // Fallback for frontend display
    }
};

/**
 * Fetch a specific analysis by ID, and clean up option image URLs
 */
export const getAnalysis = async (analysisId) => {
    try {
        const response = await api.get(`/api/analysis/${analysisId}`);
        console.log(`Received analysis data for ID ${analysisId}:`, response.data);

        // Ensure image URLs are clean and valid
        const processOptions = (options) => {
            if (!Array.isArray(options)) return [];
            return options.map(item => {
                const hasValidImage = item.imageUrl &&
                    item.imageUrl !== '#' &&
                    item.imageUrl !== 'placeholder.jpg' &&
                    (item.imageUrl.startsWith('http://') || item.imageUrl.startsWith('https://'));

                return {
                    ...item,
                    imageUrl: hasValidImage ? item.imageUrl : item.imageUrl
                };
            });
        };

        return {
            ...response.data,
            expensiveOptions: processOptions(response.data.expensiveOptions),
            affordableOptions: processOptions(response.data.affordableOptions)
        };
    } catch (error) {
        console.error(`Error fetching analysis with ID ${analysisId}:`, error);
        throw error;
    }
};

/**
 * Get mock or real photos from Google Photos API
 */
export const getGooglePhotos = async () => {
    try {
        const response = await api.get('/api/photos/google');
        return response.data;
    } catch (error) {
        console.error('Error fetching Google photos:', error);
        throw error;
    }
};

/**
 * Get mock or real pins from Pinterest API
 */
export const getPinterestPins = async () => {
    try {
        const response = await api.get('/api/photos/pinterest');
        return response.data;
    } catch (error) {
        console.error('Error fetching Pinterest pins:', error);
        throw error;
    }
};

/**
 * Export the axios instance (for use in custom calls if needed)
 */
export default api;
