// routes/store.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Store = require('../models/store');

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ✅ GET: Check if store exists for current session user
router.get("/check", async (req, res) => {
  try {
    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ exists: false, message: "User not logged in." });
    }

    const store = await Store.findOne({ ownerId: req.session.userId, ownerEmail: req.session.email });

    if (store) {
      return res.json({ exists: true, store });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking store:", error);
    res.status(500).json({ exists: false, message: "Server error while checking store." });
  }
});

// ✅ POST: Create new store
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const { name, description } = req.body;
    const logo = req.file;

    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    if (!name || !logo || !description) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existingStore = await Store.findOne({ ownerId: req.session.userId });
    if (existingStore) {
      return res.status(409).json({ message: "Store already exists for this user." });
    }

    const newStore = new Store({
      ownerId: req.session.userId,
      ownerEmail: req.session.email,
      storeName: name,
      storeLogo: "/uploads/" + logo.filename,
      description,
      authMethod: "email"
    });

    await newStore.save();

    res.status(201).json({ message: "Store created successfully!", store: newStore });
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ message: "Something went wrong while creating the store." });
  }
});

module.exports = router;
