// routes/store.js
const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const multer = require('multer');
const path = require('path');

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Get store by ownerId
router.get('/check/:ownerId', async (req, res) => {
  const { ownerId } = req.params;
  try {
    const store = await Store.findOne({ ownerId });
    if (store) {
      res.status(200).json({ exists: true, store });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new store
router.post('/', upload.single('storeLogo'), async (req, res) => {
  const { ownerId, ownerEmail, storeName, storeDescription } = req.body;
  if (!req.file) return res.status(400).json({ error: 'Logo is required' });

  try {
    const existingStore = await Store.findOne({ ownerId });
    if (existingStore) {
      return res.status(400).json({ error: 'Store already exists' });
    }

    const store = new Store({
      ownerId,
      ownerEmail,
      storeName,
      description: storeDescription,
      storeLogo: `/uploads/${req.file.filename}`,
      authMethod: 'email' // or 'google'/'facebook' if you're tracking this
    });

    await store.save();
    res.status(201).json({ message: 'Store created successfully', store });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create store' });
  }
});

// Get store details by ownerId (for store.html view)
router.get('/:ownerId', async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId });
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.status(200).json(store);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
