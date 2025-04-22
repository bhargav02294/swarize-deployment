
// ✅ File: public/store-redirect.js
document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/api/store/check');
    const result = await response.json();
    if (result.exists) {
      window.location.href = 'store.html';
    } else {
      window.location.href = 'create-store.html';
    }
  });