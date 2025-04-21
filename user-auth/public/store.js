document.addEventListener('DOMContentLoaded', async () => {
  const storeSection = document.getElementById('display-store');
  const storeName = document.getElementById('store-name');
  const storeLogo = document.getElementById('store-logo');
  const storeDescription = document.getElementById('store-description');
  const addProductBtn = document.getElementById('add-product-btn');

  try {
    const res = await fetch('/api/store/check');
    const data = await res.json();

    if (!data.exists) {
      window.location.href = 'create-store.html';
      return;
    }

    // Fetch store details if exists
    const storeRes = await fetch('/api/store');
    const storeData = await storeRes.json();

    storeSection.style.display = 'block';
    storeName.textContent = storeData.storeName;
    storeLogo.src = storeData.storeLogo;
    storeDescription.textContent = storeData.description;

    addProductBtn.addEventListener('click', () => {
      window.location.href = `add-product.html?storeId=${storeData._id}`;
    });

  } catch (err) {
    console.error('Error loading store:', err);
    window.location.href = 'create-store.html';
  }
});
