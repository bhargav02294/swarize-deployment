document.getElementById("signup-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get form input values
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const country = document.getElementById("signup-country").value.trim(); // Get the country value

    // Email and password validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

    // Validate email
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Validate password
    if (!passwordRegex.test(password)) {
        alert("Password must be at least 6 characters long, with at least one numeric character and one symbol.");
        return;
    }

    // Check if the country is India
    if (country.toLowerCase() !== "india") {
        alert("This platform is only available for users in India.");
        return;
    }

    try {
        // Send form data to the server
        const response = await fetch("https://swarize.in/api/auth/signup", { // ✅ Correct API path
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // ✅ Ensures cookies/sessions work
            body: JSON.stringify({ name, email, password, country }) // Include country in payload
        });

        const data = await response.json();

        // Handle server response
        if (response.ok && data.success) {
            alert(data.message || "Signup successful!"); // ✅ Success message
            localStorage.setItem("signupEmail", email);

            window.location.href = "https://swarize.in/otp.html"; // ✅ Absolute path to OTP page
        } else {
            alert(data.message || "Error registering user.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again later.");
    }
});

// Fetch user country and set it in the hidden input field
fetch("https://ipapi.co/json/")
    .then(response => response.json())
    .then(data => {
        const country = data.country_name; // Get the country name
        document.getElementById("signup-country").value = country; // Set the hidden input value
        if (country !== "India") {
            alert("This platform is only available in India."); // Alert user immediately if not from India
        }
    })
    .catch(error => console.error("Error fetching country data:", error));

// ✅ Google OAuth Signup Button
document.querySelector(".google").addEventListener("click", function () {
    window.location.href = "https://swarize.in/auth/google"; // ✅ Redirects to backend for Google OAuth
});
