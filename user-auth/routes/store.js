const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Store = require("../models/store");

// Multer setup to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

// Route to create a store
router.post("/", upload.single("storeLogo"), async (req, res) => {
  const { storeName, storeDescription, sellerId } = req.body;

  if (!storeName || !storeDescription || !req.file || !sellerId) {
    return res.status(400).json({ error: "All fields are required, including store logo." });
  }

  try {
    const existingStore = await Store.findOne({ sellerId });
    if (existingStore) {
      return res.status(400).json({ error: "Store already exists" });
    }

    const store = new Store({
      storeName,
      storeDescription,
      sellerId,
      storeLogo: "/uploads/" + req.file.filename,
    });

    await store.save();
    res.status(201).json({ message: "Store created successfully", store });
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get a store by seller ID
router.get("/:sellerId", async (req, res) => {
  try {
    const store = await Store.findOne({ sellerId: req.params.sellerId });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json(store);
  } catch (error) {
    console.error("Error fetching store:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
