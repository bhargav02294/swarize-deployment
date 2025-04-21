const express = require('express');
const router = express.Router();
const multer = require('multer');
const Store = require('../models/store');

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Check if store exists for the logged-in user
router.get("/check", async (req, res) => {
  try {
    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const existingStore = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    if (existingStore) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create store
// Inside POST request for store creation
router.post("/", upload.single("storeLogo"), async (req, res) => {
  try {
    // Log session data
    console.log("🔍 Session Data:", req.session);

    // Check if the session is missing
    if (!req.session.userId || !req.session.email) {
      console.log("❌ Missing session data.");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Log file upload info
    console.log("📁 Uploaded File Info:", req.file);

    // Log form data from the request body
    console.log("📝 Request Body:", req.body);

    const existingStore = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    if (existingStore) {
      console.log("⚠️ Store already exists for this user.");
      return res.status(400).json({ success: false, message: "Store already exists" });
    }

    const newStore = new Store({
      ownerId: req.session.userId,
      ownerEmail: req.session.email,
      storeName: req.body.storeName,
      storeLogo: "/uploads/" + req.file.filename,
      description: req.body.description
    });

    // ✅ Log the store data being saved
    console.log("✅ New Store Data:", newStore);

    await newStore.save();
    return res.status(201).json({ success: true, message: "Store created successfully" });

  } catch (err) {
    console.error("🔥 Error while creating store:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// Get store details for the logged-in user
router.get("/my-store", async (req, res) => {
  try {
    const store = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    return res.json({ success: true, store });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
