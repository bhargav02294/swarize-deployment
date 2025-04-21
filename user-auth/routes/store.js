// routes/store.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Store = require('../models/store');

// Set up storage for uploaded logos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// Get store by ownerId (for checking if user has a store)
router.get('/check/:ownerId', async (req, res) => {
  const { ownerId } = req.params;
  try {
    const store = await Store.findOne({ ownerId });
    if (store) {
      res.json({ hasStore: true, store });
    } else {
      res.json({ hasStore: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new store
router.post('/', upload.single('storeLogo'), async (req, res) => {
  try {
    const { ownerId, ownerEmail, storeName, storeDescription, authMethod } = req.body;
    const storeLogo = req.file ? `/uploads/${req.file.filename}` : '';

    const existingStore = await Store.findOne({ ownerId });
    if (existingStore) {
      return res.status(400).json({ message: 'Store already exists for this user.' });
    }

    const newStore = new Store({
      ownerId,
      ownerEmail,
      storeName,
      storeLogo,
      description: storeDescription,
      authMethod,
      country: 'India',
    });

    await newStore.save();
    res.status(201).json({ message: 'Store created successfully', store: newStore });
  } catch (err) {
    console.error('Store creation error:', err);
    res.status(500).json({ message: 'Error creating store' });
  }
});

module.exports = router;
