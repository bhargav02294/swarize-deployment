document.getElementById('store-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const formData = new FormData();
  formData.append('name', document.getElementById('name').value);
  formData.append('logo', document.getElementById('logo').files[0]);
  formData.append('description', document.getElementById('description').value);

  const response = await fetch('/api/store/create-store', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  if (response.status === 201) {
    document.getElementById('store-message').innerText = 'Store created successfully!';
    window.location.href = '/store.html';  // Redirect to store page
  } else {
    document.getElementById('store-message').innerText = result.message;
  }
});
