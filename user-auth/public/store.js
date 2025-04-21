document.addEventListener("DOMContentLoaded", async () => {
  const sellerId = localStorage.getItem("sellerId");

  // If no seller ID, redirect to homepage
  if (!sellerId) {
    console.error("Seller ID not found in localStorage.");
    window.location.href = "home.html";
    return;
  }

  // Handle store creation (create-store.html)
  const createForm = document.getElementById("store-form");
  const msg = document.getElementById("store-message");

  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append("storeName", document.getElementById("storeName").value);
      formData.append("storeDescription", document.getElementById("storeDescription").value);
      formData.append("storeLogo", document.getElementById("storeLogo").files[0]);
      formData.append("sellerId", sellerId);

      try {
        const res = await fetch("/api/store", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok) {
          msg.textContent = "Store created! Redirecting...";
          setTimeout(() => {
            window.location.href = `store.html`;
          }, 2000);
        } else {
          msg.textContent = data.error || "Failed to create store.";
        }
      } catch (error) {
        msg.textContent = "An error occurred. Please try again.";
      }
    });
  }

  // Handle store display (store.html)
  const storeSection = document.getElementById("display-store");
  if (storeSection) {
    try {
      const res = await fetch(`/api/store/${sellerId}`);

      if (!res.ok) {
        // Store not found — redirect to store creation page
        window.location.href = "create-store.html";
        return;
      }

      const store = await res.json();

      const logoImg = document.getElementById("store-logo");
      const nameEl = document.getElementById("store-name");
      const descEl = document.getElementById("store-description-display");

      if (logoImg) logoImg.src = `https://swarize-deployment.onrender.com${store.storeLogo}`;
      if (nameEl) nameEl.textContent = store.storeName;
      if (descEl) descEl.textContent = store.storeDescription;

      storeSection.style.display = "block";

      const addProductBtn = document.getElementById("add-product-btn");
      if (addProductBtn) {
        addProductBtn.addEventListener("click", () => {
          window.location.href = `add-product.html?sellerId=${sellerId}`;
        });
      }
    } catch (error) {
      console.error("Failed to load store data:", error);
      window.location.href = "create-store.html";
    }
  }
});
