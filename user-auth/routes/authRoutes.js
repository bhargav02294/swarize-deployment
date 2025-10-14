const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/user");
const nodemailer = require("nodemailer");

const router = express.Router();
const otpStorage = new Map(); 

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send OTP
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    try {
        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStorage.set(email, otp);
        setTimeout(() => otpStorage.delete(email), 5 * 60 * 1000); // expire in 5 minutes

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



// Reset Password API
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  try {
      const user = await User.findOne({ email: email.trim() });
      if (!user) return res.status(404).json({ message: "User not found." });

      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) return res.status(409).json({ message: "New password cannot be the same as old password." });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password. Please try again." });
  }
});


// Sign in
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
            res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV==="production", sameSite:"None", maxAge:3600000 });
            res.json({ success:true, message:"Login successful", token });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success:false, message:"Server error" });
    }
});

// Google OAuth, logout, debug-session
router.get("/google", passport.authenticate("google",{ scope:["profile","email"] }));
router.get("/google/callback", passport.authenticate("google",{failureRedirect:"/signin"}),(req,res)=>{
    req.session.userId = req.user.id;
    req.session.save();
    res.redirect("https://swarize.in/profile");
});
router.post("/logout",(req,res)=>{
    res.clearCookie("token");
    req.session.destroy(err=>err?res.status(500).json({success:false,message:"Logout failed"}):res.json({success:true,message:"Logout successful"}));
});
router.get("/debug-session",(req,res)=>res.json({session:req.session}));

module.exports = router;
