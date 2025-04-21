// public/store.js
document.addEventListener("DOMContentLoaded", async () => {
  try {
      // Fetch user session and store details
      const sessionResponse = await fetch('/api/user/session');
      const sessionData = await sessionResponse.json();

      if (!sessionData.success) {
          alert('User session not found. Please log in again.');
          window.location.href = 'signin.html';
          return;
      }

      // Fetch store data
      const storeResponse = await fetch(`/api/store/${sessionData.userId}`);
      const storeData = await storeResponse.json();

      if (!storeData.success) {
          alert(storeData.message);
          return;
      }

      const store = storeData.store;
      
      // Populate store details on the page
      document.getElementById('storeName').innerText = store.storeName;
      document.getElementById('storeDescription').innerText = store.description;
      document.getElementById('storeLogo').src = `/uploads/${store.storeLogo}`;
      document.getElementById('ownerEmail').innerText = store.ownerEmail;
  } catch (error) {
      console.error('Error loading store:', error);
      alert('Something went wrong. Please try again.');
  }
});
