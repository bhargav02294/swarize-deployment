// ✅ Toggle Password Visibility
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
        const input = document.getElementById(button.getAttribute('data-input'));
        input.type = input.type === "password" ? "text" : "password";
        button.textContent = input.type === "password" ? "Show" : "Hide";
    });
});

// ✅ Reset Password Form Submission
document.getElementById("reset-password-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const newPassword = document.getElementById("new-password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const email = localStorage.getItem("resetEmail"); // ✅ Retrieve email from localStorage
    const message = document.getElementById("message");

    if (!email) {
        message.textContent = "❌ Error: Email not found. Please restart the password reset process.";
        return;
    }

    if (newPassword !== confirmPassword) {
        message.textContent = "❌ Passwords do not match!";
        return;
    }

    try {
        const response = await fetch("https://swarize.in/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword })
        });

        const result = await response.json();

        if (response.status === 409) {
            message.textContent = result.message;  // ❌ If password matches the old one
        } else if (response.ok) {
            alert("✅ Password reset successfully! Redirecting to sign-in...");
            window.location.href = "/signin.html";
        } else {
            throw new Error(result.message || "❌ Failed to reset password.");
        }
    } catch (error) {
        console.error("❌ Error:", error);
        message.textContent = error.message;
    }
});
