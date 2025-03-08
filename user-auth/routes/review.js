const express = require("express");
const router = express.Router();
const Review = require("../models/review");
const User = require("../models/user");

// ✅ Add a new review (No authentication required)
router.post("/add", async (req, res) => {
    try {
        const { productId, rating, comment, userId } = req.body;

        if (!productId || !rating || !comment || !userId) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        // ✅ Fetch the user's name from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found." });
        }

        // ✅ Save the review
        const newReview = new Review({
            productId,
            userId,
            userName: user.name, // Fetch and store the user's name
            rating,
            comment
        });

        await newReview.save();
        res.json({ success: true, message: "Review added successfully!" });

    } catch (error) {
        console.error("❌ Error adding review:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// ✅ Get all reviews for a product & calculate average rating
router.get("/:productId", async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });

        // Calculate average rating
        let avgRating = 5; // Default to 5 stars
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            avgRating = totalRating / reviews.length;
        }

        res.json({ success: true, reviews, avgRating });

    } catch (error) {
        console.error("❌ Error fetching reviews:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

module.exports = router;
