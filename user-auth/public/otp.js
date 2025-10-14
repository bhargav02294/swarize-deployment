// otp.js - robust OTP frontend for /api/auth/send-otp and /api/auth/verify-otp

document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("otp-email");
  const getOtpBtn = document.getElementById("get-otp");
  const resendBtn = document.getElementById("resend-otp");
  const submitOtpBtn = document.getElementById("submit-email-otp");
  const timerEl = document.getElementById("timer");
  const timerCount = document.getElementById("timer-count");
  const messageContainer = document.getElementById("message-container");
  const messageText = document.getElementById("message-text");
  const emailError = document.getElementById("email-error");
  const emailOtpError = document.getElementById("email-otp-error");

  // Load saved email (if signup flow saved it) and make readonly only if present
  const savedEmail = localStorage.getItem("signupEmail");
  if (savedEmail) {
    emailInput.value = savedEmail;
    emailInput.readOnly = true;
  } else {
    emailInput.readOnly = false;
  }

  // helpers
  function showMessage(type, text) {
    messageContainer.className = "message " + (type === "success" ? "success" : "error");
    messageText.textContent = text;
    messageContainer.style.display = "block";
    setTimeout(() => {
      messageContainer.style.display = "none";
    }, 5000);
  }

  function safeParseJson(resText) {
    try { return JSON.parse(resText); }
    catch (e) { return null; }
  }

  // Timer
  let timer = null;
  let timeLeft = 0;
  function startTimer(seconds = 60) {
    clearInterval(timer);
    timeLeft = seconds;
    timerCount.textContent = formatTime(timeLeft);
    timerEl.style.display = "block";
    resendBtn.style.display = "none";
    timer = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        clearInterval(timer);
        timerEl.style.display = "none";
        resendBtn.style.display = "inline-block";
        return;
      }
      timerCount.textContent = formatTime(timeLeft);
    }, 1000);
  }
  function formatTime(sec) {
    const mm = Math.floor(sec / 60).toString().padStart(2, "0");
    const ss = (sec % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }

  // validate email
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Generic POST helper with safe JSON parse and error handling
  async function postJson(url, payload) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include" // include cookies if your server needs sessions
      });

      const text = await res.text();
      const data = safeParseJson(text);
      if (!res.ok) {
        const message = (data && data.message) || `Server returned ${res.status}`;
        throw new Error(message);
      }
      if (!data) throw new Error("Invalid JSON response from server");
      return data;
    } catch (err) {
      throw err;
    }
  }

  // Get OTP
  getOtpBtn.addEventListener("click", async () => {
    emailError.textContent = "";
    const email = emailInput.value.trim();
    if (!validateEmail(email)) {
      emailError.textContent = "Please enter a valid email address.";
      return;
    }

    getOtpBtn.disabled = true;
    getOtpBtn.textContent = "Sending...";
    try {
      // replace origin if you test locally: '/api/auth/send-otp'
      const res = await postJson("/api/auth/send-otp", { email });
      if (res.success) {
        showMessage("success", res.message || "OTP sent to your email.");
        startTimer(60); // start 60s timer
      } else {
        showMessage("error", res.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      showMessage("error", err.message || "Failed to send OTP");
    } finally {
      getOtpBtn.disabled = false;
      getOtpBtn.textContent = "Get OTP";
    }
  });

  // Resend OTP
  resendBtn.addEventListener("click", async () => {
    emailError.textContent = "";
    const email = emailInput.value.trim();
    if (!validateEmail(email)) {
      emailError.textContent = "Please enter a valid email address.";
      return;
    }
    resendBtn.disabled = true;
    resendBtn.textContent = "Resending...";
    try {
      const res = await postJson("/api/auth/send-otp", { email });
      if (res.success) {
        showMessage("success", res.message || "OTP resent to your email.");
        startTimer(60);
      } else {
        showMessage("error", res.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      showMessage("error", err.message || "Failed to resend OTP");
    } finally {
      resendBtn.disabled = false;
      resendBtn.textContent = "Resend OTP";
    }
  });

  // Verify OTP
  submitOtpBtn.addEventListener("click", async () => {
    emailOtpError.textContent = "";
    emailError.textContent = "";
    const otp = document.getElementById("otp-email-input").value.trim();
    const email = emailInput.value.trim();

    if (!validateEmail(email)) {
      emailError.textContent = "Please enter a valid email address.";
      return;
    }
    if (!otp) {
      emailOtpError.textContent = "Please enter the OTP you received.";
      return;
    }

    submitOtpBtn.disabled = true;
    submitOtpBtn.textContent = "Verifying...";
    try {
      const res = await postJson("/api/auth/verify-otp", { email, otp });
      if (res.success) {
        showMessage("success", res.message || "OTP verified successfully!");
        // proceed further (redirect)
        setTimeout(() => {
          window.location.href = "/index.html";
        }, 1100);
      } else {
        showMessage("error", res.message || "OTP verification failed.");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      showMessage("error", err.message || "Failed to verify OTP");
    } finally {
      submitOtpBtn.disabled = false;
      submitOtpBtn.textContent = "Submit OTP";
    }
  });

});
