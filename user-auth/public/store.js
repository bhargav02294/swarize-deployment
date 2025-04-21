// public/store.js

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ownerId = urlParams.get("ownerId");
  const ownerEmail = urlParams.get("ownerEmail");

  const currentPage = window.location.pathname;

  if (!ownerId || !ownerEmail) {
    // Always go to create-store if credentials missing
    window.location.href = "create-store.html";
    return;
  }

  try {
    const response = await fetch(`/api/store/check?ownerId=${ownerId}&ownerEmail=${ownerEmail}`);
    const data = await response.json();

    const hasStore = data.hasStore;
    const store = data.store;

    if (hasStore && currentPage.includes("create-store.html")) {
      // User has a store but is on create-store page → redirect to store.html
      window.location.href = `store.html?ownerId=${ownerId}&ownerEmail=${ownerEmail}`;
      return;
    }

    if (!hasStore && currentPage.includes("store.html")) {
      // User has no store but is on store page → redirect to create-store
      window.location.href = `create-store.html?ownerId=${ownerId}&ownerEmail=${ownerEmail}`;
      return;
    }

    // If already on the correct page, proceed:
    if (hasStore && currentPage.includes("store.html")) {
      displayStore(store);
    }
  } catch (error) {
    console.error("Error checking store:", error);
  }

  const storeForm = document.getElementById("store-form");
  if (storeForm) {
    storeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(storeForm);
      formData.append("ownerId", ownerId);
      formData.append("ownerEmail", ownerEmail);

      try {
        const response = await fetch("/api/store", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (response.ok) {
          window.location.href = `store.html?ownerId=${ownerId}&ownerEmail=${ownerEmail}`;
        } else {
          document.getElementById("store-message").textContent = result.error || "Failed to create store.";
        }
      } catch (error) {
        console.error("Error creating store:", error);
      }
    });
  }

  async function displayStore(store) {
    if (!store) return;
    document.getElementById("display-store").style.display = "block";
    document.getElementById("store-logo").src = `/uploads/${store.storeLogo}`;
    document.getElementById("store-name").textContent = store.storeName;
    document.getElementById("store-description-display").textContent = store.description;
  }
});
