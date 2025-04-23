document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('create-store-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch('https://swarize-deployment.onrender.com/api/store', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        alert('Store created successfully!');
        window.location.href = 'https://swarize.in/store.html';
      } else {
        alert(result.message || 'Failed to create store');
      }
    } catch (error) {
      console.error('Error creating store:', error);
      alert('Error while creating store');
    }
  });
});
