// routes/store.js
const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const multer = require('multer');
const path = require('path');

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ✅ Check if seller already has a store
router.get('/check', async (req, res) => {
  const { ownerId, ownerEmail } = req.query;
  if (!ownerId || !ownerEmail) return res.status(400).json({ error: 'Missing credentials' });

  try {
    const store = await Store.findOne({ ownerId, ownerEmail });
    if (store) {
      return res.json({ hasStore: true, store });
    } else {
      return res.json({ hasStore: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Create store
router.post('/', upload.single('storeLogo'), async (req, res) => {
  const { ownerId, ownerEmail, storeName, storeDescription } = req.body;

  if (!ownerId || !ownerEmail || !storeName || !req.file) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const existingStore = await Store.findOne({ ownerId });
    if (existingStore) {
      return res.status(400).json({ error: 'Store already exists' });
    }

    const store = new Store({
      ownerId,
      ownerEmail,
      storeName,
      storeLogo: req.file.filename,
      description: storeDescription,
    });

    await store.save();
    res.status(201).json({ message: 'Store created', store });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

module.exports = router;
