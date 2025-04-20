const express = require("express");
const multer = require("multer");
const Store = require("../models/store"); // Adjust the path as needed
const Product = require("../models/product"); // Adjust the path as needed
const User = require("../models/user"); // Adjust the path as needed
const { isAuthenticated } = require("../middleware/auth"); // Add authentication middleware if necessary

const router = express.Router();

// =============== Store ===================//
// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // Set the directory where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Set the filename as a timestamp followed by the original filename
  },
});
const upload = multer({ storage });

// Fetch store details for the logged-in user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.session.userId });

    if (!store) {
      return res.json({ success: false, message: "No store found." });
    }

    res.json({
      success: true,
      store: {
        storeName: store.storeName,
        storeLogo: `uploads/${store.storeLogo}`,
        description: store.description || "",
        country: store.country || "India",
      },
    });
  } catch (error) {
    console.error("❌ Error fetching private store:", error);
    res.status(500).json({ success: false, message: "Error fetching store." });
  }
});

// Save store details (create or update store)
router.post("/", isAuthenticated, upload.single("storeLogo"), async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, message: "Unauthorized: Please sign in first." });
  }

  const { storeName, storeDescription } = req.body;
  const storeLogo = req.file ? req.file.filename : null;

  if (!storeName || !storeLogo) {
    return res.status(400).json({ success: false, message: "Store name and logo are required." });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user || !user.email) {
      return res.status(404).json({ success: false, message: "User not found or email missing." });
    }

    let store = await Store.findOne({ ownerId: req.session.userId });

    if (store) {
      // Update existing store
      store.storeName = storeName;
      store.storeLogo = storeLogo;
      store.description = storeDescription || "";
      await store.save();
    } else {
      // Create new store
      store = new Store({
        ownerId: req.session.userId,
        ownerEmail: user.email,
        storeName,
        storeLogo,
        description: storeDescription || "",
        country: "India",
      });
      await store.save();
    }

    res.json({ success: true, message: "Store saved successfully!", store });
  } catch (error) {
    console.error("❌ Error saving store:", error);
    res.status(500).json({ success: false, message: "Failed to save store details." });
  }
});

// Delete a product by its ID (requires user to be logged in)
router.delete("/products/:id", isAuthenticated, async (req, res) => {
  const productId = req.params.id;
  const userId = req.session?.userId || req.session?.passport?.user;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized: User not logged in" });
  }

  try {
    // Find product and check if the logged-in user is the owner
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    if (product.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: You cannot delete this product." });
    }

    await Product.findByIdAndDelete(productId);
    res.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Error deleting product." });
  }
});

// Fetch public store details by sellerId
router.get("/public/:sellerId", async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.params.sellerId });

    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found." });
    }

    res.json({ success: true, store: { storeName: store.storeName, storeLogo: store.storeLogo, description: store.description || "" } });
  } catch (error) {
    console.error("❌ Error fetching public store:", error);
    res.status(500).json({ success: false, message: "Error fetching store." });
  }
});

// Fetch products for a store (private view)
router.get("/products/:userId", async (req, res) => {
  try {
    const products = await Product.find({ ownerId: req.params.userId });
    res.json({ success: true, products });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ success: false, message: "Error fetching products." });
  }
});

module.exports = router;
