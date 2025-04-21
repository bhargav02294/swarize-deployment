document.addEventListener("DOMContentLoaded", () => {
  // Check if store already exists
  fetch("/api/store/check")
    .then(res => res.json())
    .then(data => {
      if (data.exists) {
        window.location.href = "store.html"; // Redirect to store page if store exists
      }
    });

  const form = document.getElementById("store-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form); // Prepare form data

    // Send the form data to the backend
    const response = await fetch("/api/store", {
      method: "POST",
      body: formData,
    });

    const result = await response.json(); // Parse the response

    if (result.success) {
      alert("Store created!");
      window.location.href = "store.html"; // Redirect to store page on success
    } else {
      alert(result.message || "Failed to create store.");
    }
  });
});
