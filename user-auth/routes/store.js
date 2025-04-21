// routes/store.js
const express = require('express');
const multer = require('multer');
const Store = require('../models/store');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Create Store Route (Handle form submission and save store data)
router.post('/create', upload.single('storeLogo'), async (req, res) => {
    try {
        // Validate session data
        if (!req.session.userId || !req.session.email) {
            return res.status(400).json({ success: false, message: 'User not logged in' });
        }

        const { storeName, storeDescription } = req.body;
        const storeLogo = req.file ? req.file.filename : null;

        // Check if all required fields are provided
        if (!storeName || !storeDescription || !storeLogo) {
            return res.status(400).json({ success: false, message: 'Please provide all required store details.' });
        }

        // Check if the user already has a store
        const existingStore = await Store.findOne({ ownerId: req.session.userId });
        if (existingStore) {
            return res.status(400).json({ success: false, message: 'You already have a store.' });
        }

        // Create a new store
        const newStore = new Store({
            ownerId: req.session.userId,
            ownerEmail: req.session.email,
            storeName,
            storeLogo,
            description: storeDescription
        });

        const store = await newStore.save();
        res.json({ success: true, store });

    } catch (error) {
        console.error('Error during store creation:', error);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
});

// Fetch Store by User ID (for displaying store page)
router.get('/:userId', async (req, res) => {
    try {
        const store = await Store.findOne({ ownerId: req.params.userId });
        
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found.' });
        }

        res.json({ success: true, store });

    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
});

module.exports = router;
