document.addEventListener("DOMContentLoaded", async () => {
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

    try{
        // ✅ Fetch store details on page load
        const response = await fetch("https://swarize-deployment.onrender.com/api/store", { credentials: "include" });
        const data = await response.json();

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
    } catch (error) {
        console.error("❌ Error fetching store details:", error);
    }

    // ✅ Load Products from API
    function loadProducts() {
        fetch("https://swarize-deployment.onrender.com/api/products", {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                productsList.innerHTML = "";
                if (data.success && data.products.length > 0) {
                    data.products.forEach((product) => {
                        const productItem = document.createElement("div");
                        productItem.classList.add("product-item");

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

                    document.querySelectorAll(".delete-btn").forEach((button) => {
                        button.addEventListener("click", deleteProduct);
                    });
                } else {
                    productsList.innerHTML = "<p>No products listed yet.</p>";
                }
            })
            .catch((err) => console.error("❌ Error loading products:", err));
    }

    // ✅ Handle Product Deletion
    function deleteProduct(event) {
        const productId = event.target.getAttribute("data-id");

        if (!confirm("Are you sure you want to delete this product?")) return;

        fetch(`https://swarize-deployment.onrender.com/api/products/${productId}`, {
            method: "DELETE",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    alert("Product deleted successfully!");
                    loadProducts();
                } else {
                    alert("Error deleting product: " + data.message);
                }
            })
            .catch((err) => console.error("❌ Error deleting product:", err));
    }

    // ✅ Handle Store Form Submission
    storeForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        // ✅ Validate Form Data
        if (!storeNameInput.value || !storeLogoInput.files[0]) {
            alert("❌ Store name and logo are required!");
            return;
        }
    
        const formData = new FormData();
        formData.append("storeName", storeNameInput.value);
        formData.append("storeLogo", storeLogoInput.files[0]);
        formData.append("storeDescription", storeDescriptionInput.value);
    
        try {
            const response = await fetch("https://swarize-deployment.onrender.com/api/store", {
                method: "POST",
                credentials: "include",
                body: formData,
            });
    
            const data = await response.json();
    
            if (data.success) {
                alert("✅ Store details saved successfully!");
                window.location.href = "addproducts.html"; // ✅ Redirect
            } else {
                alert("❌ Error: " + data.message);
            }
        } catch (err) {
            console.error("❌ Error saving store details:", err);
            alert("❌ Failed to save store details. Try again.");
        }
    });
    
   
    loadProducts();
});
