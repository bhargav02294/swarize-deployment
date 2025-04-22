document.addEventListener('DOMContentLoaded', async () => {
    try {
      const res = await fetch('https://swarize-deployment.onrender.com/api/store/check', {
        credentials: 'include'
      });
      const data = await res.json();
  
      if (data.storeExists) {
        window.location.href = 'store.html';
      } else {
        window.location.href = 'create-store.html';
      }
    } catch (err) {
      console.error('Redirect check failed:', err);
    }
  });
  