document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ownerId = urlParams.get('ownerId');
  const ownerEmail = urlParams.get('ownerEmail');

  if (!ownerId || !ownerEmail) {
    alert("Missing owner credentials.");
    return;
  }

  const currentPage = window.location.pathname.split('/').pop();

  try {
    const res = await fetch(`/api/store/check/${ownerId}`);
    const data = await res.json();

    if (currentPage === 'store.html') {
      if (!data.exists) {
        window.location.href = 'create-store.html?ownerId=' + ownerId + '&ownerEmail=' + ownerEmail;
        return;
      }
      // If store exists, show it
      const store = data.store;
      document.getElementById('store-logo').src = store.storeLogo;
      document.getElementById('store-name').textContent = store.storeName;
      document.getElementById('store-description-display').textContent = store.description;
      document.getElementById('display-store').style.display = 'block';
    }

    if (currentPage === 'create-store.html') {
      if (data.exists) {
        window.location.href = 'store.html?ownerId=' + ownerId + '&ownerEmail=' + ownerEmail;
        return;
      }

      // Form submission
      const storeForm = document.getElementById('store-form');
      storeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('ownerId', ownerId);
        formData.append('ownerEmail', ownerEmail);
        formData.append('storeName', document.getElementById('storeName').value);
        formData.append('storeDescription', document.getElementById('storeDescription').value);
        formData.append('storeLogo', document.getElementById('storeLogo').files[0]);

        const response = await fetch('/api/store', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        if (response.ok) {
          alert('Store created successfully!');
          window.location.href = 'store.html?ownerId=' + ownerId + '&ownerEmail=' + ownerEmail;
        } else {
          alert(result.error || 'Error creating store');
        }
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
