document.getElementById('store-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = document.getElementById('store-form');
  const formData = new FormData(form);

  try {
    const res = await fetch('https://swarize-deployment.onrender.com/api/store', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const data = await res.json();
    const msg = document.getElementById('store-message');

    if (res.ok) {
      msg.textContent = 'Store created successfully!';
      window.location.href = 'store.html';
    } else {
      msg.textContent = data.message || 'Error creating store.';
    }
  } catch (err) {
    console.error('Create store failed:', err);
    document.getElementById('store-message').textContent = 'Something went wrong.';
  }
});
