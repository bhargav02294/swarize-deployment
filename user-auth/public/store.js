document.addEventListener('DOMContentLoaded', async () => {
  const storeDetailsDiv = document.getElementById('storeDetails');

  try {
    const response = await fetch('/api/store');
    if (!response.ok) throw new Error('Failed to fetch store data');
    const store = await response.json();

    storeDetailsDiv.innerHTML = `
      <h2>${store.storeName}</h2>
      <img src="${store.storeLogo}" alt="Store Logo" width="150" />
      <p>${store.description}</p>
    `;
  } catch (err) {
    console.error('Error:', err);
    storeDetailsDiv.innerHTML = '<p>Could not load store info.</p>';
  }
});
