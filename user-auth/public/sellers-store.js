// public/sellers-store.js

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const storeSlug = params.get('storeSlug');  // Correct key expected in URL

  const errorMessage = document.getElementById("error-message");

  if (!storeSlug) {
      if (errorMessage) errorMessage.textContent = "Invalid store link";
      return;
  }

  try {
      // Load store info from slug
      const storeRes = await fetch(`/api/store/${storeSlug}`);
      const storeData = await storeRes.json();

      if (storeRes.ok && storeData.success) {
          const store = storeData.store;
          document.getElementById("store-logo").src = store.logoUrl;
          document.getElementById("store-name").textContent = store.storeName;
          document.getElementById("store-description").textContent = store.description;

          // Load products for this store
          loadProducts(storeSlug);
      } else {
          if (errorMessage) errorMessage.textContent = storeData.message || "Store not found";
      }
  } catch (err) {
      console.error("❌ Error loading store:", err);
      if (errorMessage) errorMessage.textContent = "Server error while loading store";
  }
});

async function loadProducts(storeSlug) {
  const productContainer = document.getElementById('product-container');
  if (!productContainer) return;

  productContainer.textContent = 'Loading products...';

  try {
      const productRes = await fetch(`/api/products/all?storeSlug=${storeSlug}`);
      const productData = await productRes.json();

      if (productRes.ok && productData.products && productData.products.length > 0) {
          productContainer.innerHTML = '';

          productData.products.forEach(product => {
              const productElement = document.createElement('div');
              productElement.classList.add('product');
              productElement.innerHTML = `
                  <img src="${product.thumbnail}" alt="${product.name}" class="product-thumbnail" />
                  <h3 class="product-name">${product.name}</h3>
                  <p class="product-description">${product.description}</p>
                  <a href="/product.html?id=${product._id}" class="view-product-btn">View Product</a>
              `;
              productContainer.appendChild(productElement);
          });
      } else {
          productContainer.textContent = 'No products found for this seller.';
      }
  } catch (error) {
      console.error("❌ Error fetching products:", error);
      productContainer.textContent = 'Error fetching products.';
  }
}
