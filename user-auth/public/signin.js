document.getElementById("signinForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();
    const message = document.getElementById("message");

    if (!email || !password) {
        message.textContent = "❌ Please enter both email and password.";
        message.style.color = "red";
        return;
    }

    try {
        const response = await fetch("https://swarize-deployment.onrender.com/api/auth/signin", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Ensures cookies/sessions work
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert("✅ Login Successful! Redirecting...");
            window.location.href = "https://swarize.in"; // ✅ Redirect to profile page
        } else {
            message.textContent = `❌ ${data.message || "Failed to sign in. Please try again."}`;
            message.style.color = "red";
        }
    } catch (error) {
        console.error("❌ Error during sign-in:", error);
        message.textContent = "❌ Something went wrong. Please try again.";
        message.style.color = "red";
    }
});

// ✅ Google OAuth Login Button
document.querySelector(".google").addEventListener("click", function () {
    window.location.href = "https://swarize-deployment.onrender.com/auth/google"; // ✅ Correct Google OAuth redirect
});
