// public/create-store.js
document.getElementById('store-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const storeName = document.getElementById('storeName').value;
  const description = document.getElementById('description').value;
  const storeLogo = document.getElementById('storeLogo').files[0];

  const formData = new FormData();
  formData.append('storeName', storeName);
  formData.append('description', description);
  formData.append('storeLogo', storeLogo);

  try {
    const response = await fetch('/api/store/create', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      alert('Store created successfully!');
      // No redirection to store.html — you can customize what happens next
    } else {
      alert('Error creating store: ' + data.message);
    }
  } catch (err) {
    console.error('Store creation error:', err);
    alert('Something went wrong. Please try again.');
  }
});
