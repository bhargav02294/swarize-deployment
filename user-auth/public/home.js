document.addEventListener('DOMContentLoaded', async () => {
    const mainContainer = document.getElementById('main-container');
    const messageContainer = document.getElementById('message-container'); // Ensure you have an element with id 'message-container' in your HTML to show the message.
    const API_BASE = "https://swarize.in";

    try {
        // Check if the user is logged in
        const response = await fetch(`${API_BASE}/api/auth/is-logged-in`, {
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok && data.isLoggedIn) {
            // Store user info in localStorage
            localStorage.setItem("loggedInUser", data.userId);
            localStorage.setItem("userName", data.userName);

            // Show main content
            mainContainer.style.display = 'flex';

            // Populate sidebar menu
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

            // Logout functionality
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

            // Check if the user has created a store
            const storeResponse = await fetch("/api/store/my-store-slug", {
                method: "GET",
                credentials: "include", // Make sure session cookie is sent
            });

            const storeData = await storeResponse.json();

            if (storeData.success && storeData.storeExists && storeData.slug) {
                // Store found, redirect to store.html
                localStorage.setItem("storeSlug", storeData.slug);
                window.location.href = `/store.html?slug=${storeData.slug}`;
            } else {
                // Store not found, show message
                mainContainer.style.display = 'none';  // Hide main content
                messageContainer.style.display = 'block';  // Show the message container
                messageContainer.innerHTML = "<h2>You haven’t created a store yet.</h2>";
            }

        } else {
            // If not logged in, redirect to not-signed-in page
            window.location.href = 'https://swarize.in/not-signed-in.html';
        }
    } catch (error) {
        console.error('Login check failed:', error);
        window.location.href = 'https://swarize.in/not-signed-in.html';
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
