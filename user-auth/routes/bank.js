const express = require("express");
const router = express.Router();
const BankDetail = require("../models/BankDetail");
const axios = require("axios");

// ✅ Middleware for authentication (same as add-to-cart system)
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized: Please sign in" });
    }
    next();
};

// ✅ Check if User is Logged In (API for Frontend)
router.get("/is-logged-in", (req, res) => {
    res.json({ isLoggedIn: !!req.session.userId });
});

// ✅ Save Bank Details (Requires Authentication)
router.post("/save", isAuthenticated, async (req, res) => {
    try {
        const { bankName, accountHolder, accountNumber, ifscCode } = req.body;
        const userId = req.session.userId; // ✅ Use session authentication like cart.js

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Please log in." });
        }

        // ✅ Validate IFSC Code using Razorpay API
        try {
            const ifscResponse = await axios.get(`https://ifsc.razorpay.com/${ifscCode}`);

            if (!ifscResponse.data || !ifscResponse.data.BANK) {
                return res.status(400).json({ success: false, message: "Invalid IFSC Code: Please check and enter a valid code." });
            }
        } catch (error) {
            console.error("❌ IFSC API Error:", error.response?.status, error.response?.data);

            if (error.response?.status === 404) {
                return res.status(400).json({ success: false, message: "Invalid IFSC Code: Not found in the database. Try a different one." });
            } else {
                return res.status(500).json({ success: false, message: "IFSC validation service unavailable. Try again later." });
            }
        }

        // ✅ Check if bank details already exist for the user
        const existingBankDetail = await BankDetail.findOne({ userId });
        if (existingBankDetail) {
            return res.status(400).json({ success: false, message: "Bank details already saved." });
        }

        // ✅ Save Bank Details to Database
        const newBankDetail = new BankDetail({
            userId,
            bankName,
            accountHolder,
            accountNumber,
            ifscCode,
            verified: true
        });

        await newBankDetail.save();
        res.json({ success: true, message: "✅ Bank details saved successfully." });

    } catch (error) {
        console.error("❌ Error saving bank details:", error);
        res.status(500).json({ success: false, message: "Server error. Try again later." });
    }
});

module.exports = router;
