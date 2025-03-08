const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    thumbnailImage: { type: String, required: true },
    category: { type: String },
    subcategory: { type: String },
    tags: { type: [String] },

    // ✅ Buyer Details
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerAddress: {
        streetAddress: { type: String, default: "" },
        city: { type: String, default: "" },
        district: { type: String, default: "" },
        state: { type: String, default: "" },
        zip: { type: String, default: "" },
        phone: { type: String, default: "" },
        country: { type: String, default: "India" },
    },
    buyerBankDetails: {
        bankName: { type: String, required: true },
        accountHolder: { type: String, required: true },
        accountNumber: { type: String, required: true },
        ifscCode: { type: String, required: true }
    },

    // ✅ Seller Details
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerName: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    sellerStoreName: { type: String, required: true },
    sellerBankDetails: {
        bankName: { type: String, required: true },
        accountHolder: { type: String, required: true },
        accountNumber: { type: String, required: true },
        ifscCode: { type: String, required: true }
    },

    // ✅ Payment Details
    paymentId: { type: String, required: true },
    paymentStatus: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },

    // ✅ Order Status
    orderStatus: { type: String, enum: ["Processing", "Shipped", "Delivered", "Cancelled"], default: "Processing" },

    createdAt: { type: Date, default: Date.now }
},  { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
