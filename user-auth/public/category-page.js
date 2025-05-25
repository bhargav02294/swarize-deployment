document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");
  const productsGrid = document.getElementById("category-products-grid");
  const categoryTitle = document.getElementById("category-title");

  if (!category) {
    categoryTitle.textContent = "No category selected!";
    return;
  }

  categoryTitle.textContent = decodeURIComponent(category);

  try {
    const response = await fetch(`/api/products/category/${encodeURIComponent(category)}/all`);
    const data = await response.json();

    if (!data.success || data.products.length === 0) {
      productsGrid.innerHTML = "<p>No products found for this category.</p>";
      return;
    }

    data.products.forEach(product => {
      const imagePath = product.thumbnailImage.startsWith("uploads/")
        ? `https://swarize.in/${product.thumbnailImage}`
        : product.thumbnailImage;

      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.innerHTML = `
        <img src="${imagePath}" alt="${product.name}" class="product-image" onclick="viewProduct('${product._id}')">
        <h4>${product.name}</h4>
        <p class="product-price">₹${product.price}</p>
        <div class="star-rating">★★★★★</div>
        <button class="cart-button" onclick="addToCart('${product._id}')">🛒</button>
      `;
      productsGrid.appendChild(productCard);
    });

  } catch (error) {
    console.error("Error fetching category products:", error);
    productsGrid.innerHTML = "<p>Error loading products. Please try again later.</p>";
  }
});

function viewProduct(id) {
  window.location.href = `product-detail.html?id=${id}`;
}

async function addToCart(productId) {
  try {
    const response = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId })
    });
    const data = await response.json();
    if (data.success) {
      window.location.href = "addtocart.html";
    } else {
      alert("Failed to add to cart.");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
}
