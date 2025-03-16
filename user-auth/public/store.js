document.addEventListener("DOMContentLoaded", () => {
    const storeForm = document.getElementById("store-form");
    const storeNameInput = document.getElementById("storeName");
    const storeLogoInput = document.getElementById("storeLogo");
    const storeDescriptionInput = document.getElementById("storeDescription");
    const saveStoreBtn = document.getElementById("save-store-btn");

    const displaySection = document.getElementById("display-store");
    const storeDisplayName = document.getElementById("store-name");
    const storeDisplayLogo = document.getElementById("store-logo");
    const storeMessage = document.getElementById("store-message");
    const editWarning = document.getElementById("edit-warning");
    const storeHeader = document.getElementById("store-header");
    const productsList = document.getElementById("products-list");
    const addProductBtn = document.getElementById("add-product-btn");
    const storeDescriptionDisplay = document.getElementById("store-description-display");

    // ✅ Show success message if redirected from product addition
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
        storeMessage.textContent = "Product added successfully!";
        storeMessage.style.color = "green";
    }

    // ✅ Fetch store details on page load
    fetch("/api/store")
        .then(res => res.json())
        .then(data => {
            if (data.success && data.store) {
                storeForm.style.display = "none";
                displaySection.style.display = "block";
                storeDisplayName.textContent = data.store.storeName;
                storeDisplayLogo.src = data.store.storeLogo;
                storeDescriptionDisplay.textContent = data.store.description;
                editWarning.style.display = "none";
                storeHeader.style.display = "none";

                // ✅ Load and display products
                loadProducts();
            }
        })
        .catch(err => console.error("❌ Error fetching store details:", err));

    // ✅ Load Products from API
    function loadProducts() {
        fetch("https://swarize-deployment.onrender.com/api/products", {
            method: "GET",
            credentials: "include"  // ✅ Ensures authentication is checked
        })
        .then(res => res.json())
        .then(data => {
            productsList.innerHTML = ""; // ✅ Clear previous product list
    
            if (data.success && data.products.length > 0) {
                console.log("✅ Displaying Products:", data.products);
    
                data.products.forEach(product => {
                    const productItem = document.createElement("div");
                    productItem.classList.add("product-item");
    
                    // ✅ Ensure correct path to image
                    const imagePath = product.thumbnailImage.startsWith("uploads/") 
                    ? `https://swarize-deployment.onrender.com/${product.thumbnailImage}` 
                    : `https://swarize-deployment.onrender.com/uploads/${product.thumbnailImage}`;
                    
                    productItem.innerHTML = `
                        <div class="product-card">
                            <img src="${imagePath}" alt="${product.name}" class="product-image">
                            <h4>${product.name}</h4>
                            <p>Price: ₹${product.price}</p>
                            <p>Category: ${product.category}</p>
                            <button class="delete-btn" data-id="${product._id}">Delete</button>
                        </div>
                    `;
    
                    productsList.appendChild(productItem);
                });
    
                // ✅ Attach Delete Button Listeners
                document.querySelectorAll(".delete-btn").forEach(button => {
                    button.addEventListener("click", deleteProduct);
                });
    
            } else {
                productsList.innerHTML = "<p>No products listed yet.</p>";
            }
        })
        .catch(err => console.error("❌ Error loading products:", err));
    }
    
    
    

    // ✅ Handle Product Deletion
    // ✅ Handle Product Deletion
    function deleteProduct(event) {
        const productId = event.target.getAttribute('data-id');
    
        // Show confirmation dialog
        const isConfirmed = confirm("Are you sure you want to delete this product?");
        if (!isConfirmed) {
            return; // Exit the function if the user cancels
        }
    
        // ✅ Send DELETE request to backend
        fetch(`https://swarize-deployment.onrender.com/api/products/${productId}`, {
            method: "DELETE",
            credentials: "include" // ✅ Ensure session cookies are sent
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log("✅ Product deleted successfully.");
                alert("Product deleted successfully!");
                loadProducts(); // ✅ Reload product list after deletion
            } else {
                console.error("❌ Error deleting product:", data.message);
                alert("Error deleting product: " + data.message);
            }
        })
        .catch(err => console.error("❌ Error deleting product:", err));
    }
    

    // ✅ Handle Store Form Submission
    storeForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("storeName", storeNameInput.value);
        formData.append("storeLogo", storeLogoInput.files[0]);
        formData.append("storeDescription", storeDescriptionInput.value);

        fetch("/api/store", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert("❌ Error saving store details: " + data.message);
            }
        })
        .catch(err => console.error("❌ Error saving store details:", err));
    });

    // ✅ Redirect to Add Product Page
    addProductBtn.addEventListener("click", () => {
        window.location.href = "add-product.html";
    });

    

    // ✅ Load Products when Page Loads
    loadProducts();
});
