const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const slugify = require('slugify');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only JPG, PNG, WEBP images are allowed"), false);
        }
        cb(null, true);
    }
});

// ✅ Utility to extract or restore session userId from JWT
async function getUserId(req, res) {
    let userId = req.session.userId;

    if (!userId) {
        const token = req.cookies.token;
        if (!token) return null;

        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            userId = verified.id;
            req.session.userId = userId;
            await req.session.save();
        } catch (err) {
            return null;
        }
    }

    return userId;
}

// ✅ Check store existence
router.get('/check', async (req, res) => {
  const userId = await getUserId(req, res);
  if (!userId) return res.status(401).json({ success: false });
  const store = await Store.findOne({ ownerId: userId });
  if (store) {
    return res.json({ hasStore: true, storeSlug: store.slug });
  } else {
    return res.json({ hasStore: false });
  }
});

// ✅ Create store
router.post('/create', upload.single('logo'), async (req, res) => {
  try {
    const userId = await getUserId(req, res);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { storeName, description } = req.body;
    if (!storeName || !description || !req.file) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const existing = await Store.findOne({ ownerId: userId });
    if (existing) return res.status(200).json({ success: true, slug: existing.slug });

    const logoResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'store_logos' }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const slug = slugify(storeName, { lower: true }) + '-' + Date.now();
    const newStore = new Store({
      storeName,
      description,
      slug,
      logoUrl: logoResult.secure_url,
      ownerId: userId
    });

    await newStore.save();
    await User.findByIdAndUpdate(userId, { store: newStore._id, role: 'seller' });

    res.status(201).json({ success: true, slug });
  } catch (err) {
    console.error("❌ /create error:", err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ✅ Redirect logic
router.get('/redirect-to-store', async (req, res) => {
  const userId = await getUserId(req, res);
  if (!userId) return res.status(401).json({ success: false });
  const store = await Store.findOne({ ownerId: userId });
  if (store) {
    return res.json({ success: true, redirectTo: `/store.html?slug=${store.slug}` });
  } else {
    return res.json({ success: true, redirectTo: '/create-store.html' });
  }
});

// ✅ Get store by slug
router.get('/:slug', async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug });
  if (!store) {
    return res.status(404).json({ success: false, message: 'Store not found' });
  }
  res.json({ success: true, store });
});

module.exports = router;