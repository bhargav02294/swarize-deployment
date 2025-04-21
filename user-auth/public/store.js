document.addEventListener("DOMContentLoaded", () => {
  const displayStore = document.getElementById("display-store");

  let userId = null;

  fetch("/api/session")
    .then(res => res.json())
    .then(data => {
      if (data && data.userId) {
        userId = data.userId;
        loadStore(userId);
      } else {
        window.location.href = "create-store.html";
      }
    })
    .catch(err => {
      console.error("Error checking session:", err);
      window.location.href = "create-store.html";
    });

  function loadStore(ownerId) {
    fetch(`/api/store/by-owner/${ownerId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.storeName) {
          displayStore.style.display = "block";
          document.getElementById("store-name").textContent = data.storeName;
          document.getElementById("store-description-display").textContent = data.description;
          document.getElementById("store-logo").src = `/uploads/${data.storeLogo}`;
        } else {
          window.location.href = "create-store.html";
        }
      })
      .catch(err => {
        console.error("Error fetching store:", err);
        window.location.href = "create-store.html";
      });
  }
});
