const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Store = require("../models/store");
const Product = require("../models/product");

// Configure multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Create or Update Store
router.post("/", upload.single("storeLogo"), async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { storeName, storeDescription } = req.body;
  const storeLogo = req.file ? req.file.filename : null;

  if (!storeName || !storeLogo) {
    return res.status(400).json({ success: false, message: "Store name and logo are required." });
  }

  try {
    let store = await Store.findOne({ ownerId: req.session.userId });

    if (store) {
      store.storeName = storeName;
      store.storeLogo = storeLogo;
      store.description = storeDescription || "";
    } else {
      const user = await require("../models/user").findById(req.session.userId);
      store = new Store({
        ownerId: req.session.userId,
        ownerEmail: user.email,
        storeName,
        storeLogo,
        description: storeDescription || "",
        country: "India",
      });
    }

    await store.save();
    res.status(201).json({ success: true, store });
  } catch (err) {
    console.error("❌ Error saving store:", err);
    res.status(500).json({ success: false, message: "Error saving store" });
  }
});

// Get store for logged-in user
router.get("/", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const store = await Store.findOne({ ownerId: req.session.userId });
    if (!store) return res.json({ success: false, message: "Store not found" });

    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching store" });
  }
});

// Get public store by userId
router.get("/public/:userId", async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.params.userId });
    if (!store) return res.json({ success: false, message: "Store not found" });

    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching store" });
  }
});

// Get products by userId
router.get("/products/:userId", async (req, res) => {
  try {
    const products = await Product.find({ ownerId: req.params.userId });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
});

module.exports = router;
