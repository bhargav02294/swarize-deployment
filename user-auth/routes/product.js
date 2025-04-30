const express = require('express');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const Product = require('../models/product');
const Store = require('../models/store');
const User = require('../models/user');

const router = express.Router();

// 🛠️ Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔐 Middleware for auth check
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId && !req.session?.passport?.user) {
        return res.status(401).json({ success: false, message: "Unauthorized: User not logged in" });
    }
    req.session.userId = req.session.userId || req.session.passport.user;
    next();
};

// 📦 Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ☁️ Cloudinary upload helper
function uploadToCloudinary(buffer, options) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
}

// ✅ Add product route
router.post('/add', isAuthenticated, upload.fields([
    { name: 'thumbnailImage', maxCount: 1 },
    { name: 'extraImages', maxCount: 5 },
    { name: 'extraVideos', maxCount: 3 }
]), async (req, res) => {
    try {
        const {
            name, price, description, summary, category, subcategory,
            tags, size, color, material, modelStyle, availableIn, storeId
        } = req.body;

        const userId = req.session.userId;

        // 🔍 Find store by storeId and userId
        const store = await Store.findOne({ _id: storeId, ownerId: userId });
        if (!store) {
            console.log("Store not found or unauthorized access");
            return res.status(400).json({ success: false, message: "Store not found or unauthorized" });
        }

        // 📤 Upload thumbnail
        let thumbnailResult = null;
        if (req.files['thumbnailImage']) {
            const file = req.files['thumbnailImage'][0];
            thumbnailResult = await uploadToCloudinary(file.buffer, {
                folder: 'products/thumbnails'
            });
        }

        // 📤 Upload extra images
        let extraImagesResult = [];
        if (req.files['extraImages']) {
            extraImagesResult = await Promise.all(req.files['extraImages'].map(file =>
                uploadToCloudinary(file.buffer, { folder: 'products/extraImages' })
            ));
        }

        // 📤 Upload extra videos
        let extraVideosResult = [];
        if (req.files['extraVideos']) {
            extraVideosResult = await Promise.all(req.files['extraVideos'].map(file =>
                uploadToCloudinary(file.buffer, { folder: 'products/extraVideos', resource_type: 'video' })
            ));
        }

        // 🧾 Create product
        const product = new Product({
            ownerId: userId,
            store: store._id,
            name,
            price,
            description,
            summary,
            category,
            subcategory,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            size,
            color,
            material,
            modelStyle,
            availableIn: availableIn || 'All Over India',
            thumbnailImage: thumbnailResult?.secure_url || null,
            extraImages: extraImagesResult.map(img => img.secure_url),
            extraVideos: extraVideosResult.map(vid => vid.secure_url),
        });

        await product.save();

        return res.status(200).json({ success: true, message: "Product added successfully!" });
    } catch (error) {
        console.error("❌ Error in product add route:", error);
        return res.status(500).json({ success: false, message: "Failed to add product." });
    }
});


// ✅ Get all products
router.get('/all', async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        console.error("❌ Error fetching all products:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
});

// ✅ Get products by store slug
router.get('/by-store/:slug', async (req, res) => {
    try {
        const store = await Store.findOne({ slug: req.params.slug });
        if (!store) return res.status(404).json({ success: false, message: "Store not found" });

        const products = await Product.find({ store: store._id });
        res.json({ success: true, products });
    } catch (err) {
        console.error("❌ Error in by-store route:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


  

// Route to fetch all products
// Fetch products by subcategory
router.get('/products', async (req, res) => {
    console.log("🔹 Checking Authentication - Session Data:", req.session);

    const userId = req.session?.userId || req.session?.passport?.user;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: User not logged in' });
    }

    try {
        const products = await Product.find({ ownerId: userId });

        if (products.length === 0) {
            console.log("No products found for user:", userId);
        } else {
            console.log("Returning products for user:", userId, products);
        }

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Error fetching products" });
    }
});




// ✅ Route to Fetch Products by Category
router.get('/category/:category/:subcategory?', async (req, res) => {
    try {
        const { category, subcategory } = req.params;
        const filter = { category };

        if (subcategory) {
            filter.subcategory = subcategory; // Filter by subcategory
        }

        const products = await Product.find(filter);

        if (!products.length) {
            return res.status(404).json({ success: false, message: `No products found in ${subcategory || category}.` });
        }

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error(" Error fetching products:", error);
        res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // ✅ Store userId in session
    req.session.userId = user._id.toString();
    req.session.save((err) => {
        if (err) {
            console.error(' Error saving session:', err);
            return res.status(500).json({ success: false, message: 'Session error' });
        }
        console.log(' User ID stored in session:', req.session.userId);
        res.json({ success: true, message: 'Login successful' });
    });
});


module.exports = router;