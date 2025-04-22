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
      console.log("📤 Sending form data to server...");
      const response = await fetch("/api/store", {
        method: "POST",
        body: formData
      });
  
      const result = await response.json();
      console.log("✅ Server response:", result);
  
      if (result.success) {
        alert("Store created!");
        window.location.href = "store.html";
      } else {
        alert(result.message || "Failed to create store.");
      }
    } catch (err) {
      console.error("❌ Error during store creation:", err);
      alert("Server error. Please try again later.");
    }
  });
});
