const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Store = require("../models/store");

// Storage engine for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Create store (POST)
router.post("/", upload.single("storeLogo"), async (req, res) => {
  const { storeName, storeDescription, sellerId } = req.body;

  if (!req.file) return res.status(400).json({ error: "Logo upload failed" });

  try {
    const existingStore = await Store.findOne({ sellerId });
    if (existingStore) return res.status(400).json({ error: "Store already exists" });

    const store = new Store({
      storeName,
      storeDescription,
      sellerId,
      storeLogo: "/uploads/" + req.file.filename,
    });

    await store.save();
    res.status(201).json({ message: "Store created successfully", store });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get store by sellerId
router.get("/:sellerId", async (req, res) => {
  try {
    const store = await Store.findOne({ sellerId: req.params.sellerId });
    if (!store) return res.status(404).json({ error: "Store not found" });

    res.json(store);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
