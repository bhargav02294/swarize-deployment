document.getElementById('signinForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();

    try {
        const response = await fetch('https://www.swarize.in/api/auth/signin', { // ✅ Correct API path
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // ✅ Ensures session cookies are sent
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // ✅ Store user ID and name in localStorage
            localStorage.setItem("loggedInUser", data.userId);
            localStorage.setItem("userName", data.userName || "User");

            // Redirect to home page
            window.location.href = 'https://www.swarize.in';
        } else {
            // Display error message
            const message = document.getElementById('message');
            message.textContent = data.message || 'Failed to sign in. Please try again.';
            message.style.color = 'red';
        }
    } catch (error) {
        console.error('Error during sign-in:', error);
        const message = document.getElementById('message');
        message.textContent = 'Something went wrong. Please try again.';
        message.style.color = 'red';
    }
});
