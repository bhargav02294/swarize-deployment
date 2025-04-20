// routes/store.js
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

const upload = multer({ storage: storage });

// Middleware to check user session
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
};

// Create Store
// ✅ Create Store
router.post("/", upload.single("storeLogo"), async (req, res) => {
    try {
      const { storeName, storeDescription } = req.body;
      const userId = req.session.userId;
  
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  
      const existingStore = await Store.findOne({ user: userId });
      if (existingStore) return res.status(400).json({ success: false, message: "Store already exists" });
  
      const storeLogoPath = `uploads/${req.file.filename}`;
  
      const store = new Store({
        user: userId,
        storeName,
        storeLogo: storeLogoPath,
        description: storeDescription,
      });
  
      await store.save();
      res.status(201).json({ success: true, store });
    } catch (error) {
      console.error("Error creating store:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
// Get seller's store
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.session.userId });
    if (!store) return res.status(404).json({ success: false, message: "No store found." });

    return res.json({ success: true, store });
  } catch (err) {
    console.error("❌ Error fetching store:", err);
    res.status(500).json({ success: false, message: "Server error fetching store." });
  }
});

module.exports = router;
