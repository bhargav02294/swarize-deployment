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

addEventListenerIfExists('#store-btn', 'click', async () => {
    try {
        const loginRes = await fetch("https://swarize.in/api/user/session", { credentials: 'include' });
        const loginData = await loginRes.json();

        if (!loginData.success || !loginData.userId) {
            alert("⚠️ You are not signed in. Please login first.");
            return window.location.href = '/signin';
        }

        const res = await fetch("https://swarize.in/api/store/check", {
            credentials: 'include'
        });

        const data = await res.json();

        if (data.hasStore && data.storeSlug) {
            // Redirect to the user's store page using the slug
            window.location.href = `/store.html?slug=${data.storeSlug}`;
        } else {
            // Redirect to create store page if no store is found
            window.location.href = '/create-store.html';
        }
    } catch (err) {
        console.error('❌ Error checking store:', err);
        alert("Couldn't verify store status. Please try again.");
    }
});
