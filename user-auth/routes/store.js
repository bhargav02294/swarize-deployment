const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + '-' + file.originalname;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

// Store creation route
router.post('/create', upload.single('storeLogo'), async (req, res) => {
  try {
    const { storeName, storeDescription } = req.body;
    const storeLogo = req.file.filename;
    
    // Check if the user already has a store
    const existingStore = await Store.findOne({ ownerId: req.session.userId });
    if (existingStore) {
      return res.status(400).json({ success: false, message: 'You already have a store.' });
    }

    const newStore = new Store({
      ownerId: req.session.userId,
      ownerEmail: req.session.email,
      storeName,
      storeLogo,
      storeDescription
    });

    const store = await newStore.save();
    res.json({ success: true, store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// Fetch store data by ownerId
router.get('/check', async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.session.userId });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }
    res.json({ success: true, store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

module.exports = router;
