document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("otp-email");
  const getOtpBtn = document.getElementById("get-otp");
  const resendBtn = document.getElementById("resend-otp");
  const submitBtn = document.getElementById("submit-email-otp");
  const timerEl = document.getElementById("timer");
  const timerCount = document.getElementById("timer-count");
  const messageBox = document.getElementById("message-container");
  const messageText = document.getElementById("message-text");

  const savedEmail = localStorage.getItem("signupEmail");
  if (savedEmail) {
    emailInput.value = savedEmail;
    emailInput.readOnly = true;
  }

  let timer;
  let timeLeft = 60;

  function showMessage(type, text) {
    messageBox.style.display = "block";
    messageBox.style.color = type === "success" ? "green" : "red";
    messageText.textContent = text;
    setTimeout(() => (messageBox.style.display = "none"), 4000);
  }

  function startTimer() {
    clearInterval(timer);
    timeLeft = 60;
    timerEl.style.display = "block";
    resendBtn.style.display = "none";
    timerCount.textContent = timeLeft;

    timer = setInterval(() => {
      timeLeft--;
      timerCount.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timer);
        timerEl.style.display = "none";
        resendBtn.style.display = "block";
      }
    }, 1000);
  }

  // ✅ SEND OTP
  getOtpBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) return showMessage("error", "Please enter an email.");

    getOtpBtn.disabled = true;
    getOtpBtn.textContent = "Sending...";

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("success", "OTP sent successfully!");
        startTimer();
      } else {
        showMessage("error", data.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      showMessage("error", "Server error while sending OTP.");
    } finally {
      getOtpBtn.disabled = false;
      getOtpBtn.textContent = "Get OTP";
    }
  });

  // ✅ RESEND OTP
  resendBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) return showMessage("error", "Please enter an email.");

    resendBtn.disabled = true;
    resendBtn.textContent = "Resending...";

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("success", "OTP resent successfully!");
        startTimer();
      } else {
        showMessage("error", data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      console.error(err);
      showMessage("error", "Error resending OTP.");
    } finally {
      resendBtn.disabled = false;
      resendBtn.textContent = "Resend OTP";
    }
  });

  // ✅ VERIFY OTP
  submitBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const otp = document.getElementById("otp-email-input").value.trim();
    if (!otp) return showMessage("error", "Please enter the OTP.");

    submitBtn.disabled = true;
    submitBtn.textContent = "Verifying...";

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("success", "OTP verified successfully!");
        setTimeout(() => (window.location.href = "index.html"), 1500);
      } else {
        showMessage("error", data.message || "Invalid OTP.");
      }
    } catch (err) {
      console.error(err);
      showMessage("error", "Error verifying OTP.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit OTP";
    }
  });
});
