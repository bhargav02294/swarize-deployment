// Function to check if a store exists
async function checkStore() {
  try {
    const response = await fetch('/api/store/check-store');
    const data = await response.json();
    if (data.exists) {
      window.location.href = '/store.html';
    } else {
      window.location.href = '/create-store.html';
    }
  } catch (error) {
    console.error('Error checking store:', error);
  }
}

// Event listener for store creation
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
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      alert('Store created successfully');
      window.location.href = '/store.html';
    } else {
      alert('Error creating store: ' + data.message);
    }
  } catch (error) {
    console.error('Error creating store:', error);
  }
});

checkStore();
