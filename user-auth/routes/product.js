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
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// 🧠 Session middleware
const isAuthenticated = (req, res, next) => {
  const userId = req.session?.userId || req.session?.passport?.user;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  req.session.userId = userId;
  next();
};





// ✅ Safe cloudinary upload helper
// ✅ Smart cloudinary upload helper
// Cloudinary Upload Helper
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    if (!buffer || buffer.length === 0) return reject(new Error("Empty buffer"));

    cloudinary.uploader.upload_stream({ folder, resource_type: 'auto' }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    }).end(buffer);
  });
};




// ✅ Add Product Route
router.post(
  '/add',
  isAuthenticated,
  upload.fields([
    { name: 'thumbnailImage', maxCount: 1 },
    { name: 'extraImages', maxCount: 4 },
    { name: 'extraVideos', maxCount: 3 }
  ]),
  async (req, res) => {
    try {
      const userId = req.session.userId;

      // ✅ Check store
      const store = await Store.findOne({ ownerId: userId });
      if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

      // ✅ Basic validation (extend as needed)
      const { name, price, category, subcategory } = req.body;
      if (!name || !price || !category || !subcategory) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      // ✅ Upload thumbnail
      const thumbnailFile = req.files['thumbnailImage']?.[0];
      if (!thumbnailFile) {
        return res.status(400).json({ success: false, message: "Thumbnail is required" });
      }
      const thumbnailImage = await uploadToCloudinary(thumbnailFile.buffer, 'swarize/products/thumbnails');

      // ✅ Upload extra images
      const extraImages = [];
      if (req.files['extraImages']) {
        for (const img of req.files['extraImages']) {
          try {
            const url = await uploadToCloudinary(img.buffer, 'swarize/products/images');
            extraImages.push(url);
          } catch (err) {
            console.warn("Extra image skipped:", err.message);
          }
        }
      }

      // ✅ Upload extra videos
      const extraVideos = [];
      if (req.files['extraVideos']) {
        for (const vid of req.files['extraVideos']) {
          try {
            const url = await uploadToCloudinary(vid.buffer, 'swarize/products/videos');
            extraVideos.push(url);
          } catch (err) {
            console.warn("Extra video skipped:", err.message);
          }
        }
      }

      // ✅ Create Product
      const product = new Product({
        ownerId: userId,
        store: store._id,
        storeSlug: store.slug,

        // Basic Info
        name,
        price,
        description: req.body.description,
        summary: req.body.summary,
        category,
        subcategory,
        availableIn: req.body.availableIn || "All Over India",

        // Optional/Dynamic Fields
size: Array.isArray(req.body.size) ? req.body.size : [req.body.size],
        color: req.body.color,
        material: req.body.material,
        modelStyle: req.body.modelStyle,
        pattern: req.body.pattern,
        brand: req.body.brand || "",

        washCare: req.body.washCare,
        fabricType: req.body.fabricType,
        fitType: req.body.fitType,
        occasion: req.body.occasion,
        neckStyle: req.body.neckStyle,
        sleeveLength: req.body.sleeveLength,
        shape: req.body.shape,
        surfaceStyling: req.body.surfaceStyling,
        heelType: req.body.heelType,
        soleMaterial: req.body.soleMaterial,
        closureType: req.body.closureType,

        // Media
        thumbnailImage,
        extraImages,
        extraVideos,
      });

      await product.save();
      return res.status(201).json({ success: true, message: "Product added successfully" });

    } catch (error) {
      console.error("Product Add Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);







// Route to fetch products for a specific seller (store)
// Fetch all products from all sellers, but filter by store
// ✅ Show all products (public route, no auth needed)
router.get('/all', async (req, res) => {
  try {
const products = await Product.find({}).sort({ createdAt: -1 }).populate('store');
    res.status(200).json(products);
  } catch (error) {
    console.error(' Failed to fetch products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Get products by store slug
router.get('/by-store/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const store = await Store.findOne({ slug });
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    const products = await Product.find({ store: store._id });
    res.json({ success: true, products });
  } catch (err) {
    console.error(" Error fetching products:", err);
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
        console.error(" Error fetching by category/subcategory:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Route to Fetch Products by Category

router.get('/category/:category', async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const products = await Product.find({ category }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ success: false, message: "Server error" });
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

// routes/product.js (add this route at bottom)
// GET /api/products/:id
// routes/productRoutes.js
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/detail/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('store', 'storeName logoUrl slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, product });
  } catch (err) {
    console.error(" Product detail error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
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