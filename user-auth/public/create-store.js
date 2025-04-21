// Handle the store creation form submission
document.getElementById('store-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const storeName = document.getElementById('storeName').value;
  const storeDescription = document.getElementById('storeDescription').value;
  const storeLogo = document.getElementById('storeLogo').files[0];

  // Validate input fields
  if (!storeName || !storeDescription || !storeLogo) {
    alert('All fields are required.');
    return;
  }

  const formData = new FormData();
  formData.append('storeName', storeName);
  formData.append('storeDescription', storeDescription);
  formData.append('storeLogo', storeLogo);

  try {
    const response = await fetch('/api/store/create', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    });

    const data = await response.json();
    if (data.success) {
      alert('Store created successfully!');
      window.location.href = 'store.html'; // Redirect to store page after creation
    } else {
      alert(data.message); // Display error message if the creation failed
    }
  } catch (error) {
    console.error('Error creating store:', error);
    alert('Something went wrong. Please try again.');
  }
});
