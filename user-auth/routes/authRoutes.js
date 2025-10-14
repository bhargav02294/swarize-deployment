const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const router = express.Router();

const otpStorage = new Map(); // store OTPs temporarily

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((err, success) => {
    if(err) console.error("Email transporter error:", err);
    else console.log("Email transporter ready ✅");
});

// Send OTP
router.post("/send-otp", async (req,res)=>{
    const {email} = req.body;
    if(!email) return res.status(400).json({success:false,message:"Email is required."});

    const otp = Math.floor(100000 + Math.random()*900000).toString();
    otpStorage.set(email, otp);

    setTimeout(()=> otpStorage.delete(email), 5*60*1000); // 5 min expiry

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Swarize OTP Verification",
        text: `Your OTP is: ${otp}. It is valid for 5 minutes.`
    };

    try{
        const info = await transporter.sendMail(mailOptions);
        console.log("OTP sent:", info.response);
        res.json({success:true,message:"OTP sent successfully!"});
    }catch(err){
        console.error("Error sending OTP:", err);
        res.status(500).json({success:false,message:"Failed to send OTP. Check email settings."});
    }
});

// Verify OTP
router.post("/verify-otp",(req,res)=>{
    const {email, otp} = req.body;
    const storedOtp = otpStorage.get(email);

    if(!storedOtp) return res.status(400).json({success:false,message:"OTP expired or not found."});
    if(storedOtp===otp){
        otpStorage.delete(email);
        return res.json({success:true,message:"OTP verified successfully!"});
    } else {
        return res.status(400).json({success:false,message:"Invalid OTP."});
    }
});

// Reset Password
router.post("/reset-password", async (req,res)=>{
    const {email,newPassword} = req.body;
    if(!email || !newPassword) return res.status(400).json({success:false,message:"Email and new password required."});

    try{
        const user = await User.findOne({email:email.trim()});
        if(!user) return res.status(404).json({success:false,message:"User not found."});

        const isSame = await bcrypt.compare(newPassword,user.password);
        if(isSame) return res.status(409).json({success:false,message:"New password cannot be same as old."});

        const hashed = await bcrypt.hash(newPassword,10);
        user.password = hashed;
        await user.save();
        res.json({success:true,message:"Password reset successfully!"});
    }catch(err){
        console.error("Reset password error:",err);
        res.status(500).json({success:false,message:"Failed to reset password."});
    }
});

module.exports = router;
