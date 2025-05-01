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
const upload = multer({ storage: multer.memoryStorage() });

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
router.post('/add', upload.fields([
    { name: 'thumbnailImage', maxCount: 1 },
    { name: 'extraImages', maxCount: 5 },
    { name: 'extraVideos', maxCount: 3 }
  ]), async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  
      const store = await Store.findOne({ ownerId: userId });
      if (!store) return res.status(400).json({ message: 'Store not found' });
  
      const {
        name, description, price, tags, size,
        color, material, modelStyle, availableIn
      } = req.body;
  
      // Upload function
      const uploadToCloudinary = (buffer, folder) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };
  
      // Thumbnail
      const thumbnailFile = req.files['thumbnailImage']?.[0];
      if (!thumbnailFile) return res.status(400).json({ message: 'Thumbnail image is required' });
  
      const thumbnailImage = await uploadToCloudinary(thumbnailFile.buffer, 'swarize/products/thumbnails');
  
      // Extra Images
      const extraImages = [];
      if (req.files['extraImages']) {
        for (const file of req.files['extraImages']) {
          const url = await uploadToCloudinary(file.buffer, 'swarize/products/images');
          extraImages.push(url);
        }
      }
  
      // Extra Videos
      const extraVideos = [];
      if (req.files['extraVideos']) {
        for (const file of req.files['extraVideos']) {
          const url = await uploadToCloudinary(file.buffer, 'swarize/products/videos');
          extraVideos.push(url);
        }
      }
  
      const newProduct = new Product({
        name,
        description,
        price,
        store: store._id,
        storeSlug: store.slug,
        tags: tags?.split(',') || [],
        size, color, material, modelStyle, availableIn,
        thumbnailImage,
        extraImages,
        extraVideos
      });
  
      await newProduct.save();
      res.status(201).json({ success: true, message: 'Product added' });
  
    } catch (error) {
      console.error("❌ Error in product add route:", error);
      res.status(500).json({ success: false, message: 'Internal server error', error });
    }
  });


// All Sellers' Products
router.get('/all', async (req, res) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 }).limit(100);
      res.json({ products });
    } catch (err) {
      console.error("Error fetching all products:", err);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });
  

// ✅ Get products by store slug
// ✅ Get products by store slug
// ✅ Get products by store slug
router.get('/by-store/:slug', async (req, res) => {
    try {
        const store = await Store.findOne({ slug: req.params.slug });
        if (!store) return res.status(404).json({ success: false, message: "Store not found" });

        // Debugging log to check if store is found
        console.log("Store found:", store);

        const products = await Product.find({ store: store._id });
        if (products.length === 0) {
            return res.status(200).json({ success: true, products: [] }); // Ensure empty array if no products found
        }

        // Debugging log to check if products are fetched
        console.log("Products found:", products);

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
// ✅ Route to fetch products by category and subcategory (like Women's Store)
router.get('/category/:category/:subcategory', async (req, res) => {
    try {
        const { category, subcategory } = req.params;

        const products = await Product.find({
            category: decodeURIComponent(category),
            subcategory: decodeURIComponent(subcategory)
        }).sort({ createdAt: -1 });

        res.json({ success: true, products });
    } catch (err) {
        console.error("❌ Error fetching by category/subcategory:", err);
        res.status(500).json({ success: false, message: "Server error" });
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