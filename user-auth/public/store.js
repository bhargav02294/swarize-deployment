// public/store.js
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/store/check", {
      method: "GET",
      credentials: "include"
    });
    const data = await res.json();

    if (!data.exists) {
      // If store doesn't exist, redirect to create-store
      window.location.href = "create-store.html";
    } else {
      // If store exists, populate store page
      console.log("Store loaded:", data.store);
      document.querySelector(".navbar-title").textContent = data.store.storeName;
      document.getElementById("store-logo").src = data.store.storeLogo;
      document.getElementById("store-description").textContent = data.store.description;
    }
  } catch (err) {
    console.error("Error checking store:", err);
    window.location.href = "create-store.html";
  }
});
