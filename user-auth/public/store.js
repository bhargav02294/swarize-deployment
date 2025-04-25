document.addEventListener('DOMContentLoaded', async () => {
  const storeDisplay = document.getElementById('display-store');
  const storeNameEl = document.getElementById('store-name');
  const storeLogoEl = document.getElementById('store-logo');
  const storeDescEl = document.getElementById('store-desc');
  const addProductBtn = document.getElementById('add-product-btn');

  try {
    const sessionRes = await fetch('https://swarize-deployment.onrender.com/api/user/session', {
      credentials: 'include'
    });
    const sessionData = await sessionRes.json();
    if (!sessionData.success) throw new Error('Not logged in.');

    const userId = sessionData.userId;

    const storeRes = await fetch('https://swarize-deployment.onrender.com/api/store/check', {
      credentials: 'include'
    });
    const storeData = await storeRes.json();

    if (storeData.hasStore && storeData.storeSlug) {
      const slug = storeData.storeSlug;

      const storeDetailsRes = await fetch(`https://swarize-deployment.onrender.com/api/store/${slug}`);
      const storeDetails = await storeDetailsRes.json();

      if (!storeDetails.store) throw new Error("Store not found");

      // ✅ Display Store Info
      storeNameEl.textContent = storeDetails.store.name || storeDetails.store.storeName;
      storeLogoEl.src = storeDetails.store.logoUrl;
      storeDescEl.textContent = storeDetails.store.description;

      storeDisplay.style.display = 'block';

    } else {
      alert("No store found. Redirecting to create...");
      window.location.href = "/create-store.html";
    }
  } catch (err) {
    console.error("Error loading store:", err);
    alert("Failed to load store details.");
  }

  // ✅ Redirect to add product page
  addProductBtn.addEventListener('click', () => {
    window.location.href = "/dashboard/add-product.html"; // Update path if needed
  });
});
