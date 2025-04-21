document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/store/my-store")
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const store = data.store;
        document.getElementById("store-name").textContent = store.storeName;
        document.getElementById("store-desc").textContent = store.description;
        document.getElementById("store-logo").src = store.storeLogo;
      } else {
        alert("Store not found");
        window.location.href = "create-store.html";
      }
    })
    .catch(err => {
      console.error("Error loading store:", err);
      window.location.href = "create-store.html";
    });
});
