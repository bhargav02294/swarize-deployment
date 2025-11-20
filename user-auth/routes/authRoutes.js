const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/user");
const router = express.Router();

// Import new Resend email util
const sendEmail = require("../utils/sendEmail");

// OTP Storage
const otpStorage = new Map();

// ================================
// ✅ SEND OTP (REPLACED WITH RESEND)
// ================================
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStorage.set(email, otp);

    console.log(`🔐 Generated OTP for ${email}: ${otp}`);

    const success = await sendEmail({
      to: email,
      subject: "Your Swarize OTP Code",
      text: `Your OTP is ${otp}. It is valid for 1 minute.`,
      html: `
        <div style="font-family: Arial; padding:16px;">
          <h2>Your OTP Code</h2>
          <p>Your code is: <strong>${otp}</strong></p>
          <p>It is valid for 1 minute.</p>
        </div>
      `
    });

    if (!success) {
      return res.status(500).json({ success: false, message: "Failed to send OTP email." });
    }

    res.json({ success: true, message: "OTP sent successfully!" });

  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ success: false, message: "OTP sending failed." });
  }
});

// ================================
// ✅ VERIFY OTP
// ================================
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  const storedOtp = otpStorage.get(email);

  if (storedOtp && storedOtp.toString() === otp) {
    otpStorage.delete(email);
    return res.json({ success: true, message: "OTP verified successfully." });
  }

  return res.status(400).json({ success: false, message: "Invalid OTP." });
});

// ================================
// ✅ SIGN IN
// ================================
router.post("/signin", async (req, res) => {
  console.log("🔹 Sign In Attempt:", req.body);

  try {
    const user = await User.findOne({ email: req.body.email.trim() });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    req.session.userId = user._id;
    req.session.role = user.role;

    req.session.save(err => {
      if (err) {
        return res.status(500).json({ success: false, message: "Session error." });
      }

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 3600000
      });

      res.json({ success: true, message: "Login successful!", token });
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ================================
// Google OAuth + Logout + Debug
// ================================
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/signin" }),
  (req, res) => {
    req.session.userId = req.user.id;
    req.session.save();
    res.redirect("https://swarize.in/profile");
  }
);

router.post("/logout", (req, res) => {
  try {
    res.clearCookie("token");
    req.session.destroy(err => {
      if (err) return res.status(500).json({ success: false, message: "Logout failed" });
      res.json({ success: true, message: "Logout successful" });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Logout error" });
  }
});

router.get("/debug-session", (req, res) => {
  res.json({ session: req.session });
});

module.exports = router;
