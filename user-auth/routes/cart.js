// routes/cart.js
const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const Product = require("../models/product");
const { isAuthenticated } = require("../middleware/auth");
const mongoose = require("mongoose");

// ✅ Add product to cart
router.post("/add", isAuthenticated, async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.userId;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        let cart = await Cart.findOne({ userId });

        if (cart) {
            const index = cart.products.findIndex(p => p.productId.toString() === product._id.toString());
            if (index > -1) {
                cart.products[index].quantity += 1;
            } else {
                cart.products.push({
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    thumbnailImage: product.thumbnailImage
                });
            }
            await cart.save();
        } else {
            cart = new Cart({
                userId,
                products: [{
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    thumbnailImage: product.thumbnailImage
                }]
            });
            await cart.save();
        }

        res.json({ success: true, message: "Product added to cart" });
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Get cart items
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.session.userId });

        if (!cart || cart.products.length === 0) {
            return res.json({ success: true, cart: [] });
        }

        // ✅ Clean up productId as string
        const cartItems = cart.products.map(p => ({
            ...p.toObject(),
            productId: p.productId.toString() // ✅ Fix this line
        }));

        res.json({ success: true, cart: cartItems });
    } catch (error) {
        console.error("❌ Error getting cart:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Remove product from cart
router.delete("/:productId", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const newProducts = cart.products.filter(
            p => p.productId.toString() !== productId
        );

        cart.products = newProducts;
        await cart.save();

        res.json({ success: true, message: "Product removed from cart" });
    } catch (err) {
        console.error("❌ Error removing from cart:", err);
        res.status(500).json({ success: false, message: "Error removing product" });
    }
});


// ✅ Fetch Cart Items for Logged-In User
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Please sign in" });
        }

        const cart = await Cart.findOne({ userId }).populate("products.productId");

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
