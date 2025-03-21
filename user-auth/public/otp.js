document.addEventListener('DOMContentLoaded', function () {
    const emailInput = document.getElementById('otp-email');
    const savedEmail = localStorage.getItem('signupEmail');
    
    if (savedEmail) {
        emailInput.value = savedEmail;
        emailInput.readOnly = true;
    }
});

let timer;
let timeLeft = 60;

function startTimer() {
    const timerDisplay = document.getElementById('timer-count');
    const resendButton = document.getElementById('resend-otp');
    document.getElementById('timer').style.display = 'block';
    resendButton.style.display = 'none';

    if (timer) clearInterval(timer);
    timeLeft = 60;

    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft < 10 ? `00:0${timeLeft}` : `00:${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            resendButton.style.display = 'block';
            document.getElementById('timer').style.display = 'none';
        }
    }, 1000);
}

// ✅ Send OTP
document.getElementById('get-otp').addEventListener('click', async () => {
    const email = document.getElementById('otp-email').value;

    try {
        const response = await fetch("https://swarize-deployment.onrender.com/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();
        if (result.success) {
            alert("✅ OTP sent successfully!");
            startTimer();
        } else {
            alert("❌ Error sending OTP: " + result.message);
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Failed to send OTP. Please try again.");
    }
});



// ✅ Resend OTP
document.getElementById('resend-otp').addEventListener('click', async () => {
    const email = document.getElementById('otp-email').value;

    try {
        const response = await fetch("https://swarize-deployment.onrender.com/api/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();
        if (result.success) {
            showMessage('success', '✅ OTP has been resent to your email!');
            startTimer();
        } else {
            showMessage('error', result.message || '❌ Failed to resend OTP.');
        }
    } catch (error) {
        showMessage('error', '❌ An unexpected error occurred.');
        console.error('Error:', error);
    }
});

// ✅ Verify OTP
// ✅ Verify OTP
document.getElementById('submit-email-otp').addEventListener('click', async () => {
    const otp = document.getElementById('otp-email-input').value;
    const email = document.getElementById('otp-email').value;

    try {
        const response = await fetch("https://swarize-deployment.onrender.com/api/auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
        });

        const result = await response.json();
        if (result.success) {
            alert("✅ Email OTP verified successfully!");
            setTimeout(() => {
                window.location.href = 'index.html'; // Redirect to homepage after success
            }, 2000);
        } else {
            alert("❌ Failed to verify OTP.");
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ An unexpected error occurred.");
    }
});


function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ Show Message in Alert Container
function showMessage(type, message) {
    const container = document.getElementById('message-container');
    const textElement = document.getElementById('message-text');
    container.className = type === 'success' ? 'message success' : 'message error';
    textElement.textContent = message;
    container.style.display = 'block';

    setTimeout(() => {
        container.style.display = 'none'; // Hide after 5 seconds
    }, 5000);
}
