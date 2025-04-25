document.addEventListener('DOMContentLoaded', async () => {
  const storeDisplay = document.getElementById('display-store');
  const storeNameEl = document.getElementById('store-name');
  const storeLogoEl = document.getElementById('store-logo');
  const storeDescEl = document.getElementById('store-desc');
  const addProductBtn = document.getElementById('add-product-btn');

  try {
    const storeRes = await fetch('https://swarize-deployment.onrender.com/api/store/check', {
      credentials: 'include'
    });
    const storeData = await storeRes.json();

    if (storeData.hasStore && storeData.storeSlug) {
      const slug = storeData.storeSlug;

      const storeDetailsRes = await fetch(`https://swarize-deployment.onrender.com/api/store/${slug}`);
      const storeDetails = await storeDetailsRes.json();

      if (!storeDetails.success || !storeDetails.store) {
        throw new Error("Store data not found.");
      }

      // ✅ Show details
      storeNameEl.textContent = storeDetails.store.storeName;
      storeLogoEl.src = storeDetails.store.logoUrl;
      storeDescEl.textContent = storeDetails.store.description;

      storeDisplay.style.display = 'block';

    } else {
      window.location.href = "/create-store.html";
    }

  } catch (err) {
    console.error("Error loading store:", err);
    alert("Failed to load store. Please try again.");
  }

  addProductBtn.addEventListener('click', () => {
    window.location.href = "/dashboard/add-product.html";
  });
});
