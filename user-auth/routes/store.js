const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Store = require('../models/store'); // Assuming Store model is in the models folder
const router = express.Router();

// Check if 'uploads' directory exists, if not, create it
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save file in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to avoid file overwriting
  },
});

const upload = multer({ storage: storage });

// Route to check if the user has a store and redirect accordingly
router.get('/check-store', async (req, res) => {
  try {
    // Fetch store details by checking userId (from session) and email
    const store = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    if (store) {
      // If the store exists, redirect to store page
      res.redirect('/store.html');
    } else {
      // If the store doesn't exist, redirect to create-store page
      res.redirect('/create-store.html');
    }
  } catch (err) {
    console.error('Error checking store:', err);
    res.status(500).json({ message: 'Something went wrong while checking your store!' });
  }
});

// Route to handle store creation with file upload
router.post('/store', upload.single('logo'), async (req, res) => {
  try {
    const { storeName, description } = req.body;
    const logoUrl = `/uploads/${req.file.filename}`;

    // Store logic to save store info into database (e.g., MongoDB)
    const newStore = new Store({
      ownerId: req.session.userId,
      ownerEmail: req.session.email, // Ensure this is set in session
      storeName,
      storeLogo: logoUrl,
      description,
      isActive: true,
    });

    await newStore.save();

    // After successfully creating the store, redirect to store page
    res.redirect('/store.html');
  } catch (err) {
    console.error('Error creating store:', err);
    res.status(500).json({ message: 'Something went wrong!' });
  }
});

module.exports = router;
