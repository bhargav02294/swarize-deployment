document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE = "https://swarize.in";
    const container = document.getElementById("products-container");
    const storeTitle = document.getElementById("storeTitle");
    const storeSubtitle = document.getElementById("storeSubtitle");

    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("slug");

    if (!slug) {
        storeTitle.textContent = "Store Not Found";
        container.innerHTML = "<p>No store selected.</p>";
        return;
    }

    try {
        /* STEP 1 — Fetch Store Info */
        const storeRes = await fetch(`${API_BASE}/api/store/${slug}`);
        if (!storeRes.ok) throw new Error("Failed to load store");
        const storeData = await storeRes.json();
        const store = storeData.store;

        storeTitle.textContent = store.storeName;
        storeSubtitle.textContent = `Products from ${store.storeName}`;

        /* STEP 2 — Fetch Products */
        const productRes = await fetch(`${API_BASE}/api/products/by-store/${slug}`);

        if (!productRes.ok) throw new Error("Failed to load products");

        const data = await productRes.json();
        const products = data.products;

        if (!products || products.length === 0) {
            container.innerHTML = "<p>No products available for this store.</p>";
            return;
        }

        /* STEP 3 — Render Products */
        container.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.thumbnailImage}" alt="${product.name}" />

                <h3>${product.name}</h3>
                <p class="product-price">₹${product.price}</p>

                <p class="product-desc">
                    ${product.description?.slice(0, 90) || "No description"}...
                </p>

                <a href="product-detail.html?id=${product._id}" class="view-button">
                    View Product
                </a>
            </div>
        `).join("");

    } catch (err) {
        console.error("Error:", err);
        container.innerHTML = "<p>Unable to load products. Please try again.</p>";
    }
});
