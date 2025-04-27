const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken'); // ADD THIS if missing

// ✅ Ensure uploads folder
const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("✅ Uploads directory created");
}

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `store_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ Max 5MB file size
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    // ✅ Check mime-type first
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Invalid file type. Only JPG, PNG, WEBP allowed.");
      error.status = 400;
      return cb(error, false);
    }

    // ✅ Double Check extension also
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      const error = new Error("Only image files are allowed!");
      error.status = 400;
      return cb(error, false);
    }

    // ✅ If all okay, accept the file
    cb(null, true);
  }
});


// ✅ Create Store Route
router.post('/create', upload.single('logo'), async (req, res) => {
  try {
    let userId = req.session.userId;

    if (!userId) {
      const token = req.cookies.token;
      if (token) {
        try {
          const verified = jwt.verify(token, process.env.JWT_SECRET);
          userId = verified.id;
          req.session.userId = userId;
          await req.session.save();
        } catch (err) {
          console.error("❌ Token Invalid during store creation:", err);
          return res.status(401).json({ success: false, message: "Invalid token. Please login again." });
        }
      } else {
        console.error("❌ No token and no session during store creation.");
        return res.status(401).json({ success: false, message: "Unauthorized. Please login." });
      }
    }

    const { storeName, description } = req.body;
    const logoFile = req.file;

    if (!storeName || !description || !logoFile) {
      console.error("❌ Missing required fields during store creation.");
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const existingStore = await Store.findOne({ ownerId: userId });
    if (existingStore) {
      return res.status(409).json({ success: false, message: "Store already exists." });
    }

    // ✅ Safe path for logo
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

    console.log(`✅ Store created successfully! Slug: ${slug}`);
    res.status(201).json({ success: true, slug });
  } catch (error) {
    console.error("❌ Server Error during store creation:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
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
