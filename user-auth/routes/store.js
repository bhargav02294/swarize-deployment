// routes/store.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const Store = require("../models/store");

const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Check if store exists for logged-in user
router.get("/check", async (req, res) => {
  try {
    const ownerId = req.session.userId;

    if (!ownerId) {
      return res.status(401).json({ exists: false, message: "Not logged in." });
    }

    const store = await Store.findOne({ ownerId });

    if (store) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error("Error checking store:", err);
    res.status(500).json({ exists: false, message: "Server error" });
  }
});

// ✅ Create a new store
router.post("/", upload.single("storeLogo"), async (req, res) => {
  try {
    const ownerId = req.session.userId;
    const ownerEmail = req.session.email;

    if (!ownerId || !ownerEmail) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { storeName, description } = req.body;

    // Check if user already has a store
    const existingStore = await Store.findOne({ ownerId });
    if (existingStore) {
      return res.status(400).json({ success: false, message: "Store already exists." });
    }

    const newStore = new Store({
      ownerId,
      ownerEmail,
      storeName,
      description,
      storeLogo: req.file ? "/uploads/" + req.file.filename : null,
      isActive: true,
    });

    await newStore.save();

    res.status(201).json({ success: true, message: "Store created successfully!" });
  } catch (err) {
    console.error("Error creating store:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
