
// ✅ File: public/create-store.js
document.getElementById('createStoreForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('storeName', document.getElementById('storeName').value);
  formData.append('storeDescription', document.getElementById('storeDescription').value);
  formData.append('storeLogo', document.getElementById('storeLogo').files[0]);

  const response = await fetch('/api/store', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  if (response.ok) {
    window.location.href = 'store.html';
  } else {
    alert(result.error);
  }
});
