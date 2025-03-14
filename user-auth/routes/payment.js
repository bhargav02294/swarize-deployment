const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ✅ Create Order Route
router.post("/create-order", async (req, res) => {
  console.log("Payment route is loaded.");

  try {
      let { amount } = req.body;

      if (amount < 1) {
          return res.status(400).json({ success: false, message: "Minimum order amount must be at least ₹1" });
      }

      amount = amount * 100; // Convert to paisa

      const order = await razorpay.orders.create({
          amount: amount,
          currency: "INR",
          payment_capture: 1 
      });

      console.log("✅ Razorpay Order Created:", order);
      res.json({ success: true, orderId: order.id, amount: order.amount });

  } catch (error) {
      console.error("❌ Razorpay Order Error:", error);
      res.status(500).json({ success: false, message: "Payment order creation failed." });
  }
});

module.exports = router;
