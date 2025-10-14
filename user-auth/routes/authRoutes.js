// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const nodemailer = require("nodemailer");

const router = express.Router();
const otpStorage = new Map();

// -------------------- Nodemailer Setup --------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Must be Gmail with App Password
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter
transporter.verify((err, success) => {
  if (err) console.error("Email Transporter Error:", err);
  else console.log("Email transporter ready!");
});

// -------------------- OTP Routes --------------------
// Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStorage.set(email, otp);
    setTimeout(() => otpStorage.delete(email), 5 * 60 * 1000); // OTP expires in 5 min

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Swarize OTP Code",
      text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP for ${email}: ${otp}`);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// Verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const storedOtp = otpStorage.get(email);

  if (storedOtp && storedOtp.toString() === otp) {
    otpStorage.delete(email);
    return res.json({ success: true, message: "OTP verified successfully" });
  }

  res.status(400).json({ success: false, message: "Invalid OTP" });
});

// -------------------- Sign In --------------------
router.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.trim() });
    if (!user) return res.status(400).json({ success: false, message: "Invalid email or password" });

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.status(400).json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.save(err => {
      if (err) return res.status(500).json({ success: false, message: "Session error" });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 60 * 60 * 1000 // 1 hour
      });

      res.json({ success: true, message: "Login successful", token });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------------------- Google OAuth --------------------

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName
        });
      }
      return done(null, user);
    } catch (err) {
      console.error("Google OAuth error:", err);
      return done(err, null);
    }
  }
));

// Serialize/Deserialize User for Passport
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Auth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/signin" }),
  (req, res) => {
    req.session.userId = req.user._id;
    req.session.save();
    res.redirect("https://swarize.in/profile"); // Redirect after login
  }
);

// -------------------- Logout --------------------
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, message: "Logout failed" });
    res.json({ success: true, message: "Logout successful" });
  });
});

// -------------------- Debug Session --------------------
router.get("/debug-session", (req, res) => {
  res.json({ session: req.session });
});

module.exports = router;
