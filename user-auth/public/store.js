document.addEventListener("DOMContentLoaded", async () => {
  const storeForm = document.getElementById("store-form");
  const storeNameInput = document.getElementById("name");
  const storeLogoInput = document.getElementById("logo");
  const storeDescriptionInput = document.getElementById("description");

  const displaySection = document.getElementById("display-store");
  const storeDisplayName = document.getElementById("store-name");
  const storeDisplayLogo = document.getElementById("store-logo");
  const storeDescriptionDisplay = document.getElementById("store-description-display");
  const productsList = document.getElementById("products-list");

  try {
      const response = await fetch("https://swarize-deployment.onrender.com/api/store", { credentials: "include" });
      const data = await response.json();

      if (data.success && data.store) {
          storeForm.style.display = "none";
          displaySection.style.display = "block";
          storeDisplayName.textContent = data.store.storeName;
          storeDisplayLogo.src = data.store.storeLogo;
          storeDescriptionDisplay.textContent = data.store.description;
          loadProducts();
      }
  } catch (error) {
      console.error("❌ Error fetching store details:", error);
  }

  function loadProducts() {
      fetch("https://swarize-deployment.onrender.com/api/store/products", { credentials: "include" })
          .then((res) => res.json())
          .then((data) => {
              if (!productsList) return;

              productsList.innerHTML = "";
              if (data.success && data.products.length > 0) {
                  data.products.forEach((product) => {
                      const productItem = document.createElement("div");
                      productItem.classList.add("product-item");

                      productItem.innerHTML = `
                          <div class="product-card">
                              <img src="https://swarize-deployment.onrender.com/${product.thumbnailImage}" alt="${product.name}" class="product-image">
                              <h4>${product.name}</h4>
                              <p>Price: ₹${product.price}</p>
                              <button class="delete-btn" data-id="${product._id}">Delete</button>
                          </div>
                      `;
                      productsList.appendChild(productItem);
                  });
              } else {
                  productsList.innerHTML = "<p>No products listed yet.</p>";
              }
          })
          .catch((err) => console.error("❌ Error loading products:", err));
  }

  if (storeForm) {
      storeForm.addEventListener("submit", async (event) => {
          event.preventDefault();

          if (!storeNameInput.value || !storeLogoInput.files[0] || !storeDescriptionInput.value) {
              alert("❌ Store name, logo, and description are required!");
              return;
          }

          const formData = new FormData();
          formData.append("storeName", storeNameInput.value);
          formData.append("storeLogo", storeLogoInput.files[0]);
          formData.append("description", storeDescriptionInput.value);

          try {
              const response = await fetch("https://swarize-deployment.onrender.com/api/store", {
                  method: "POST",
                  credentials: "include",
                  body: formData,
              });

              const data = await response.json();

              if (data.success) {
                  alert("✅ Store created successfully!");
                  window.location.href = "addproducts.html";
              } else {
                  alert("❌ Error: " + data.message);
              }
          } catch (err) {
              console.error("❌ Error saving store details:", err);
              alert("❌ Server error. Please try again later.");
          }
      });
  }
});
