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
router.get('/check-store', isAuthenticated, async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.session.userId });
    if (store) {
      return res.status(200).json({ exists: true, store });
    }
    return res.status(200).json({ exists: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching store.' });
  }
});

// Create a new store
router.post('/create', isAuthenticated, [
  check('storeName').not().isEmpty().withMessage('Store name is required'),
  check('description').not().isEmpty().withMessage('Store description is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { storeName, description, storeLogo } = req.body;

  try {
    const newStore = new Store({
      ownerId: req.session.userId,
      storeName,
      description,
      storeLogo
    });

    await newStore.save();
    res.status(201).json({ message: 'Store created successfully', store: newStore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating store.' });
  }
});

module.exports = router;
