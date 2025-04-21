document.addEventListener('DOMContentLoaded', () => {
  const storeForm = document.getElementById('store-form');
  const storeMessage = document.getElementById('store-message');

  storeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(storeForm);

    try {
      const response = await fetch('/api/store', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        storeMessage.textContent = 'Store created successfully!';
        window.location.href = 'store.html';
      } else {
        storeMessage.textContent = result.message || 'Something went wrong.';
      }
    } catch (err) {
      console.error(err);
      storeMessage.textContent = 'Server error. Try again later.';
    }
  });
});
