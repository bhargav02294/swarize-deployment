document.getElementById("signup-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const country = document.getElementById("signup-country").value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

    if (!emailRegex.test(email)) {
        alert("❌ Please enter a valid email address.");
        return;
    }

    if (!passwordRegex.test(password)) {
        alert("❌ Password must be at least 6 characters long, with at least one numeric character and one symbol.");
        return;
    }

    if (country.toLowerCase() !== "india") {
        alert("❌ This platform is only available for users in India.");
        return;
    }

    try {
        const response = await fetch("https://swarize-deployment.onrender.com/api/auth/signup", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Ensures cookies/sessions work
            body: JSON.stringify({ name, email, password, country })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert("✅ Signup successful! Redirecting to OTP verification...");
            localStorage.setItem("signupEmail", email);
            window.location.href = "https://swarize-deployment.onrender.com/otp";
        } else {
            alert(`❌ ${data.message || "Error registering user. Please try again."}`);
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Something went wrong. Please try again later.");
    }
});

// Fetch user country and set it in the hidden input field
fetch("https://ipapi.co/json")
    .then(response => response.json())
    .then(data => {
        const country = data.country_name || "Unknown";
        document.getElementById("signup-country").value = country;
        if (country.toLowerCase() !== "india") {
            alert("❌ This platform is only available in India.");
        }
    })
    .catch(error => console.error("❌ Error fetching country data:", error));

// Google OAuth Signup Button
document.querySelector(".google").addEventListener("click", function () {
    window.location.href = "https://swarize-deployment.onrender.com/auth/google"; // Redirects to backend for Google OAuth
});
