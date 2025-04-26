document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  if (!slug) return alert("Store slug missing in URL");

  try {
    const response = await fetch(`/api/store/${slug}`);
    const data = await response.json();

    if (data.success) {
      document.getElementById('store-name').textContent = data.store.storeName;
      document.getElementById('store-logo').src = data.store.logoUrl;
      document.getElementById('store-description').textContent = data.store.description;
    } else {
      alert("❌ Store not found");
    }

  } catch (err) {
    console.error("❌ Error loading store:", err);
    alert("❌ Server error");
  }

  document.getElementById('add-product-btn').addEventListener('click', () => {
    window.location.href = '/dashboard/add-product.html';
  });
});
