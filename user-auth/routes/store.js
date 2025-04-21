const express = require("express");
const router = express.Router();
const Store = require("../models/store");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Route to create a new store
router.post("/create", upload.single("logo"), async (req, res) => {
    const { name, description } = req.body;
    const logo = req.file ? req.file.filename : null;

    if (!name || !description || !logo) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const newStore = new Store({
            ownerId: req.session.userId,
            name,
            description,
            logo,
        });

        await newStore.save();
        res.status(200).json({ success: true, message: "Store created successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }
});

// Route to get a store by userId
router.get("/:userId", async (req, res) => {
    try {
        const store = await Store.findOne({ ownerId: req.params.userId });

        if (!store) {
            return res.status(404).json({ success: false, message: "Store not found" });
        }

        res.status(200).json({ success: true, store });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }
});

// Check if the user has a store and redirect appropriately
router.get("/check-store", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: "User not logged in" });
    }

    try {
        const store = await Store.findOne({ ownerId: userId });

        if (store) {
            // Redirect to store page if the store exists
            res.status(200).json({ success: true, redirect: "/store.html" });
        } else {
            // Redirect to create-store page if the store doesn't exist
            res.status(200).json({ success: true, redirect: "/create-store.html" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }
});

module.exports = router;
