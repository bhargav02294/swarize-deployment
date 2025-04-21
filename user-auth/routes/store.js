// routes/store.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Store = require("../models/store");

// Set up multer for logo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// ✅ Check if store exists for the logged-in user
router.get("/check", async (req, res) => {
  try {
    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ message: "User not logged in" });
    }

    const existingStore = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email,
    });

    if (existingStore) {
      return res.status(200).json({ exists: true, storeId: existingStore._id });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("❌ Error checking store:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create new store (with image upload)
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, description } = req.body;

    if (!name || !description || !req.file) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingStore = await Store.findOne({ ownerId: req.session.userId });
    if (existingStore) {
      return res.status(400).json({ message: "Store already exists for this user." });
    }

    const newStore = new Store({
      ownerId: req.session.userId,
      ownerEmail: req.session.email,
      storeName: name,
      description: description,
      storeLogo: `/uploads/${req.file.filename}`,
    });

    await newStore.save();

    return res.status(201).json({ success: true, message: "Store created successfully", storeId: newStore._id });
  } catch (error) {
    console.error("❌ Store creation error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get store details for logged-in user
router.get("/my-store", async (req, res) => {
  try {
    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const store = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email,
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    return res.status(200).json({ success: true, store });
  } catch (error) {
    console.error("❌ Error fetching store:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
