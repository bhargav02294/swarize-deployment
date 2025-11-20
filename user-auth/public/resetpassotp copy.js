// resetpassotp.js — Updated for new Resend backend OTP system

let timerInterval;

// ---------------------------------------
// SEND OTP
// ---------------------------------------
document.getElementById("get-otp").addEventListener("click", function () {
    const email = document.getElementById("otp-email").value.trim();

    if (!validateEmail(email)) {
        showError("email-error", "Please enter a valid email address.");
        return;
    }

    sendOtp(email);
    resetTimer();
    startTimer(60);

    document.getElementById("timer").style.display = "block";
    document.getElementById("resend-otp").style.display = "none";
});

// ---------------------------------------
// RESET TIMER
// ---------------------------------------
function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

// ---------------------------------------
// START TIMER
// ---------------------------------------
function startTimer(duration) {
    let timer = duration;
    const display = document.getElementById("timer");
    const submitBtn = document.getElementById("submit-otp");

    timerInterval = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;

        display.textContent = `Time left: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (--timer < 0) {
            clearInterval(timerInterval);
            display.textContent = "OTP has expired.";
            submitBtn.disabled = true;
            document.getElementById("resend-otp").style.display = "block";
        } else {
            submitBtn.disabled = false;
        }
    }, 1000);
}

// ---------------------------------------
// RESEND OTP
// ---------------------------------------
document.getElementById("resend-otp").addEventListener("click", function (event) {
    event.preventDefault();

    const email = document.getElementById("otp-email").value.trim();

    if (!validateEmail(email)) {
        showError("email-error", "Please enter a valid email address.");
        return;
    }

    sendOtp(email, true);
    resetTimer();
    startTimer(60);

    document.getElementById("resend-otp").style.display = "none";
});

// ---------------------------------------
// VALIDATE EMAIL
// ---------------------------------------
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------------------------------------
// SEND OTP API CALL (Updated Endpoint)
// ---------------------------------------
function sendOtp(email, isResend = false) {
    fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                showMessage("OTP sent successfully!");
            } else {
                showError("email-error", result.message || "Failed to send OTP.");
            }
        })
        .catch(err => {
            showError("email-error", "Something went wrong.");
            console.error("OTP Error:", err);
        });
}

// ---------------------------------------
// VERIFY OTP
// ---------------------------------------
document.getElementById("otp-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const otp = document.getElementById("otp-input").value.trim();
    const email = document.getElementById("otp-email").value.trim();

    if (otp.length !== 6) {
        showError("otp-error", "Please enter a valid 6-digit OTP.");
        return;
    }

    verifyOtp(email, otp);
});

// ---------------------------------------
// VERIFY OTP API CALL (Updated Endpoint)
// ---------------------------------------
function verifyOtp(email, otp) {
    fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
    })
        .then(async (res) => {
            const result = await res.json();

            if (res.ok && result.success) {
                localStorage.setItem("resetEmail", email);
                window.location.href = "/reset-password.html";
            } else {
                showError("otp-error", result.message || "Invalid OTP.");
            }
        })
        .catch(error => {
            console.error("Verify Error:", error);
            showError("otp-error", "Something went wrong.");
        });
}

// ---------------------------------------
// SHOW UI MESSAGES
// ---------------------------------------
function showError(id, message) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.style.color = "red";
}

function showMessage(msg) {
    const el = document.getElementById("otp-message");
    if (!el) return;

    el.textContent = msg;
    el.style.color = "green";

    setTimeout(() => {
        el.textContent = "";
    }, 3000);
}
