// ✅ store-redirect.js

// This script checks if the logged-in user has a store
// If the store exists → redirect to store.html
// If not → redirect to create-store.html

fetch("https://swarize-deployment.onrender.com/api/store/check", {
    credentials: "include" // Important to send session cookie
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("🔹 Store check result:", data);
  
      if (data.success && data.hasStore) {
        // Store exists → Redirect to store.html
        window.location.href = "store.html";
      } else {
        // No store exists → Redirect to create-store.html
        window.location.href = "create-store.html";
      }
    })
    .catch((err) => {
      console.error("❌ Error checking store existence:", err);
      // Fallback in case of error
      window.location.href = "create-store.html";
    });
  