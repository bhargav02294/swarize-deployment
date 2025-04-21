document.addEventListener('DOMContentLoaded', async () => {
  const storeSection = document.getElementById('display-store');
  const storeName = document.getElementById('store-name');
  const storeLogo = document.getElementById('store-logo');
  const storeDescription = document.getElementById('store-description');

  try {
    const res = await fetch('/api/store/my-store');
    const data = await res.json();

    if (res.ok && data.store) {
      const store = data.store;
      storeSection.style.display = 'block';
      storeName.textContent = store.name;
      storeLogo.src = store.logo;
      storeDescription.textContent = store.description;
    } else {
      // Store not found, redirect to create-store.html
      window.location.href = 'create-store.html';
    }
  } catch (err) {
    console.error(err);
    // Error occurred, redirect to create-store.html
    window.location.href = 'create-store.html';
  }

  // Add Products button
  const addProductBtn = document.getElementById('add-product-btn');
  addProductBtn.addEventListener('click', () => {
    window.location.href = 'add-product.html';
  });
});
