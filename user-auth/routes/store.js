const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Store = require('../models/store');

// Set up multer storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Check if store exists for logged-in user
router.get('/api/store/check', async (req, res) => {
  try {
    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ exists: false });
    }

    const store = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    if (store) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ exists: false });
  }
});

// Create a new store
router.post('/api/store', upload.single('logo'), async (req, res) => {
  try {
    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { name, description } = req.body;

    if (!name || !description || !req.file) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const existingStore = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    if (existingStore) {
      return res.status(400).json({ success: false, message: 'Store already exists' });
    }

    const newStore = new Store({
      name,
      description,
      logoUrl: `/uploads/${req.file.filename}`,
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    await newStore.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get store details
router.get('/api/store', async (req, res) => {
  try {
    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const store = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    res.json({ success: true, store });
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
