// public/store.js
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ownerId = urlParams.get("ownerId");
  const ownerEmail = urlParams.get("ownerEmail");

  if (!ownerId || !ownerEmail) {
    document.getElementById("display-store").innerHTML = "Missing owner credentials.";
    return;
  }

  try {
    const response = await fetch(`/api/store/check?ownerId=${ownerId}&ownerEmail=${ownerEmail}`);
    const data = await response.json();

    if (!data.hasStore) {
      // Redirect new sellers to create page
      window.location.href = `create-store.html?ownerId=${ownerId}&ownerEmail=${ownerEmail}`;
      return;
    }

    const store = data.store;
    displayStore(store);
  } catch (error) {
    console.error("Error loading store:", error);
  }

  function displayStore(store) {
    if (!store) return;

    document.getElementById("display-store").style.display = "block";
    document.getElementById("store-logo").src = `/uploads/${store.storeLogo}`;
    document.getElementById("store-name").textContent = store.storeName;
    document.getElementById("store-description-display").textContent = store.description;

    const addProductBtn = document.getElementById("add-product-btn");
    addProductBtn.onclick = () => {
      window.location.href = `add-product.html?storeId=${store._id}`;
    };
  }
});
