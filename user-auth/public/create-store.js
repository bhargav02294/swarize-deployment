// public/create-store.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('create-store-form');
  
  form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Get form data
      const storeName = document.getElementById('storeName').value;
      const storeDescription = document.getElementById('storeDescription').value;
      const storeLogo = document.getElementById('storeLogo').files[0];

      const formData = new FormData();
      formData.append('storeName', storeName);
      formData.append('storeDescription', storeDescription);
      formData.append('storeLogo', storeLogo);

      try {
          // Send POST request to create store
          const response = await fetch('/api/store/create', {
              method: 'POST',
              body: formData,
              credentials: 'same-origin', // Include session data automatically
          });

          const data = await response.json();

          if (data.success) {
              // Redirect to store page if creation is successful
              window.location.href = 'store.html';
          } else {
              alert(data.message);  // Show the error message from the backend
          }
      } catch (error) {
          console.error('Error creating store:', error);
          alert('Something went wrong. Please try again.');
      }
  });
});
