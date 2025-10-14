document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('otp-email');
    const savedEmail = localStorage.getItem('signupEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        emailInput.readOnly = true; // prevent changing if saved
    }
});

let timer;
let timeLeft = 60;

// ✅ Timer function
function startTimer() {
    const timerDisplay = document.getElementById('timer-count');
    const resendBtn = document.getElementById('resend-otp');

    document.getElementById('timer').style.display = 'block';
    resendBtn.style.display = 'none';

    if (timer) clearInterval(timer);
    timeLeft = 60;
    timerDisplay.textContent = '01:00';

    timer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const seconds = (timeLeft % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            resendBtn.style.display = 'block';
            document.getElementById('timer').style.display = 'none';
        }
    }, 1000);
}

// ✅ Validate email format
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ Send OTP function
async function sendOtp() {
    const email = document.getElementById('otp-email').value.trim();
    if (!email || !validateEmail(email)) {
        alert("Please enter a valid email address");
        return;
    }

    try {
        const response = await fetch("/api/auth/send-otp", {  // ✅ Correct route
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (result.success) {
            startTimer();
            alert(result.message);
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error sending OTP:", error);
        alert("Failed to send OTP. Check your internet or email settings.");
    }
}

// ✅ Resend OTP
document.getElementById('get-otp').addEventListener('click', sendOtp);
document.getElementById('resend-otp').addEventListener('click', sendOtp);

// ✅ Verify OTP
document.getElementById('submit-email-otp').addEventListener('click', async () => {
    const email = document.getElementById('otp-email').value.trim();
    const otp = document.getElementById('otp-email-input').value.trim();

    if (!otp) return alert("Please enter the OTP");

    try {
        const response = await fetch("/api/auth/verify-otp", { // ✅ Correct route
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp })
        });

        const result = await response.json();

        if (result.success) {
            alert("✅ OTP Verified successfully!");
            window.location.href = "index.html"; // redirect after success
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        alert("An unexpected error occurred while verifying OTP.");
    }
});
