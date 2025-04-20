const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Store = require("../models/store");

// Configure multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // Save files to /public/uploads
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /api/store - create store with logo
router.post("/", upload.single("storeLogo"), async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { storeName, storeDescription } = req.body;
    const storeLogoPath = `uploads/${req.file.filename}`;

    const store = new Store({
      user: req.session.userId,
      storeName,
      description: storeDescription,
      storeLogo: storeLogoPath,
    });

    await store.save();

    res.status(201).json({ success: true, message: "Store created", store });
  } catch (err) {
    console.error("❌ Error creating store:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/store - get store for logged-in user
router.get("/", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const store = await Store.findOne({ user: req.session.userId });
    if (!store) {
      return res.json({ success: false, message: "Store not found" });
    }

    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Public view: GET /api/store/public/:userId
router.get("/public/:userId", async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.params.userId });
    if (!store) {
      return res.json({ success: false, message: "Store not found" });
    }

    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get products for a specific store
router.get("/products/:userId", async (req, res) => {
  const Product = require("../models/product");

  try {
    const products = await Product.find({ user: req.params.userId });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
