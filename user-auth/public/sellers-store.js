document.addEventListener('DOMContentLoaded', async () => {
  const productsContainer = document.getElementById('products-container');
  const heading = document.getElementById('store-heading');

  try {
    const res = await fetch('/api/products/my-store');
    const data = await res.json();

    if (!data.success) {
      heading.innerText = "Error: Could not fetch store.";
      return;
    }

    if (!data.storeExists) {
      heading.innerText = "❌ You haven’t created a store yet.";
      return;
    }

    if (data.products.length === 0) {
      heading.innerText = "📦 No products added to your store yet.";
      return;
    }

    heading.innerText = "🛍️ Your Store Products:";

    data.products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${product.thumbnail}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p><strong>₹${product.price}</strong></p>
      `;
      productsContainer.appendChild(card);
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    heading.innerText = "❌ Server Error: Unable to load store.";
  }
});
