// File: category-page.js

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");
  const categoryTitle = document.getElementById("category-title");
  const container = document.getElementById("product-container");

  if (!category) {
    categoryTitle.textContent = "No category selected";
    return;
  }

  categoryTitle.textContent = decodeURIComponent(category);

  try {
    const res = await fetch(`/api/products/category/${encodeURIComponent(category)}/all`);
    const data = await res.json();

    if (data.success && data.products.length > 0) {
      container.innerHTML = "";
      data.products.forEach(product => {
        const img = product.thumbnailImage.startsWith("uploads/")
          ? `https://swarize.in/${product.thumbnailImage}`
          : product.thumbnailImage;

        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${img}" alt="${product.name}" onclick="window.location.href='product-detail.html?id=${product._id}'">
          <h3>${product.name}</h3>
          <p>₹${product.price}</p>
          <button onclick="addToCart('${product._id}')">Add to Cart</button>
        `;
        container.appendChild(card);
      });
    } else {
      container.innerHTML = "<p>No products found in this category.</p>";
    }
  } catch (err) {
    console.error("Error fetching category products:", err);
    container.innerHTML = "<p>Error loading products. Try again later.</p>";
  }
});

async function addToCart(productId) {
  try {
    const response = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
      credentials: "include"
    });

    const data = await response.json();
    if (data.success) {
      alert("Product added to cart");
    } else {
      alert(data.message || "Failed to add to cart");
    }
  } catch (err) {
    console.error("Error adding to cart:", err);
  }
}
