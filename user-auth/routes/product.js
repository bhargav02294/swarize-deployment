const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const Product = require('../models/product');
const Store = require('../models/store');
const verifySession = require("../middleware/verifySession"); 
const { authenticateToken } = require('../middleware/auth'); // ✅ FIXED: Added this line

const router = express.Router();

// 🧠 Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🧠 Multer - memoryStorage
const upload = multer({ storage: multer.memoryStorage() });

// 🧠 Session middleware
const isAuthenticated = (req, res, next) => {
  const userId = req.session?.userId || req.session?.passport?.user;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  req.session.userId = userId;
  next();
};

// ✅ Safe cloudinary upload helper
const uploadToCloudinary = (buffer, folder, mimetype) => {
  return new Promise((resolve, reject) => {
    if (!buffer || buffer.length === 0) return reject(new Error("File buffer empty"));

    const type = mimetype?.split('/')[0];
    if (type !== 'image' && type !== 'video') return reject(new Error("Invalid file type: " + mimetype));

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: type },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ✅ Add Product Route
router.post(
  '/add',
  isAuthenticated,
  upload.fields([
    { name: 'thumbnailImage', maxCount: 1 },
    { name: 'extraImages', maxCount: 5 },
    { name: 'extraVideos', maxCount: 3 },
  ]),
  async (req, res) => {
    try {
      const userId = req.session.userId;
      const store = await Store.findOne({ ownerId: userId });
      if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

      const {
        name, price, description, summary,
        category, subcategory, tags, size,
        color, material, modelStyle, availableIn
      } = req.body;

      // 📌 Mandatory thumbnail
      const thumbnailFile = req.files['thumbnailImage']?.[0];
      if (!thumbnailFile) return res.status(400).json({ success: false, message: "Thumbnail is required" });

      const thumbnailImage = await uploadToCloudinary(thumbnailFile.buffer, 'swarize/products/thumbnails', thumbnailFile.mimetype);

      // 🌄 Optional extra images
      const extraImages = [];
      if (req.files['extraImages']) {
        for (const img of req.files['extraImages']) {
          const url = await uploadToCloudinary(img.buffer, 'swarize/products/images', img.mimetype);
          extraImages.push(url);
        }
      }

      // 📹 Optional extra videos
      const extraVideos = [];
      if (req.files['extraVideos']) {
        for (const vid of req.files['extraVideos']) {
          const url = await uploadToCloudinary(vid.buffer, 'swarize/products/videos', vid.mimetype);
          extraVideos.push(url);
        }
      }

      // ✅ Save to DB
      const product = new Product({
        name,
        price,
        description,
        summary,
        category,
        subcategory,
        tags: tags ? tags.split(',') : [],
        size,
        color,
        material,
        modelStyle,
        availableIn,
        thumbnailImage,
        extraImages,
        extraVideos,
        store: store._id,
        storeSlug: store.slug,
        ownerId: userId,
      });

      await product.save();

      return res.status(201).json({ success: true, message: "Product added successfully" });

    } catch (error) {
      console.error("❌ Product Add Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);



// Route to fetch products for a specific seller (store)
// Fetch all products from all sellers, but filter by store
// ✅ Show all products (public route, no auth needed)
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find({}).populate('store');
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Failed to fetch products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Get products by store slug
router.get('/by-store/:slug', async (req, res) => {
    try {
        const store = await Store.findOne({ slug: req.params.slug });
        if (!store) return res.status(404).json({ success: false, message: "Store not found" });

        const products = await Product.find({ store: store._id });
        if (products.length === 0) {
            return res.status(200).json({ success: true, products: [] });
        }

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



// 🔴 DELETE product
router.delete("/delete/:id", verifySession, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.userId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.ownerId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Product.findByIdAndDelete(productId);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Server error while deleting" });
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