document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createStoreForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('storeName', document.getElementById('storeName').value);
    formData.append('storeDescription', document.getElementById('storeDescription').value);
    formData.append('storeLogo', document.getElementById('storeLogo').files[0]);

    try {
      const response = await fetch('/api/store', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        window.location.href = 'store.html';
      } else {
        alert(data.message || 'Failed to create store');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong!');
    }
  });
});
