// Function to check if a store exists
async function checkStore() {
  try {
    const response = await fetch('/api/store/check-store'); // API call to check store existence
    const data = await response.json();

    if (data.exists) {
      // If store exists, redirect to store page
      window.location.href = '/store.html';
    } else {
      // If store does not exist, redirect to create-store page
      window.location.href = '/create-store.html';
    }
  } catch (error) {
    console.error('Error checking store:', error);
    // Optionally, handle errors by showing a message to the user or redirecting to an error page
  }
}

// Event listener for store creation on create-store.html
document.getElementById('store-form')?.addEventListener('submit', async (e) => {
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
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      alert('Store created successfully');
      window.location.href = '/store.html'; // Redirect to store page after successful creation
    } else {
      alert('Error creating store: ' + data.message);
    }
  } catch (error) {
    console.error('Error creating store:', error);
  }
});

// Check if the user has a store and handle redirection
checkStore();
