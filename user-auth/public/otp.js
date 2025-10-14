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
    document.getElementById('timer').style.display = 'block'; // show timer
    resendButton.style.display = 'none'; // hide resend button initially

    if (timer) clearInterval(timer); // clear any previous timer
    timeLeft = 60; // 1 minute
    timerDisplay.textContent = '01:00'; // reset display

    timer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const seconds = (timeLeft % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            resendButton.style.display = 'block'; // show resend button
            document.getElementById('timer').style.display = 'none'; // hide timer
        }
    }, 1000);
}


// ✅ Send OTP
document.getElementById('get-otp').addEventListener('click', async () => {
    const emailInput = document.getElementById('otp-email');
    const email = emailInput.value.trim();

    if (!email) return alert("Please enter your email");

    try {
        const response = await fetch("/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        const result = await response.json();
        if (result.success) {
            startTimer(); // ✅ start countdown
            alert("OTP sent successfully!");
        } else {
            alert("Error sending OTP: " + result.message);
        }
    } catch (error) {
        console.error(error);
        alert("Failed to send OTP. Check your internet or email settings.");
    }
});




// ✅ Resend OTP (Fixed)
document.getElementById('resend-otp').addEventListener('click', async () => {
    const email = document.getElementById('otp-email').value.trim();

    if (!validateEmail(email)) {
        alert(" Please enter a valid email address.");
        return;
    }

    try {
const response = await fetch("/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
});


        const result = await response.json();
        if (result.success) {
            alert(" OTP has been resent to your email!");
            startTimer();
        } else {
            alert(" Failed to resend OTP: " + result.message);
        }
    } catch (error) {
        console.error(" Error:", error);
        alert(" An unexpected error occurred.");
    }
});

// ✅ Verify OTP
// ✅ Verify OTP
document.getElementById('submit-email-otp').addEventListener('click', async () => {
    const otp = document.getElementById('otp-email-input').value;
    const email = document.getElementById('otp-email').value;

    try {
const response = await fetch("/verify-otp", {       
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
            alert(" Failed to verify OTP.");
        }
    } catch (error) {
        console.error(" Error:", error);
        alert(" An unexpected error occurred.");
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
