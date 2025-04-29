// backend/routes/photos.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const authenticateUser = require('../middleware/auth');

// Get Google Photos
router.get('/google', authenticateUser, async (req, res) => {
    try {
        // This would normally fetch photos from Google Photos API
        // For demo purposes, we'll return mock data

        // Mock Google Photos data
        const mockPhotos = Array(10).fill().map((_, i) => ({
            id: `photo_${i}`,
            baseUrl: `https://via.placeholder.com/300/3498db/ffffff?text=Photo+${i}`,
            filename: `photo_${i}.jpg`,
            mediaMetadata: {
                creationTime: new Date().toISOString()
            }
        }));

        res.json({ photos: mockPhotos });
    } catch (error) {
        console.error('Google Photos error:', error);
        res.status(500).json({ error: 'Failed to fetch Google Photos' });
    }
});

// Get Pinterest pins
router.get('/pinterest', authenticateUser, async (req, res) => {
    try {
        // This would normally fetch pins from Pinterest API
        // For demo purposes, we'll return mock data

        // Mock Pinterest data
        const mockPins = Array(10).fill().map((_, i) => ({
            id: `pin_${i}`,
            imageUrl: `https://via.placeholder.com/300/e74c3c/ffffff?text=Pin+${i}`,
            title: `Pin ${i}`,
            description: `Description for Pin ${i}`,
            link: `https://pinterest.com/pin/${i}`
        }));

        res.json({ pins: mockPins });
    } catch (error) {
        console.error('Pinterest error:', error);
        res.status(500).json({ error: 'Failed to fetch Pinterest pins' });
    }
});

module.exports = router;