document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE = "https://swarize.in";
    const productsContainer = document.getElementById("products-container");
    const header = document.querySelector("header");
  
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("slug");
  
    if (!slug) {
      productsContainer.innerHTML = "<p> No store selected.</p>";
      return;
    }
  
    try {
      // ✅ STEP 1: Fetch store info separately
      const storeRes = await fetch(`${API_BASE}/api/store/${slug}`);
      if (!storeRes.ok) throw new Error(`Store HTTP ${storeRes.status}`);
      const storeData = await storeRes.json();
      const store = storeData.store;
      const storeName = store.storeName;
  
      // ✅ Show Store Name in Header
      if (header) header.textContent = `Products from ${storeName}`;
  
      // ✅ STEP 2: Fetch products by store slug
      const res = await fetch(`${API_BASE}/api/products/by-store/${slug}`, {
        method: 'GET',
        credentials: 'include'
      });
  
      if (!res.ok) throw new Error(`Product HTTP ${res.status}`);
  
      const data = await res.json();
      const products = data.products;
  
      if (!products || products.length === 0) {
        productsContainer.innerHTML = "<p>No products found for this store.</p>";
        return;
      }
  
      // ✅ Render all products using fetched storeName
      productsContainer.innerHTML = products.map(product => `
        <div class="product-card">
          <img src="${product.thumbnailImage}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p class="product-price">₹${product.price}</p>
          <p class="product-desc">${product.description?.substring(0, 100)}...</p>
          <p><strong>Seller Store:</strong> ${storeName}</p>
    <button class="view-button" onclick="window.location.href='product-detail.html?id=${product._id}'">View Product</button>
        </div>
      `).join("");
  
    } catch (err) {
      console.error(" Error fetching products:", err);
      productsContainer.innerHTML = `<p> Failed to load products.</p>`;
    }
  });
  