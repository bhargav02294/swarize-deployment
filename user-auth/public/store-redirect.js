window.onload = async () => {
    try {
      const res = await fetch('/api/store/check-store');
      const data = await res.json();
  
      if (data.exists) {
        window.location.href = 'store.html';
      } else {
        window.location.href = 'create-store.html';
      }
    } catch (error) {
      console.error('Redirect error:', error);
      alert('Could not determine store status.');
    }
  };
  