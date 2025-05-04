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

        // ✅ Fetch Cart Items
        await loadCartItems();

    } catch (error) {
        console.error("❌ Error loading cart:", error);
        document.getElementById("cart-message").textContent = "Error loading cart.";
    }
});

// ✅ Function to load and render cart
async function loadCartItems() {
    const cartContainer = document.getElementById("cart-container");
    const cartResponse = await fetch("https://swarize.in/api/cart", {
        credentials: "include"
    });

    const cartData = await cartResponse.json();

    if (!cartData.success || cartData.cart.length === 0) {
        document.getElementById("cart-message").textContent = "Your cart is empty.";
        return;
    }

    cartContainer.innerHTML = "";
    cartContainer.style.display = "block";

    cartData.cart.forEach(product => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("cart-item");
        productDiv.innerHTML = `
            <img src="${product.thumbnailImage.startsWith('http') ? product.thumbnailImage : 'https://swarize.in/' + product.thumbnailImage}" class="cart-product-image">
            <div class="cart-product-details">
                <h2 class="cart-product-name">${product.name}</h2>
                <p class="cart-product-price">₹${product.price}</p>
                <p class="cart-product-description">${product.description}</p>
                <button class="remove-button" onclick="removeFromCart('${product._id}')">🗑️ Remove</button>
            </div>
        `;
        cartContainer.appendChild(productDiv);
    });

    document.getElementById("cart-message").textContent = "";
    document.getElementById("go-to-store").style.display = "block";
}

// ✅ Function to remove item from cart
async function removeFromCart(productId) {
    try {
        const res = await fetch(`https://swarize.in/api/cart/${productId}`, {
            method: "DELETE",
            credentials: "include"
        });

        const data = await res.json();
        if (data.success) {
            console.log("🗑️ Product removed from cart");
            await loadCartItems(); // Reload cart
        } else {
            alert("❌ Failed to remove item: " + data.message);
        }
    } catch (error) {
        console.error("❌ Error removing item from cart:", error);
        alert("❌ Could not remove item.");
    }
}
