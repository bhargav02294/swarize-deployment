const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    thumbnailImage: { type: String, required: true },
    category: { type: String },
    subcategory: { type: String },
    selectedSize: { type: String, default: "Not selected" },

    // ✅ Seller Details
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerName: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    sellerStoreName: { type: String, required: true },
    
    sellerBankDetails: {
        bankName: { type: String, required: false },
        accountHolder: { type: String, required: false },
        accountNumber: { type: String, required: false },
        ifscCode: { type: String, required: false }
    },
    
    

    // ✅ Payment & Order Details
    paymentId: { type: String, required: true },
    paymentStatus: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
    orderStatus: { type: String, enum: ["Processing", "Shipped", "Delivered", "Cancelled"], default: "Processing" },
    sellerEarnings: { type: Number, required: false },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Sale", SaleSchema);
