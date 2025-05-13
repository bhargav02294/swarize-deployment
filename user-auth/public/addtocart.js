document.addEventListener("DOMContentLoaded", async () => {
    try {
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

        const cartResponse = await fetch("https://swarize.in/api/cart", { credentials: "include" });
        const cartData = await cartResponse.json();

        if (!cartData.success || cartData.cart.length === 0) {
            document.getElementById("cart-message").textContent = "Your cart is empty.";
            return;
        }

        const cartContainer = document.getElementById("cart-container");
        cartContainer.innerHTML = "";
        cartContainer.style.display = "block";

        cartData.cart.forEach(product => {
            const productDiv = document.createElement("div");
            productDiv.classList.add("cart-item");

            productDiv.innerHTML = `
                <img src="${product.thumbnailImage.startsWith('http') ? product.thumbnailImage : 'https://swarize.in/' + product.thumbnailImage}" alt="${product.name}" class="cart-product-image">
                <h2 class="cart-product-name">${product.name}</h2>
                <p class="cart-product-price">₹${product.price}</p>
                <p class="cart-product-description">${product.description}</p>
                <button class="remove-button" data-id="${product.productId}">Remove</button>
            `;

            cartContainer.appendChild(productDiv);
        });

        // Attach remove event
        document.querySelectorAll(".remove-button").forEach(button => {
            button.addEventListener("click", async (e) => {
                const productId = e.target.getAttribute("data-id");
                try {
                    const res = await fetch("https://swarize.in/api/cart/remove", {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ productId })
                    });

                    const data = await res.json();
                    if (data.success) {
                        alert("Product removed from cart.");
                        // Remove from UI without reload
                        e.target.closest(".cart-item").remove();
                    } else {
                        alert("Failed to remove product.");
                    }
                } catch (err) {
                    console.error(" Remove error:", err);
                    alert("Error removing product.");
                }
            });
        });

        document.getElementById("cart-message").textContent = "";

    } catch (error) {
        console.error(" Error loading cart:", error);
        document.getElementById("cart-message").textContent = "Error loading cart.";
    }
});
