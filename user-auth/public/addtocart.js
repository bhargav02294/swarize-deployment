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

        // ✅ Fetch Cart Items
        const cartResponse = await fetch("https://swarize.in/api/cart", { credentials: "include" });
        const cartData = await cartResponse.json();

        console.log("🛒 Cart Data from Backend:", cartData);

        if (!cartData.success || cartData.cart.length === 0) {
            document.getElementById("cart-message").textContent = "Your cart is empty.";
            return;
        }

        // ✅ Display all products in the cart
        const cartContainer = document.getElementById("cart-container");
        cartContainer.innerHTML = "";
        cartContainer.style.display = "block";

        cartData.cart.forEach(product => {
            const productDiv = document.createElement("div");
            productDiv.classList.add("cart-item");
            productDiv.innerHTML = `
<img src="${product.thumbnailImage.startsWith('http') ? product.thumbnailImage : 'https://swarize.in/' + product.thumbnailImage}" ...>
                <h2 class="cart-product-name">${product.name}</h2>
                <p class="cart-product-price">₹${product.price}</p>
                <p class="cart-product-description">${product.description}</p>
            `;
            cartContainer.appendChild(productDiv);
        });

        document.getElementById("cart-message").textContent = "";
        document.getElementById("go-to-store").style.display = "block";

    } catch (error) {
        console.error("❌ Error loading cart:", error);
        document.getElementById("cart-message").textContent = "Error loading cart.";
    }
});
