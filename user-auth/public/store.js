
// ✅ File: public/store.js
document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('/api/store/details');
  if (response.ok) {
    const store = await response.json();
    document.getElementById('storeName').textContent = store.storeName;
    document.getElementById('storeDescription').textContent = store.description;
    document.getElementById('storeLogo').src = '/uploads/' + store.storeLogo;
  } else {
    console.error('Failed to load store');
  }
});