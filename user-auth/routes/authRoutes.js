const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// ✅ User Login Route
router.post("/signin", async (req, res) => {
    console.log("🔹 Sign In Attempt:", req.body);

    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            console.log("❌ User Not Found:", req.body.email);
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            console.log("❌ Invalid Password for:", req.body.email);
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // ✅ Store user ID in session
        req.session.userId = user._id;
        req.session.role = user.role;
        await req.session.save(); // Ensure session is saved

        // ✅ Set Token in Cookies
        res.cookie("token", token, {
            httpOnly: true, // Security: Prevent XSS attacks
            secure: process.env.NODE_ENV === "production", // Use secure flag in production
            sameSite: "Strict",
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        console.log("✅ User logged in:", { userId: req.session.userId, role: req.session.role });
        res.json({ success: true, message: "Login successful", token });
    } catch (error) {
        console.error("❌ Error during login:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ User Logout Route
router.post("/logout", (req, res) => {
    try {
        res.clearCookie("token"); // ✅ Remove JWT cookie
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ success: false, message: "Logout failed" });
            }
            res.json({ success: true, message: "Logout successful" });
        });
    } catch (error) {
        console.error("❌ Logout error:", error);
        res.status(500).json({ success: false, message: "Logout error" });
    }
});

// ✅ Debug Route to Check Session Data
router.get("/debug-session", (req, res) => {
    res.json({ session: req.session });
});

module.exports = router;
