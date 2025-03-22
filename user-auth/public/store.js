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

    const logoutButton = document.getElementById("logout-btn");

    // ✅ Check if the user is logged in before fetching store details
    try {
        const authResponse = await fetch("https://swarize-deployment.onrender.com/api/auth/is-logged-in", {
            credentials: "include"
        });
        const authData = await authResponse.json();

        if (!authData.isLoggedIn) {
            document.body.innerHTML = `
                <div id="sign-in-message" class="center-message">
                    <h2>You are not signed in! Please sign in to manage your store.</h2>
                    <button onclick="window.location.href='signin.html'">Sign In</button>
                </div>
            `;
            return;
        }

        console.log("✅ User is logged in:", authData);

        // ✅ Fetch store details only if logged in
        fetch("https://swarize-deployment.onrender.com/api/store", { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.store) {
                    storeForm.style.display = "none";
                    displaySection.style.display = "block";
                    storeDisplayName.textContent = data.store.storeName;
                    storeDisplayLogo.src = `https://swarize-deployment.onrender.com/uploads/${data.store.storeLogo}`;
                    storeDescriptionDisplay.textContent = data.store.description;
                    editWarning.style.display = "none";
                    storeHeader.style.display = "none";

                    loadProducts();
                }
            })
            .catch(err => console.error("❌ Error fetching store details:", err));
    } catch (error) {
        console.error("❌ Error checking authentication:", error);
    }

    // ✅ Load Products from API
    function loadProducts() {
        fetch("https://swarize-deployment.onrender.com/api/products", {
            method: "GET",
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                productsList.innerHTML = "";

                if (data.success && data.products.length > 0) {
                    data.products.forEach(product => {
                        const productItem = document.createElement("div");
                        productItem.classList.add("product-item");

                        const imagePath = `https://swarize-deployment.onrender.com/uploads/${product.thumbnailImage}`;

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
    function deleteProduct(event) {
        const productId = event.target.getAttribute("data-id");

        const isConfirmed = confirm("Are you sure you want to delete this product?");
        if (!isConfirmed) return;

        fetch(`https://swarize-deployment.onrender.com/api/products/${productId}`, {
            method: "DELETE",
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Product deleted successfully!");
                    loadProducts();
                } else {
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

        fetch("https://swarize-deployment.onrender.com/api/store", {
            method: "POST",
            body: formData,
            credentials: "include"
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

    // ✅ Logout Function
    logoutButton.addEventListener("click", async () => {
        try {
            const logoutResponse = await fetch("https://swarize-deployment.onrender.com/api/auth/logout", {
                method: "GET",
                credentials: "include"
            });

            if (logoutResponse.ok) {
                console.log("✅ Successfully logged out");
                sessionStorage.clear();
                localStorage.clear();
                window.location.href = "https://swarize.in/index.html";
            } else {
                console.error("❌ Logout failed");
            }
        } catch (error) {
            console.error("❌ Error during logout:", error);
        }
    });

    loadProducts();
});
