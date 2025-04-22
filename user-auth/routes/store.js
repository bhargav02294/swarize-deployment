const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Store = require('../models/store');
const User = require('../models/user');
const fs = require('fs');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  // Store with timestamp to avoid name conflicts
  }
});
const upload = multer({ storage: storage });

// Route to check if store exists and redirect accordingly
router.get('/', async (req, res) => {
  try {
    if (req.session.userId) {
      const store = await Store.findOne({ ownerId: req.session.userId });
      if (store) {
        // Store exists, redirect to the store page
        return res.json({ store });
      } else {
        // No store, redirect to the create-store page
        return res.json({ store: null });
      }
    } else {
      return res.status(400).json({ error: 'User not logged in' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Route to create a new store
router.post('/', upload.single('storeLogo'), async (req, res) => {
  try {
    const { storeName, storeDescription } = req.body;
    const { userId } = req.session;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if the user already has a store
    const existingStore = await Store.findOne({ ownerId: userId });
    if (existingStore) {
      return res.status(400).json({ error: 'Store already exists' });
    }

    // Create a new store
    const store = new Store({
      ownerId: userId,
      storeName,
      description: storeDescription,
      storeLogo: req.file.filename,  // Save the logo filename
    });

    await store.save();

    // Respond with success
    res.status(201).json({ success: true, store });

  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to fetch a specific store
router.get('/:storeId', async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId).populate('ownerId', 'name email');
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
