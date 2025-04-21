document.addEventListener('DOMContentLoaded', async () => {
  const storeForm = document.getElementById('store-form');
  const messagePara = document.getElementById('store-message');

  storeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('logo', document.getElementById('logo').files[0]);
    formData.append('description', document.getElementById('description').value);

    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        messagePara.textContent = 'Store created successfully!';
        setTimeout(() => {
          window.location.href = 'store.html';
        }, 1000);
      } else {
        messagePara.textContent = data.message || 'Something went wrong.';
      }
    } catch (err) {
      console.error(err);
      messagePara.textContent = 'Something went wrong. Please try again.';
    }
  });
});
