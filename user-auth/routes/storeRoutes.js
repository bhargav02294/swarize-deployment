const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// ✅ Ensure uploads folder exists
const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log("✅ Uploads directory created");
}

// ✅ Multer config for image uploads
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
    limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
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

// ✅ Create Store Route
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
    } catch (error) {
        console.error("❌ /create error:", error);
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
