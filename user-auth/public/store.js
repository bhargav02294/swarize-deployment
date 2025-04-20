document.addEventListener("DOMContentLoaded", async () => {
  const storeForm = document.getElementById("store-form");
  const storeNameInput = document.getElementById("storeName");
  const storeLogoInput = document.getElementById("storeLogo");
  const storeDescriptionInput = document.getElementById("storeDescription");

  const displaySection = document.getElementById("display-store");
  const storeDisplayName = document.getElementById("store-name");
  const storeDisplayLogo = document.getElementById("store-logo");
  const storeDescriptionDisplay = document.getElementById("store-description-display");
  const productsList = document.getElementById("products-list");
  const addProductBtn = document.getElementById("add-product-btn");

  const sellerId = new URLSearchParams(window.location.search).get("seller");

  if (sellerId) {
    // Public store
    fetch(`https://swarize-deployment.onrender.com/api/store/public/${sellerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showStore(data.store);
          fetchProducts(sellerId, false);
        }
      });
  } else {
    // Logged-in user store
    fetch("https://swarize-deployment.onrender.com/api/store", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showStore(data.store, true);
          fetchProducts("", true);
        } else {
          storeForm.style.display = "block";
        }
      });

    storeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append("storeName", storeNameInput.value);
      formData.append("storeLogo", storeLogoInput.files[0]);
      formData.append("storeDescription", storeDescriptionInput.value);

      const res = await fetch("https://swarize-deployment.onrender.com/api/store", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        alert("✅ Store saved!");
        location.reload();
      } else {
        alert("❌ " + data.message);
      }
    });
  }

  function showStore(store, isPrivate = false) {
    storeForm.style.display = "none";
    displaySection.style.display = "block";
    storeDisplayName.textContent = store.storeName;
    storeDescriptionDisplay.textContent = store.description;
    storeDisplayLogo.src = `https://swarize-deployment.onrender.com/uploads/${store.storeLogo}`;

    if (isPrivate) {
      addProductBtn.style.display = "inline-block";
      addProductBtn.onclick = () => (window.location.href = "add-product.html");
    }
  }

  function fetchProducts(userId, isPrivate) {
    const url = isPrivate
      ? "https://swarize-deployment.onrender.com/api/products"
      : `https://swarize-deployment.onrender.com/api/store/products/${userId}`;

    fetch(url, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        productsList.innerHTML = "";
        if (data.products?.length) {
          data.products.forEach((product) => {
            const productEl = document.createElement("div");
            productEl.innerHTML = `
              <div>
                <img src="https://swarize-deployment.onrender.com/uploads/${product.thumbnailImage}" width="100" />
                <h4>${product.name}</h4>
                <p>₹${product.price}</p>
              </div>
            `;
            productsList.appendChild(productEl);
          });
        } else {
          productsList.innerHTML = "<p>No products yet.</p>";
        }
      });
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
  