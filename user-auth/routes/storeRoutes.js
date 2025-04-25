const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Upload directory created at:", uploadDir);
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, 'store_' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({ storage: storage });

// ✅ Check Store
router.get('/check', async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ success: false, hasStore: false });

    const store = await Store.findOne({ ownerId: req.session.userId });
    if (store) {
      return res.json({ success: true, hasStore: true, storeSlug: store.slug });
    } else {
      return res.json({ success: true, hasStore: false });
    }
  } catch (err) {
    console.error("❌ Store check error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Create Store

router.post('/create', upload.single('logo'), async (req, res) => {
  try {
    const userId = req.session.userId;
    const { storeName, description } = req.body;
    const logoFile = req.file;

    if (!userId || !storeName || !description || !logoFile) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const existingStore = await Store.findOne({ ownerId: userId });
    if (existingStore) {
      return res.status(409).json({ success: false, message: "Store already exists" });
    }

    const slug = storeName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    const newStore = new Store({
      storeName,
      slug,
      description,
      logoUrl: `/uploads/${logoFile.filename}`,
      ownerId: userId
    });

    await newStore.save();

    await User.findByIdAndUpdate(userId, { store: newStore._id, role: 'seller' });

    res.status(201).json({ success: true, slug });
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ✅ Get Store by Slug
router.get('/:slug', async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug });
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    res.json({ success: true, store });
  } catch (err) {
    console.error("❌ Store fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
