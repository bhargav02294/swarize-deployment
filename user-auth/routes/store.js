const express = require('express');
const router = express.Router();
const multer = require('multer');
const Store = require('../models/store');

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ Route: Check if user already has a store
router.get("/check", async (req, res) => {
  try {
    if (!req.session.userId || !req.session.email) {
      console.log("🔒 Not logged in");
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const existingStore = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    if (existingStore) {
      console.log("✅ Store found for user:", req.session.userId);
      return res.json({ exists: true });
    } else {
      console.log("❌ No store found for user:", req.session.userId);
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error("🔥 Error in GET /api/store/check:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Route: Create a store
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    if (!req.session.userId || !req.session.email) {
      console.log("🔒 Unauthorized - No session");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    console.log("📥 Form submission received");
    console.log("Session userId:", req.session.userId);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const existingStore = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    if (existingStore) {
      console.log("⚠️ Store already exists");
      return res.status(400).json({ success: false, message: "Store already exists" });
    }

    const newStore = new Store({
      ownerId: req.session.userId,
      ownerEmail: req.session.email,
      storeName: req.body.name,
      storeLogo: "/uploads/" + req.file.filename,
      description: req.body.description
    });

    console.log("✅ New Store Data:", newStore);

    await newStore.save();

    return res.status(201).json({ success: true, message: "Store created successfully" });

  } catch (err) {
    console.error("🔥 Error in POST /api/store:", err);
    return res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});

// ✅ Route: Get store details for current user
router.get("/my-store", async (req, res) => {
  try {
    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const store = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    return res.json({ success: true, store });
  } catch (err) {
    console.error("🔥 Error in GET /api/store/my-store:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
