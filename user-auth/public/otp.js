// otp.js — Optimized for new Resend API backend
document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("otp-email");
  const savedEmail = localStorage.getItem("signupEmail");

  if (savedEmail) {
    emailInput.value = savedEmail;
    emailInput.readOnly = true;
  }
});

// -----------------------------------------
// TIMER
// -----------------------------------------
let timer;
let timeLeft = 60;

function startTimer() {
  const timerDisplay = document.getElementById("timer-count");
  const resendButton = document.getElementById("resend-otp");

  document.getElementById("timer").style.display = "block";
  resendButton.style.display = "none";

  if (timer) clearInterval(timer);

  timeLeft = 60;
  timer = setInterval(() => {
    timeLeft--;

    timerDisplay.textContent =
      timeLeft < 10 ? `00:0${timeLeft}` : `00:${timeLeft}`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      resendButton.style.display = "block";
      document.getElementById("timer").style.display = "none";
    }
  }, 1000);
}

// -----------------------------------------
// SEND OTP
// -----------------------------------------
document.getElementById("get-otp").addEventListener("click", async () => {
  const email = document.getElementById("otp-email").value.trim();

  if (!validateEmail(email)) {
    showMessage("error", "Please enter a valid email address.");
    return;
  }

  try {
    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (result.success) {
      showMessage("success", "OTP sent successfully!");
      startTimer();
    } else {
      showMessage("error", result.message || "Failed to send OTP.");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("error", "Failed to send OTP. Try again.");
  }
});

// -----------------------------------------
// RESEND OTP
// -----------------------------------------
document.getElementById("resend-otp").addEventListener("click", async () => {
  const email = document.getElementById("otp-email").value.trim();

  if (!validateEmail(email)) {
    showMessage("error", "Please enter a valid email address.");
    return;
  }

  try {
    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (result.success) {
      showMessage("success", "OTP resent successfully!");
      startTimer();
    } else {
      showMessage("error", result.message || "Failed to resend OTP.");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("error", "Unexpected error occurred.");
  }
});

// -----------------------------------------
// VERIFY OTP
// -----------------------------------------
document.getElementById("submit-email-otp").addEventListener("click", async () => {
  const otp = document.getElementById("otp-email-input").value.trim();
  const email = document.getElementById("otp-email").value.trim();

  if (!otp || otp.length !== 6) {
    showMessage("error", "Please enter a valid 6-digit OTP.");
    return;
  }

  try {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });

    const result = await response.json();

    if (result.success) {
      showMessage("success", "OTP verified successfully!");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      showMessage("error", "Invalid OTP. Try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("error", "Unexpected error occurred.");
  }
});

// -----------------------------------------
// VALIDATE EMAIL
// -----------------------------------------
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// -----------------------------------------
// SHOW INLINE MESSAGE (not alerts)
// -----------------------------------------
function showMessage(type, message) {
  const container = document.getElementById("message-container");
  const text = document.getElementById("message-text");

  container.className = type === "success" ? "message success" : "message error";
  text.textContent = message;
  container.style.display = "block";

  setTimeout(() => {
    container.style.display = "none";
  }, 5000);
}
