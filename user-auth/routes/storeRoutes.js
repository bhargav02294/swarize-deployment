const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const User = require('../models/user');

// GET /api/store/check
router.get('/check', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "User not logged in." });
  }

  const store = await Store.findOne({ ownerId: req.session.userId });
  if (store) {
    return res.json({ hasStore: true, storeSlug: store.slug });
  } else {
    return res.json({ hasStore: false });
  }
});

// POST /api/store/create
router.post('/create', async (req, res) => {
  const { storeName, description, slug, logoUrl, bannerUrl, socialLinks } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "User not logged in." });
  }

  const existingStore = await Store.findOne({ ownerId: userId });
  if (existingStore) {
    return res.status(400).json({ success: false, message: "User already has a store." });
  }

  const store = new Store({
    storeName,
    slug,
    description,
    logoUrl,
    bannerUrl,
    socialLinks,
    ownerId: userId
  });

  await store.save();
  await User.findByIdAndUpdate(userId, { store: store._id, role: 'seller' });

  res.status(201).json({ success: true, message: "Store created successfully", slug: store.slug });
});

// GET /api/store/:slug
router.get('/:slug', async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('ownerId');
  if (!store) {
    return res.status(404).json({ success: false, message: "Store not found" });
  }

  const Product = require('../models/product');
  const products = await Product.find({ storeId: store._id });

  res.json({
    store: {
      name: store.storeName,
      description: store.description,
      logoUrl: store.logoUrl,
      bannerUrl: store.bannerUrl,
      socialLinks: store.socialLinks,
    },
    products
  });
});

module.exports = router;
