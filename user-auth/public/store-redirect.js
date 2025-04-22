// public/store-redirect.js

window.addEventListener("DOMContentLoaded", async () => {
    try {
      const response = await fetch("https://swarize-deployment.onrender.com/api/store/check", {
        method: "GET",
        credentials: "include",
      });
  
      const data = await response.json();
  
      if (data.exists) {
        // If store exists, go to store.html
        window.location.href = "store.html";
      } else {
        // If no store found, go to create-store.html
        window.location.href = "create-store.html";
      }
    } catch (err) {
      console.error("Error checking store existence:", err);
      alert("Something went wrong while redirecting.");
    }
  });
  