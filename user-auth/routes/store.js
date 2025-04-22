const express = require('express');
const router = express.Router();
const multer = require('multer');
const Store = require('../models/store');

const upload = multer({ dest: 'public/uploads/' });

// Check if a store exists for the logged-in user
router.get('/check', async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ message: 'Not logged in' });

    const existingStore = await Store.findOne({ ownerId: req.session.userId });
    res.json({ storeExists: !!existingStore });
  } catch (err) {
    console.error('Error checking store:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new store
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ message: 'Not logged in' });
    }

    const existingStore = await Store.findOne({ ownerId: req.session.userId });
    if (existingStore) {
      return res.status(400).json({ message: 'Store already exists' });
    }

    const { storeName, storeDescription } = req.body;
    const logo = req.file?.filename;

    if (!storeName || !logo || !storeDescription) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newStore = new Store({
      ownerId: req.session.userId,
      ownerEmail: req.session.email,
      storeName,
      storeLogo: `/uploads/${logo}`,
      description: storeDescription,
      isActive: true
    });

    await newStore.save();
    res.status(201).json({ message: 'Store created successfully' });
  } catch (err) {
    console.error('Error creating store:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's store
router.get('/', async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ message: 'Not logged in' });

    const store = await Store.findOne({ ownerId: req.session.userId });
    if (!store) return res.status(404).json({ message: 'Store not found' });

    res.json(store);
  } catch (err) {
    console.error('Error fetching store:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
