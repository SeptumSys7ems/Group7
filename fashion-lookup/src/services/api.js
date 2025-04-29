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
        const response = await api.post('/api/analysis', { imageUrl });
        return response.data;
    } catch (error) {
        console.error('Error analyzing image:', error);
        throw error;
    }
};

// Improved mock data for development purposes
const mockAnalyses = {
    analyses: [
        {
            id: 'analysis1',
            imageUrl: 'https://via.placeholder.com/400x600?text=Fashion+Outfit+1',
            detectedItems: [
                { type: 'Shirt', description: 'Blue button-down shirt' },
                { type: 'Pants', description: 'Beige chinos' }
            ],
            expensiveOptions: [
                { 
                    type: 'Shirt', 
                    brand: 'Ralph Lauren', 
                    name: 'Oxford Button-Down', 
                    price: 125, 
                    imageUrl: 'https://via.placeholder.com/300x400?text=Oxford+Button+Down', 
                    productUrl: 'https://www.ralphlauren.com/mens-clothing-shirts/custom-fit-oxford-shirt/406225.html' 
                },
                { 
                    type: 'Pants', 
                    brand: 'Bonobos', 
                    name: 'Stretch Chinos', 
                    price: 98, 
                    imageUrl: 'https://via.placeholder.com/300x400?text=Stretch+Chinos', 
                    productUrl: 'https://bonobos.com/products/stretch-washed-chino' 
                }
            ],
            affordableOptions: [
                { 
                    type: 'Shirt', 
                    brand: 'Uniqlo', 
                    name: 'Oxford Cloth Button-Down', 
                    price: 39.90, 
                    imageUrl: 'https://via.placeholder.com/300x400?text=OCBD+Shirt', 
                    productUrl: 'https://www.uniqlo.com/us/en/products/E444656-000/00' 
                },
                { 
                    type: 'Pants', 
                    brand: 'H&M', 
                    name: 'Slim Fit Chinos', 
                    price: 29.99, 
                    imageUrl: 'https://via.placeholder.com/300x400?text=Slim+Chinos', 
                    productUrl: 'https://www2.hm.com/en_us/productpage.0815456002.html' 
                }
            ],
            timestamp: new Date().toISOString()
        },
        {
            id: 'analysis2',
            imageUrl: 'https://via.placeholder.com/400x600?text=Fashion+Outfit+2',
            detectedItems: [
                { type: 'Jacket', description: 'Black leather jacket' },
                { type: 'Jeans', description: 'Dark blue jeans' }
            ],
            expensiveOptions: [
                { 
                    type: 'Jacket', 
                    brand: 'AllSaints', 
                    name: 'Cargo Leather Biker Jacket', 
                    price: 499, 
                    imageUrl: 'https://via.placeholder.com/300x400?text=Leather+Jacket', 
                    productUrl: 'https://www.us.allsaints.com/men/leather-jackets/allsaints-cargo-biker/?colour=5&category=21759' 
                },
                { 
                    type: 'Jeans', 
                    brand: 'Diesel', 
                    name: 'D-Amny Jeans', 
                    price: 228, 
                    imageUrl: 'https://via.placeholder.com/300x400?text=Designer+Jeans', 
                    productUrl: 'https://shop.diesel.com/en/jeans/d-amny-jeans/00SDHB069WF.html' 
                }
            ],
            affordableOptions: [
                { 
                    type: 'Jacket', 
                    brand: 'Zara', 
                    name: 'Faux Leather Biker Jacket', 
                    price: 69.90, 
                    imageUrl: 'https://via.placeholder.com/300x400?text=Faux+Leather+Jacket', 
                    productUrl: 'https://www.zara.com/us/en/faux-leather-biker-jacket-p08281410.html' 
                },
                { 
                    type: 'Jeans', 
                    brand: 'Levi\'s', 
                    name: '511 Slim Fit Jeans', 
                    price: 59.50, 
                    imageUrl: 'https://via.placeholder.com/300x400?text=511+Jeans', 
                    productUrl: 'https://www.levi.com/US/en_US/apparel/clothing/bottoms/511-slim-fit-mens-jeans/p/045111816' 
                }
            ],
            timestamp: new Date().toISOString()
        }
    ]
};

export const getUserAnalyses = async () => {
    try {
        // try to fetch from API first
        try {
            const response = await api.get('/api/analysis');
            
            // If response has no analyses or is empty, use mock data
            if (!response.data || !response.data.analyses || response.data.analyses.length === 0) {
                console.log('No analyses found in API response, using mock data');
                return mockAnalyses;
            }
            
            return response.data;
        } catch (apiError) {
            console.warn('API request failed, using mock data:', apiError);
            // Fall back to mock data if API fails
            return mockAnalyses;
        }
    } catch (error) {
        console.error('Error fetching analyses:', error);
        // Return mock data even if there's an error handling the API failure
        return mockAnalyses;
    }
};

// Mock function to simulate getting a single analysis
export const getMockAnalysis = (analysisId) => {
    const analysis = mockAnalyses.analyses.find(a => a.id === analysisId);
    
    if (!analysis) {
        // If no matching analysis found, return the first one
        return {
            ...mockAnalyses.analyses[0],
            id: analysisId
        };
    }
    
    return analysis;
};

export const getGooglePhotos = async () => {
    try {
        const response = await api.get('/api/photos/google');
        return response.data;
    } catch (error) {
        console.error('Error fetching Google photos:', error);
        throw error;
    }
};

export const getPinterestPins = async () => {
    try {
        const response = await api.get('/api/photos/pinterest');
        return response.data;
    } catch (error) {
        console.error('Error fetching Pinterest pins:', error);
        throw error;
    }
};

export default api;