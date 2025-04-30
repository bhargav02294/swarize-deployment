// routes/storeRoutes.js
const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier'); // ✅ ADD THIS LINE

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer config: memory storage to access file buffer
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

// Get user ID from session or token
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
// ✅ Check store existence route
router.get('/check', async (req, res) => {
    try {
        const userId = await getUserId(req, res);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const store = await Store.findOne({ ownerId: userId });
        if (store) {
            return res.json({ hasStore: true, storeSlug: store.slug });
        } else {
            return res.json({ hasStore: false });
        }
    } catch (err) {
        console.error("❌ /check error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Create Store Route with Cloudinary upload

// Create Store Route with Cloudinary upload
// Create Store Route
router.post('/create', upload.single('logo'), async (req, res) => {
    try {
        const userId = await getUserId(req, res);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const { storeName, description } = req.body;
        const logoFile = req.file;

        if (!storeName || !description || !logoFile) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const existingStore = await Store.findOne({ ownerId: userId });
        if (existingStore) {
            return res.status(200).json({ success: true, slug: existingStore.slug });
        }

        const streamUpload = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({
                    folder: 'swarize/stores',
                    public_id: `store_${Date.now()}`,
                }, (error, result) => {
                    if (error) {
                        console.error('❌ Cloudinary Upload Error:', error); // Log error
                        return reject(error);
                    }
                    console.log('✅ Cloudinary Upload Success:', result); // Log success
                    resolve(result);
                });
                streamifier.createReadStream(logoFile.buffer).pipe(stream);
            });
        };

        const uploadResult = await streamUpload();

        const slug = storeName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const store = new Store({
            storeName,
            slug,
            description,
            logoUrl: uploadResult.secure_url,
            ownerId: userId
        });

        await store.save();
        await User.findByIdAndUpdate(userId, { store: store._id, role: 'seller' });

        res.status(201).json({ success: true, slug });
    } catch (error) {
        console.error("❌ /create error:", error);  // Log server errors
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


// ✅ Smart redirection based on store availability
router.get('/redirect-to-store', async (req, res) => {
    try {
        const userId = await getUserId(req, res);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const store = await Store.findOne({ ownerId: userId });
        if (store) {
            return res.json({ success: true, redirectTo: `/store.html?slug=${store.slug}` });
        } else {
            return res.json({ success: true, redirectTo: "/create-store.html" });
        }
    } catch (error) {
        console.error("❌ redirect-to-store error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Get store by slug
router.get('/:slug', async (req, res) => {
    try {
        const store = await Store.findOne({ slug: req.params.slug });
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        res.json({ success: true, store });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
