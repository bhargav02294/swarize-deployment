document.addEventListener("DOMContentLoaded", () => {
    const productContainer = document.getElementById("product-container");
    const subcategoryTitle = document.getElementById("subcategory-title");

    // ✅ Get selected subcategory from URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedSubcategory = urlParams.get("subcategory") || "All";

    // ✅ Update page title based on selected subcategory
    subcategoryTitle.textContent = selectedSubcategory;

    // ✅ Fetch and display products for the selected subcategory
    function loadProducts() {
        fetch(`http://localhost:3000/api/products/category/Jewelry and Accessories/${selectedSubcategory}`)
            .then(res => res.json())
            .then(data => {
                productContainer.innerHTML = ""; // Clear previous products
                
                if (data.success && data.products.length > 0) {
                    console.log("✅ Displaying Products:", data.products);
                    
                    data.products.forEach(product => {
                        const productItem = document.createElement("div");
                        productItem.classList.add("product-card");

                        // ✅ Ensure correct path for images
                        const imagePath = product.thumbnailImage.startsWith("uploads/")
                            ? `http://localhost:3000/${product.thumbnailImage}`
                            : product.thumbnailImage;

                        productItem.innerHTML = `
                            <div class="product-card">
                                <img src="${imagePath}" alt="${product.name}" class="product-image" onclick="viewProduct('${product._id}')">
                                <h4>${product.name}</h4>
                                <p class="product-price">₹${product.price}</p>

                                <!-- Star Rating -->
                                <div class="star-rating">
                                    ★★★★★
                                </div>

                                <!-- Add to Cart Button -->
                                <button class="cart-button" onclick="addToCart('${product._id}')">🛒</button>
                            </div>
                        `;

                        productContainer.appendChild(productItem);
                    });

                } else {
                    productContainer.innerHTML = `<p>No products found in ${selectedSubcategory}.</p>`;
                }
            })
            .catch(err => console.error("❌ Error loading products:", err));
    }

    // ✅ Load products when the page loads
    loadProducts();
});

// ✅ Function to view product details
function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// ✅ Function to add product to cart
// ✅ Function to add product to cart
async function addToCart(productId) {
    try {
        const response = await fetch("http://localhost:3000/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
            credentials: "include"
        });

        const data = await response.json();
        if (data.success) {
            console.log("✅ Product added to cart");
            window.location.href = `addtocart.html?id=${productId}`;
        } else {
            alert("❌ Failed to add product to cart: " + data.message);
        }
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
        alert("❌ Error adding product to cart.");
    }
}