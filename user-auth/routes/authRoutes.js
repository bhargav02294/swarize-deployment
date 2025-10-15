const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const otpStore = new Map();

// ✅ Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, otp);
  console.log(`📧 Generated OTP for ${email}: ${otp}`);

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
  });

  const mailOptions = {
    from: `"Swarize" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Swarize OTP Code",
    html: `
      <div style="font-family:sans-serif;line-height:1.6">
        <h2>OTP Verification</h2>
        <p>Hello,</p>
        <p>Your one-time password (OTP) for Swarize is:</p>
        <h1 style="color:#4CAF50;">${otp}</h1>
        <p>This OTP is valid for 2 minutes. Please do not share it with anyone.</p>
        <hr>
        <p>Regards,<br>Swarize Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to ${email}`);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ OTP send failed:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// ✅ Verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ success: false, message: "Email and OTP are required" });

  const storedOtp = otpStore.get(email);
  if (storedOtp && storedOtp === otp) {
    otpStore.delete(email);
    return res.json({ success: true, message: "OTP verified successfully" });
  }
  res.status(400).json({ success: false, message: "Invalid or expired OTP" });
});

module.exports = router;
