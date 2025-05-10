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
        
                    

            <button class="menu-toggle">&#9776;</button>
            <div class="mobile-slide-menu hidden">
                <ul>    
                    <li><a href="/">Home</a></li>
                    <li><a href="/resetpassotp.html">Change Password</a></li>
                    <li><a href="/bank-details.html">Bank Details</a></li>
                    <li><a href="/sellers-store.html">Sellers Store</a></li>
                    <li><a href="/security.html">Security</a></li>
                    <li><a href="/invite.html">Invite</a></li>
                    <li><a href="/about.html">About</a></li>
                    <li><a href="/help.html">Help</a></li>
                    <li><a href="#" id="logout-btn" class="logout"> </a></li>
                 </ul>
            </div>
            `;
  const toggleBtn = document.querySelector(".menu-toggle");
    const slideMenu = document.querySelector(".mobile-slide-menu");

    toggleBtn.addEventListener("click", () => {
        slideMenu.classList.toggle("visible");
    });
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
        const customHeaders = {
            'Content-Type': 'application/json',
            'X-Custom-Source': 'sellers-store-access' // optional header if needed for distinction
        };

        const res = await fetch('https://swarize.in/api/store/my-store', {
            method: 'GET',
            credentials: 'include', // you can keep this to maintain session cookies
            headers: customHeaders
        });

        const data = await res.json();
        if (res.ok && data.success) {
            const slug = data.store.slug;
            window.location.href = `/sellers-store.html?slug=${slug}`;
        } else {
            alert("⚠️ You haven't created a store yet.");
        }
    } catch (err) {
        console.error("❌ Failed to fetch store info", err);
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
