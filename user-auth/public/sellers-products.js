document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE = "https://swarize.in";
    const params = new URLSearchParams(window.location.search);
    const storeSlug = params.get("slug");
    const productsContainer = document.getElementById("products-container");
    const storeTitle = document.getElementById("store-title");
  
    if (!storeSlug) {
      storeTitle.innerText = "⚠️ Store not found!";
      return;
    }
  
    try {
      const res = await fetch(`${API_BASE}/api/store/${storeSlug}`, {
        method: "GET",
        credentials: "include"
      });
  
      const data = await res.json();
  
      if (!data.success) {
        storeTitle.innerText = "❌ Could not load store.";
        return;
      }
  
      const store = data.store;
      storeTitle.innerText = `Products from ${store.name}`;
  
      const products = store.products;
  
      if (!products || products.length === 0) {
        productsContainer.innerHTML = "<p>No products found for this store.</p>";
        return;
      }
  
      productsContainer.innerHTML = products.map(product => `
        <div class="product-card">
    <img src="${product.thumbnailImage}" alt="${product.name}" />
    <h3>${product.name}</h3>
          <p>₹${product.price}</p>
          <p>${product.description?.substring(0, 100)}...</p>
        </div>
      `).join("");
  
    } catch (err) {
      console.error("❌ Error loading seller products:", err);
      storeTitle.innerText = "❌ Error loading store products.";
    }
  });
  