document.addEventListener("DOMContentLoaded", async () => {
    // Check if user is signed in
    const authResponse = await fetch("/is-logged-in", { credentials: "include" });
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

    try {
        // Fetch Cart Items
        const cartResponse = await fetch("https://www.swarize.in/cart", { credentials: "include" });
        const cartData = await cartResponse.json();

        console.log("🛒 Cart Data from Backend:", cartData); // Debugging Log

        if (!cartData.success || cartData.cart.length === 0) {
            document.getElementById("cart-message").textContent = "Your cart is empty.";
            return;
        }

        // Display all products in the cart
        const cartContainer = document.getElementById("cart-container");
        cartContainer.innerHTML = "";

        cartData.cart.forEach(product => {
            console.log("🛒 Product from Backend:", product);

            const validProductId = product.productId ? product.productId.toString() : "";

            const productDiv = document.createElement("div");
            productDiv.classList.add("cart-item");
            productDiv.innerHTML = `
                <img src="https://www.swarize.in/${product.thumbnailImage}" alt="${product.name}" class="cart-product-thumbnail">
                <h2 class="cart-product-name">${product.name}</h2>
                <p class="cart-product-price">₹${product.price}</p>
                <p class="cart-product-description">${product.description}</p>
            `;
            cartContainer.appendChild(productDiv);
        });

        document.getElementById("cart-message").textContent = "";
        cartContainer.style.display = "block";
        document.getElementById("go-to-store").style.display = "block";

        

    } catch (error) {
        console.error("❌ Error loading cart:", error);
        document.getElementById("cart-message").textContent = "Error loading cart.";
    }
});




