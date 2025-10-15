const getOtpBtn = document.getElementById("get-otp");
const submitOtpBtn = document.getElementById("submit-otp");
const emailInput = document.getElementById("otp-email");
const otpInput = document.getElementById("otp-input");
const messageDiv = document.getElementById("message");
const timerDiv = document.getElementById("timer");

let countdown;

getOtpBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) return alert("Enter your email");

  try {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    if (data.success) {
      messageDiv.textContent = "✅ OTP sent successfully!";
      startTimer(120);
    } else {
      messageDiv.textContent = "❌ " + data.message;
    }
  } catch (err) {
    console.error("Error:", err);
    messageDiv.textContent = "Failed to send OTP.";
  }
});

submitOtpBtn.addEventListener("click", async () => {
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
    messageDiv.textContent = "Verification failed.";
  }
});

function startTimer(seconds) {
  clearInterval(countdown);
  countdown = setInterval(() => {
    if (seconds <= 0) {
      clearInterval(countdown);
      timerDiv.textContent = "⏱️ OTP expired!";
      return;
    }
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    timerDiv.textContent = `Time left: ${min}:${sec < 10 ? "0" + sec : sec}`;
    seconds--;
  }, 1000);
}
