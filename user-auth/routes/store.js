const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const { check, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

// Middleware to check user session
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
};

// Check if store exists for a user

// Check if a store exists for the user
router.get('/check-store', async (req, res) => {
  if (req.session.userId) {
    const store = await Store.findOne({ ownerId: req.session.userId });
    if (store) {
      return res.json({ exists: true });
    }
  }
  return res.json({ exists: false });
});

// Create a new store
router.post('/create', async (req, res) => {
  if (!req.session.userId) {
    return res.status(400).json({ message: 'User not authenticated' });
  }

  const { storeName, description } = req.body;
  const storeLogo = req.files.storeLogo; // Assuming you're using file upload middleware like `express-fileupload` or `multer`

  try {
    const store = new Store({
      ownerId: req.session.userId,
      storeName,
      description,
      storeLogo: storeLogo.path, // Save the file path or URL
      isActive: true,
    });
    
    await store.save();
    return res.status(201).json({ message: 'Store created successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating store' });
  }
});

module.exports = router;
