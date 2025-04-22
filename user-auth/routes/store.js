// ✅ File: routes/store.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Store = require('../models/store');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/check', async (req, res) => {
  try {
    const ownerId = req.session.userId;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const store = await Store.findOne({ ownerId });
    if (store) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', upload.single('storeLogo'), async (req, res) => {
  try {
    const ownerId = req.session.userId;
    const { storeName, storeDescription } = req.body;
    const storeLogo = req.file ? req.file.filename : '';

    if (!ownerId || !storeName || !storeDescription || !storeLogo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await Store.findOne({ ownerId });
    if (existing) return res.status(400).json({ error: 'Store already exists' });

    const newStore = new Store({
      ownerId,
      storeName,
      storeLogo,
      description: storeDescription,
    });
    await newStore.save();
    res.json({ message: 'Store created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/details', async (req, res) => {
  try {
    const ownerId = req.session.userId;
    const store = await Store.findOne({ ownerId });
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
