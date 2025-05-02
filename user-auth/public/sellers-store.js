document.addEventListener("DOMContentLoaded", async () => {
  const productList = document.getElementById("product-list");

  try {
    const response = await fetch("/api/products/all");
    const data = await response.json();

    if (response.ok && Array.isArray(data)) {
      if (data.length === 0) {
        productList.innerHTML = "<p>No products available yet.</p>";
        return;
      }

      data.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
          <img src="${product.thumbnail}" alt="${product.title}" />
          <h3>${product.title}</h3>
          <p>₹${product.price}</p>
          <p>${product.category} - ${product.subCategory}</p>
        `;

        productList.appendChild(card);
      });
    } else {
      productList.innerHTML = "<p>Failed to load products.</p>";
    }
  } catch (err) {
    console.error("Error loading products:", err);
    productList.innerHTML = "<p>Error fetching products.</p>";
  }
});
