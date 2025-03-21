document.addEventListener('DOMContentLoaded', async () => {
    const mainContainer = document.getElementById('main-container');
    const signInMessage = document.getElementById('sign-in-message');
    const signInBtn = document.getElementById('sign-in-btn');

    try {
        const response = await fetch('https://swarize-deployment.onrender.com/api/auth/is-logged-in', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.isLoggedIn) {
            localStorage.setItem("loggedInUser", data.userId);
            localStorage.setItem("userName", data.userName);

            signInMessage.style.display = 'none';
            mainContainer.style.display = 'flex';

            const sidebar = document.querySelector('.sidebar');
            sidebar.innerHTML = `
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

            // ✅ Logout Button Handling
            document.getElementById('logout-btn').addEventListener('click', async () => {
                try {
                    const logoutResponse = await fetch("https://swarize-deployment.onrender.com/api/auth/logout", {
                        method: "GET",
                        credentials: "include"
                    });

                    if (logoutResponse.ok) {
                        console.log("✅ Successfully logged out");

                        // ✅ Clear session storage & local storage
                        sessionStorage.clear();
                        localStorage.removeItem("loggedInUser");
                        localStorage.removeItem("userName");

                        // ✅ Redirect to index.html
                        window.location.href = 'https://swarize.in/index.html';
                    } else {
                        console.error("❌ Logout failed");
                    }
                } catch (error) {
                    console.error("❌ Error during logout:", error);
                }
            });

        } else {
            mainContainer.style.display = 'none';
            signInMessage.style.display = 'flex';

            if (signInBtn) {
                signInBtn.onclick = () => {
                    window.location.href = 'https://swarize.in/signin.html';
                };
            }
        }
    } catch (error) {
        console.error('❌ Error fetching login status:', error);
        signInMessage.innerHTML += `<p style="color: red;">Failed to load content. Please try again later.</p>`;
    }
});

// ✅ Safe Event Listener Binding
function addEventListenerIfExists(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) element.addEventListener(event, handler);
}

// ✅ Button event listeners
addEventListenerIfExists('#collections-btn', 'click', () => {
    window.location.href = 'https://swarize.in/collections.html';
});

addEventListenerIfExists('#store-btn', 'click', () => {
    window.location.href = 'https://swarize.in/store.html';
});

addEventListenerIfExists('#profile-btn', 'click', () => {
    window.location.href = 'https://swarize.in/user-profile.html';
});

addEventListenerIfExists('#seller-dashboard-btn', 'click', () => {
    window.location.href = 'https://swarize.in/dashboard.html';
});
