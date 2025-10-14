const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const router = express.Router();

const otpStorage = new Map(); // Store OTPs temporarily

// Nodemailer transporter (Gmail App Password)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // Gmail address
        pass: process.env.EMAIL_PASS   // Gmail App Password
    }
});

// ✅ Send OTP
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage.set(email, otp);

    // OTP expires in 5 minutes
    setTimeout(() => otpStorage.delete(email), 5 * 60 * 1000);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Swarize OTP Code",
        text: `Hello!\n\nYour OTP code is: ${otp}\nIt is valid for 5 minutes.\n\n- Swarize Team`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP sent to ${email}: ${otp}`);
        res.json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        res.status(500).json({ success: false, message: "Failed to send OTP. Check email or App Password." });
    }
});

// ✅ Verify OTP
router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    const storedOtp = otpStorage.get(email);

    if (!storedOtp) return res.status(400).json({ success: false, message: "OTP expired or not found." });
    if (storedOtp === otp) {
        otpStorage.delete(email);
        return res.json({ success: true, message: "OTP verified successfully!" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid OTP." });
    }
});

// ✅ Reset Password
router.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email: email.trim() });
        if (!user) return res.status(404).json({ message: "User not found." });

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) return res.status(409).json({ message: "New password cannot be same as old password." });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully!" });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Failed to reset password." });
    }
});

module.exports = router;
