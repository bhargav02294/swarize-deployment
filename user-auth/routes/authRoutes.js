const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/user");

const router = express.Router();

// ✅ User Sign In Route
router.post("/signin", async (req, res) => {
    console.log("🔹 Sign In Attempt:", req.body);

    try {
        const user = await User.findOne({ email: req.body.email.trim() });

        if (!user) {
            console.log(" User Not Found:", req.body.email);
            return res.status(400).json({ success: false, message: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            console.log(" Invalid Password for:", req.body.email);
            return res.status(400).json({ success: false, message: "Invalid email or password." });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // ✅ Store user ID in session
        req.session.userId = user._id;
        req.session.role = user.role;
        req.session.save(err => {
            if (err) {
                console.error(" Error saving session:", err);
                return res.status(500).json({ success: false, message: "Session error." });
            }

            console.log(" User logged in:", { userId: req.session.userId, role: req.session.role });
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "None",
                maxAge: 60 * 60 * 1000 // 1 hour
            });

            res.json({ success: true, message: "Login successful!", token });
        });

    } catch (error) {
        console.error(" Error during login:", error);
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
        res.redirect("https://swarize.in/profile"); // ✅ Redirect user to profile page
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
        console.error(" Logout error:", error);
        res.status(500).json({ success: false, message: "Logout error" });
    }
});

// ✅ Debug Session Route
router.get("/debug-session", (req, res) => {
    res.json({ session: req.session });
});

module.exports = router;
