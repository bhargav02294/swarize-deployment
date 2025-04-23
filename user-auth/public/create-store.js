document.addEventListener('DOMContentLoaded', () => {
  const storeForm = document.getElementById('store-form');
  const message = document.getElementById('store-message');

  // Check if the store already exists
  async function checkStoreExists() {
    try {
      const res = await fetch('/api/store/check-store', {
        method: 'GET',
        credentials: 'include'
      });
      const result = await res.json();
      if (result.exists) {
        // If store exists, redirect to store page
        window.location.href = '/store.html';
      }
    } catch (error) {
      console.error('Error checking store existence:', error);
      message.textContent = 'Error checking store existence. Please try again.';
    }
  }

  // Check store existence when page loads
  checkStoreExists();

  storeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('name');
    const logoInput = document.getElementById('logo');
    const descInput = document.getElementById('description');

    const storeName = nameInput.value.trim();
    const storeDescription = descInput.value.trim();
    const storeLogo = logoInput.files[0];

    // Validation
    if (!storeName || !storeDescription || !storeLogo) {
      message.textContent = "All fields are required!";
      return;
    }

    try {
      // Get session data
      const sessionRes = await fetch('/api/user/session', {
        credentials: 'include'
      });
      const sessionData = await sessionRes.json();

      if (!sessionData.userId) {
        message.textContent = "You must be logged in to create a store.";
        return;
      }

      const formData = new FormData();
      formData.append('storeName', storeName);
      formData.append('description', storeDescription);
      formData.append('logo', storeLogo);

      // Send POST request to create store
      const response = await fetch('/api/store', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        message.textContent = "Store created successfully!";
        setTimeout(() => {
          window.location.href = '/store.html'; // Redirect to store page after success
        }, 1500);
      } else {
        message.textContent = data.error || "Something went wrong.";
      }
    } catch (error) {
      console.error("Error creating store:", error);
      message.textContent = "Error creating store. Please try again.";
    }
  });
});
