const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');

// ✅ Image Upload Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `store_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// ✅ Check Store
router.get('/check', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ hasStore: false });

  const store = await Store.findOne({ ownerId: req.session.userId });
  if (store) {
    return res.json({ hasStore: true, storeSlug: store.slug });
  }
  return res.json({ hasStore: false });
});

// ✅ Create Store
router.post('/create', upload.single('logo'), async (req, res) => {
  const userId = req.session.userId;
  const { storeName, description } = req.body;
  const logoFile = req.file;

  if (!userId || !storeName || !description || !logoFile) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const existing = await Store.findOne({ ownerId: userId });
  if (existing) return res.status(409).json({ success: false, message: "Store already exists" });

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

  res.status(201).json({ success: true, slug });
});

module.exports = router;
