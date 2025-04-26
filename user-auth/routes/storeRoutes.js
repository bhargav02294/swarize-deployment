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

    console.log("▶ Received POST /create");
    console.log("🧑‍💻 userId:", userId);
    console.log("🏷️ storeName:", storeName);
    console.log("📄 description:", description);
    console.log("🖼️ logoFile:", logoFile);

    if (!userId) return res.status(401).json({ success: false, message: "User not logged in" });
    if (!storeName || !description || !logoFile) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const existing = await Store.findOne({ ownerId: userId });
    if (existing) return res.status(409).json({ success: false, message: "Store already exists." });

    const slug = storeName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    const store = new Store({
      storeName,
      slug,
      description,
      logoUrl: `/uploads/${logoFile.filename}`,
      ownerId: userId
    });

    await store.save();

    await User.findByIdAndUpdate(userId, {
      store: store._id,
      role: 'seller'
    });

    console.log("✅ Store saved successfully!");
    res.status(201).json({ success: true, slug });

  } catch (err) {
    console.error("❌ Store creation failed:", err); // 🔥 THIS WILL SHOW THE REAL ERROR IN TERMINAL
    res.status(500).json({ success: false, message: "Internal Server Error: " + err.message });
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
