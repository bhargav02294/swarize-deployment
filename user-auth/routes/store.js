const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Store = require("../models/store");

// Upload storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Check if store exists
router.get("/check", async (req, res) => {
  const { ownerId, ownerEmail } = req.query;

  if (!ownerId || !ownerEmail) {
    return res.status(400).json({ error: "Missing ownerId or ownerEmail." });
  }

  try {
    const store = await Store.findOne({ ownerId, ownerEmail });
    if (store) {
      res.json({ hasStore: true, store });
    } else {
      res.json({ hasStore: false });
    }
  } catch (err) {
    console.error("Error checking store:", err);
    res.status(500).json({ error: "Server error while checking store." });
  }
});

// Create store
router.post("/", upload.single("storeLogo"), async (req, res) => {
  const { storeName, storeDescription, ownerId, ownerEmail } = req.body;

  if (!storeName || !storeDescription || !ownerId || !ownerEmail || !req.file) {
    return res.status(400).json({ error: "All fields including logo are required." });
  }

  try {
    const exists = await Store.findOne({ ownerId });
    if (exists) {
      return res.status(400).json({ error: "Store already exists for this owner." });
    }

    const newStore = new Store({
      storeName,
      description: storeDescription,
      ownerId,
      ownerEmail,
      storeLogo: req.file.filename,
    });

    await newStore.save();
    res.status(201).json({ message: "Store created", store: newStore });
  } catch (err) {
    console.error("Error creating store:", err);
    res.status(500).json({ error: "Server error while creating store." });
  }
});

module.exports = router;
