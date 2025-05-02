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



// ✅ Place this BEFORE any /:id or similar param route
router.get('/my-store', async (req, res) => {
  try {
    const userId = req.session?.userId || req.session?.passport?.user;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const store = await Store.findOne({ owner: userId }); // 👈 FIXED: owner, not ownerId
    if (!store) {
      return res.status(200).json({ success: true, storeExists: false, products: [] });
    }

    const products = await Product.find({ store: store._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, storeExists: true, products });
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// 👇 Make sure this is AFTER /my-store route
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});



module.exports = router;
