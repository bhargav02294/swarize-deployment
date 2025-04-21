const express = require('express');
const router = express.Router();
const Store = require('../models/store');  // Assuming the store schema is defined in 'models/store.js'

// Check if a store exists for the logged-in user
router.get('/check-store', async (req, res) => {
  try {
    const { userId, email } = req.session;  // Getting userId and email from session

    // Check if the user is logged in
    if (!userId || !email) {
      return res.status(400).json({ message: 'User not logged in' });
    }

    // Check if store exists in the database for this user
    const store = await Store.findOne({ ownerId: userId, ownerEmail: email });

    if (store) {
      return res.redirect('/store.html');  // Redirect to store page if store exists
    } else {
      return res.redirect('/create-store.html');  // Redirect to create store page if store doesn't exist
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Handle store creation (for new users)
router.post('/create-store', async (req, res) => {
  try {
    const { name, logo, description } = req.body;
    const { userId, email } = req.session;

    // Check if the store already exists for this user
    const existingStore = await Store.findOne({ ownerId: userId, ownerEmail: email });
    if (existingStore) {
      return res.status(400).json({ message: 'Store already exists' });
    }

    // Create a new store document
    const store = new Store({
      ownerId: userId,
      ownerEmail: email,
      name,
      logo,  // Save the file path or image URL
      description
    });

    await store.save();

    res.status(201).json({ message: 'Store created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating store' });
  }
});

module.exports = router;
