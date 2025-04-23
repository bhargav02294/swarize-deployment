document.addEventListener('DOMContentLoaded', () => {
  const storeForm = document.getElementById('store-form');
  const message = document.getElementById('store-message');

  // Check if store exists
  async function checkStoreExists() {
    try {
      const res = await fetch('/api/store/check-store', {
        credentials: 'include'
      });
      const result = await res.json();

      if (result.exists) {
        window.location.href = '/store.html';
      }
    } catch (error) {
      console.error('Error checking store existence:', error);
      message.textContent = 'Could not verify store existence.';
    }
  }

  checkStoreExists();

  storeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const desc = document.getElementById('description').value.trim();
    const logo = document.getElementById('logo').files[0];

    if (!name || !desc || !logo) {
      message.textContent = "All fields are required.";
      return;
    }

    const formData = new FormData();
    formData.append('storeName', name);
    formData.append('description', desc);
    formData.append('logo', logo);

    try {
      const response = await fetch('/api/store', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        message.textContent = "Store created successfully!";
        setTimeout(() => window.location.href = '/store.html', 1200);
      } else {
        message.textContent = data.message || 'Failed to create store.';
      }
    } catch (err) {
      console.error('Store creation error:', err);
      message.textContent = "Server error while creating store.";
    }
  });
});
