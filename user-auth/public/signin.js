document.getElementById('signinForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();

    try {
        const response = await fetch('https://www.swarize.in/api/auth/signin', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include' 
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem("loggedInUser", data.userId);
            localStorage.setItem("userName", data.userName || "User");

            window.location.href = 'https://www.swarize.in'; // ✅ Redirect to home page
        } else {
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

document.querySelector(".google").addEventListener("click", function() {
    window.location.href = "https://www.swarize.in/auth/google"; // ✅ Redirects to backend OAuth route
});
