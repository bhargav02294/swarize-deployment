const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/user');

// Store OTPs in memory for simplicity (or use DB / Redis for production)
const otpStore = new Map();

// Send OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, otp);

    // Email transporter
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}: ${otp}`);
        res.json({ success: true, message: 'OTP sent' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email & OTP required' });

    const storedOtp = otpStore.get(email);
    if (storedOtp === otp) {
        otpStore.delete(email);
        return res.json({ success: true, message: 'OTP verified' });
    }

    res.status(400).json({ success: false, message: 'Invalid OTP' });
});

module.exports = router;
