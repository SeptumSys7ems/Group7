// Firebase aunthentication
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const authenticateUser = require('../middleware/auth');

router.get('/me', authenticateUser, async (req, res) => {
    try {
        const user = await admin.auth().getUser(req.user.uid);

        res.json({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

module.exports = router;