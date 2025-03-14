const express = require('express');
const multer = require('multer');
const Product = require('../models/product');
const path = require('path');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
    console.log("🔹 Checking Authentication - Session Data:", req.session);

    if (!req.session.userId && !req.session?.passport?.user) {
        return res.status(401).json({ success: false, message: "Unauthorized: User not logged in" });
    }

    req.session.userId = req.session.userId || req.session.passport.user;

    req.session.save(err => {
        if (err) {
            console.error("Error saving session:", err);
            return res.status(500).json({ success: false, message: "Session error" });
        }
        next();
    });
};


// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

router.post("/add", isAuthenticated, upload.fields([
    { name: 'thumbnailImage', maxCount: 1 },
    { name: 'extraImages', maxCount: 5 },  // ✅ Fix: Ensure matches frontend
    { name: 'extraVideos', maxCount: 3 }   // ✅ Fix: Ensure matches frontend
]), async (req, res) => {
    try {
        console.log("🔹 Incoming request to add a product...");
        console.log("🔹 Uploaded Files:", req.files);

        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not logged in" });
        }

        const { name, price, description, summary, category, subcategory, tags, size, color, material, modelStyle } = req.body;

        const thumbnailImage = req.files['thumbnailImage'] ? `uploads/${req.files['thumbnailImage'][0].filename}` : null;
        const extraImages = req.files['extraImages'] ? req.files['extraImages'].map(file => `uploads/${file.filename}`) : [];
        const extraVideos = req.files['extraVideos'] ? req.files['extraVideos'].map(file => `uploads/${file.filename}`) : [];


        console.log("✅ Extracted Extra Images:", extraImages);
        console.log("✅ Extracted Extra Videos:", extraVideos);

        const product = new Product({
            ownerId: userId,
            name,
            price,
            description,
            summary,
            category,
            subcategory,
            tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
            size,
            color,
            material,
            modelStyle,
            thumbnailImage,
            extraImages,
            extraVideos
        });

        await product.save();
        res.json({ success: true, message: "Product added successfully!", product });

    } catch (error) {
        console.error("❌ Error adding product:", error);
        res.status(500).json({ success: false, message: "Server error while adding product." });
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
            console.log(" No products found for user:", userId);
        } else {
            console.log(" Returning products for user:", userId, products);
        }

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error(" Error fetching products:", error);
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