document.addEventListener("DOMContentLoaded", async () => {
    try {
        // ✅ Check login status
        const authResponse = await fetch("https://swarize.in/api/auth/is-logged-in", {
            credentials: "include"
        });

        const authData = await authResponse.json();

        if (!authData.isLoggedIn) {
            document.body.innerHTML = `
                <div id="sign-in-message" class="center-message">
                    <h2>You are not signed in! Please sign in to view your cart.</h2>
                    <button onclick="window.location.href='signin.html'">Sign In</button>
                </div>
            `;
            return;
        }

        console.log("✅ User is logged in:", authData); // ✅ Debugging Log

        await loadCartItems(); // 🔁 Load cart
    } catch (error) {
        console.error("❌ Error loading cart:", error);
        document.getElementById("cart-message").textContent = "Error loading cart.";
    }
});

// ✅ Load Cart
async function loadCartItems() {
    const cartResponse = await fetch("https://swarize.in/api/cart", { credentials: "include" });
    const cartData = await cartResponse.json();

    console.log("🛒 Cart Data from Backend:", cartData);

    const cartContainer = document.getElementById("cart-container");
    cartContainer.innerHTML = "";

    if (!cartData.success || cartData.cart.length === 0) {
        document.getElementById("cart-message").textContent = "Your cart is empty.";
        return;
    }

    cartContainer.style.display = "block";

    cartData.cart.forEach(product => {
        const productId = product.productId;

        const productDiv = document.createElement("div");
        productDiv.classList.add("cart-item");

        productDiv.innerHTML = `
            <img src="${product.thumbnailImage.startsWith('http') ? product.thumbnailImage : 'https://swarize.in/' + product.thumbnailImage}" class="cart-product-image" />
            <h2 class="cart-product-name">${product.name}</h2>
            <p class="cart-product-price">₹${product.price}</p>
            <p class="cart-product-description">${product.description}</p>
            <button class="remove-button" onclick="removeFromCart('${productId}')">🗑️ Remove</button>
        `;

        cartContainer.appendChild(productDiv);
    });

    document.getElementById("cart-message").textContent = "";
    document.getElementById("go-to-store").style.display = "block";
}

// ✅ Remove Product from Cart
async function removeFromCart(productId) {
    if (!productId) return;

    try {
        const response = await fetch(`https://swarize.in/api/cart/${productId}`, {
            method: "DELETE",
            credentials: "include"
        });

        const data = await response.json();

        if (data.success) {
            console.log("✅ Product removed");
            await loadCartItems(); // 🔁 Reload cart
        } else {
            console.error("❌ Failed to remove:", data.message);
            alert("Failed to remove product from cart.");
        }
    } catch (err) {
        console.error("❌ Error removing product:", err);
        alert("Error removing product.");
    }
}
