// routes/store.js
const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const multer = require('multer');
const path = require('path');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Check if store exists
router.get('/check-store', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const store = await Store.findOne({
      ownerId: req.session.userId,
      storeName: { $exists: true, $ne: '' }
    });

    res.json({ exists: !!store });
  } catch (err) {
    console.error('Error checking store:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Create store
router.post('/create', upload.single('storeLogo'), async (req, res) => {
  try {
    const { storeName, description } = req.body;
    const storeLogo = req.file ? `/uploads/${req.file.filename}` : null;

    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if store already exists
    const existing = await Store.findOne({ ownerId: req.session.userId });
    if (existing) {
      return res.status(400).json({ message: 'Store already exists' });
    }

    const newStore = new Store({
      ownerId: req.session.userId,
      storeName,
      description,
      storeLogo,
      isActive: true
    });

    await newStore.save();
    res.status(201).json({ message: 'Store created successfully' });
  } catch (err) {
    console.error('Error creating store:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
