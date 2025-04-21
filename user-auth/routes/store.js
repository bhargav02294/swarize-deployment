// routes/store.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Store = require("../models/store");

// Set up multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Check if user already has a store
router.get("/check", async (req, res) => {
  const { ownerId, ownerEmail } = req.query;
  if (!ownerId || !ownerEmail) {
    return res.status(400).json({ error: "Missing owner credentials." });
  }

  try {
    const store = await Store.findOne({ ownerId, ownerEmail });
    if (store) {
      res.json({ hasStore: true, store });
    } else {
      res.json({ hasStore: false });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error while checking store." });
  }
});

// Create new store
router.post("/", upload.single("storeLogo"), async (req, res) => {
  const { storeName, storeDescription, ownerId, ownerEmail } = req.body;
  const logoFile = req.file;

  if (!storeName || !storeDescription || !ownerId || !ownerEmail || !logoFile) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const existing = await Store.findOne({ ownerId });
    if (existing) {
      return res.status(400).json({ error: "Store already exists for this owner." });
    }

    const newStore = new Store({
      storeName,
      description: storeDescription,
      storeLogo: logoFile.filename,
      ownerId,
      ownerEmail,
    });

    await newStore.save();
    res.status(201).json({ message: "Store created successfully", store: newStore });
  } catch (err) {
    res.status(500).json({ error: "Server error while saving store." });
  }
});

module.exports = router;
