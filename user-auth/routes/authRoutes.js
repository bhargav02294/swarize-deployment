
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const router = express.Router();

// ✅ User Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

          // ✅ Generate JWT Token
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

          // ✅ Set Token in Cookies
          res.cookie("token", token, {
              httpOnly: true, // Security: Prevent XSS attacks
              secure: process.env.NODE_ENV === "production", // Use secure flag in production
              sameSite: "Strict"
          });
        
        // ✅ Store user ID in session
        req.session.userId = user._id;
        req.session.role = user.role;
        await req.session.save(); // Ensure session is saved

        console.log('✅ User logged in:', { userId: req.session.userId, role: req.session.role });
        res.json({ success: true, message: 'Login successful' });
    } catch (error) {
        console.error("❌ Error during login:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ✅ User Logout Route
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: "Logout failed" });
        }
        res.json({ success: true, message: "Logout successful" });
    });
});

// ✅ Debug Route to Check Session Data
router.get('/debug-session', (req, res) => {
    res.json({ session: req.session });
});

module.exports = router;

