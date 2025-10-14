// public/otp.js
document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("otp-email");
  const getOtpBtn = document.getElementById("get-otp");
  const resendBtn = document.getElementById("resend-otp");
  const submitBtn = document.getElementById("submit-email-otp");
  const timerEl = document.getElementById("timer");
  const timerCount = document.getElementById("timer-count");
  const messageBox = document.getElementById("message-container");
  const otpInput = document.getElementById("otp-email-input");

  // if you set signupEmail before, populate it
  const savedEmail = localStorage.getItem("signupEmail");
  if (savedEmail) {
    emailInput.value = savedEmail;
    emailInput.readOnly = true;
  }

  function showMessage(text, type = "info") {
    messageBox.style.display = "block";
    messageBox.textContent = text;
    messageBox.style.color = type === "success" ? "green" : type === "error" ? "crimson" : "black";
    setTimeout(() => {
      messageBox.style.display = "none";
    }, 5000);
  }

  let timer;
  function startTimer(seconds = 60) {
    clearInterval(timer);
    let left = seconds;
    timerCount.textContent = left;
    timerEl.style.display = "block";
    resendBtn.style.display = "none";

    timer = setInterval(() => {
      left--;
      timerCount.textContent = left;
      if (left <= 0) {
        clearInterval(timer);
        timerEl.style.display = "none";
        resendBtn.style.display = "inline-block";
      }
    }, 1000);
  }

  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  getOtpBtn.addEventListener("click", async () => {
    const email = (emailInput.value || "").trim();
    if (!email) return showMessage("Please enter email", "error");
    getOtpBtn.disabled = true;
    getOtpBtn.textContent = "Sending...";

    try {
      const data = await postJSON("/api/auth/send-otp", { email });
      if (data && data.success) {
        showMessage("OTP sent to your email", "success");
        startTimer(60);
      } else {
        showMessage(data?.message || "Failed to send OTP", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Server error sending OTP", "error");
    } finally {
      getOtpBtn.disabled = false;
      getOtpBtn.textContent = "Get OTP";
    }
  });

  resendBtn.addEventListener("click", async () => {
    resendBtn.disabled = true;
    resendBtn.textContent = "Resending...";
    const email = (emailInput.value || "").trim();
    if (!email) {
      showMessage("Please enter email", "error");
      resendBtn.disabled = false;
      resendBtn.textContent = "Resend OTP";
      return;
    }
    try {
      const data = await postJSON("/api/auth/send-otp", { email });
      if (data && data.success) {
        showMessage("OTP resent", "success");
        startTimer(60);
      } else {
        showMessage(data?.message || "Failed to resend", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Server error resending OTP", "error");
    } finally {
      resendBtn.disabled = false;
      resendBtn.textContent = "Resend OTP";
    }
  });

  submitBtn.addEventListener("click", async () => {
    submitBtn.disabled = true;
    submitBtn.textContent = "Verifying...";
    const email = (emailInput.value || "").trim();
    const otp = (otpInput.value || "").trim();
    if (!email || !otp) {
      showMessage("Email and OTP required", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit OTP";
      return;
    }
    try {
      const data = await postJSON("/api/auth/verify-otp", { email, otp });
      if (data && data.success) {
        showMessage("OTP verified — redirecting...", "success");
        setTimeout(() => {
          window.location.href = "/"; // change to desired page
        }, 1400);
      } else {
        showMessage(data?.message || "Invalid OTP", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Server error verifying OTP", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit OTP";
    }
  });
});
