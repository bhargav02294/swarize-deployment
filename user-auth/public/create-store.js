document.addEventListener("DOMContentLoaded", () => {
  // Check if store already exists
  fetch("/api/store/check")
    .then(res => res.json())
    .then(data => {
      if (data.exists) {
        window.location.href = "store.html";
      }
    });

  const form = document.getElementById("store-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch("/api/store", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        alert("Store created!");
        window.location.href = "store.html";
      } else {
        alert(result.message || "Failed to create store.");
      }
    } catch (err) {
      console.error("Error while creating store:", err);
      alert("Server error. Please try again later.");
    }
  });
});
