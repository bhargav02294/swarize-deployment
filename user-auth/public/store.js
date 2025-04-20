document.addEventListener("DOMContentLoaded", async () => {
  const sellerId = localStorage.getItem("sellerId");
  
  // Check if sellerId is available
  if (!sellerId) {
    console.error("Seller ID not found in localStorage.");
    window.location.href = "home.html"; // Redirect to homepage if no seller ID is found
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

  // Handle store display (store.html)
  const storeSection = document.getElementById("display-store");
  if (storeSection) {
    const urlParams = new URLSearchParams(window.location.search);
    const sellerIdParam = urlParams.get("sellerId");

    // If sellerIdParam is not present, redirect to create-store.html
    if (!sellerIdParam) {
      window.location.href = "create-store.html"; // Redirect to store creation page if no storeId
      return;
    }

    try {
      const res = await fetch(`/api/store/${sellerIdParam}`);
      if (!res.ok) {
        window.location.href = "create-store.html"; // Redirect if store not found
        return;
      }

      const store = await res.json();
      document.getElementById("store-logo").src = store.storeLogo;
      document.getElementById("store-name").textContent = store.storeName;
      document.getElementById("store-description-display").textContent = store.storeDescription;
      storeSection.style.display = "block";

      document.getElementById("add-product-btn").addEventListener("click", () => {
        window.location.href = `add-product.html?sellerId=${sellerIdParam}`;
      });
    } catch (error) {
      console.error("Failed to load store data:", error);
      window.location.href = "create-store.html"; // If error occurs, redirect to create store page
    }
  }
});
