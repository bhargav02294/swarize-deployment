// public/store.js

document.addEventListener("DOMContentLoaded", async () => {
  const storeSection = document.getElementById("display-store");

  try {
    const res = await fetch("/api/store/by-owner");
    const store = await res.json();

    if (res.ok && store && store.storeName) {
      document.getElementById("store-name").textContent = store.storeName;
      document.getElementById("store-description-display").textContent = store.description;
      document.getElementById("store-logo").src = `/uploads/${store.storeLogo}`;
      storeSection.style.display = "block";
    } else {
      window.location.href = "create-store.html";
    }
  } catch (err) {
    console.error("Error loading store:", err);
    window.location.href = "create-store.html";
  }
});
