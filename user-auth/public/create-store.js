document.addEventListener("DOMContentLoaded", () => {
  const storeMessage = document.getElementById("store-message");

  // Check if the user already has a store
  fetch("/api/store/check")
    .then((res) => res.json())
    .then((data) => {
      if (data.exists) {
        window.location.href = "store.html"; // Redirect to store page if already has a store
      }
    });

  const form = document.getElementById("store-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission

    const formData = new FormData(form);

    try {
      const response = await fetch("/api/store", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        storeMessage.textContent = "Store created successfully!";
        storeMessage.style.color = "green";
        window.location.href = "store.html"; // Redirect to store page after creation
      } else {
        storeMessage.textContent = result.message || "Failed to create store.";
        storeMessage.style.color = "red";
      }
    } catch (err) {
      storeMessage.textContent = "Server error. Please try again later.";
      storeMessage.style.color = "red";
    }
  });
});
