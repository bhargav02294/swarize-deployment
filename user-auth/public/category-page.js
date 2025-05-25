document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  const title = document.getElementById("category-title");
  const container = document.getElementById("product-container");

  if (!category) {
    title.textContent = "No category selected.";
    return;
  }

  title.textContent = decodeURIComponent(category);

  try {
    const response = await fetch(`/api/products/category/${encodeURIComponent(category)}/all`);
    const data = await response.json();

    if (!data.success || data.products.length === 0) {
      container.innerHTML = "<p>No products found in this category.</p>";
      return;
    }

    data.products.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${p.thumbnailImage}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>₹${p.price}</p>
        <a href="product-detail.html?id=${p._id}" class="view-link">View Details</a>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error("Error fetching category products:", err);
    container.innerHTML = "<p>Error loading products.</p>";
  }
});
