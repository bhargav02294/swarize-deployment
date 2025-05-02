document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "https://swarize.in";
  const storesContainer = document.getElementById("stores-container");
  const productsContainer = document.getElementById("products-container");

  // Step 1: Fetch all stores and display them
  try {
    const storesRes = await fetch(`${API_BASE}/api/store/public`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!storesRes.ok) {
      throw new Error(`HTTP ${storesRes.status}`);
    }

    const storesData = await storesRes.json();
    const stores = storesData.stores;

    if (!stores || stores.length === 0) {
      storesContainer.innerHTML = "<p>No stores found.</p>";
      return;
    }

    storesContainer.innerHTML = stores.map(store => `
      <div class="store-card" data-slug="${store.slug}">
          <img src="${store.logoUrl}" alt="${store.name}" class="store-logo">
          <h3>${store.name}</h3>
          <p>${store.description?.substring(0, 100)}...</p>
          <button class="view-products" onclick="viewStoreProducts('${store.slug}')">View Products</button>
      </div>
    `).join("");

  } catch (err) {
    console.error("❌ Error fetching stores:", err);
    storesContainer.innerHTML = `<p>❌ Failed to fetch stores.</p>`;
  }

  // Step 2: Function to fetch products of a store
  async function viewStoreProducts(slug) {
    try {
      const res = await fetch(`${API_BASE}/api/products/by-store/${slug}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const products = data.products;

      if (!products || products.length === 0) {
        productsContainer.innerHTML = "<p>No products found for this store.</p>";
        return;
      }

      productsContainer.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.thumbnail}" alt="${product.title}" class="product-thumb">
            <h3>${product.title}</h3>
            <p>₹${product.price}</p>
            <p class="product-desc">${product.description?.substring(0, 100)}...</p>
            <p><strong>Seller Store:</strong> ${product.store?.name || "Unknown"}</p>
            <button class="view-product" onclick="window.location.href='/store/${product.store.slug}/product/${product._id}'">View Product</button>
        </div>
      `).join("");

    } catch (err) {
      console.error("❌ Error fetching products:", err);
      productsContainer.innerHTML = `<p>❌ Failed to fetch products.</p>`;
    }
  }
});
