// public/create-store.js
document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/store/check")
    .then((res) => res.json())
    .then((data) => {
      if (data.exists) {
        window.location.href = "store.html";
      }
    });

  const form = document.getElementById("store-form");
  const messageEl = document.getElementById("store-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch("/api/store", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        messageEl.textContent = result.message;
        messageEl.style.color = "green";
        setTimeout(() => {
          window.location.href = "store.html";
        }, 1500);
      } else {
        messageEl.textContent = result.message;
        messageEl.style.color = "red";
      }
    } catch (error) {
      messageEl.textContent = "Server error. Try again later.";
      messageEl.style.color = "red";
    }
  });
});
