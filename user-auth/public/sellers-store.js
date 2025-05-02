document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    document.getElementById("error-message").textContent = "Invalid store link";
    return;
  }

  try {
    const res = await fetch(`/api/store/${slug}`);
    const data = await res.json();

    if (res.ok && data.success) {
      const store = data.store;
      document.getElementById("store-logo").src = store.logoUrl;
      document.getElementById("store-name").textContent = store.storeName;  // Updated
      document.getElementById("store-description").textContent = store.description;

      loadProducts(slug, store._id);  // Ensure that this function is properly defined
    } else {
      document.getElementById("error-message").textContent = data.message || "Store not found";
    }
  } catch (err) {
    console.error("❌ Load store failed:", err);
    document.getElementById("error-message").textContent = "Server error";
  }
});


// Ensure the DOM is fully loaded before executing JS
// sellers-store.js
document.addEventListener('DOMContentLoaded', function() {
  const productContainer = document.getElementById('product-container');
  if (productContainer) {
      productContainer.textContent = 'Loading products...';
  }

  // Fetch products and display them
  fetch('/api/products/all?storeSlug=yourStoreSlug') // Replace with actual storeSlug
      .then(res => res.json())
      .then(data => {
          if (data.products && data.products.length > 0) {
              productContainer.innerHTML = ''; // Clear 'Loading...' text
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
              productContainer.textContent = 'No products found for this seller.';
          }
      })
      .catch(error => {
          console.error(error);
          productContainer.textContent = 'Error fetching products.';
      });
});
