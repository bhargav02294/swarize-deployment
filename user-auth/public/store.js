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
    console.error(" Load store failed:", err);
    document.getElementById("error-message").textContent = "Server error";
  }
});


if (res.ok && data.success) {
  const store = data.store;
  document.getElementById("store-logo").src = store.logoUrl;
  document.getElementById("store-name").textContent = store.storeName;
  document.getElementById("store-description").textContent = store.description;
  localStorage.setItem("storeSlug", store.slug);
  localStorage.setItem("storeId", store._id);

  // Dynamic SEO Meta Updates
  document.title = `${store.storeName} | Online Store`;
  document.getElementById("meta-description").content = store.description || "Visit our store";
  document.getElementById("og-title").content = store.storeName;
  document.getElementById("og-desc").content = store.description || "";
  document.getElementById("og-image").content = store.logoUrl || "/default-logo.png";
  document.getElementById("og-url").content = window.location.href;
  document.getElementById("twitter-title").content = store.storeName;
  document.getElementById("twitter-desc").content = store.description || "";
  document.getElementById("twitter-image").content = store.logoUrl || "/default-logo.png";

  // Add JSON-LD Structured Data
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": store.storeName,
    "url": window.location.href,
    "image": store.logoUrl,
    "description": store.description,
    "identifier": store._id
  };
  document.getElementById("json-ld-store").textContent = JSON.stringify(storeSchema);

  loadProducts(slug, store._id);
}




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
        const productStoreId = product.store?._id || product.store;
        const isOwner = String(productStoreId) === String(loggedInStoreId);

        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${product.thumbnailImage}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>₹${product.price}</p>
          ${isOwner ? `<button class="remove-btn" onclick="removeProduct('${product._id}', this)">Remove</button>` : ''}
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

async function removeProduct(productId) {
  try {
    const res = await fetch(`/api/products/delete/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      alert("Product deleted successfully!");
      location.reload();
    } else {
      const errorData = await res.json();
      console.error("Delete product failed:", errorData);
      alert(` Delete failed: ${errorData.error}`);
    }
  } catch (error) {
    console.error("Delete product error:", error);
    alert(" Error deleting product");
  }
}
