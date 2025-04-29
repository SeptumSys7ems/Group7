// Const for services
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateUser = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

function sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}
  


// Multer storage setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userDir = path.join(uploadsDir, req.user.uid);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: function (req, file, cb) {
        // const uniqueFilename = Date.now() + '-' + file.originalname;
        const uniqueFilename = Date.now() + '-' + sanitizeFilename(file.originalname);
        cb(null, uniqueFilename);
    }
});

// Multer upload setup
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: function (req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    }
});

// User photo upload
router.post('/', authenticateUser, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.user.uid}/${req.file.filename}`;
        res.json({ imageUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

module.exports = router;
