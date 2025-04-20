document.addEventListener('DOMContentLoaded', async () => {
  const storeName = document.getElementById('store-name');
  const storeLogo = document.getElementById('store-logo');
  const storeDesc = document.getElementById('store-description');

  try {
    const res = await fetch('/api/store/me');
    const data = await res.json();

    if (data.success) {
      storeName.textContent = data.store.storeName;
      storeLogo.src = '/' + data.store.storeLogo;
      storeDesc.textContent = data.store.description;
    } else {
      window.location.href = 'create-store.html'; // Redirect if no store
    }
  } catch (err) {
    console.error('Error loading store:', err);
    window.location.href = 'create-store.html';
  }
});
