// home.js
// Complete behavior for home dashboard UI

document.addEventListener('DOMContentLoaded', () => {

  const API_BASE = "https://swarize.in";

  const mainContainer = document.getElementById('main-container');
  const sidebar = document.querySelector('.sidebar');

  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLogout = document.getElementById('mobileLogout');

  /* =====================================================
     DESKTOP SIDEBAR INJECTION
  ====================================================== */
  function injectSidebar(userName) {
    sidebar.innerHTML = `
      

      <nav class="sidebar-nav">
        <ul class="menu">
          <li><a href="/">Home</a></li>
          <li><a href="/resetpassotp.html">Change Password</a></li>
          <li><a href="/bank-details.html">Bank Details</a></li>
          <li><a href="#" id="sellers-store-link">My Store</a></li>
          <li><a href="/security.html">Security</a></li>
          <li><a href="/invite.html">Invite</a></li>
          <li><a href="/about.html">About</a></li>
          <li><a href="/help.html">Help</a></li>
          <li><a href="#" id="logout-btn">Logout</a></li>
        </ul>
      </nav>
    `;

    /* Logout button (Desktop sidebar) */
    document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const out = await fetch(`${API_BASE}/logout`, { method: "GET", credentials: "include" });
        if (out.ok) {
          sessionStorage.clear();
          localStorage.clear();
          window.location.href = "https://swarize.in/index.html";
        } else alert("Logout failed");
      } catch {
        alert("Server error during logout");
      }
    });

    /* My Store (Desktop Sidebar) */
    document.getElementById('sellers-store-link')?.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(`${API_BASE}/api/store/my-store`, {
          method: "GET",
          credentials: "include",
          headers: { "X-Custom-Source": "sellers-store-access" }
        });

        const data = await res.json();
        if (data.success && data.store?.slug) {
          window.location.href = `/sellers-store.html?slug=${data.store.slug}`;
        } else {
          alert("You haven't created a store yet.");
        }
      } catch (err) {
        console.error(err);
        alert("Server error");
      }
    });
  }

  /* =====================================================
     MOBILE MENU OPEN/CLOSE
  ====================================================== */
  function openMobileMenu() {
    mobileMenu.classList.add('open');
    menuToggle.textContent = "✕";
    document.body.style.overflow = "hidden";
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    menuToggle.textContent = "☰";
    document.body.style.overflow = "";
  }

  menuToggle?.addEventListener("click", () => {
    mobileMenu.classList.contains("open") ? closeMobileMenu() : openMobileMenu();
  });

  /* Click outside to close */
  document.addEventListener("click", (event) => {
    if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
      if (mobileMenu.classList.contains("open")) closeMobileMenu();
    }
  });

  /* Escape to close */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });

  /* Mobile Logout */
  mobileLogout?.addEventListener('click', async (e) => {
    e.preventDefault();
    const out = await fetch(`${API_BASE}/logout`, { method: "GET", credentials: "include" });
    if (out.ok) window.location.href = "/index.html";
  });


  /* =====================================================
     AUTH CHECK + PAGE BUTTONS
  ====================================================== */
  (async function auth() {
    try {
      const res = await fetch(`${API_BASE}/api/auth/is-logged-in`, { credentials: "include" });
      const data = await res.json();

      if (!data.isLoggedIn) {
        window.location.href = "/not-signed-in.html";
        return;
      }

      /* Show dashboard */
      mainContainer.classList.remove("hidden");

      /* Sidebar */
      injectSidebar(data.userName);

      /* Dashboard Buttons */
      document.getElementById('collections-btn')?.addEventListener("click", () => {
        window.location.href = "/collections.html";
      });

      document.getElementById('profile-btn')?.addEventListener("click", () => {
        window.location.href = "/user-profile.html";
      });

      document.getElementById('seller-dashboard-btn')?.addEventListener("click", () => {
        window.location.href = "/dashboard.html";
      });

      document.getElementById('store-btn')?.addEventListener("click", async () => {
        try {
          const go = await fetch('/api/store/redirect-to-store', { credentials: 'include' });
          const out = await go.json();
          if (out.success && out.redirectTo) {
            window.location.href = out.redirectTo;
          } else alert("Store redirection failed");
        } catch {
          alert("Server error");
        }
      });

    } catch (err) {
      console.error(err);
      window.location.href = "/not-signed-in.html";
    }
  })();

});
