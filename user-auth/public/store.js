document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
      document.getElementById("error-message").textContent = "Invalid store link. Please try again.";
      return;
  }

  try {
      const response = await fetch(`https://swarize.in/api/store/${slug}`);
      const result = await response.json();

      if (response.ok && result.success) {
          const store = result.store;

          // Show store info
          document.getElementById('store-logo').src = store.logoUrl;
          document.getElementById('store-name').textContent = store.storeName;
          document.getElementById('store-description').textContent = store.description;

          // Save storeSlug to localStorage for add-product page
          localStorage.setItem("storeSlug", store.slug);
          localStorage.setItem("storeId", store._id);


          // ✅ Load products for this store
          loadProducts(store.slug);
      } else {
          document.getElementById("error-message").textContent = result.message || "Store not found.";
      }
  } catch (err) {
      console.error('❌ Error loading store:', err);
      document.getElementById("error-message").textContent = "Server error, try again later.";
  }
});

async function loadProducts(slug) {
  const container = document.getElementById("product-container");

  try {
      const res = await fetch(`https://swarize.in/api/products/by-store/${slug}`);
      const data = await res.json();

      if (data.success) {
          const products = data.products;

          if (products.length === 0) {
              container.innerHTML = "<p>No products found.</p>";
              return;
          }

          products.forEach(product => {
              const card = document.createElement("div");
              card.className = "product-card";

              card.innerHTML = `
                  <img src="${product.thumbnailImage}" alt="${product.name}" class="product-thumbnail" />
                  <h3>${product.name}</h3>
                  <p>₹${product.price}</p>
                  <p>${product.description.slice(0, 60)}...</p>
                  <div class="extra-images">
                      ${product.extraImages?.map(img => `<img src="${img}" class="extra-image" />`).join("") || ""}
                  </div>
                  <div class="extra-videos">
                      ${product.extraVideos?.map(video => `
                          <video src="${video}" controls class="extra-video"></video>
                      `).join("") || ""}
                  </div>
              `;

              container.appendChild(card);
          });
      } else {
          container.innerHTML = "<p>Failed to load products.</p>";
      }
  } catch (error) {
      console.error("Error loading products:", error);
      container.innerHTML = "<p>Error fetching products</p>";
  }
}
