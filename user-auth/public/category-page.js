// category-products.js
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  const title = document.getElementById("category-title");
  const container = document.getElementById("category-product-list");

  if (!category) {
    title.textContent = "No category selected";
    return;
  }

  title.textContent = `Showing products in: ${decodeURIComponent(category)}`;

  try {
    const res = await fetch(`/api/products/category/${encodeURIComponent(category)}`);
    const data = await res.json();

    if (data.success && data.products.length) {
      data.products.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";
        const imgSrc = p.thumbnailImage.startsWith("uploads/")
          ? `https://swarize.in/${p.thumbnailImage}`
          : p.thumbnailImage;

        card.innerHTML = `
          <img src="${imgSrc}" alt="${p.name}" class="product-image" />
          <h3>${p.name}</h3>
          <p>₹${p.price}</p>
          <button onclick="location.href='/product-detail.html?id=${p._id}'">View Product</button>
        `;

        container.appendChild(card);
      });
    } else {
      container.innerHTML = "<p>No products found in this category.</p>";
    }
  } catch (err) {
    console.error("Error loading category products:", err);
    container.innerHTML = "<p>Error fetching products. Please try again.</p>";
  }
});
