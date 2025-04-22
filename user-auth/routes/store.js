const express = require('express');
const router = express.Router();
const Store = require('../models/store'); // Assuming you have a store model
const multer = require('multer'); // For file uploads
const path = require('path');

// Multer Setup for File Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads'); // Store files in 'public/uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file names
  }
});

const upload = multer({ storage: storage });

// 1. Check if store exists or not (Redirection Logic)
router.get('/check-store', async (req, res) => {
  try {
    const userId = req.session.userId; // Assuming userId is saved in session
    const userStore = await Store.findOne({ ownerId: userId });

    if (userStore) {
      // Redirect to store page if store exists
      res.redirect('/store.html');
    } else {
      // Redirect to create-store page if store does not exist
      res.redirect('/create-store.html');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
});

// 2. Create store (Post data to save in database)
router.post('/create-store', upload.single('storeLogo'), async (req, res) => {
  try {
    const { storeName, description } = req.body;
    const userId = req.session.userId;
    const storeLogo = req.file ? req.file.filename : null; // Store logo filename

    if (!storeName || !description || !storeLogo) {
      return res.status(400).send('Please fill in all fields');
    }

    // Save store details to the database
    const newStore = new Store({
      ownerId: userId,
      storeName,
      storeLogo,
      description,
      isActive: true,
    });

    await newStore.save();

    // After saving the store, redirect to the store page
    res.redirect('/store.html');
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
});
// 3. Get Store Details
router.get('/get-store/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Find the store by the owner's userId
      const userStore = await Store.findOne({ ownerId: userId });
  
      if (userStore) {
        res.json(userStore); // Send store details to the frontend
      } else {
        res.status(404).json({ message: 'Store not found' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send('Server error');
    }
  });
  
module.exports = router;
