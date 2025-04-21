// public/store.js

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ownerId = urlParams.get("ownerId");
  const ownerEmail = urlParams.get("ownerEmail");

  // These must be present in the URL
  if (!ownerId || !ownerEmail) {
    console.error("Missing owner credentials in URL.");
    return;
  }

  // Check from backend if store exists
  try {
    const res = await fetch(`/api/store/check?ownerId=${ownerId}&ownerEmail=${ownerEmail}`);
    const data = await res.json();

    if (data.hasStore) {
      if (window.location.pathname.includes("create-store.html")) {
        // Redirect to store if already created
        window.location.href = `store.html?ownerId=${ownerId}&ownerEmail=${ownerEmail}`;
      } else if (window.location.pathname.includes("store.html")) {
        displayStore(data.store);
      }
    } else {
      if (!window.location.pathname.includes("create-store.html")) {
        // Redirect to create page if store doesn't exist
        window.location.href = `create-store.html?ownerId=${ownerId}&ownerEmail=${ownerEmail}`;
      }
    }
  } catch (err) {
    console.error("Error checking store:", err);
  }

  // Store creation logic
  const storeForm = document.getElementById("store-form");
  if (storeForm) {
    storeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(storeForm);
      formData.append("ownerId", ownerId);
      formData.append("ownerEmail", ownerEmail);

      try {
        const res = await fetch("/api/store", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          window.location.href = `store.html?ownerId=${ownerId}&ownerEmail=${ownerEmail}`;
        } else {
          document.getElementById("store-message").textContent = data.error || "Failed to create store.";
        }
      } catch (err) {
        console.error("Error creating store:", err);
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
