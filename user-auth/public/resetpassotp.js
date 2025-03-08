let timerInterval;

document.getElementById("get-otp").addEventListener("click", function () {
    const email = document.getElementById("otp-email").value;

    if (validateEmail(email)) {
        sendOtp(email);  
        resetTimer();
        startTimer(60);  
        document.getElementById("timer").style.display = "block";
        document.getElementById("resend-otp").style.display = "none";
    } else {
        document.getElementById("email-error").textContent = "Please enter a valid email address.";
    }
});

function resetTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    const display = document.getElementById("timer");
    const submitBtn = document.getElementById("submit-otp");

    timerInterval = setInterval(() => {
        minutes = Math.floor(timer / 60);
        seconds = timer % 60;
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

document.getElementById("resend-otp").addEventListener("click", function (event) {
    event.preventDefault();
    const email = document.getElementById("otp-email").value;

    if (validateEmail(email)) {
        sendOtp(email, true);
        resetTimer();
        startTimer(60);
    } else {
        document.getElementById("email-error").textContent = "Please enter a valid email address.";
    }
});

function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function sendOtp(email, isResend = false) {
    console.log("📤 Sending OTP request for:", email);

    fetch('/api/send-otp', {  // ✅ Ensure the correct API path
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, isResend }),
    })
    .then(response => {
        console.log("✅ Response received:", response);
        return response.json();
    })
    .then(data => {
        console.log("✅ OTP API Response:", data);
        if (!data.success) {
            throw new Error(data.message);
        }
    })
    .catch(error => console.error('❌ Error sending OTP:', error));
}


document.getElementById("otp-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const otp = document.getElementById("otp-input").value;
    const email = document.getElementById("otp-email").value;

    if (otp.length === 6) {
        verifyOtp(email, otp);
    } else {
        document.getElementById("otp-error").textContent = "Please enter a valid 6-digit OTP.";
    }
});

function verifyOtp(email, otp) {
    fetch('/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
    })
    .then(response => {
        if (response.ok) {
            localStorage.setItem('email', email);  // Store email in localStorage
            window.location.href = '/reset-password.html';  // Redirect to reset password
        } else {
            return response.text().then(text => { throw new Error(text); });
        }
    })
    .catch(error => {
        document.getElementById("otp-error").textContent = error.message;
    });
}
