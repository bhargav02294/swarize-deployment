document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ownerId = urlParams.get("ownerId");
  const ownerEmail = urlParams.get("ownerEmail");

  // Ensure ownerId and ownerEmail are passed via URL
  if (!ownerId || !ownerEmail) {
    window.location.href = "create-store.html"; // Redirect to create store if not present
    return;
  }

  try {
    const response = await fetch(`/api/store/check?ownerId=${ownerId}&ownerEmail=${ownerEmail}`);
    const data = await response.json();

    if (data.hasStore) {
      // If store exists, display store details
      if (!window.location.href.includes("store.html")) {
        window.location.href = `store.html?ownerId=${ownerId}&ownerEmail=${ownerEmail}`;
      } else {
        displayStore(data.store);
      }
    } else {
      // If store doesn't exist, redirect to create-store.html
      if (!window.location.href.includes("create-store.html")) {
        window.location.href = `create-store.html?ownerId=${ownerId}&ownerEmail=${ownerEmail}`;
      }
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

  // Display the store information if store exists
  async function displayStore(store) {
    if (!store) return;
    document.getElementById("display-store").style.display = "block";
    document.getElementById("store-logo").src = `/uploads/${store.storeLogo}`;
    document.getElementById("store-name").textContent = store.storeName;
    document.getElementById("store-description-display").textContent = store.description;
  }
});
