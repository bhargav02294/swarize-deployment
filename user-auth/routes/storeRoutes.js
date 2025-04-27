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

// ✅ Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Save to uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, `store_${Date.now()}${path.extname(file.originalname)}`); // Unique file name
  }
});

// Setup multer to handle file upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Invalid file type. Only JPG, PNG, WEBP allowed.");
      error.status = 400;
      return cb(error, false);
    }
    cb(null, true); // Accept the file
  }
});


// ✅ Create Store Route
// ✅ Create Store Route
router.post('/create', upload.single('logo'), async (req, res) => {
  try {
    console.log("Received data:", req.body);  // Log form data
    console.log("Received file:", req.file);  // Log the uploaded file

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

    // Check if data is present
    if (!storeName || !description || !logoFile) {
      console.error("❌ Missing required fields during store creation.");
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const existingStore = await Store.findOne({ ownerId: userId });
    if (existingStore) {
      // Store already exists, redirect to store page
      return res.status(200).json({ success: true, slug: existingStore.slug });
    }

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
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const store = await Store.findOne({ ownerId: req.session.userId });
    if (store) {
      return res.json({ hasStore: true, storeSlug: store.slug });
    } else {
      return res.json({ hasStore: false });
    }
  } catch (error) {
    console.error("❌ Error checking store:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ✅ Get store details by slug
router.get('/:slug', async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    res.json({ success: true, store });
  } catch (err) {
    console.error("❌ Error loading store:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
