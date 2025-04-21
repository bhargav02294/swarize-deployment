// public/create-store.js

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const ownerId = urlParams.get("ownerId");
    const ownerEmail = urlParams.get("ownerEmail");
  
    if (!ownerId || !ownerEmail) {
      document.getElementById("store-message").textContent = "Missing owner credentials.";
      return;
    }
  
    // Check if store already exists
    try {
      const response = await fetch(`/api/store/check?ownerId=${ownerId}&ownerEmail=${ownerEmail}`);
      const data = await response.json();
  
      if (data.hasStore) {
        window.location.href = `store.html?ownerId=${ownerId}&ownerEmail=${ownerEmail}`;
        return;
      }
    } catch (err) {
      console.error("Store check failed", err);
    }
  
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
  
          const result = await res.json();
          if (res.ok) {
            window.location.href = `store.html?ownerId=${ownerId}&ownerEmail=${ownerEmail}`;
          } else {
            document.getElementById("store-message").textContent = result.error || "Failed to create store.";
          }
        } catch (err) {
          console.error("Store creation error", err);
        }
      });
    }
  });
  