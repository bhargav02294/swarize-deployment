document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/products/all")
      .then((res) => res.json())
      .then((data) => {
        const container = document.getElementById("products-container");
        if (data.products.length === 0) {
          container.innerHTML = "<p>No products found.</p>";
          return;
        }
  
        data.products.forEach((product) => {
          const div = document.createElement("div");
          div.classList.add("product-card");
  
          div.innerHTML = `
            <img src="${product.thumbnailUrl}" alt="${product.name}" />
            <div class="product-title">${product.name}</div>
            <p>Price: ₹${product.price}</p>
            <p>${product.description}</p>
          `;
  
          container.appendChild(div);
        });
      })
      .catch((err) => {
        console.error("Error loading products:", err);
      });
  });
  