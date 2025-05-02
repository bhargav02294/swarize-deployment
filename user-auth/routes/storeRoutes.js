const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require("streamifier");

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer config
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP allowed"), false);
    }
    cb(null, true);
  }
});

// ✅ Get session userId or fallback to JWT
async function getUserId(req, res) {
  let userId = req.session.userId;
  if (!userId && req.cookies.token) {
    try {
      const verified = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
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
  try {
    const userId = await getUserId(req, res);
    if (!userId) return res.status(401).json({ success: false });

    const store = await Store.findOne({ ownerId: userId });
    if (store) {
      res.json({ hasStore: true, storeSlug: store.slug });
    } else {
      res.json({ hasStore: false });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Create store
router.post('/create', upload.single('logo'), async (req, res) => {
  try {
    const userId = await getUserId(req, res);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const storeName = req.body.storeName?.trim();
    const description = req.body.description?.trim();
    const logoFile = req.file;

    if (!storeName || !description || !logoFile) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await Store.findOne({ ownerId: userId });
    if (existing) {
      return res.status(200).json({ message: "Store already exists", slug: existing.slug });
    }

    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
          folder: 'swarize/stores',
          public_id: `store_${Date.now()}`
        }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const uploaded = await streamUpload(logoFile.buffer);

    const newStore = new Store({
      storeName,
      description,
      logoUrl: uploaded.secure_url,
      ownerId: userId
    });

    const saved = await newStore.save();
    await User.findByIdAndUpdate(userId, { store: saved._id, role: 'seller' });

    res.status(201).json({ success: true, slug: saved.slug });

  } catch (err) {
    console.error("❌ Store Create Error:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// ✅ Redirect to store
router.get('/redirect-to-store', async (req, res) => {
  try {
    const userId = await getUserId(req, res);
    if (!userId) return res.status(401).json({ success: false });

    const store = await Store.findOne({ ownerId: userId });
    if (store) {
      res.json({ success: true, redirectTo: `/store.html?slug=${store.slug}` });
    } else {
      res.json({ success: true, redirectTo: "/create-store.html" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ Route to get current user's store slug
// 👇 is route ko top me daalo, slug wale route se pehle
router.get('/my-store-slug', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const store = await Store.findOne({ owner: userId });
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    res.json({ success: true, slug: store.slug });
  } catch (err) {
    console.error("❌ Error getting store slug:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ Route to get store by slug (MUST be last)
router.get('/:slug', async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug });
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });
    res.json({ success: true, store });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
