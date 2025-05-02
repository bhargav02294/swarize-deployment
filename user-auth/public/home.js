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
<li><a href="#" id="sellers-store-link">Sellers Store</a></li>
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

  document.getElementById('sellers-store-link')?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('/api/store/my-store', {
            method: 'GET',
            credentials: 'include'
        });

        const data = await res.json();
        if (res.ok && data.success && data.store.slug) {
            const slug = data.store.slug;
            window.location.href = `/sellers-store.html?slug=${slug}`;
        } else {
            alert("❌ Store not found for this user.");
        }
    } catch (err) {
        console.error("❌ Store fetch error:", err);
        alert("Server error while redirecting to seller store.");
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
