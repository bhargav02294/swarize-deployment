document.addEventListener('DOMContentLoaded', async () => {
    const mainContainer = document.getElementById('main-container');
    const API_BASE = "https://swarize.in";

    try {
        const response = await fetch(`${API_BASE}/api/auth/is-logged-in`, {
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok && data.isLoggedIn) {
            localStorage.setItem("loggedInUser", data.userId);
            localStorage.setItem("userName", data.userName);

            mainContainer.style.display = 'flex';

            document.querySelector('.sidebar').innerHTML = `
                <div class="logo-container">
                    <span class="logo-text">S</span>
                </div>
                <ul class="menu">
                    <li><a href="/">Home</a></li>
                    <li><a href="/resetpassotp.html">Change Password</a></li>
                    <li><a href="/bank-details.html">Bank Details</a></li>
                    <li><a href="/sellers-store.html">Sellers Store</a></li>
                    <li><a href="/Security.html">Security</a></li>
                    <li><a href="/invite.html">Invite</a></li>
                    <li><a href="/about.html">About</a></li>
                    <li><a href="/help.html">Help</a></li>
                    <li><a href="#" id="logout-btn" class="logout">Logout</a></li>
                </ul>
            `;

            document.getElementById('logout-btn').addEventListener('click', async () => {
                try {
                    const logoutResponse = await fetch(`${API_BASE}/logout`, {
                        method: "GET",
                        credentials: "include"
                    });

                    if (logoutResponse.ok) {
                        sessionStorage.clear();
                        localStorage.removeItem("loggedInUser");
                        localStorage.removeItem("userName");
                        window.location.href = 'https://swarize.in/index.html';
                    } else {
                        console.error("Logout failed");
                    }
                } catch (error) {
                    console.error("Logout error:", error);
                }
            });

        } else {
            window.location.href = 'https://swarize.in/not-signed-in.html';
        }
    } catch (error) {
        console.error('Login check failed:', error);
        window.location.href = 'https://swarize.in/not-signed-in.html';
    }
});

// public/home.js
document.addEventListener("DOMContentLoaded", async () => {
    const storeContainer = document.getElementById("store-products");
    const messageContainer = document.getElementById("message-container");

    try {
        // Step 1: Check if user is logged in
        const authRes = await fetch("/api/auth/is-logged-in", {
            credentials: "include"
        });
        const authData = await authRes.json();

        if (!authRes.ok || !authData.isLoggedIn) {
            window.location.href = "/not-signed-in.html";
            return;
        }

        localStorage.setItem("loggedInUser", authData.userId);
        localStorage.setItem("userName", authData.userName);

        // Step 2: Check if store exists and get products
        const res = await fetch("/api/products/my-store", {
            credentials: "include"
        });
        const data = await res.json();

        if (data.success && data.storeExists && data.products.length > 0) {
            messageContainer.style.display = "none";
            storeContainer.style.display = "grid";

            data.products.forEach(product => {
                const card = document.createElement("div");
                card.classList.add("product-card");
                card.innerHTML = `
                    <img src="${product.thumbnail}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p><strong>Price:</strong> ₹${product.price}</p>
                `;
                storeContainer.appendChild(card);
            });
        } else {
            storeContainer.style.display = "none";
            messageContainer.style.display = "block";
            messageContainer.innerHTML = "<h2>You haven’t created a store yet.</h2>";
        }

    } catch (err) {
        console.error("❌ Error loading seller store:", err);
        messageContainer.innerHTML = "<h2>Error loading your store. Please try again later.</h2>";
    }
});

  
  
  document.getElementById('store-btn')?.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/store/redirect-to-store', { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.redirectTo) {
        window.location.href = data.redirectTo;
      } else {
        alert("❌ Store redirection failed");
      }
    } catch (err) {
      console.error("❌ Store redirect error:", err);
      alert("Server error");
    }
  });
  

// Utility Function for buttons
function addEventListenerIfExists(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) element.addEventListener(event, handler);
}

addEventListenerIfExists('#collections-btn', 'click', () => {
    window.location.href = 'https://swarize.in/collections.html';
});

addEventListenerIfExists('#profile-btn', 'click', () => {
    window.location.href = 'https://swarize.in/user-profile.html';
});

addEventListenerIfExists('#seller-dashboard-btn', 'click', () => {
    window.location.href = 'https://swarize.in/dashboard.html';
});
