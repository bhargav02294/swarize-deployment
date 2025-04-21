document.addEventListener("DOMContentLoaded", async () => {
  const sellerId = localStorage.getItem("sellerId");
  const sellerEmail = localStorage.getItem("sellerEmail");

  if (!sellerId || !sellerEmail) {
    console.error("Seller info missing. Please login first.");
    return;
  }

  const createForm = document.getElementById("store-form");
  const msg = document.getElementById("store-message");

  // ========== CREATE STORE ==========
  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append("storeName", document.getElementById("storeName").value);
      formData.append("storeDescription", document.getElementById("storeDescription").value);
      formData.append("storeLogo", document.getElementById("storeLogo").files[0]);
      formData.append("sellerId", sellerId);
      formData.append("ownerEmail", sellerEmail);

      try {
        const res = await fetch("/api/store", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok) {
          msg.textContent = "Store created successfully! Redirecting...";
          setTimeout(() => {
            window.location.href = `store.html?sellerId=${sellerId}`;
          }, 1500);
        } else {
          msg.textContent = data.error || "Store creation failed.";
        }
      } catch (error) {
        msg.textContent = "Error submitting form. Please try again.";
      }
    });
  }

  // ========== DISPLAY STORE ==========
  const storeSection = document.getElementById("display-store");
  if (storeSection) {
    const urlParams = new URLSearchParams(window.location.search);
    const sellerIdParam = urlParams.get("sellerId");
    const finalSellerId = sellerIdParam || sellerId;

    try {
      const res = await fetch(`/api/store/${finalSellerId}`);
      if (!res.ok) {
        window.location.href = "create-store.html";
        return;
      }

      const store = await res.json();
      document.getElementById("store-logo").src = `https://swarize-deployment.onrender.com${store.storeLogo}`;
      document.getElementById("store-name").textContent = store.storeName;
      document.getElementById("store-description-display").textContent = store.storeDescription;
      storeSection.style.display = "block";

      const addProductBtn = document.getElementById("add-product-btn");
      if (addProductBtn) {
        addProductBtn.addEventListener("click", () => {
          window.location.href = `add-product.html?sellerId=${finalSellerId}`;
        });
      }
    } catch (error) {
      console.error("Failed to fetch store:", error);
      window.location.href = "create-store.html";
    }
  }

  // ========== AUTO-REDIRECT TO STORE OR CREATE ==========
  const onNeutralPage = !createForm && !storeSection;
  if (onNeutralPage) {
    try {
      const res = await fetch(`/api/store/${sellerId}`);
      if (!res.ok) {
        window.location.href = "create-store.html";
      } else {
        window.location.href = `store.html?sellerId=${sellerId}`;
      }
    } catch (error) {
      console.error("Redirect error:", error);
      window.location.href = "create-store.html";
    }
  }
});
