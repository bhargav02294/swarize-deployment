document.addEventListener("DOMContentLoaded", async () => {
  const sellerId = localStorage.getItem("sellerId");

  const createForm = document.getElementById("store-form");
  const storeSection = document.getElementById("display-store");

  if (createForm) {
    // On create-store.html
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append("storeName", document.getElementById("storeName").value);
      formData.append("storeDescription", document.getElementById("storeDescription").value);
      formData.append("storeLogo", document.getElementById("storeLogo").files[0]);
      formData.append("sellerId", sellerId);

      const res = await fetch("/api/store", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const msg = document.getElementById("store-message");

      if (res.ok) {
        msg.textContent = "Store created! Redirecting...";
        setTimeout(() => {
          window.location.href = `store.html?sellerId=${sellerId}`;
        }, 2000);
      } else {
        msg.textContent = data.error || "Failed to create store";
      }
    });
  }

  if (storeSection) {
    // On store.html
    const urlParams = new URLSearchParams(window.location.search);
    const sellerIdParam = urlParams.get("sellerId");

    const res = await fetch(`/api/store/${sellerIdParam}`);
    if (!res.ok) return;

    const store = await res.json();

    document.getElementById("store-logo").src = store.storeLogo;
    document.getElementById("store-name").textContent = store.storeName;
    document.getElementById("store-description-display").textContent = store.storeDescription;
    document.getElementById("display-store").style.display = "block";

    // Add product logic can go here
    document.getElementById("add-product-btn").addEventListener("click", () => {
      window.location.href = `add-product.html?sellerId=${sellerIdParam}`;
    });
  }
});
