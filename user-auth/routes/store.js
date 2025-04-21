const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Store = require('../models/store');

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// POST /api/store - Create store
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const logoPath = '/uploads/' + req.file.filename;

    const ownerId = req.session.userId;
    const ownerEmail = req.session.email;

    if (!ownerId || !ownerEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existingStore = await Store.findOne({ ownerId, ownerEmail });
    if (existingStore) {
      return res.status(400).json({ message: 'Store already exists' });
    }

    const newStore = new Store({
      ownerId,
      ownerEmail,
      name,
      logo: logoPath,
      description
    });

    await newStore.save();
    res.status(201).json({ message: 'Store created', store: newStore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET /api/store/my-store - Fetch user's store
router.get('/my-store', async (req, res) => {
  try {
    const ownerId = req.session.userId;
    const ownerEmail = req.session.email;

    if (!ownerId || !ownerEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const store = await Store.findOne({ ownerId, ownerEmail });
    if (store) {
      res.json({ store });
    } else {
      res.status(404).json({ message: 'Store not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
