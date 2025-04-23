document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('https://swarize-deployment.onrender.com/api/store/my-store', {
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to fetch store');

    const store = await response.json();

    if (!store || !store.storeName) {
      window.location.href = 'https://swarize.in/create-store.html';
      return;
    }

    // Populate store details
    document.getElementById('store-name').textContent = store.storeName;
    document.getElementById('store-description').textContent = store.description;
    document.getElementById('store-logo').src = `https://swarize-deployment.onrender.com${store.storeLogo}`;
  } catch (err) {
    console.error('Error loading store:', err);
    alert('Failed to load store info');
  }
});
