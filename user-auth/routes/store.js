const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Store = require('../models/store');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// ✅ Route to check if user has a store
router.get('/check', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'User not logged in' });
  }

  try {
    const store = await Store.findOne({ ownerId: req.session.userId });
    if (store) {
      return res.json({ success: true, storeExists: true });
    } else {
      return res.json({ success: true, storeExists: false });
    }
  } catch (err) {
    console.error("Error checking store:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Route to create a store
router.post('/create', upload.single('storeLogo'), async (req, res) => {
  if (!req.session.userId || !req.body.storeName || !req.body.description) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const existing = await Store.findOne({ ownerId: req.session.userId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Store already exists' });
    }

    const newStore = new Store({
      ownerId: req.session.userId,
      ownerEmail: req.session.email,
      storeName: req.body.storeName,
      description: req.body.description,
      storeLogo: req.file ? `/uploads/${req.file.filename}` : '',
      isActive: true,
    });

    await newStore.save();
    return res.json({ success: true, message: 'Store created successfully' });

  } catch (err) {
    console.error("Store creation error:", err);
    res.status(500).json({ success: false, message: 'Server error during store creation' });
  }
});

module.exports = router;
