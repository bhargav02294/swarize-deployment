// public/js/addtocart.js
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const authRes = await fetch("https://swarize.in/api/auth/is-logged-in", { credentials: "include" });
        const authData = await authRes.json();

        if (!authData.isLoggedIn) {
            document.body.innerHTML = `
                <div class="center-message">
                    <h2>You are not signed in! Please sign in to view your cart.</h2>
                    <button onclick="window.location.href='signin.html'">Sign In</button>
                </div>
            `;
            return;
        }

        console.log("✅ User is logged in");
        await loadCartItems();
    } catch (err) {
        console.error("❌ Error:", err);
    }
});

async function loadCartItems() {
    try {
        const res = await fetch("https://swarize.in/api/cart", { credentials: "include" });
        const data = await res.json();

        const cartContainer = document.getElementById("cart-container");
        cartContainer.innerHTML = "";

        if (!data.success || data.cart.length === 0) {
            document.getElementById("cart-message").textContent = "Your cart is empty.";
            return;
        }

        data.cart.forEach(product => {
            const productDiv = document.createElement("div");
            productDiv.classList.add("cart-item");

            productDiv.innerHTML = `
                <img src="${product.thumbnailImage}" class="cart-product-image" />
                <h2>${product.name}</h2>
                <p>₹${product.price}</p>
                <p>${product.description}</p>
                <button onclick="removeFromCart('${product.productId}')">🗑️ Remove</button>
            `;

            cartContainer.appendChild(productDiv);
        });

        document.getElementById("cart-message").textContent = "";
        document.getElementById("go-to-store").style.display = "block";
    } catch (err) {
        console.error("❌ Error loading cart:", err);
        document.getElementById("cart-message").textContent = "Error loading cart.";
    }
}

async function removeFromCart(productId) {
    if (!productId) return;

    try {
        const res = await fetch(`https://swarize.in/api/cart/${productId}`, {
            method: "DELETE",
            credentials: "include"
        });

        const data = await res.json();

        if (data.success) {
            console.log("✅ Product removed");
            await loadCartItems();
        } else {
            console.error("❌ Failed to remove:", data.message);
            alert("Failed to remove product from cart.");
        }
    } catch (err) {
        console.error("❌ Error:", err);
        alert("Error removing product.");
    }
}
