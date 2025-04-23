// Handle the form submission and create the store
const storeForm = document.getElementById('store-form');
const storeMessage = document.getElementById('store-message');

storeForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  // Get form data
  const storeName = document.getElementById('name').value;
  const storeLogo = document.getElementById('logo').files[0];
  const storeDescription = document.getElementById('description').value;

  const formData = new FormData();
  formData.append('storeName', storeName);
  formData.append('description', storeDescription);
  if (storeLogo) {
    formData.append('logo', storeLogo);
  }

  // Send POST request to create store
  try {
    const response = await fetch('/api/store', {
      method: 'POST',
      body: formData,
      credentials: 'include', // Send cookies with the request (for session management)
    });

    const result = await response.json();
    if (response.ok) {
      storeMessage.innerHTML = `<p>Store created successfully!</p>`;
    } else {
      storeMessage.innerHTML = `<p>${result.message}</p>`;
    }
  } catch (err) {
    storeMessage.innerHTML = `<p>Error creating store. Please try again.</p>`;
  }
});
