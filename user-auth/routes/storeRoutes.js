const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require("jsonwebtoken");


// ✅ Create uploads folder if not exist
const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `store_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// ✅ Create store
// ✅ Create store (updated for token recovery)
router.post('/create', upload.single('logo'), async (req, res) => {
  try {
    let userId = req.session.userId;
    const { storeName, description } = req.body;
    const logoFile = req.file;

    if (!userId) {
      // 🛑 Try recovering from token if session userId is missing
      const token = req.cookies.token;
      if (token) {
        try {
          const verified = jwt.verify(token, process.env.JWT_SECRET);
          userId = verified.id;
          req.session.userId = userId;
          await req.session.save();
          console.log("✅ Recovered userId from token for store creation.");
        } catch (err) {
          console.error("❌ Invalid token during store creation.");
          return res.status(401).json({ success: false, message: "Invalid session. Please login again." });
        }
      } else {
        console.log("❌ No session or token during store creation.");
        return res.status(401).json({ success: false, message: "Unauthorized. Please login." });
      }
    }

    if (!storeName || !description || !logoFile) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const existing = await Store.findOne({ ownerId: userId });
    if (existing) return res.status(409).json({ success: false, message: 'Store already exists' });

    const slug = storeName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    const store = new Store({
      storeName,
      slug,
      description,
      logoUrl: `/uploads/${logoFile.filename}`,
      ownerId: userId
    });

    await store.save();
    await User.findByIdAndUpdate(userId, { store: store._id, role: 'seller' });

    console.log(`✅ Store created successfully for user: ${userId}`);

    res.status(201).json({ success: true, slug });
  } catch (err) {
    console.error('❌ Store creation failed:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ✅ Check if user has store
router.get('/check', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false });
  const store = await Store.findOne({ ownerId: req.session.userId });
  if (store) {
    return res.json({ hasStore: true, storeSlug: store.slug });
  } else {
    return res.json({ hasStore: false });
  }
});

// ✅ Get store details by slug
router.get('/:slug', async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    res.json({ success: true, store });
  } catch (err) {
    console.error("❌ Error loading store:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
