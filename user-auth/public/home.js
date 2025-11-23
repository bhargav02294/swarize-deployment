// home.js
// Complete client-side behavior for home dashboard:
// - auth check (/api/auth/is-logged-in)
// - desktop sidebar injection
// - logout (/logout)
// - store-btn redirect (/api/store/redirect-to-store)
// - sellers-store-link fetch (/api/store/my-store)
// - mobile menu (open/close + Escape/outside click)
// - utility helper to attach handlers if element exists

document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = "https://swarize.in";
  const mainContainer = document.getElementById('main-container');
  const sidebar = document.querySelector('.sidebar');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');
  const mobileLogout = document.getElementById('mobileLogout');

  function injectSidebar(userName) {
    // build sidebar HTML, including sellers-store-link and logout
    sidebar.innerHTML = `
      <div class="sidebar-brand">
        <img src="/images/logo.png" alt="Swarize" class="sidebar-logo" />
        <div style="display:flex;flex-direction:column;">
          <div class="sidebar-title">swarize</div>
          <div style="font-size:12px;color:${getComputedStyle(document.documentElement).getPropertyValue('--muted') || '#9aa4ad'}; margin-top:4px;">${userName ? userName : ''}</div>
        </div>
      </div>
      <nav class="sidebar-nav" role="navigation" aria-label="Dashboard navigation">
        <ul class="menu">
          <li><a href="/" id="link-home">Home</a></li>
          <li><a href="/resetpassotp.html" id="link-reset">Change Password</a></li>
          <li><a href="/bank-details.html" id="link-bank">Bank Details</a></li>
          <li><a href="#" id="sellers-store-link">My Store</a></li>
          <li><a href="/security.html" id="link-security">Security</a></li>
          <li><a href="/invite.html" id="link-invite">Invite</a></li>
          <li><a href="/about.html" id="link-about">About</a></li>
          <li><a href="/help.html" id="link-help">Help</a></li>
          <li><a href="#" id="logout-btn">Logout</a></li>
        </ul>
      </nav>
    `;

    // attach logout handler (desktop)
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
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
          alert("Logout failed — try again.");
        }
      } catch (err) {
        console.error("Logout error:", err);
        alert("Logout failed — server error.");
      }
    });

    // attach sellers-store-link behaviour
    const sellersStoreLink = document.getElementById('sellers-store-link');
    sellersStoreLink?.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const customHeaders = {
          'Content-Type': 'application/json',
          'X-Custom-Source': 'sellers-store-access'
        };
        const res = await fetch(`${API_BASE}/api/store/my-store`, {
          method: 'GET',
          credentials: 'include',
          headers: customHeaders
        });
        const data = await res.json();
        if (res.ok && data.success && data.store && data.store.slug) {
          window.location.href = `/sellers-store.html?slug=${data.store.slug}`;
        } else {
          alert("You haven't created a store yet.");
        }
      } catch (err) {
        console.error("Failed to fetch store info", err);
        alert("Server error");
      }
    });
  }

  // mobile menu controls
  function openMobileMenu() {
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.textContent = '✕';   // ← FIXED
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.textContent = '☰';  // ← FIXED
  document.body.style.overflow = '';
}

  menuToggle?.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) closeMobileMenu();
    else openMobileMenu();
  });

  // mobile logout
  mobileLogout?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const logoutResponse = await fetch(`${API_BASE}/logout`, {
        method: "GET",
        credentials: "include"
      });
      if (logoutResponse.ok) window.location.href = 'https://swarize.in/index.html';
      else alert("Logout failed");
    } catch (err) {
      console.error(err);
      alert("Logout error");
    }
  });

  // close mobile menu on outside click or Escape
  document.addEventListener('click', (ev) => {
    if (!mobileMenu.contains(ev.target) && !menuToggle.contains(ev.target) && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobileMenu();
  });

  // utility helper
  function addEventListenerIfExists(selector, event, handler) {
    const el = document.querySelector(selector);
    if (el) el.addEventListener(event, handler);
  }

  // main auth-check and mounting
  (async function authAndMount() {
    try {
      const response = await fetch(`${API_BASE}/api/auth/is-logged-in`, { credentials: 'include' });
      const data = await response.json();

      if (response.ok && data.isLoggedIn) {
        // save some user info
        localStorage.setItem("loggedInUser", data.userId ?? "");
        localStorage.setItem("userName", data.userName ?? "");

        // show main container
        mainContainer.classList.remove('hidden');

        // inject desktop sidebar with username
        injectSidebar(data.userName || '');

        // attach page buttons
        addEventListenerIfExists('#collections-btn', 'click', () => {
          window.location.href = 'https://swarize.in/collections.html';
        });
        addEventListenerIfExists('#profile-btn', 'click', () => {
          window.location.href = 'https://swarize.in/user-profile.html';
        });
        addEventListenerIfExists('#seller-dashboard-btn', 'click', () => {
          window.location.href = 'https://swarize.in/dashboard.html';
        });

        // store-btn logic (redirect to store)
        addEventListenerIfExists('#store-btn', 'click', async () => {
          try {
            const res = await fetch('/api/store/redirect-to-store', { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.redirectTo) {
              window.location.href = data.redirectTo;
            } else {
              alert("Store redirection failed");
            }
          } catch (err) {
            console.error("Store redirect error:", err);
            alert("Server error");
          }
        });

        // If somebody clicked mobile menu "My Store" (the mobile item uses same id as below)
        // attach a listener to the mobile menu's My Store link if present
        const mobileMyStore = document.querySelector('#mobileMenu a[href="/sellers-store.html"]');
        // If mobile link exists, it's a simple href — no custom fetch required. The special "My Store" button is the
        // sellers-store-link in desktop sidebar injected earlier.

      } else {
        // not logged in -> redirect to not-signed-in
        window.location.href = 'https://swarize.in/not-signed-in.html';
      }
    } catch (err) {
      console.error("Login check failed:", err);
      window.location.href = 'https://swarize.in/not-signed-in.html';
    }
  })();

});
