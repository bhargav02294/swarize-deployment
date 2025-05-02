document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "https://swarize.in";
  const productsContainer = document.getElementById("products-container");

  // Step 1: Check if user has a store (optional use for current user context)
  try {
      const res = await fetch(`${API_BASE}/api/store/my-store`, {
          method: 'GET',
          credentials: 'include'
      });

      const data = await res.json();

      if (res.ok && data.success && data.store) {
          const slug = data.store.slug;
          localStorage.setItem("myStoreSlug", slug);
          console.log("✅ User's store slug stored:", slug);
      } else {
          console.warn("⚠️ You haven't created a store. Some seller features may be unavailable.");
          alert("⚠️ You haven't created your own store. Viewing other sellers' products only.");
      }
  } catch (err) {
      console.error("❌ Failed to check user's store info:", err);
      alert("Server error while checking your store.");
  }

  // Step 2: Fetch all products from all sellers
  try {
      const response = await fetch(`${API_BASE}/api/products/all`, {
          method: "GET",
          credentials: "include"
      });

      const result = await response.json();

      if (response.ok && result.success) {
          const products = result.products;

          if (products.length === 0) {
              productsContainer.innerHTML = "<p>No products found from any sellers.</p>";
              return;
          }

          // Render products
          productsContainer.innerHTML = products.map(product => `
              <div class="product-card">
                  <img src="${product.thumbnail}" alt="${product.title}" class="product-thumb">
                  <h3>${product.title}</h3>
                  <p>₹${product.price}</p>
                  <p class="product-desc">${product.description?.substring(0, 100)}...</p>
                  <p><strong>Seller Store:</strong> ${product.store?.name || "Unknown"}</p>
              </div>
          `).join("");

      } else {
          productsContainer.innerHTML = `<p>❌ Failed to fetch seller products.</p>`;
      }

  } catch (err) {
      console.error("❌ Error fetching products:", err);
      productsContainer.innerHTML = `<p>❌ Server error while loading products.</p>`;
  }
});
