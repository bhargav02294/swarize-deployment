const sendBtn = document.getElementById("sendOtp");
const verifyBtn = document.getElementById("verifyOtp");
const emailInput = document.getElementById("email");
const otpInput = document.getElementById("otp");
const messageDiv = document.getElementById("message");
const timerDiv = document.getElementById("timer");

let countdown;

sendBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) return alert("Enter email");

    try {
        const res = await fetch("/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.success) {
            messageDiv.textContent = "OTP sent!";
            startTimer(120); // 2 minutes countdown
        } else {
            messageDiv.textContent = data.message;
        }
    } catch (err) {
        console.error("Error:", err);
        messageDiv.textContent = "Failed to send OTP. Check email or internet.";
    }
});

verifyBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const otp = otpInput.value.trim();
    if (!email || !otp) return alert("Enter email and OTP");

    try {
        const res = await fetch("/api/auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp })
        });
        const data = await res.json();
        messageDiv.textContent = data.message;
        if (data.success) clearInterval(countdown);
    } catch (err) {
        console.error(err);
        messageDiv.textContent = "Verification failed";
    }
});

function startTimer(seconds) {
    clearInterval(countdown);
    countdown = setInterval(() => {
        if (seconds <= 0) { clearInterval(countdown); timerDiv.textContent = "OTP expired"; return; }
        let min = Math.floor(seconds / 60);
        let sec = seconds % 60;
        timerDiv.textContent = `Time left: ${min}:${sec < 10 ? "0"+sec : sec}`;
        seconds--;
    }, 1000);
}
