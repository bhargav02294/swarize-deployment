const express = require('express');
const multer = require('multer');
const path = require('path');
const Store = require('../models/store');
const router = express.Router();

// File upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.get('/check-store', async (req, res) => {
  try {
    const { userId, email } = req.session;
    if (!userId || !email) return res.status(401).json({ message: 'Unauthorized' });

    const store = await Store.findOne({ ownerId: userId, ownerEmail: email });
    if (store) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error('Error checking store:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', upload.single('storeLogo'), async (req, res) => {
  try {
    const { userId, email } = req.session;
    if (!userId || !email) return res.status(401).json({ message: 'Unauthorized' });

    const existingStore = await Store.findOne({ ownerId: userId, ownerEmail: email });
    if (existingStore) return res.status(400).json({ message: 'Store already exists' });

    const store = new Store({
      ownerId: userId,
      ownerEmail: email,
      storeName: req.body.storeName,
      storeLogo: req.file ? '/uploads/' + req.file.filename : '',
      description: req.body.storeDescription,
      isActive: true
    });

    await store.save();
    res.status(200).json({ message: 'Store created successfully', store });
  } catch (err) {
    console.error('Error creating store:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { userId, email } = req.session;
    const store = await Store.findOne({ ownerId: userId, ownerEmail: email });
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json(store);
  } catch (err) {
    console.error('Error fetching store:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
