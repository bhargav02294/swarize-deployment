document.addEventListener('DOMContentLoaded', async () => {
    const mainContainer = document.getElementById('main-container');
    const signInMessage = document.getElementById('sign-in-message');
    const gridContainer = document.getElementById('grid-container');
    const buttonContainer = document.getElementById('button-container');

    try {
        // ✅ Ensure session cookies are included in the request
        const response = await fetch('/is-logged-in', { credentials: 'include' });
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
                    <span class="logo-text">S</span> <!-- Letter "S" in the circle -->
                </div>
                </div>

                <ul class="menu">
                    <li><a href="/">Home</a></li>
                    <li><a href="/resetpassotp.html">Change Password</a></li>
                    <li><a href="/bank-details.html">Bank Details</a></li>
                    <li><a href="/Security.html">Security</a></li>
                    <li><a href="/invite.html">Invite</a></li>
                    <li><a href="/about.html">About</a></li>
                    <li><a href="/help.html">Help</a></li>
                    <li><a href="/logout" class="logout">Logout</a></li>
                </ul>
            `;

            // ✅ Display welcome message
            const welcomeMessage = document.createElement('p');
            welcomeMessage.textContent = `Welcome, ${data.userName || 'User'}!`;
            buttonContainer.appendChild(welcomeMessage);

            // ✅ Ensure the grid is visible
            gridContainer.style.display = 'grid';
        } else {
            // If user is not logged in, show sign-in message
            mainContainer.style.display = 'none';
            signInMessage.style.display = 'flex';

            // Redirect to sign-in page when button is clicked
            document.getElementById('sign-in-btn').onclick = () => {
                window.location.href = '/signin';
            };
        }
    } catch (error) {
        console.error('Error fetching login status:', error);
        signInMessage.innerHTML += `<p style="color: red;">Failed to load content. Please try again later.</p>`;
    }
});


// Button event listeners
document.getElementById('collections-btn').addEventListener('click', () => {
    window.location.href = 'collections.html';
});

document.getElementById('store-btn').addEventListener('click', () => {
    window.location.href = 'store.html';
});

document.getElementById('profile-btn').addEventListener('click', () => {
    window.location.href = 'user-profile.html';
});

// Add event listener for the Seller Dashboard button
document.getElementById('seller-dashboard-btn').addEventListener('click', () => {
    window.location.href = 'dashboard.html'; // Redirect to the Seller Dashboard page
});
