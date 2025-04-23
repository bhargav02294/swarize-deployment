// Redirect user based on store existence
async function redirectToStore() {
    try {
      const response = await fetch('/api/store/check-store');
      const data = await response.json();
      
      if (data.exists) {
        window.location.href = '/store.html';
      } else {
        window.location.href = '/create-store.html';
      }
    } catch (error) {
      console.error('Error fetching store status:', error);
      window.location.href = '/create-store.html';
    }
  }
  
  // Check the store when page loads
  window.onload = redirectToStore;
  