document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");

  const container = document.getElementById("products-container");
  const heading = document.getElementById("store-heading");

  if (!slug) {
    container.innerHTML = "<p style='color:red;'>Invalid store link. No slug provided.</p>";
    return;
  }

  fetch(`/api/products/by-store/${slug}`)
    .then((res) => res.json())
    .then((data) => {
      if (!data.success || data.products.length === 0) {
        container.innerHTML = "<p>No products found for this seller.</p>";
        return;
      }

      heading.textContent = `Products from "${slug}"`;

      data.products.forEach((product) => {
        const div = document.createElement("div");
        div.classList.add("product-card");

        div.innerHTML = `
          <img src="${product.thumbnailImage}" alt="${product.name}" class="product-thumbnail" />
          <h3>${product.name}</h3>
          <p>₹${product.price}</p>
          <p>${product.description.slice(0, 60)}...</p>
        `;

        container.appendChild(div);
      });
    })
    .catch((err) => {
      console.error("Error loading seller products:", err);
      container.innerHTML = "<p style='color:red;'>Failed to load products.</p>";
    });
});
