document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "https://swarize.in";
  const productsContainer = document.getElementById("products-container");

  // Step 1: Check if the user has a store and fetch products based on the store
  try {
    const res = await fetch(`${API_BASE}/api/store/my-store`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      if (res.status === 404) {
        console.warn("⚠️ Store not found.");
        alert("⚠️ You haven't created your own store. Viewing other sellers' products only.");
      } else if (res.status === 401) {
        alert("⚠️ You are not authenticated. Please log in.");
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } else {
      const data = await res.json();
      if (data.success && data.store) {
        const slug = data.store.slug;
        localStorage.setItem("myStoreSlug", slug);
        console.log("✅ User's store slug stored:", slug);
      }
    }

  } catch (err) {
    console.error("❌ Failed to check user's store info:", err);
    alert("Server error while checking your store.");
  }

  // Step 2: Fetch all products from all stores and display them
  try {
    const response = await fetch(`${API_BASE}/api/products/all`, {
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      const products = result.products;

      if (!products || products.length === 0) {
        productsContainer.innerHTML = "<p>No products found from any sellers.</p>";
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

    } else {
      productsContainer.innerHTML = `<p>❌ Failed to fetch seller products.</p>`;
    }

  } catch (err) {
    console.error("❌ Error fetching products:", err);
    productsContainer.innerHTML = `<p>❌ Server error while loading products.</p>`;
  }
});
