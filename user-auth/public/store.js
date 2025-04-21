document.addEventListener("DOMContentLoaded", async () => {
  const sellerId = localStorage.getItem("sellerId");

  // If no sellerId in localStorage, we can't continue
  if (!sellerId) {
    console.error("Seller ID not found. Please login first.");
    // Optional: you can redirect to login or show a message
    return;
  }

  const createForm = document.getElementById("store-form");
  const msg = document.getElementById("store-message");

  // ========== Handle store creation (create-store.html) ==========
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
            window.location.href = `store.html?sellerId=${sellerId}`;
          }, 2000);
        } else {
          msg.textContent = data.error || "Failed to create store.";
        }
      } catch (error) {
        msg.textContent = "An error occurred. Please try again.";
      }
    });
  }

  // ========== Handle store display (store.html) ==========
  const storeSection = document.getElementById("display-store");
  if (storeSection) {
    const urlParams = new URLSearchParams(window.location.search);
    const sellerIdParam = urlParams.get("sellerId");

    // If sellerId is not passed in URL, use from localStorage
    const finalSellerId = sellerIdParam || sellerId;

    try {
      const res = await fetch(`/api/store/${finalSellerId}`);
      if (!res.ok) {
        // If store not found, redirect to create page
        window.location.href = "create-store.html";
        return;
      }

      const store = await res.json();
      document.getElementById("store-logo").src = `https://swarize-deployment.onrender.com${store.storeLogo}`;
      document.getElementById("store-name").textContent = store.storeName;
      document.getElementById("store-description-display").textContent = store.storeDescription;
      storeSection.style.display = "block";

      document.getElementById("add-product-btn").addEventListener("click", () => {
        window.location.href = `add-product.html?sellerId=${finalSellerId}`;
      });
    } catch (error) {
      console.error("Failed to load store data:", error);
      window.location.href = "create-store.html"; // fallback
    }
  }

  // ========== Automatic redirection based on store status ==========
  // If on some neutral page (like dashboard), you can do:
  const onNeutralPage = !createForm && !storeSection;
  if (onNeutralPage) {
    try {
      const res = await fetch(`/api/store/${sellerId}`);
      if (!res.ok) {
        // No store yet → go to creation page
        window.location.href = "create-store.html";
      } else {
        // Store exists → go to store page
        window.location.href = `store.html?sellerId=${sellerId}`;
      }
    } catch (err) {
      console.error("Error checking store:", err);
      window.location.href = "create-store.html";
    }
  }
});
