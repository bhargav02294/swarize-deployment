const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Store = require('../models/store');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error("Only images are allowed"));
    }
  }
});

// Middleware to check user session
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
};

// Create Store
router.post("/", upload.single("storeLogo"), async (req, res) => {
  try {
    const { storeName, storeDescription, country } = req.body;
    const userId = req.session.userId;
    const userEmail = req.session.userEmail; // Assuming email is saved in session

    if (!userId || !userEmail) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Check if store already exists for the user
    const existingStore = await Store.findOne({ ownerId: userId });
    if (existingStore) {
      return res.status(400).json({ success: false, message: "Store already exists" });
    }

    // If no file is uploaded, return an error
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Store file path
    const storeLogoPath = `uploads/${req.file.filename}`;

    // Create a new store entry
    const store = new Store({
      ownerId: userId,
      ownerEmail: userEmail,
      storeName,
      storeLogo: storeLogoPath,
      description: storeDescription,
      country: country || "India",  // Default to India if no country is provided
    });

    // Save the store
    await store.save();

    // Return the created store
    res.status(201).json({ success: true, store });
  } catch (error) {
    console.error("Error creating store:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});

// Get seller's store
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    // Fetch the store by user ID
    const store = await Store.findOne({ ownerId: req.session.userId });

    if (!store) {
      return res.status(404).json({ success: false, message: "No store found." });
    }

    return res.json({ success: true, store });
  } catch (err) {
    console.error("❌ Error fetching store:", err);
    res.status(500).json({ success: false, message: "Server error fetching store." });
  }
});

module.exports = router;
