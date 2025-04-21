document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ownerId = urlParams.get("ownerId");
  const ownerEmail = urlParams.get("ownerEmail");

  // Redirect to create-store.html if credentials are missing
  if (!ownerId || !ownerEmail) {
    console.error("Missing credentials.");
    window.location.href = "create-store.html";
    return;
  }

  try {
    const res = await fetch(`/api/store/check?ownerId=${ownerId}&ownerEmail=${ownerEmail}`);
    const data = await res.json();

    // If the store exists, show store.html
    if (data.hasStore) {
      if (window.location.pathname.includes("create-store.html")) {
        window.location.href = `store.html?ownerId=${ownerId}&ownerEmail=${ownerEmail}`;
      } else {
        displayStore(data.store); // Show store content if already on store.html
      }
    } else {
      // Store doesn't exist, redirect to create-store.html
      if (!window.location.pathname.includes("create-store.html")) {
        window.location.href = `create-store.html?ownerId=${ownerId}&ownerEmail=${ownerEmail}`;
      }
    }
  } catch (err) {
    console.error("Error checking store status:", err);
    window.location.href = "create-store.html";
  }

  // Form submission for create-store.html
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
        console.error("Error creating store:", err);
      }
    });
  }

  // Display store data
  function displayStore(store) {
    if (!store) return;
    const storeSection = document.getElementById("display-store");
    if (!storeSection) return;

    document.getElementById("store-logo").src = `/uploads/${store.storeLogo}`;
    document.getElementById("store-name").textContent = store.storeName;
    document.getElementById("store-description-display").textContent = store.description;
    storeSection.style.display = "block";
  }
});
