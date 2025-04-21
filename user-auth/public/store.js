document.addEventListener('DOMContentLoaded', async function () {
  const storeContainer = document.getElementById('display-store');
  const storeLogo = document.getElementById('store-logo');
  const storeName = document.getElementById('store-name');
  const storeDescriptionDisplay = document.getElementById('store-description-display');
  const subscriptionStatus = document.getElementById('subscription-status');
  const addProductBtn = document.getElementById('add-product-btn');
  const productsList = document.getElementById('products-list');

  try {
    const response = await fetch('/api/store/check', {
      method: 'GET',
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error('Store not found.');
    }

    const data = await response.json();
    const store = data.store;

    // Display store details
    storeLogo.src = `/uploads/${store.storeLogo}`;
    storeName.textContent = store.storeName;
    storeDescriptionDisplay.textContent = store.storeDescription;

    storeContainer.style.display = 'block';

    // Placeholder: Show the add product button
    addProductBtn.addEventListener('click', function () {
      window.location.href = '/add-product.html';
    });

    productsList.innerHTML = '<p>No products yet.</p>';

    subscriptionStatus.style.display = 'none'; 

  } catch (error) {
    console.error('Error fetching store:', error);
    window.location.href = 'create-store.html';
  }
});
