const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const Product = require("../models/product");

// ✅ Middleware for authentication
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized: Please sign in" });
    }
    next();
};

// ✅ Add product to cart
router.post("/add", isAuthenticated, async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.userId;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let cart = await Cart.findOne({ userId });

        if (cart) {
            const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);

            if (productIndex > -1) {
                cart.products[productIndex].quantity += 1;
            } else {
                cart.products.push({
                    productId: product._id, // Ensure it's stored correctly
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    thumbnailImage: product.thumbnailImage,
                });
                
            }

            await cart.save();
        } else {
            cart = new Cart({
                userId,
                products: [{
                    productId,
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    thumbnailImage: product.thumbnailImage,
                }],
            });
            await cart.save();
        }

        res.json({ success: true, message: "Product added to cart" });
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
        res.status(500).json({ success: false, message: "Server error while adding product to cart" });
    }
});

// ✅ Get all cart items for a user
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.session.userId }).populate("products.productId");

        if (!cart) {
            return res.json({ success: true, cart: [] });
        }

        const cartProducts = cart.products.map(product => ({
            productId: product.productId ? product.productId.toString() : "", 
            name: product.name,
            price: product.price,
            description: product.description,
            thumbnailImage: product.thumbnailImage,
        }));

        console.log("🛒 Debugging - Sending Cart Data:", cartProducts);
        res.json({ success: true, cart: cartProducts });
    } catch (error) {
        console.error("❌ Error fetching cart:", error);
        res.status(500).json({ success: false, message: "Error fetching cart" });
    }
});




module.exports = router;
