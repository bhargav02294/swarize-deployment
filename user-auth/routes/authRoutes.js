const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const passport = require("passport");


// OTP storage
const otpStorage = new Map();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) console.error("Email Transporter Error:", error);
  else console.log("Email Transporter Ready!");
});

// ✅ Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const otp = crypto.randomInt(100000, 999999).toString();
  otpStorage.set(email, otp);
  setTimeout(() => otpStorage.delete(email), 5 * 60 * 1000); // OTP expires in 5 mins

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Swarize OTP",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`
    });

    console.log(`OTP for ${email}: ${otp}`);
    res.json({ success: true, message: "OTP sent successfully!" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP. Check your email credentials." });
  }
});

// ✅ Verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const storedOtp = otpStorage.get(email);

  if (!storedOtp) return res.status(400).json({ success: false, message: "OTP not found or expired" });

  if (storedOtp === otp) {
    otpStorage.delete(email);
    return res.json({ success: true, message: "OTP verified successfully" });
  }
  res.status(400).json({ success: false, message: "Invalid OTP" });
});

// ✅ Reset Password
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email: email.trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const same = await bcrypt.compare(newPassword, user.password);
    if (same) return res.status(409).json({ message: "New password cannot be same as old" });

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reset password" });
  }
});


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
