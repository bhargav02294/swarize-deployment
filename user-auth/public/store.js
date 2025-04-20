document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const sellerId = urlParams.get("seller");

  const storeForm = document.getElementById("store-form");
  const storeNameInput = document.getElementById("storeName");
  const storeLogoInput = document.getElementById("storeLogo");
  const storeDescriptionInput = document.getElementById("storeDescription");

  const displaySection = document.getElementById("display-store");
  const storeDisplayName = document.getElementById("store-name");
  const storeDisplayLogo = document.getElementById("store-logo");
  const storeMessage = document.getElementById("store-message");
  const editWarning = document.getElementById("edit-warning");
  const storeHeader = document.getElementById("store-header");
  const productsList = document.getElementById("products-list");
  const addProductBtn = document.getElementById("add-product-btn");
  const storeDescriptionDisplay = document.getElementById("store-description-display");

  if (sellerId) {
    // Public view (store by sellerId)
    try {
      const response = await fetch(`https://swarize-deployment.onrender.com/api/store/public/${sellerId}`);
      const data = await response.json();

      if (data.success && data.store) {
        displayStore(data.store);
        loadProductsPublic(sellerId);
      } else {
        storeMessage.textContent = "❌ Store not found.";
      }
    } catch (error) {
      console.error("❌ Error fetching public store:", error);
      storeMessage.textContent = "❌ Failed to load store.";
    }
  } else {
    // Private view (logged-in user)
    try {
      const response = await fetch("https://swarize-deployment.onrender.com/api/store", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success && data.store) {
        displayStore(data.store, true);
        loadProductsPrivate();
      } else {
        storeForm.style.display = "block";
      }
    } catch (error) {
      console.error("❌ Error fetching store details:", error);
    }

    // Create/submit store form
    storeForm.addEventListener("submit", async (event) => {
      event.preventDefault();

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
          window.location.href = "https://swarize.in/add-product.html";
        } else {
          alert("❌ Error: " + data.message);
        }
      } catch (err) {
        console.error("❌ Error saving store details:", err);
        alert("❌ Failed to save store details.");
      }
    });
  }

  function displayStore(store, isPrivate = false) {
    storeForm.style.display = "none";
    displaySection.style.display = "block";
    storeDisplayName.textContent = store.storeName;

    const logoPath = store.storeLogo.startsWith("uploads/")
      ? `https://swarize-deployment.onrender.com/${store.storeLogo}`
      : store.storeLogo;
    storeDisplayLogo.src = logoPath;

    storeDescriptionDisplay.textContent = store.description;
    storeHeader.style.display = "none";
    editWarning.style.display = "none";

    if (isPrivate) {
      addProductBtn.style.display = "inline-block";
      addProductBtn.addEventListener("click", () => {
        window.location.href = "add-product.html";
      });
      loadProductsPrivate();
    } else {
      addProductBtn.style.display = "none";
    }
  }

  function loadProductsPublic(userId) {
    fetch(`https://swarize-deployment.onrender.com/api/store/products/${userId}`)
      .then(res => res.json())
      .then(data => displayProducts(data.products || []))
      .catch(err => console.error("❌ Error loading public products:", err));
  }

  function loadProductsPrivate() {
    fetch("https://swarize-deployment.onrender.com/api/products", {
      method: "GET",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => displayProducts(data.products || [], true))
      .catch(err => console.error("❌ Error loading products:", err));
  }

  function displayProducts(products, allowDelete = false) {
    productsList.innerHTML = "";
    if (products.length === 0) {
      productsList.innerHTML = "<p>No products listed yet.</p>";
      return;
    }

    products.forEach(product => {
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
          ${allowDelete ? `<button class="delete-btn" data-id="${product._id}">Delete</button>` : ""}
        </div>
      `;

      productsList.appendChild(productItem);
    });

    if (allowDelete) {
      document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", deleteProduct);
      });
    }
  }

  function deleteProduct(event) {
    const productId = event.target.getAttribute("data-id");
    if (!confirm("Are you sure you want to delete this product?")) return;

    fetch(`https://swarize-deployment.onrender.com/api/products/${productId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Product deleted successfully!");
          loadProductsPrivate();
        } else {
          alert("Error deleting product: " + data.message);
        }
      })
      .catch(err => console.error("❌ Error deleting product:", err));
  }
});
