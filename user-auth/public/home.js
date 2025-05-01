document.addEventListener('DOMContentLoaded', async () => {
    const mainContainer = document.getElementById('main-container');
    const API_BASE = "https://swarize.in";

    try {
        const res = await fetch(`${API_BASE}/api/auth/is-logged-in`, { credentials: 'include' });
        const data = await res.json();

        if (!res.ok || !data.isLoggedIn) {
            return window.location.href = '/not-signed-in.html';
        }

        localStorage.setItem("loggedInUser", data.userId);
        localStorage.setItem("userName", data.userName);

        let storeSlug = null;
        try {
            const slugRes = await fetch(`${API_BASE}/api/store/my-store-slug`, {
                credentials: 'include'
            });
            const slugData = await slugRes.json();
            if (slugData.success) {
                storeSlug = slugData.slug;
                localStorage.setItem("myStoreSlug", storeSlug);
            }
        } catch (e) {
            console.error("Error fetching store slug:", e);
        }

        mainContainer.style.display = 'flex';

        document.querySelector('.sidebar').innerHTML = `
            <div class="logo-container">
                <span class="logo-text">S</span>
            </div>
            <ul class="menu">
                <li><a href="/">Home</a></li>
                <li><a href="/resetpassotp.html">Change Password</a></li>
                <li><a href="/bank-details.html">Bank Details</a></li>
                <li><a href="${storeSlug ? `/sellers-store.html?slug=${storeSlug}` : '#'}" id="sellers-store-link">Sellers Store</a></li>
                <li><a href="/Security.html">Security</a></li>
                <li><a href="/invite.html">Invite</a></li>
                <li><a href="/about.html">About</a></li>
                <li><a href="/help.html">Help</a></li>
                <li><a href="#" id="logout-btn" class="logout">Logout</a></li>
            </ul>
        `;

        // 👇 Handle seller store link only if store not found
        const sellerLink = document.getElementById('sellers-store-link');
        if (!storeSlug && sellerLink) {
            sellerLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/create-store.html';
            });
        }

        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            const logoutRes = await fetch(`${API_BASE}/logout`, {
                method: "GET",
                credentials: "include"
            });

            if (logoutRes.ok) {
                sessionStorage.clear();
                localStorage.clear();
                window.location.href = '/index.html';
            }
        });

    } catch (err) {
        console.error("Error loading home:", err);
        window.location.href = '/not-signed-in.html';
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
