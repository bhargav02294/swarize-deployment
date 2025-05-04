const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const Product = require("../models/product");
const { isAuthenticated } = require("../middleware/auth");

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
            const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);

            if (productIndex > -1) {
                cart.products[productIndex].quantity += 1;
            } else {
                cart.products.push({
                    productId: product._id,
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

// ✅ Remove Product from Cart
router.delete("/:productId", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { productId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        // Filter out the product to be removed
        cart.products = cart.products.filter(
            item => item.productId.toString() !== productId
        );

        await cart.save();

        res.json({ success: true, message: "Product removed from cart" });
    } catch (error) {
        console.error("❌ Error removing product from cart:", error);
        res.status(500).json({ success: false, message: "Server error while removing product" });
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
