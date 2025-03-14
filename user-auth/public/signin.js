document.getElementById("signinForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();
    const message = document.getElementById("message");

    try {
        const response = await fetch("https://swarize.in/api/auth/signin", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Ensures cookies/sessions work
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        if (data.success) {
            alert("✅ Login Successful! Redirecting...");
            window.location.href = "https://swarize.in/profile"; 
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


document.querySelector(".google").addEventListener("click", function () {
    window.location.href = "https://swarize.in/auth/google";
});
