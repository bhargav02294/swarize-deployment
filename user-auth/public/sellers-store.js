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
document.addEventListener('DOMContentLoaded', function() {
  const storeNameElement = document.getElementById('store-name');
  if (storeNameElement) {
    storeNameElement.textContent = "Welcome to Your Store!";
  } else {
    console.error("store-name element not found!");
  }

  fetch('/api/products/all')
    .then((response) => response.json())
    .then((data) => {
      const productsContainer = document.getElementById('products-container');
      if (productsContainer) {
        data.forEach((product) => {
          const productElement = document.createElement('div');
          productElement.classList.add('product');
          productElement.innerHTML = `
            <img src="${product.thumbnailUrl}" alt="${product.name}" />
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p><strong>Price: </strong>${product.price}</p>
          `;
          productsContainer.appendChild(productElement);
        });
      } else {
        console.error("products-container element not found!");
      }
    })
    .catch((error) => console.error('Error fetching products:', error));
});
