document.addEventListener('DOMContentLoaded', async () => {
  const sellerId = localStorage.getItem('sellerId');
  const isStorePage = window.location.pathname.includes('store.html');
  const isCreatePage = window.location.pathname.includes('create-store.html');

  if (!sellerId) {
    console.error("Seller ID not found in localStorage.");
    window.location.href = 'home.html';
    return;
  }

  try {
    const res = await fetch(`https://swarize-deployment.onrender.com/api/store/${sellerId}`);
    const data = await res.json();

    if (res.ok && data.store) {
      if (isCreatePage) {
        // Redirect to store page if store exists and user is on create page
        window.location.href = 'store.html';
        return;
      }

      // SHOW EXISTING STORE DETAILS
      document.getElementById('display-store').style.display = 'block';
      document.getElementById('store-logo').src = data.store.storeLogo;
      document.getElementById('store-name').textContent = data.store.storeName;
      document.getElementById('store-description-display').textContent = data.store.description;
    } else {
      if (isStorePage) {
        // Redirect to create page if no store exists and user is on store page
        window.location.href = 'create-store.html';
        return;
      }

      // If you're already on create page and there's no store, stay here.
    }
  } catch (err) {
    console.error('Error fetching store:', err);
    if (isStorePage) {
      window.location.href = 'create-store.html';
    }
  }

  // ADD PRODUCT REDIRECT
  const addProductBtn = document.getElementById('add-product-btn');
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
      window.location.href = 'add-product.html';
    });
  }
});
