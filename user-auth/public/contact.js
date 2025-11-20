// contact.js — improved: disables button, better messages, optional relative URL
(function () {
  const form = document.getElementById("contactForm");
  const responseMessage = document.getElementById("responseMessage");
  const submitBtn = document.querySelector("#contactForm button[type='submit']");

  if (!form) return;

  // Use relative path when the frontend is served from swarize.in.
  // If you need to call a remote server (different domain), change to absolute URL.
  const SEND_URL = "/send-message"; // or "https://swarize.in/send-message"

  function setMessage(text, color = "#000") {
    responseMessage.textContent = text;
    responseMessage.style.color = color;
  }

  function validateEmail(email) {
    // simple email regex (not perfect but good enough for basic validation)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (document.getElementById("name").value || "").trim();
    const email = (document.getElementById("email").value || "").trim();
    const message = (document.getElementById("message").value || "").trim();

    if (!name || !email || !message) {
      setMessage("Please fill in all fields.", "red");
      return;
    }

    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address.", "red");
      return;
    }

    // disable UI while sending
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.6";
    }
    setMessage("Sending message...", "#007bff");

    try {
      const res = await fetch(SEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage("Message sent successfully! We'll get back to you soon.", "green");
        form.reset();
        // auto-clear after 6s
        setTimeout(() => setMessage(""), 6000);
      } else {
        const err = data.error || data.message || "Something went wrong. Please try again.";
        setMessage(err, "red");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setMessage("Failed to send message. Please try again later.", "red");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
      }
    }
  });
})();
