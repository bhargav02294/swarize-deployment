document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        return document.getElementById("error-message").textContent = "Invalid store link";
    }

    try {
        const res = await fetch(`/api/store/${slug}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
            return document.getElementById("error-message").textContent = data.message;
        }

        const store = data.store;

        // Display store details
        document.getElementById("store-logo").src = store.logoUrl;
        document.getElementById("store-name").textContent = store.storeName;
        document.getElementById("store-description").textContent = store.description;

        // Store ID for edit/remove check
        localStorage.setItem("storeSlug", store.slug);
        localStorage.setItem("storeId", store._id);

        // Dynamic SEO updates
        document.title = `${store.storeName} | Swarize Store`;
        document.getElementById("meta-description").content = store.description || "";
        document.getElementById("og-title").content = store.storeName;
        document.getElementById("og-desc").content = store.description;
        document.getElementById("og-image").content = store.logoUrl;
        document.getElementById("og-url").content = window.location.href;
        document.getElementById("twitter-title").content = store.storeName;
        document.getElementById("twitter-desc").content = store.description;
        document.getElementById("twitter-image").content = store.logoUrl;

        // Schema update
        const schema = {
            "@context": "https://schema.org",
            "@type": "Store",
            "name": store.storeName,
            "url": window.location.href,
            "description": store.description,
            "image": store.logoUrl,
            "identifier": store._id
        };
        document.getElementById("json-ld-store").textContent = JSON.stringify(schema);

        loadProducts(slug, store._id);

    } catch (error) {
        console.error(" Store load failed:", error);
        document.getElementById("error-message").textContent = "Server error";
    }
});


/* ---------------- LOAD PRODUCTS ------------------ */
async function loadProducts(slug, ownerId) {
    const container = document.getElementById("product-container");

    try {
        const res = await fetch(`/api/products/by-store/${slug}`);
        const data = await res.json();

        if (!data.success) {
            return container.innerHTML = "<p>Could not load products</p>";
        }

        const loggedInStoreId = localStorage.getItem("storeId");

        if (data.products.length === 0) {
            return container.innerHTML = "<p>No products found</p>";
        }

        data.products.forEach(product => {
            const productStoreId = product.store?._id || product.store;
            const isOwner = String(productStoreId) === String(loggedInStoreId);

            const card = document.createElement("div");
            card.className = "product-card";

            card.innerHTML = `
                <img src="${product.thumbnailImage}" alt="${product.name}" />
                <h3>${product.name}</h3>
                <p>₹${product.price}</p>
                ${isOwner ? `<button class="remove-btn" onclick="removeProduct('${product._id}')">Remove</button>` : ""}
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Product fetch error:", err);
        container.innerHTML = "<p>Error loading products</p>";
    }
}


/* ---------------- DELETE PRODUCT ------------------ */
async function removeProduct(productId) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const res = await fetch(`/api/products/delete/${productId}`, {
            method: "DELETE",
            credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
            alert(`Delete failed: ${data.error}`);
            return;
        }

        alert("Product deleted successfully!");
        location.reload();

    } catch (error) {
        console.error("Delete product error:", error);
        alert("Error deleting product");
    }
}
