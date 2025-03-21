const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/user");

const router = express.Router();
const otpStorage = new Map(); // ✅ Store OTPs temporarily

// ✅ User Sign Up Route
router.post("/signup", async (req, res) => {
    console.log("🔹 Sign Up Attempt:", req.body);

    try {
        const { name, email, password, country, authMethod } = req.body;

        if (!email || !password || !name || !country || !authMethod) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword, country, authMethod });
        await user.save();

        req.session.userId = user._id;
        req.session.save();

        console.log("✅ User Registered:", user.email);
        res.json({ success: true, message: "Signup successful!", redirect: "/otp.html" });
    } catch (error) {
        console.error("❌ Error during signup:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Send OTP Route
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    try {
        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStorage.set(email, otp);

        console.log(`✅ OTP for ${email}: ${otp}`);

        res.json({ success: true, message: "OTP sent successfully." });
    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        res.status(500).json({ success: false, message: "Failed to send OTP." });
    }
});

// ✅ Verify OTP Route
router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    const storedOtp = otpStorage.get(email);

    if (storedOtp && storedOtp.toString() === otp) {
        otpStorage.delete(email);
        res.json({ success: true, message: "OTP verified successfully." });
    } else {
        res.status(400).json({ success: false, message: "Invalid OTP." });
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
router.get("/google/callback", 
    passport.authenticate("google", { failureRedirect: "/signin" }), 
    (req, res) => {
        req.session.userId = req.user.id;
        req.session.save();
        res.redirect("/profile");
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
