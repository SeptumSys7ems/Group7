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
                expensiveOptions: [],
                affordableOptions: []
            };
        }

        // Process and sanitize product options to ensure all fields are present and valid
        const processOptions = (options, isPremium = true) => {
            if (!Array.isArray(options)) return [];
            
            return options.map((item, index) => {
                // Create descriptive placeholder text for the image
                const placeholderText = `${item.brand || ''} ${item.name || ''} ${item.type || 'Fashion Item'}`.trim();
                const encodedText = encodeURIComponent(placeholderText);
                
                // Generate appropriate colors for premium vs affordable
                const bgColor = isPremium ? '3e4095' : '4CAF50';
                const textColor = 'ffffff';
                
                return {
                    type: item.type || 'Apperal Type',
                    brand: item.brand || 'Brand',
                    name: item.name || item.description || 'hostess Item',
                    price: typeof item.price === 'number' ? item.price : parseFloat(item.price.replace('$', '')) || (isPremium ? 159.99 : 39.99),
                    imageUrl: (item.imageUrl && item.imageUrl !== '#' && item.imageUrl !== 'placeholder.jpg') 
                        ? item.imageUrl 
                        : `https://via.placeholder.com/500x600/${bgColor}/${textColor}?text=${encodedText}`,
                    productUrl: (item.productUrl && item.productUrl !== '#') 
                        ? item.productUrl 
                        : `https://www.google.com/search?q=${encodeURIComponent((item.brand || '') + ' ' + (item.name || '') + ' ' + (item.type || 'fashion item'))}`
                };
            });
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
            expensiveOptions: processOptions(geminiResults.expensiveOptions, true),
            affordableOptions: processOptions(geminiResults.affordableOptions, false),
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

        // Process options to ensure they have all required fields and valid images
        const processOptions = (options, isPremium = true) => {
            if (!Array.isArray(options)) return [];
            
            return options.map((item, index) => {
                // Create descriptive placeholder text for the image
                const placeholderText = `${item.brand || ''} ${item.name || ''} ${item.type || 'Fashn Item'}`.trim();
                const encodedText = encodeURIComponent(placeholderText);
                
                // Generate appropriate colors for premium vs affordable
                const bgColor = isPremium ? '3e4095' : '4CAF50';
                const textColor = 'ffffff';
                
                return {
                    type: item.type || 'Fashion It',
                    brand: item.brand || 'Brand',
                    name: item.name || 'Fashion em',
                    price: typeof item.price === 'number' ? item.price : parseFloat(item.price.replace('$', '')) || (isPremium ? 159.99 : 39.99),
                    imageUrl: (item.imageUrl && item.imageUrl !== '#' && item.imageUrl !== 'placeholder.jpg') 
                        ? item.imageUrl 
                        : `https://via.placeholder.com/500x600/${bgColor}/${textColor}?text=${encodedText}`,
                    productUrl: (item.productUrl && item.productUrl !== '#') 
                        ? item.productUrl 
                        : `https://www.google.com/search?q=${encodeURIComponent((item.brand || '') + ' ' + (item.name || '') + ' ' + (item.type || 'fashion item'))}`
                };
            });
        };

        res.json({
            analysisId: docRef.id,
            imageUrl: analysis.imageUrl,
            detectedItems: analysis.detectedItems || [],
            expensiveOptions: processOptions(analysis.expensiveOptions || [], true),
            affordableOptions: processOptions(analysis.affordableOptions || [], false),
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
            // Create a basic query without the orderBy (which requires an index)
            let query = db.collection('analyses')
                .where('userId', '==', userId);
                
            // Try to get the most recent analyses
            // If the index error occurs, we'll catch it and use a simpler query
            try {
                query = query.orderBy('timestamp', 'desc');
            } catch (indexError) {
                console.warn('Index not available for timestamp ordering, using basic query');
            }
                
            // Limit to 10 results
            query = query.limit(10);
            
            const snapshot = await query.get();

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
            // If we get the index error, try a simpler query without ordering
            if (firestoreError.code === 9 && firestoreError.details && firestoreError.details.includes('index')) {
                console.warn('Using fallback query without ordering due to missing index');
                const snapshot = await db.collection('analyses')
                    .where('userId', '==', userId)
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
            } else {
                console.error('Firestore query error:', firestoreError);
                res.json({ analyses: [] });
            }
        }
    } catch (error) {
        console.error('Get analyses error:', error);
        res.status(500).json({ error: 'Failed to get analyses' });
    }
});

module.exports = router;
