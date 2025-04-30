document.addEventListener("DOMContentLoaded", () => {
    const productContainer = document.getElementById("product-container");
    const subcategoryTitle = document.getElementById("subcategory-title");
  
    // Read ?subcategory=<name>
    const urlParams = new URLSearchParams(window.location.search);
    const selectedSubcategory = urlParams.get("subcategory") || "All";
  
    // Show it in heading
    subcategoryTitle.textContent = selectedSubcategory;
  
    // Fetch & render
    fetch(`/api/products/category/${encodeURIComponent("Women's Store")}/${encodeURIComponent(selectedSubcategory)}`)
      .then(res => res.json())
      .then(data => {
        productContainer.innerHTML = "";
  
        if (data.success && data.products.length) {
          data.products.forEach(product => {
            const item = document.createElement("div");
            item.classList.add("product-card");
  
            const img = product.thumbnailImage.startsWith("uploads/")
              ? `https://swarize.in/${product.thumbnailImage}`
              : product.thumbnailImage;
  
            item.innerHTML = `
              <img src="${img}" alt="${product.name}" class="product-image" onclick="viewProduct('${product._id}')">
              <h4>${product.name}</h4>
              <p class="product-price">₹${product.price}</p>
              <button onclick="addToCart('${product._id}')">🛒 Add to Cart</button>
            `;
            productContainer.appendChild(item);
          });
        } else {
          productContainer.innerHTML = `<p>No products found in ${selectedSubcategory}.</p>`;
        }
      })
      .catch(err => {
        console.error("❌ Error loading products:", err);
        productContainer.innerHTML = "<p>Error loading products.</p>";
      });
  });
  
  // View & Cart functions (as before)
  function viewProduct(id) {
    window.location.href = `product-detail.html?id=${id}`;
  }
  async function addToCart(id) {
    try {
      const res = await fetch("/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) window.location.href = `addtocart.html?id=${id}`;
      else alert("Failed to add to cart: " + data.message);
    } catch {
      alert("Error adding to cart.");
    }
  }
  