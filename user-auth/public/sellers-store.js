document.addEventListener('DOMContentLoaded', async () => {
  // Fetch storeSlug from URL parameters
  const params = new URLSearchParams(window.location.search);
  const storeSlug = params.get('storeSlug');  // Extract storeSlug from URL

  if (!storeSlug) {
      document.getElementById("error-message").textContent = "Invalid store link";
      return;
  }

  // Load the store info
  try {
      const storeRes = await fetch(`/api/store/${storeSlug}`);
      const storeData = await storeRes.json();

      if (storeRes.ok && storeData.success) {
          const store = storeData.store;
          document.getElementById("store-logo").src = store.logoUrl;
          document.getElementById("store-name").textContent = store.storeName;
          document.getElementById("store-description").textContent = store.description;

          // Now load products for this store
          loadProducts(storeSlug);  // Pass storeSlug to load products
      } else {
          document.getElementById("error-message").textContent = storeData.message || "Store not found";
      }
  } catch (err) {
      console.error("❌ Load store failed:", err);
      document.getElementById("error-message").textContent = "Server error while loading store";
  }
});

// Function to load products for the store
async function loadProducts(storeSlug) {
  const productContainer = document.getElementById('product-container');
  if (productContainer) {
      productContainer.textContent = 'Loading products...';  // Show loading text while fetching
  }

  try {
      const productRes = await fetch(`/api/products/all?storeSlug=${storeSlug}`);
      const productData = await productRes.json();

      if (productRes.ok && productData.products && productData.products.length > 0) {
          productContainer.innerHTML = '';  // Clear the 'Loading...' text

          // Loop through products and display them
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
      if (productContainer) {
          productContainer.textContent = 'Error fetching products.';
      }
  }
}
