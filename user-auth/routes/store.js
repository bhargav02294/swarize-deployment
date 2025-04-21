const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Store = require('../models/store');

// Multer config for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Check if store exists for current session user
router.get('/check', async (req, res) => {
  try {
    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const store = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    if (store) {
      return res.json({ exists: true, storeId: store._id });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error('Error checking store:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create store
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const logo = req.file ? '/uploads/' + req.file.filename : null;

    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existingStore = await Store.findOne({ ownerId: req.session.userId });
    if (existingStore) {
      return res.status(400).json({ message: 'Store already exists' });
    }

    const newStore = new Store({
      ownerId: req.session.userId,
      ownerEmail: req.session.email,
      storeName: name,
      storeLogo: logo,
      description
    });

    await newStore.save();
    res.status(201).json({ message: 'Store created successfully' });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get store details for current user
router.get('/', async (req, res) => {
  try {
    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const store = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
