document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/products/my-store")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("products-container");
      container.innerHTML = ""; // Clear loading content if any

      if (!data.storeExists) {
        container.innerHTML = "<p>You haven’t created a store yet.</p>";
        return;
      }

      if (data.products.length === 0) {
        container.innerHTML = "<p>No products listed yet.</p>";
        return;
      }

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
      document.getElementById("products-container").innerHTML =
        "<p>Failed to load your products. Please try again later.</p>";
    });
});
