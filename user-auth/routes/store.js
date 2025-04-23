const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Store = require("../models/store");
const Product = require("../models/product");

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Check if store exists
router.get("/check", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ hasStore: false, message: "User not logged in" });
  }

  const store = await Store.findOne({ ownerId: req.session.userId });
  res.json({ hasStore: !!store });
});

// Create store
router.post("/create", upload.single("logo"), async (req, res) => {
  try {
    const { storeName, description } = req.body;
    const logo = req.file ? `/uploads/${req.file.filename}` : "";

    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const existingStore = await Store.findOne({ ownerId: req.session.userId });
    if (existingStore) {
      return res.status(400).json({ success: false, message: "Store already exists" });
    }

    const newStore = new Store({
      ownerId: req.session.userId,
      storeName,
      storeLogo: logo,
      description,
    });

    await newStore.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Error creating store:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get store and its products
router.get("/", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false });
    }

    const store = await Store.findOne({ ownerId: req.session.userId });
    const products = await Product.find({ ownerId: req.session.userId });

    res.json({ store, products });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Delete product
router.delete("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    await Product.findByIdAndDelete(productId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete" });
  }
});

module.exports = router;
