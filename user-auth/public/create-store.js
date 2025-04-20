document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('store-form');
    const message = document.getElementById('store-message');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const formData = new FormData();
      formData.append('storeName', document.getElementById('storeName').value);
      formData.append('storeLogo', document.getElementById('storeLogo').files[0]);
      formData.append('storeDescription', document.getElementById('storeDescription').value);
  
      try {
        const res = await fetch('/api/store', {
          method: 'POST',
          body: formData
        });
  
        const data = await res.json();
  
        if (data.success) {
          message.textContent = 'Store created!';
          message.style.color = 'green';
          setTimeout(() => {
            window.location.href = 'seller-store.html';
          }, 1500);
        } else {
          message.textContent = data.message;
          message.style.color = 'red';
        }
      } catch (err) {
        console.error(err);
        message.textContent = 'Error creating store.';
        message.style.color = 'red';
      }
    });
  });
  