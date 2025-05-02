document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    document.getElementById("error-message").textContent = "Invalid store link";
    return;
  }

  try {
    const storeRes = await fetch(`/api/store/${slug}`);
    const storeData = await storeRes.json();

    if (storeRes.ok && storeData.success) {
      const store = storeData.store;
      document.getElementById("store-logo").src = store.logoUrl;
      document.getElementById("store-name").textContent = store.storeName;
      document.getElementById("store-description").textContent = store.description;

      loadProducts(slug);
    } else {
      document.getElementById("error-message").textContent = storeData.message || "Store not found";
    }
  } catch (err) {
    console.error("❌ Store load error:", err);
    document.getElementById("error-message").textContent = "Server error while loading store.";
  }
});

async function loadProducts(slug) {
  const productContainer = document.getElementById('product-container');
  productContainer.textContent = 'Loading products...';

  try {
    const res = await fetch(`/api/products/all?storeSlug=${slug}`);
    const data = await res.json();

    if (res.ok && data.products && data.products.length > 0) {
      productContainer.innerHTML = '';
      data.products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('product');
        productElement.innerHTML = `
          <img src="${product.thumbnail}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>${product.description}</p>
        `;
        productContainer.appendChild(productElement);
      });
    } else {
      productContainer.textContent = 'No products found for this store.';
    }
  } catch (err) {
    console.error("❌ Product fetch error:", err);
    productContainer.textContent = 'Error fetching products.';
  }
}
