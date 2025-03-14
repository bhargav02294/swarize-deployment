
document.getElementById("signinForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();

    try {
        const response = await fetch("https://swarize.in/api/auth/signin", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Ensures cookies/sessions work
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem("loggedInUser", data.userId);
            localStorage.setItem("userName", data.userName || "User");

            alert("✅ Login Successful! Redirecting...");
            window.location.href = "https://swarize.in/profile"; // Redirect to user profile page
        } else {
            const message = document.getElementById("message");
            message.textContent = `❌ ${data.message || "Failed to sign in. Please try again."}`;
            message.style.color = "red";
        }
    } catch (error) {
        console.error("❌ Error during sign-in:", error);
        const message = document.getElementById("message");
        message.textContent = "❌ Something went wrong. Please try again.";
        message.style.color = "red";
    }
});

// Google OAuth Login Button
document.querySelector(".google").addEventListener("click", function () {
    window.location.href = "https://swarize.in/auth/google"; // Redirects to backend OAuth route
});
