const express = require('express');
const multer = require('multer');
const Product = require('../models/product');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const Store = require('../models/store');  
const User = require('../models/user');    

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

const storage = multer.memoryStorage();
const upload = multer({ storage });

function uploadToCloudinary(buffer, options) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
}

router.post('/add', isAuthenticated, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'extraImages', maxCount: 5 },
    { name: 'extraVideos', maxCount: 2 }
  ]), async (req, res) => {
    try {
      const userId = req.session.userId;
      const store = await Store.findOne({ owner: userId });
  
      if (!store) {
        return res.status(404).json({ success: false, message: 'Store not found' });
      }
  
      const { name, description, price, category } = req.body;
      const thumbnailFile = req.files['thumbnail']?.[0];
      const extraImageFiles = req.files['extraImages'] || [];
      const extraVideoFiles = req.files['extraVideos'] || [];
  
      if (!thumbnailFile) {
        return res.status(400).json({ success: false, message: 'Thumbnail is required' });
      }
  
      const thumbnailUpload = await cloudinary.uploader.upload_stream({
        resource_type: 'image',
        folder: 'product-thumbnails'
      }, async (error, result) => {
        if (error) {
          console.error("Thumbnail upload error:", error);
          return res.status(500).json({ success: false, message: 'Thumbnail upload failed' });
        }
  
        const thumbnailUrl = result.secure_url;
  
        const extraImageUrls = [];
        for (const file of extraImageFiles) {
          const imgResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
              resource_type: 'image',
              folder: 'product-extra-images'
            }, (error, result) => {
              if (error) {
                console.error("Extra image upload error:", error);
                return reject(error);
              }
              resolve(result.secure_url);
            }).end(file.buffer);
          });
          extraImageUrls.push(imgResult);
        }
  
        const extraVideoUrls = [];
        for (const file of extraVideoFiles) {
          const videoResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
              resource_type: 'video',
              folder: 'product-extra-videos'
            }, (error, result) => {
              if (error) {
                console.error("Extra video upload error:", error);
                return reject(error);
              }
              resolve(result.secure_url);
            }).end(file.buffer);
          });
          extraVideoUrls.push(videoResult);
        }
  
        const newProduct = new Product({
          name,
          description,
          price,
          category,
          thumbnail: thumbnailUrl,
          extraImages: extraImageUrls,
          extraVideos: extraVideoUrls,
          store: store._id
        });
  
        await newProduct.save();
  
        res.json({ success: true, product: newProduct });
      });
  
      thumbnailUpload.end(thumbnailFile.buffer);
  
    } catch (error) {
      console.error("Product creation error:", error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
  

router.get('/by-store/:slug', async (req, res) => {
    try {
        const store = await Store.findOne({ slug: req.params.slug });
        if (!store) return res.status(404).json({ success: false, message: "Store not found" });

        const products = await Product.find({ store: store._id });
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
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