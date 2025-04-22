document.getElementById('createStoreForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const storeName = document.getElementById('storeName').value;
  const description = document.getElementById('description').value;
  const storeLogo = document.getElementById('storeLogo').files[0];

  const formData = new FormData();
  formData.append('storeName', storeName);
  formData.append('description', description);
  formData.append('storeLogo', storeLogo);

  try {
    const response = await fetch('/api/store/create-store', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      // Store was successfully created
      window.location.href = '/store.html'; // Redirect to store page
    } else {
      const errorText = await response.text();
      alert('Error: ' + errorText);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('An error occurred while creating the store');
  }
});
