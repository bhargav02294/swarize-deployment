document.addEventListener('DOMContentLoaded', async () => {
  const storeSection = document.getElementById('display-store');
  const nameEl = document.getElementById('store-name');
  const descEl = document.getElementById('store-desc');
  const logoEl = document.getElementById('store-logo');

  try {
    const res = await fetch('/api/store/my-store', {
      credentials: 'include'
    });

    if (!res.ok) {
      console.error('Error fetching store');
      return;
    }

    const store = await res.json();

    if (store && store.storeName) {
      nameEl.textContent = store.storeName;
      descEl.textContent = store.description;
      logoEl.src = store.storeLogo;
      storeSection.style.display = 'block';
    } else {
      window.location.href = '/create-store.html';
    }
  } catch (err) {
    console.error('Failed to load store data:', err);
  }

  document.getElementById('add-product-btn').addEventListener('click', () => {
    window.location.href = '/add-product.html';
  });
});
