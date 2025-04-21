// public/store.js
document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/store/check")
    .then((res) => res.json())
    .then((data) => {
      if (!data.exists) {
        window.location.href = "create-store.html";
      } else {
        loadStoreDetails();
      }
    });

  function loadStoreDetails() {
    fetch("/api/store/my-store")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const store = data.store;
          document.getElementById("store-logo").src = store.storeLogo;
          document.getElementById("store-name").textContent = store.storeName;
          document.getElementById("store-description").textContent = store.description;
          document.getElementById("display-store").style.display = "block";
        }
      });
  }

  document.getElementById("add-product-btn").addEventListener("click", () => {
    window.location.href = "add-product.html";
  });
});
