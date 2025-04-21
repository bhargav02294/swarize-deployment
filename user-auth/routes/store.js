const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Store = require("../models/store");

// Image upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Route to check if user has a store
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
  } catch (error) {
    console.error("Error checking store:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to create a store
router.post("/", upload.single("storeLogo"), async (req, res) => {
  const { storeName, storeDescription, ownerId, ownerEmail } = req.body;

  if (!storeName || !storeDescription || !ownerId || !ownerEmail || !req.file) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const existingStore = await Store.findOne({ ownerId });
    if (existingStore) {
      return res.status(400).json({ error: "Store already exists." });
    }

    const newStore = new Store({
      storeName,
      description: storeDescription,
      storeLogo: req.file.filename,
      ownerId,
      ownerEmail,
    });

    await newStore.save();
    res.status(201).json({ message: "Store created successfully", store: newStore });
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
