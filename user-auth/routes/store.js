const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Store = require("../models/store");
const Product = require("../models/product");

const uploadPath = path.join(__dirname, "../public/uploads");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET: Fetch store for current session user
router.get("/", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  try {
    const store = await Store.findOne({ ownerId: req.session.userId });
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    const products = await Product.find({ ownerId: req.session.userId });
    res.json({ success: true, store, products });
  } catch (error) {
    console.error("❌ Error fetching store:", error);
    res.status(500).json({ success: false, message: "Error fetching store data" });
  }
});

// POST: Create a store
router.post("/", upload.single("logo"), async (req, res) => {
  const { storeName, description } = req.body;
  const logo = req.file?.filename;

  if (!req.session.userId || !logo || !storeName || !description) {
    return res.status(400).json({ success: false, message: "Missing fields or not logged in" });
  }

  const existing = await Store.findOne({ ownerId: req.session.userId });
  if (existing) {
    return res.status(409).json({ success: false, message: "Store already exists" });
  }

  const newStore = new Store({
    ownerId: req.session.userId,
    ownerEmail: req.session.email,
    storeName,
    storeLogo: logo,
    description
  });

  await newStore.save();
  res.status(201).json({ success: true, message: "Store created successfully!" });
});

module.exports = router;
