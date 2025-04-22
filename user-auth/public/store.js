document.addEventListener('DOMContentLoaded', async () => {
  const storeSection = document.getElementById('display-store');
  const nameEl = document.getElementById('store-name');
  const logoEl = document.getElementById('store-logo');
  const descEl = document.getElementById('store-desc');

  try {
    const res = await fetch('https://swarize-deployment.onrender.com/api/store', {
      credentials: 'include'
    });
    const store = await res.json();

    nameEl.textContent = store.storeName;
    logoEl.src = store.storeLogo;
    descEl.textContent = store.description;

    storeSection.style.display = 'block';
  } catch (err) {
    console.error('Failed to load store:', err);
  }

  document.getElementById('add-product-btn').addEventListener('click', () => {
    window.location.href = 'add-product.html';
  });
});
