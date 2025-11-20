// ---------------------------------------------
// Toggle Password Visibility
// ---------------------------------------------
document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.getAttribute("data-input"));
        const isPassword = input.type === "password";

        input.type = isPassword ? "text" : "password";
        button.textContent = isPassword ? "Hide" : "Show";
    });
});

// ---------------------------------------------
// Reset Password Form Submission
// ---------------------------------------------
document.getElementById("reset-password-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const newPassword = document.getElementById("new-password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const email = localStorage.getItem("resetEmail");
    const message = document.getElementById("message");

    // Clear old messages
    message.textContent = "";

    if (!email) {
        message.textContent = "❌ Error: Email not found. Please restart the reset process.";
        return;
    }

    if (newPassword !== confirmPassword) {
        message.textContent = "❌ Passwords do not match!";
        return;
    }

    if (newPassword.length < 6) {
        message.textContent = "❌ Password must be at least 6 characters.";
        return;
    }

    try {
        const response = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword })
        });

        const result = await response.json();

        if (response.status === 409) {
            message.textContent = `⚠️ ${result.message}`;
        } else if (response.ok) {
            message.textContent = "✔️ Password reset successful! Redirecting...";
            message.style.color = "green";

            setTimeout(() => {
                window.location.href = "/signin.html";
            }, 1500);
        } else {
            throw new Error(result.message || "Failed to reset password.");
        }
    } catch (error) {
        console.error("Reset Error:", error);
        message.textContent = "❌ " + error.message;
    }
});
