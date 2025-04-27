document.addEventListener('DOMContentLoaded', async () => {
  const API_BASE = "https://swarize.in";

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  if (!slug) {
      alert("❌ Store slug missing in URL");
      return;
  }

  try {
      const response = await fetch(`${API_BASE}/api/store/${slug}`, {
          credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
          document.getElementById('store-name').textContent = data.store.storeName;
          document.getElementById('store-logo').src = data.store.logoUrl;
          document.getElementById('store-description').textContent = data.store.description;
      } else {
          alert("❌ Store not found!");
      }

  } catch (err) {
      console.error("❌ Error loading store:", err);
      alert("❌ Server error, please try again later.");
  }

  document.getElementById('add-product-btn').addEventListener('click', () => {
      window.location.href = '/dashboard/add-product.html';
  });
});
