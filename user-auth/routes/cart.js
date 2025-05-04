const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const Product = require("../models/product");
const { isAuthenticated } = require("../middleware/auth");

// ✅ Add product to cart
// ✅ Add product to cart
router.post("/add", isAuthenticated, async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Please sign in" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let cart = await Cart.findOne({ userId });

        if (cart) {
            const productIndex = cart.products.findIndex(item => item.productId.toString() === product._id.toString());

            if (productIndex > -1) {
                cart.products[productIndex].quantity += 1;
            } else {
                cart.products.push({
                    productId: product._id, // ✅ USE THIS — real MongoDB ID
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
                    productId: product._id, // ✅ FIXED here too
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
