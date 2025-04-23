const express = require('express');
const router = express.Router();
const multer = require('multer');
const Store = require('../models/store');

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ✅ Create Store
router.post('/', upload.single('storeLogo'), async (req, res) => {
  try {
    const ownerId = req.session.userId;
    const ownerEmail = req.session.email;
    const { storeName, description } = req.body;

    if (!ownerId || !ownerEmail) {
      return res.status(401).json({ message: 'Not logged in' });
    }

    const existing = await Store.findOne({ ownerId });
    if (existing) {
      return res.status(400).json({ message: 'Store already exists' });
    }

    const storeLogo = req.file ? `/uploads/${req.file.filename}` : '';

    const newStore = new Store({
      ownerId,
      ownerEmail,
      storeName,
      storeLogo,
      description,
      isActive: true
    });

    await newStore.save();
    res.status(201).json({ message: 'Store created successfully' });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get Store by Owner
router.get('/my-store', async (req, res) => {
  try {
    const ownerId = req.session.userId;
    if (!ownerId) return res.status(401).json({ message: 'Not logged in' });

    const store = await Store.findOne({ ownerId });
    res.json(store || {});
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Check if store exists
router.get('/check-store', async (req, res) => {
  try {
    const ownerId = req.session.userId;
    if (!ownerId) return res.json({ exists: false });

    const existing = await Store.findOne({ ownerId });
    res.json({ exists: !!existing });
  } catch (err) {
    console.error('Check store error:', err);
    res.status(500).json({ exists: false });
  }
});

module.exports = router;
