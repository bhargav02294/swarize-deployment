document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) return document.getElementById("error-message").textContent = "Invalid store link";

  try {
    const res = await fetch(`/api/store/${slug}`);
    const data = await res.json();

    if (res.ok && data.success) {
      const store = data.store;
      document.getElementById("store-logo").src = store.logoUrl;
      document.getElementById("store-name").textContent = store.storeName;
      document.getElementById("store-description").textContent = store.description;
      localStorage.setItem("storeSlug", store.slug);
      localStorage.setItem("storeId", store._id);

      loadProducts(slug, store._id);
    } else {
      document.getElementById("error-message").textContent = data.message;
    }
  } catch (err) {
    console.error("❌ Load store failed:", err);
    document.getElementById("error-message").textContent = "Server error";
  }
});

async function loadProducts(slug, ownerId) {
  const container = document.getElementById("product-container");
  try {
    const res = await fetch(`/api/products/by-store/${slug}`);
    const data = await res.json();

    if (data.success) {
      if (data.products.length === 0) {
        container.innerHTML = "<p>No products found</p>";
        return;
      }

      const loggedInStoreId = localStorage.getItem("storeId");

      data.products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${product.thumbnailImage}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>₹${product.price}</p>
          ${product.store === loggedInStoreId ? `<button class="remove-btn" onclick="removeProduct('${product._id}', this)">Remove</button>` : ''}
        `;
        container.appendChild(card);
      });
    } else {
      container.innerHTML = "<p>Could not load products</p>";
    }
  } catch (err) {
    console.error("Product load error:", err);
    container.innerHTML = "<p>Error loading products</p>";
  }
}

async function removeProduct(productId, buttonElement) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`/api/products/delete/${productId}`, {
      method: "DELETE",
      credentials: "include"
    });

    const result = await res.json();

    if (res.ok && result.success) {
      buttonElement.parentElement.remove(); // Remove the product card from UI
      alert("✅ Product deleted");
    } else {
      alert("❌ Failed to delete product: " + result.message);
    }
  } catch (err) {
    console.error("Delete product failed:", err);
    alert("❌ Server error while deleting");
  }
}
