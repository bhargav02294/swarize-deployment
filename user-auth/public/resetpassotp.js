let timerInterval;

// ✅ Send OTP Request
document.getElementById("get-otp").addEventListener("click", function () {
    const email = document.getElementById("otp-email").value.trim();

    if (validateEmail(email)) {
        sendOtp(email);
        resetTimer();
        startTimer(60);
        document.getElementById("timer").style.display = "block";
        document.getElementById("resend-otp").style.display = "none";
    } else {
        document.getElementById("email-error").textContent = "❌ Please enter a valid email address.";
    }
});

function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function startTimer(duration) {
    let timer = duration;
    const display = document.getElementById("timer");
    const submitBtn = document.getElementById("submit-otp");

    timerInterval = setInterval(() => {
        display.textContent = `Time left: 00:${timer < 10 ? "0" : ""}${timer}`;
        if (--timer < 0) {
            clearInterval(timerInterval);
            display.textContent = "❌ OTP has expired.";
            submitBtn.disabled = true;
            document.getElementById("resend-otp").style.display = "block";
        } else {
            submitBtn.disabled = false;
        }
    }, 1000);
}

// ✅ Resend OTP
document.getElementById("resend-otp").addEventListener("click", function (event) {
    event.preventDefault();
    const email = document.getElementById("otp-email").value.trim();

    if (validateEmail(email)) {
        sendOtp(email, true);
        resetTimer();
        startTimer(60);
    } else {
        document.getElementById("email-error").textContent = "❌ Please enter a valid email address.";
    }
});

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ Send OTP Function
function sendOtp(email, isResend = false) {
    fetch("https://swarize.in/api/auth/send-otp", {  // ✅ Correct API path
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, isResend }),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) throw new Error(data.message);
    })
    .catch(error => console.error("❌ Error sending OTP:", error));
}

// ✅ Verify OTP Function
document.getElementById("otp-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const otp = document.getElementById("otp-input").value.trim();
    const email = document.getElementById("otp-email").value.trim();

    if (otp.length === 6) {
        verifyOtp(email, otp);
    } else {
        document.getElementById("otp-error").textContent = "❌ Please enter a valid 6-digit OTP.";
    }
});

// ✅ OTP Verification Function
function verifyOtp(email, otp) {
    fetch("https://swarize.in/api/auth/verify-otp", {  // ✅ Correct API path
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem("resetEmail", email); // ✅ Store email for password reset
            window.location.href = "/reset-password.html";
        } else {
            document.getElementById("otp-error").textContent = "❌ Invalid OTP. Please try again.";
        }
    })
    .catch(error => console.error("❌ Error verifying OTP:", error));
}
