// public/sellers-store.js

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug'); // Expected: ?slug=your-store-slug

  const errorMessageEl = document.getElementById("error-message");
  const productContainer = document.getElementById("product-container");

  if (!slug) {
    errorMessageEl.textContent = "Invalid store link";
    return;
  }

  try {
    // Fetch store info using slug
    const res = await fetch(`/api/store/${slug}`);
    const data = await res.json();

    if (res.ok && data.success) {
      const store = data.store;

      document.getElementById("store-logo").src = store.logoUrl;
      document.getElementById("store-name").textContent = store.storeName;
      document.getElementById("store-description").textContent = store.description;

      // Load products
      await loadProducts(slug);
    } else {
      errorMessageEl.textContent = data.message || "Store not found";
    }
  } catch (err) {
    console.error("❌ Error loading store:", err);
    errorMessageEl.textContent = "Something went wrong.";
  }
});

// Load products for given slug
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
          <img class="product-thumbnail" src="${product.thumbnail}" alt="${product.name}" />
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
        `;
        productContainer.appendChild(productElement);
      });
    } else {
      productContainer.textContent = 'No products found for this seller.';
    }
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    productContainer.textContent = 'Failed to load products.';
  }
}
