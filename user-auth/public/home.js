document.addEventListener('DOMContentLoaded', async () => {
    const mainContainer = document.getElementById('main-container');
    const API_BASE = "https://swarize-deployment.onrender.com"; // Define API_BASE here

    try {
        const response = await fetch(`${API_BASE}/api/auth/is-logged-in`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.isLoggedIn) {
            // ✅ Save user info
            localStorage.setItem("loggedInUser", data.userId);
            localStorage.setItem("userName", data.userName);

            // ✅ Show dashboard
            mainContainer.style.display = 'flex';

            // ✅ Add sidebar
            document.querySelector('.sidebar').innerHTML = `
                <div class="logo-container">
                    <span class="logo-text">S</span>
                </div>
                <ul class="menu">
                    <li><a href="/">Home</a></li>
                    <li><a href="/resetpassotp.html">Change Password</a></li>
                    <li><a href="/bank-details.html">Bank Details</a></li>
                    <li><a href="/Security.html">Security</a></li>
                    <li><a href="/invite.html">Invite</a></li>
                    <li><a href="/about.html">About</a></li>
                    <li><a href="/help.html">Help</a></li>
                    <li><a href="#" id="logout-btn" class="logout">Logout</a></li>
                </ul>
            `;

            // ✅ Logout functionality
            document.getElementById('logout-btn').addEventListener('click', async () => {
                try {
                    const logoutResponse = await fetch(`${API_BASE}/api/auth/logout`, {
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
            // 🚨 Redirect if not signed in
            window.location.href = 'https://swarize.in/not-signed-in.html';
        }
    } catch (error) {
        console.error('Login check failed:', error);
        window.location.href = 'https://swarize.in/not-signed-in.html';
    }
});

// ✅ Page button links
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

// 🔁 Utility to attach event listener safely
function addEventListenerIfExists(selector, event, handler) {
    const el = document.querySelector(selector);
    if (el) el.addEventListener(event, handler);
}

// ✅ Store Check and Redirect Logic
addEventListenerIfExists('#store-btn', 'click', async () => {
    try {
        // Step 1: Check if user is logged in
        const loginRes = await fetch(`${API_BASE}/api/user/session`, { credentials: 'include' });
        const loginData = await loginRes.json();

        if (!loginData.success || !loginData.userId) {
            alert("⚠️ You are not signed in. Please login first.");
            return window.location.href = '/signin';
        }

        // Step 2: Check if store exists
        const res = await fetch(`${API_BASE}/api/store/check`, {
            credentials: 'include'
        });

        const data = await res.json();

        if (data.hasStore && data.storeSlug) {
            window.location.href = `/store.html?slug=${data.storeSlug}`;
        } else {
            window.location.href = '/create-store.html';
        }

    } catch (err) {
        console.error('❌ Error checking store:', err);
        alert("Couldn't verify store status. Please try again.");
    }
});
