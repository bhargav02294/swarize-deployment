// Fetch the store information when the page loads
document.addEventListener('DOMContentLoaded', async function () {
  const storeContainer = document.getElementById('display-store');
  const storeLogo = document.getElementById('store-logo');
  const storeName = document.getElementById('store-name');
  const storeDescriptionDisplay = document.getElementById('store-description-display');
  const subscriptionStatus = document.getElementById('subscription-status');
  const addProductBtn = document.getElementById('add-product-btn');
  const productsList = document.getElementById('products-list');

  // Fetch the store data from the backend using session userId
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
      window.location.href = '/add-product.html'; // Navigate to the product addition page
    });

    // Display the products related to this store (Placeholder)
    productsList.innerHTML = '<p>No products yet.</p>';

    // Add subscription status logic here (optional)
    subscriptionStatus.style.display = 'none'; // Hide this section initially, add your logic if required

  } catch (error) {
    console.error('Error fetching store:', error);
    window.location.href = 'create-store.html'; // Redirect to create store page if no store is found
  }
});
