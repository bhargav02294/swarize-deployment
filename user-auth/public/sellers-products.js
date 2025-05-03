document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE = "https://swarize.in";
    const productsContainer = document.getElementById("products-container");
  
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("slug");
  
    if (!slug) {
      productsContainer.innerHTML = "<p>❌ No store selected.</p>";
      return;
    }
  
    try {
      const res = await fetch(`${API_BASE}/api/products/by-store/${slug}`, {
        method: 'GET',
        credentials: 'include'
      });
  
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
      const data = await res.json();
      const products = data.products;
  
      if (!products || products.length === 0) {
        productsContainer.innerHTML = "<p>No products found for this store.</p>";
        return;
      }
  
      // ✅ Store name from product.store
      const storeName = products[0].store?.storeName || "Unknown";
  
      // ✅ Optional: Show Store Name on Page
      const header = document.querySelector("header");
      if (header) header.textContent = `Products from ${storeName}`;
  
      // ✅ Render Product Cards
      productsContainer.innerHTML = products.map(product => `
        <div class="product-card">
          <img src="${product.thumbnailImage}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p class="product-price">₹${product.price}</p>
          <p class="product-desc">${product.description?.substring(0, 100)}...</p>
          <p><strong>Seller Store:</strong> ${product.store?.storeName || "Unknown"}</p>
          <button onclick="window.location.href='/store/${product.store.slug}/product/${product._id}'">View Product</button>
        </div>
      `).join("");
  
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      productsContainer.innerHTML = `<p>❌ Failed to load products.</p>`;
    }
  });
  