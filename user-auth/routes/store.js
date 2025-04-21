const express = require('express');
const router = express.Router();
const multer = require('multer');
const Store = require('../models/store');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ Check if store exists for the logged-in user
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

// ✅ Create store
// ✅ Create store
router.post("/", upload.single("storeLogo"), async (req, res) => {
  try {
    console.log("Request Body: ", req.body); // Log form data
    console.log("Uploaded File: ", req.file); // Log uploaded file info

    if (!req.session.userId || !req.session.email) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const existingStore = await Store.findOne({
      ownerId: req.session.userId,
      ownerEmail: req.session.email
    });

    if (existingStore) {
      return res.status(400).json({ success: false, message: "Store already exists" });
    }

    const newStore = new Store({
      ownerId: req.session.userId,
      ownerEmail: req.session.email,
      storeName: req.body.storeName,
      storeLogo: req.file ? "/uploads/" + req.file.filename : "", // Ensure file exists before using it
      description: req.body.description
    });

    await newStore.save();
    return res.status(201).json({ success: true, message: "Store created successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ Get store details
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
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
