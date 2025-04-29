const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const visionService = require('../services/vision');
const geminiService = require('../services/gemini');
const authenticateUser = require('../middleware/auth');
// firebase
const db = admin.firestore();

// Takes image and calls vision + gemini api
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { imageUrl } = req.body;
        const userId = req.user.uid;

        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        console.log('Calling Vision API', imageUrl);
        
        let visionResults;
        try {
            visionResults = await visionService.analyzeImage(imageUrl);
            console.log('Vision API results:', visionResults);
        } catch (visionError) {
            console.error('Vision API error:', visionError);
            // Continue with default values if Vision API fails
            visionResults = { labels: [], objects: [] };
        }
        
        console.log('Calling Gemini API');
        let geminiResults;
        try {
            geminiResults = await geminiService.generateAlternatives(imageUrl, visionResults);
        } catch (geminiError) {
            console.error('Gemini API error:', geminiError);
            // Provide default values if Gemini API fails
            geminiResults = {
                detectedItems: [{ type: 'Unknown', description: 'Could not analyze item' }],
                expensiveOptions: [
                    { 
                        type: 'Unknown', 
                        brand: 'Luxury Brand', 
                        name: 'Premium Item', 
                        price: 149.99, 
                        imageUrl: 'https://via.placeholder.com/300x400?text=Premium+Item', 
                        productUrl: 'https://www.google.com/search?q=luxury+fashion+items' 
                    },
                    { 
                        type: 'Unknown', 
                        brand: 'Designer Label', 
                        name: 'Designer Item', 
                        price: 199.99, 
                        imageUrl: 'https://via.placeholder.com/300x400?text=Designer+Item', 
                        productUrl: 'https://www.google.com/search?q=designer+fashion+items' 
                    }
                ],
                affordableOptions: [
                    { 
                        type: 'Unknown', 
                        brand: 'Budget Brand', 
                        name: 'Budget Item', 
                        price: 39.99, 
                        imageUrl: 'https://via.placeholder.com/300x400?text=Budget+Item', 
                        productUrl: 'https://www.google.com/search?q=affordable+fashion+items' 
                    },
                    { 
                        type: 'Unknown', 
                        brand: 'Value Store', 
                        name: 'Value Item', 
                        price: 29.99, 
                        imageUrl: 'https://via.placeholder.com/300x400?text=Value+Item', 
                        productUrl: 'https://www.google.com/search?q=value+fashion+items' 
                    }
                ]
            };
        }

        // Process and sanitize product options to ensure all fields are present
        const processOptions = (options) => {
            if (!Array.isArray(options)) return [];
            
            return options.map(item => ({
                type: item.type || 'Fashion Item',
                brand: item.brand || 'Brand',
                name: item.name || 'Fashion Item',
                price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 99.99,
                imageUrl: item.imageUrl && item.imageUrl !== '#' 
                    ? item.imageUrl 
                    : `https://via.placeholder.com/300x400?text=${encodeURIComponent(item.name || 'Fashion Item')}`,
                productUrl: item.productUrl && item.productUrl !== '#' 
                    ? item.productUrl 
                    : `https://www.google.com/search?q=${encodeURIComponent((item.brand || '') + ' ' + (item.name || 'fashion item'))}`
            }));
        };

        // Sanitize the data before storing
        const sanitizedData = {
            userId,
            imageUrl,
            visionResults: {
                labels: Array.isArray(visionResults.labels) ? visionResults.labels : [],
                objects: Array.isArray(visionResults.objects) ? visionResults.objects : []
            },
            detectedItems: Array.isArray(geminiResults.detectedItems) ? geminiResults.detectedItems : [],
            expensiveOptions: processOptions(geminiResults.expensiveOptions),
            affordableOptions: processOptions(geminiResults.affordableOptions),
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };

        try {
            const docRef = await db.collection('analyses').add(sanitizedData);
            return res.json({
                analysisId: docRef.id,
                imageUrl,
                detectedItems: sanitizedData.detectedItems,
                expensiveOptions: sanitizedData.expensiveOptions,
                affordableOptions: sanitizedData.affordableOptions
            });
        } catch (firestoreError) {
            console.error('Firestore error:', firestoreError);
            // Even if saving to Firestore fails, return the results to the client
            return res.json({
                analysisId: 'temp-' + Date.now(),
                imageUrl,
                detectedItems: sanitizedData.detectedItems,
                expensiveOptions: sanitizedData.expensiveOptions,
                affordableOptions: sanitizedData.affordableOptions
            });
        }
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

// Takes id of user and returns previous user requests
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        // Handle temporary IDs that weren't saved to the database
        if (id.startsWith('temp-')) {
            return res.status(404).json({ error: 'Analysis not found' });
        }

        const docRef = await db.collection('analyses').doc(id).get();

        if (!docRef.exists) {
            return res.status(404).json({ error: 'Analysis not found' });
        }

        const analysis = docRef.data();

        if (analysis.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Process options to ensure they have all required fields
        const processOptions = (options) => {
            if (!Array.isArray(options)) return [];
            
            return options.map(item => ({
                type: item.type || 'Fashion Item',
                brand: item.brand || 'Brand',
                name: item.name || 'Fashion Item',
                price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 99.99,
                imageUrl: item.imageUrl && item.imageUrl !== '#' 
                    ? item.imageUrl 
                    : `https://via.placeholder.com/300x400?text=${encodeURIComponent(item.name || 'Fashion Item')}`,
                productUrl: item.productUrl && item.productUrl !== '#' 
                    ? item.productUrl 
                    : `https://www.google.com/search?q=${encodeURIComponent((item.brand || '') + ' ' + (item.name || 'fashion item'))}`
            }));
        };

        res.json({
            analysisId: docRef.id,
            imageUrl: analysis.imageUrl,
            detectedItems: analysis.detectedItems || [],
            expensiveOptions: processOptions(analysis.expensiveOptions || []),
            affordableOptions: processOptions(analysis.affordableOptions || []),
            timestamp: analysis.timestamp
        });
    } catch (error) {
        console.error('Get analysis error:', error);
        res.status(500).json({ error: 'Failed to get analysis' });
    }
});

// Returns user fashion data
router.get('/', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.uid;

        try {
            const snapshot = await db.collection('analyses')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();

            const analyses = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    imageUrl: data.imageUrl,
                    detectedItems: data.detectedItems || [],
                    timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
                };
            });

            res.json({ analyses });
        } catch (firestoreError) {
            console.error('Firestore query error:', firestoreError);
            // Return empty analyses array if Firestore query fails
            res.json({ analyses: [] });
        }
    } catch (error) {
        console.error('Get analyses error:', error);
        res.status(500).json({ error: 'Failed to get analyses' });
    }
});

module.exports = router;