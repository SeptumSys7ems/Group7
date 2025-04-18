
import axios from 'axios';
import { auth } from '../firebase';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(async (config) => {
    if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const analyzeImage = async (imageUrl) => {
    try {
        const response = await api.post('/analysis', { imageUrl });
        return response.data;
    } catch (error) {
        console.error('Error analyzing image:', error);
        throw error;
    }
};

export const getUserAnalyses = async () => {
    try {
        const response = await api.get('/analyses');
        return response.data;
    } catch (error) {
        console.error('Error fetching analyses:', error);
        throw error;
    }
};

export const getGooglePhotos = async () => {
    try {
        const response = await api.get('/photos/google');
        return response.data;
    } catch (error) {
        console.error('Error fetching Google photos:', error);
        throw error;
    }
};

export const getPinterestPins = async () => {
    try {
        const response = await api.get('/photos/pinterest');
        return response.data;
    } catch (error) {
        console.error('Error fetching Pinterest pins:', error);
        throw error;
    }
};

export default api;