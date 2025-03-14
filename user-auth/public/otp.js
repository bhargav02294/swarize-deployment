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
    
    if (timer) clearInterval(timer); // Reset any previous timer
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


document.getElementById('get-otp').addEventListener('click', async () => {
    const email = document.getElementById('otp-email').value;

    if (!validateEmail(email)) {
        document.getElementById('email-error').innerText = 'Invalid email address';
        return;
    }

    try {
        const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();
        if (result.success) {
            alert('OTP sent to your email!');
            startTimer();
        } else {
            alert('Error sending OTP: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to send OTP. Please try again.');
    }
});

document.getElementById('resend-otp').addEventListener('click', async () => {
    const email = document.getElementById('otp-email').value;

    try {
        const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();
        if (result.success) {
            showMessage('success', 'OTP has been resent to your email!');
            startTimer(); // Restart the timer
        } else {
            showMessage('error', result.message || 'Failed to resend OTP.');
        }
    } catch (error) {
        showMessage('error', 'An unexpected error occurred.');
        console.error('Error:', error);
    }
});


document.getElementById('submit-email-otp').addEventListener('click', () => {
    const otp = document.getElementById('otp-email-input').value;
    const email = document.getElementById('otp-email').value;

    fetch('/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type: 'email' }),
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showMessage('success', 'Email OTP verified successfully!');
                setTimeout(() => {
                    window.location.href = 'index.html'; // Redirect after success
                }, 2000);
            } else {
                showMessage('error', result.message || 'Failed to verify OTP.');
            }
        })
        .catch(error => {
            showMessage('error', 'An unexpected error occurred.');
            console.error('Error:', error);
        });
});


function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
/**
 * Show Message in the Alert Container
 * @param {string} type - 'success' or 'error'
 * @param {string} message - Message to display
 */
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

