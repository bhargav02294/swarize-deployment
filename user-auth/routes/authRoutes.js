const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/user");

const router = express.Router();

// ✅ User Sign Up Route
router.post("/signup", async (req, res) => {
    console.log("🔹 Sign Up Attempt:", req.body);

    try {
        const { name, email, password, country } = req.body;

        // ✅ Validate Email and Password
        if (!email || !password || !name || !country) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // ✅ Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists." });
        }

        // ✅ Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Create User
        user = new User({ name, email, password: hashedPassword, country });
        await user.save();

        console.log("✅ User Registered:", user.email);
        res.json({ success: true, message: "Signup successful! Please log in." });
    } catch (error) {
        console.error("❌ Error during signup:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ User Sign In Route
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
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        console.log("✅ User logged in:", { userId: req.session.userId, role: req.session.role });
        res.json({ success: true, message: "Login successful", token });
    } catch (error) {
        console.error("❌ Error during login:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Google OAuth Authentication
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// ✅ Google OAuth Callback
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/signin" }),
    (req, res) => {
        console.log("✅ Google OAuth Success:", req.user);
        req.session.userId = req.user.id;
        req.session.save(() => {
            res.redirect("https://swarize.in/profile");
        });
    }
);

// ✅ Logout Route
router.post("/logout", (req, res) => {
    try {
        res.clearCookie("token");
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

// ✅ Debug Session Route
router.get("/debug-session", (req, res) => {
    res.json({ session: req.session });
});

module.exports = router;
