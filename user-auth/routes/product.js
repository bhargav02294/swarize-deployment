const express = require('express');
const multer = require('multer');
const Product = require('../models/product');
const path = require('path');
const cloudinary = require('cloudinary').v2;


// ✅ Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const router = express.Router();


const isAuthenticated = (req, res, next) => {
    if (!req.session.userId && !req.session?.passport?.user) {
        return res.status(401).json({ success: false, message: "Unauthorized: User not logged in" });
    }
    req.session.userId = req.session.userId || req.session.passport.user;
    next();
};

// Multer storage setup
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

router.post('/add', isAuthenticated, upload.fields([
    { name: 'thumbnailImage', maxCount: 1 },
    { name: 'extraImages', maxCount: 5 },
    { name: 'extraVideos', maxCount: 3 }
]), async (req, res) => {
    try {
        const { name, price, description, summary, category, subcategory, tags, size, color, material, modelStyle, availableIn } = req.body;
        const userId = req.session?.userId;

        // Cloudinary upload for Thumbnail Image
        const thumbnailResult = req.files['thumbnailImage'] ? await cloudinary.uploader.upload_stream({ folder: 'products/thumbnails' }, (error, result) => result)(req.files['thumbnailImage'][0].buffer) : null;

        // Cloudinary upload for Extra Images
        const extraImagesResult = req.files['extraImages'] ? await Promise.all(req.files['extraImages'].map(file =>
            cloudinary.uploader.upload_stream({ folder: 'products/extraImages' }, (error, result) => result)(file.buffer)
        )) : [];

        // Cloudinary upload for Extra Videos
        const extraVideosResult = req.files['extraVideos'] ? await Promise.all(req.files['extraVideos'].map(file =>
            cloudinary.uploader.upload_stream({ resource_type: 'video', folder: 'products/extraVideos' }, (error, result) => result)(file.buffer)
        )) : [];

        const product = new Product({
            ownerId: userId,
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
            thumbnailImage: thumbnailResult ? thumbnailResult.secure_url : null,
            extraImages: extraImagesResult.map(image => image.secure_url),
            extraVideos: extraVideosResult.map(video => video.secure_url),
        });

        await product.save();
        res.json({ success: true, message: 'Product added successfully!' });

    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ success: false, message: 'Failed to add product. Please try again.' });
    }
});



router.get('/all', async (req, res) => {
    try {
      const products = await Product.find({}).sort({ createdAt: -1 });
      res.json({ success: true, products });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ success: false, message: "Failed to fetch products" });
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