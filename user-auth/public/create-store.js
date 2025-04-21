// public/create-store.js

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("store-form");
  const msg = document.getElementById("store-message");

  try {
    const check = await fetch("/api/store/check");
    const data = await check.json();

    if (data.hasStore) {
      window.location.href = "store.html";
      return;
    }
  } catch (err) {
    console.error("Error checking store:", err);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/store", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      if (res.ok) {
        msg.textContent = "Store created! Redirecting...";
        setTimeout(() => {
          window.location.href = "store.html";
        }, 1500);
      } else {
        msg.textContent = result.error || "Failed to create store.";
      }
    } catch (err) {
      console.error("Error submitting store form:", err);
      msg.textContent = "Something went wrong.";
    }
  });
});
