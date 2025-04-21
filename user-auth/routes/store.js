// routes/store.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Store = require("../models/store");

// Multer setup for logo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// GET: Check if current session user has a store
router.get("/check", async (req, res) => {
  if (!req.session.userId || !req.session.email) {
    return res.status(401).json({ error: "Unauthorized - Missing session" });
  }

  try {
    const store = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    if (store) {
      return res.json({ hasStore: true, store });
    } else {
      return res.json({ hasStore: false });
    }
  } catch (error) {
    console.error("Store check error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET: Get store details by session user
router.get("/by-owner", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const store = await Store.findOne({ ownerId: req.session.userId });
    if (!store) return res.status(404).json({ error: "Store not found" });
    res.json(store);
  } catch (err) {
    console.error("Error fetching store:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST: Create a new store
router.post("/", upload.single("storeLogo"), async (req, res) => {
  const { storeName, storeDescription } = req.body;
  const { userId, email } = req.session;

  if (!storeName || !storeDescription || !req.file || !userId || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existing = await Store.findOne({ ownerId: userId });
    if (existing) {
      return res.status(400).json({ error: "Store already exists" });
    }

    const newStore = new Store({
      storeName,
      description: storeDescription,
      storeLogo: req.file.filename,
      ownerId: userId,
      ownerEmail: email
    });

    await newStore.save();
    res.status(201).json({ message: "Store created", store: newStore });
  } catch (err) {
    console.error("Error creating store:", err);
    res.status(500).json({ error: "Failed to create store" });
  }
});

module.exports = router;
