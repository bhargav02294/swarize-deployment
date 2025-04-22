document.getElementById('create-store-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const formData = new FormData();
  formData.append('storeName', document.getElementById('storeName').value);
  formData.append('storeDescription', document.getElementById('storeDescription').value);
  formData.append('storeLogo', document.getElementById('storeLogo').files[0]);

  fetch('/api/store', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Store created successfully');
        window.location.href = 'store.html';  // Redirect to store page after creation
      } else {
        alert('Error creating store');
      }
    })
    .catch(error => console.error('Error:', error));
});
