// routes/store.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Store = require('../models/store');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads'); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// Create store route
router.post('/', upload.single('storeLogo'), async (req, res) => {
  try {
    const { storeName, storeDescription } = req.body;
    const storeLogo = req.file?.path?.replace('public/', '') || '';

    // Simulate auth user for now
    const ownerId = req.user?._id || req.body.ownerId || '661e721b03df49d546b20449'; // Replace with real user logic
    const ownerEmail = req.user?.email || req.body.ownerEmail || 'test@example.com';
    const authMethod = req.user?.authMethod || 'email';

    const existing = await Store.findOne({ ownerId });
    if (existing) return res.json({ success: false, message: 'Store already exists' });

    const store = new Store({
      ownerId,
      ownerEmail,
      storeName,
      storeLogo,
      description: storeDescription,
      authMethod
    });

    await store.save();

    res.json({ success: true, store });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get store for logged-in seller
router.get('/me', async (req, res) => {
  try {
    const ownerId = req.user?._id || req.query.ownerId || '661e721b03df49d546b20449'; // Replace with real user logic
    const store = await Store.findOne({ ownerId });
    if (!store) return res.json({ success: false, message: 'Store not found' });

    res.json({ success: true, store });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
