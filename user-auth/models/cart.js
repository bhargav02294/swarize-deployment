const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, 
            name: { type: String, required: true },
            price: { type: Number, required: true },
            description: { type: String },
            thumbnailImage: { type: String },
            quantity: { type: Number, default: 1 } 
        }
    ]
});

cartSchema.index({ userId: 1, "products.productId": 1 }, { unique: true });

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
