// Import necessary modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Uses application default credentials (e.g., from Google Cloud)
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET // Set storage bucket from environment
});

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'https://frontend-dot-fashionthief-a6f61.uc.r.appspot.com'], // Allowlisted origins
    credentials: true, // Allow cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
    optionsSuccessStatus: 200 // For legacy browsers (IE11, etc.) that choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight across-the-board

// Middleware to parse incoming requests with JSON payloads and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import route handlers
const authRoutes = require('./routes/auth');
const photoRoutes = require('./routes/photos');
const analysisRoutes = require('./routes/analysis');
const uploadRoutes = require('./routes/upload');

// Setup API routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/photos', photoRoutes); // Photo handling routes
app.use('/api/analysis', analysisRoutes); // Image analysis routes
app.use('/api/upload', uploadRoutes); // Upload-related routes

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});

/*
=================
Commented Out Code (Optional):
=================
- multer setup for local uploads (if needed)
- Firebase Admin initialization with service account credentials
- Directory creation for uploads if it doesn't exist
*/
