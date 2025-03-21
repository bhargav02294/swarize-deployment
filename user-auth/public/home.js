document.addEventListener('DOMContentLoaded', async () => {
    const mainContainer = document.getElementById('main-container');
    const signInMessage = document.getElementById('sign-in-message');
    const signInBtn = document.getElementById('sign-in-btn');
    const gridContainer = document.getElementById('grid-container');
    const buttonContainer = document.getElementById('button-container');

    try {
        // ✅ Ensure session cookies are included in the request
        const response = await fetch('https://swarize-deployment.onrender.com/api/auth/is-logged-in', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.isLoggedIn) {
            // ✅ Store user data in localStorage for fast access
            localStorage.setItem("loggedInUser", data.userId);
            localStorage.setItem("userName", data.userName);

            // ✅ Show main content and hide sign-in message
            signInMessage.style.display = 'none';
            mainContainer.style.display = 'flex';

            // ✅ Populate sidebar dynamically
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

            // ✅ Display welcome message without duplicating
            buttonContainer.innerHTML = `<p>Welcome, ${data.userName || 'User'}!</p>`;

            // ✅ Ensure the grid is visible
            gridContainer.style.display = 'grid';

            // ✅ Handle Logout Functionality
            document.getElementById('logout-btn').addEventListener('click', async () => {
                await fetch("https://swarize-deployment.onrender.com/api/auth/logout", {
                    method: "GET",
                    credentials: "include"
                });
                localStorage.removeItem("loggedInUser");
                localStorage.removeItem("userName");
                window.location.href = 'https://swarize.in/index.html'; // ✅ Redirect after logout
            });

        } else {
            // ✅ Show sign-in message if user is NOT logged in
            mainContainer.style.display = 'none';
            signInMessage.style.display = 'flex';

            // ✅ Redirect to sign-in page when button is clicked
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
