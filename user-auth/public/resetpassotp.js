// resetpassotp.js — Updated for new Resend OTP backend

let timerInterval;

// -----------------------------------------
// SEND OTP
// -----------------------------------------
document.getElementById("get-otp").addEventListener("click", function () {
    const email = document.getElementById("otp-email").value.trim();
    clearMessages();

    if (!validateEmail(email)) {
        showError("email-error", "❌ Please enter a valid email address.");
        return;
    }

    sendOtp(email);
    resetTimer();
    startTimer(60);
    document.getElementById("timer").style.display = "block";
    document.getElementById("resend-otp").style.display = "none";
});

// -----------------------------------------
// RESET TIMER
// -----------------------------------------
function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

// -----------------------------------------
// START TIMER
// -----------------------------------------
function startTimer(duration) {
    let time = duration;
    const display = document.getElementById("timer");
    const submitBtn = document.getElementById("submit-otp");

    timerInterval = setInterval(() => {
        display.textContent = `Time left: 00:${time < 10 ? "0" + time : time}`;

        if (--time < 0) {
            clearInterval(timerInterval);
            display.textContent = "❌ OTP has expired.";
            submitBtn.disabled = true;
            document.getElementById("resend-otp").style.display = "block";
        } else {
            submitBtn.disabled = false;
        }
    }, 1000);
}

// -----------------------------------------
// RESEND OTP
// -----------------------------------------
document.getElementById("resend-otp").addEventListener("click", function (event) {
    event.preventDefault();

    const email = document.getElementById("otp-email").value.trim();
    clearMessages();

    if (!validateEmail(email)) {
        showError("email-error", "❌ Please enter a valid email address.");
        return;
    }

    sendOtp(email, true);
    resetTimer();
    startTimer(60);
    document.getElementById("resend-otp").style.display = "none";
});

// -----------------------------------------
// EMAIL VALIDATION
// -----------------------------------------
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// -----------------------------------------
// SEND OTP FUNCTION (Updated Endpoint)
// -----------------------------------------
function sendOtp(email, isResend = false) {
    fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showSuccess("OTP sent to your email!");
            } else {
                showError("email-error", data.message || "Failed to send OTP.");
            }
        })
        .catch(err => {
            console.error("OTP Error:", err);
            showError("email-error", "Failed to send OTP. Please try again.");
        });
}

// -----------------------------------------
// VERIFY OTP ON SUBMIT
// -----------------------------------------
document.getElementById("otp-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const otp = document.getElementById("otp-input").value.trim();
    const email = document.getElementById("otp-email").value.trim();
    clearMessages();

    if (otp.length !== 6) {
        showError("otp-error", "❌ Please enter a valid 6-digit OTP.");
        return;
    }

    verifyOtp(email, otp);
});

// -----------------------------------------
// VERIFY OTP FUNCTION (Updated Endpoint)
// -----------------------------------------
function verifyOtp(email, otp) {
    fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem("resetEmail", email);
                window.location.href = "/reset-password.html";
            } else {
                showError("otp-error", "❌ Invalid OTP. Please try again.");
            }
        })
        .catch(err => {
            console.error("OTP Verify Error:", err);
            showError("otp-error", "Something went wrong. Try again.");
        });
}

// -----------------------------------------
// UI MESSAGE HELPERS
// -----------------------------------------
function showError(id, msg) {
    const el = document.getElementById(id);
    el.style.color = "red";
    el.textContent = msg;
}

function showSuccess(msg) {
    const el = document.getElementById("otp-success");
    if (el) {
        el.style.color = "green";
        el.textContent = msg;
        setTimeout(() => (el.textContent = ""), 3000);
    }
}

function clearMessages() {
    const errors = document.querySelectorAll("#email-error, #otp-error");
    errors.forEach(el => (el.textContent = ""));
}
