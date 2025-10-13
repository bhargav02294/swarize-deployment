// ================= PRODUCT LOADER & CAROUSEL ================= //

document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const productsGrid = document.getElementById("products-grid");
  const carouselTrack = document.getElementById("product-track"); // if you have a carousel track element
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");

  // Categories for the grid view
  const categories = ["Women", "Men", "Kids", "Accessories"];

  /* ----------------------
     Utility: Safe JSON parse
     ---------------------- */
  async function safeParseJson(response) {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      // Not JSON (likely HTML error page)
      throw new Error("Server did not return JSON. Response text length: " + text.length);
    }
  }

  /* -----------------------------------------
     Function: fetchAllProducts (for main slider)
     Endpoint: GET /api/products/all
     Returns: array of products (or empty array)
     ----------------------------------------- */
  async function fetchAllProducts() {
    try {
      const res = await fetch("/api/products/all", {
        method: "GET",
        credentials: "include" // in case your server uses session cookies
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch all products: ${res.status} ${res.statusText}`);
      }

      // parse safely
      const data = await safeParseJson(res);

      // Your /api/products/all route returns an array (based on routes/product.js)
      if (Array.isArray(data)) return data;

      // If server unexpectedly wrapped it, handle common wrapper shapes:
      if (data && Array.isArray(data.products)) return data.products;
      if (data && data.success && Array.isArray(data.products)) return data.products;

      // otherwise return empty
      return [];
    } catch (err) {
      console.error("Error fetching all products:", err);
      return [];
    }
  }

  /* -----------------------------------------
     Function: fetchProducts (by category)
     Endpoint: GET /api/products/category/:category
     Returns: array (or empty)
     ----------------------------------------- */
  async function fetchProductsByCategory(category) {
    try {
      const formatted = encodeURIComponent(category);
      const res = await fetch(`/api/products/category/${formatted}`, {
        method: "GET",
        credentials: "include"
      });

      if (!res.ok) {
        console.warn(`Category fetch returned ${res.status} for ${category}`);
        return [];
      }

      const data = await safeParseJson(res);

      // your category endpoints return { success: true, products }
      if (data && Array.isArray(data.products)) return data.products;
      // fallback if returned array directly
      if (Array.isArray(data)) return data;

      return [];
    } catch (err) {
      console.error(`Error fetching products for category ${category}:`, err);
      return [];
    }
  }

  /* -----------------------------------------
     Helper: Resolve image path (uploads vs full URL)
     ----------------------------------------- */
  function resolveImagePath(imagePath) {
    if (!imagePath) return "/assets/img-placeholder.png"; // fallback placeholder
    if (typeof imagePath !== "string") return "/assets/img-placeholder.png";
    if (imagePath.startsWith("uploads/") || imagePath.startsWith("/uploads/")) {
      // adjust to your domain
      return `https://swarize.in/${imagePath.replace(/^\/+/, "")}`;
    }
    return imagePath; // already a URL (cloudinary, S3 etc.)
  }

  /* -----------------------------------------
     UI: Render Category Grid Sections
     ----------------------------------------- */
  function createCategorySection(category, products) {
    const categorySection = document.createElement("div");
    categorySection.classList.add("category-section");
    categorySection.innerHTML = `<h3>${category}</h3><div class="category-products"></div>`;

    const productRow = categorySection.querySelector(".category-products");

    products.forEach(product => {
      const imagePath = resolveImagePath(product.thumbnailImage);

      const productItem = document.createElement("div");
      productItem.classList.add("product-card");
      productItem.innerHTML = `
        <img src="${imagePath}" alt="${escapeHtml(product.name)} - Buy online at Swarize" class="product-image" onclick="viewProduct('${product._id}')">
        <h4>${escapeHtml(product.name)}</h4>
        <p class="product-price">₹${formatPrice(product.price)}</p>
        <div class="star-rating">★★★★★</div>
        <button class="cart-button" onclick="addToCart('${product._id}')">🛒</button>
      `;
      productRow.appendChild(productItem);
    });

    return categorySection;
  }

  /* -----------------------------------------
     Small helpers: formatPrice & escapeHtml
     ----------------------------------------- */
  function formatPrice(p) {
    if (p === null || p === undefined) return "-";
    if (typeof p === "number") return p.toLocaleString("en-IN");
    // if saved as string already
    return Number(p).toLocaleString("en-IN");
  }

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* -----------------------------------------
     Load grid categories (existing behaviour)
     ----------------------------------------- */
  async function loadCategoryGrid() {
    if (!productsGrid) return;
    productsGrid.innerHTML = "";

    for (let i = 0; i < categories.length; i += 2) {
      const row = document.createElement("div");
      row.classList.add("product-row");

      // First category
      const category1 = categories[i];
      const products1 = await fetchProductsByCategory(category1);
      const categorySection1 = createCategorySection(category1, products1.slice(0, 6)); // limit per section
      row.appendChild(categorySection1);

      // Second category (if exists)
      if (i + 1 < categories.length) {
        const category2 = categories[i + 1];
        const products2 = await fetchProductsByCategory(category2);
        const categorySection2 = createCategorySection(category2, products2.slice(0, 6));
        row.appendChild(categorySection2);
      }

      productsGrid.appendChild(row);
    }
  }

  /* -----------------------------------------
     Build Carousel from all products
     ----------------------------------------- */
  async function buildProductCarousel() {
    if (!carouselTrack) return;
    carouselTrack.innerHTML = "";

    const allProducts = await fetchAllProducts();
    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      carouselTrack.innerHTML = `<p class="no-products">No products found 🛍️</p>`;
      return;
    }

    // render cards
    allProducts.forEach(prod => {
      const card = document.createElement("div");
      card.classList.add("product-card");
      const imagePath = resolveImagePath(prod.thumbnailImage);

      card.innerHTML = `
        <img src="${imagePath}" alt="${escapeHtml(prod.name)}" />
        <div class="product-info">
          <h3>${escapeHtml(prod.name)}</h3>
          <p>₹${formatPrice(prod.price)}</p>
          <button class="quick-view-btn" onclick="viewProduct('${prod._id}')">Quick View</button>
        </div>
      `;
      carouselTrack.appendChild(card);
    });

    // wire up arrow buttons if present
    if (nextBtn) {
      nextBtn.onclick = () => carouselTrack.scrollBy({ left: 300, behavior: "smooth" });
    }
    if (prevBtn) {
      prevBtn.onclick = () => carouselTrack.scrollBy({ left: -300, behavior: "smooth" });
    }
  }

  /* -----------------------------------------
     Initialize: load both grid and carousel
     ----------------------------------------- */
  await Promise.all([
    loadCategoryGrid(),
    buildProductCarousel()
  ]);
});

/* ============================
   Existing global helpers (keep)
   ============================ */

// ✅ Function to view product details
function viewProduct(productId) {
  window.location.href = `product-detail.html?id=${productId}`;
}

// ✅ Function to add product to cart
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
      console.log(" Product added to cart");
      window.location.href = `addtocart.html?id=${productId}`;
    } else {
      alert(" Failed to add product to cart: " + (data.message || "Unknown error"));
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert(" Error adding product to cart.");
  }
}









/*
//-------------home section image slider-------------------//

document.addEventListener("DOMContentLoaded", function () {
    const slider = document.querySelector(".slider");
    const slides = document.querySelectorAll(".slide");
    let currentIndex = 0;

    function showNextSlide() {
        currentIndex++;
        if (currentIndex >= slides.length) {
            currentIndex = 0; // Loop back
        }
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    setInterval(showNextSlide, 5000); // 5 seconds per slide
});

*/



document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  const dotsContainer = document.querySelector(".slider-dots");
  let currentIndex = 0;

  // Create dots dynamically
  slides.forEach((_, idx) => {
    const dot = document.createElement("button");
    dot.addEventListener("click", () => goToSlide(idx));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll("button");
  dots[0].classList.add("active");

  function goToSlide(index) {
    slides[currentIndex].classList.remove("active");
    dots[currentIndex].classList.remove("active");
    currentIndex = index;
    slides[currentIndex].classList.add("active");
    dots[currentIndex].classList.add("active");
  }

  function nextSlide() {
    let next = (currentIndex + 1) % slides.length;
    goToSlide(next);
  }

  setInterval(nextSlide, 5000); // Auto slide every 5s
});

// Category-style redirection for hero buttons
function openSection(section) {
  window.location.href = `section.html?section=${section}`;
}











document.addEventListener("DOMContentLoaded", () => {
  const productTrack = document.getElementById("product-track");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");

  // Example demo data (replace this with your fetched data)
  const products = [
    {
      id: 1,
      name: "Elegant Red Saree",
      price: "₹2,499",
      thumbnailImage: "https://images.unsplash.com/photo-1659293554631-d7a38642c5e3?auto=format&fit=crop&q=60&w=600"
    },
    {
      id: 2,
      name: "Chic Floral Dress",
      price: "₹1,999",
      thumbnailImage: "https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&q=60&w=600"
    },
    {
      id: 3,
      name: "Festive Gold Saree",
      price: "₹3,299",
      thumbnailImage: "https://plus.unsplash.com/premium_photo-1682090864876-c452a35292cb?auto=format&fit=crop&q=60&w=600"
    },
    {
      id: 4,
      name: "Everyday Elegance Kurti",
      price: "₹899",
      thumbnailImage: "https://plus.unsplash.com/premium_photo-1661369481899-6ce99b916223?auto=format&fit=crop&q=60&w=600"
    },
    {
      id: 5,
      name: "Modern Black Dress",
      price: "₹1,599",
      thumbnailImage: "https://images.unsplash.com/photo-1520975922131-a07b84c77b72?auto=format&fit=crop&q=60&w=600"
    },
  ];

  // Render products dynamically
  products.forEach(prod => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${prod.thumbnailImage}" alt="${prod.name}">
      <div class="product-info">
        <h3>${prod.name}</h3>
        <p>${prod.price}</p>
        <button class="quick-view-btn" onclick="viewProduct(${prod.id})">Quick View</button>
      </div>
    `;
    productTrack.appendChild(card);
  });

  // Scroll controls
  nextBtn.addEventListener("click", () => {
    productTrack.scrollBy({ left: 300, behavior: "smooth" });
  });

  prevBtn.addEventListener("click", () => {
    productTrack.scrollBy({ left: -300, behavior: "smooth" });
  });
});

// ✅ Redirect to product detail
function viewProduct(productId) {
  window.location.href = `product-detail.html?id=${productId}`;
}















document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const subcategory = params.get("subcategory");

    console.log("Selected subcategory:", subcategory);

    // ❗ Define the buttons and dropdowns correctly
    const categoryButtons = document.querySelectorAll(".category-btn");
    const dropdowns = document.querySelectorAll(".subcategory-list");

    categoryButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const dropdown = button.nextElementSibling;

            // Close other dropdowns
            dropdowns.forEach((drop) => {
                if (drop !== dropdown) {
                    drop.style.display = "none";
                    drop.style.opacity = "0";
                }
            });

            // Toggle this dropdown
            if (dropdown.style.display === "flex") {
                dropdown.style.display = "none";
                dropdown.style.opacity = "0";
            } else {
                dropdown.style.display = "flex";
                dropdown.style.opacity = "1";
            }
        });
    });

    // Close dropdowns on outside click
    document.addEventListener("click", () => {
        dropdowns.forEach((dropdown) => {
            dropdown.style.display = "none";
            dropdown.style.opacity = "0";
        });
    });

    // Prevent closing when clicking inside the dropdown
    dropdowns.forEach((dropdown) => {
        dropdown.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    });
});





//==================     sign in sign up CHECK      ==============================//

document.addEventListener("DOMContentLoaded", function () {
    console.log(" JavaScript loaded!");

    // Check if on the signup page
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        console.log(" Signup form found. Running signup script.");
        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const name = document.getElementById("signup-name").value.trim();
            const email = document.getElementById("signup-email").value.trim();
            const password = document.getElementById("signup-password").value.trim();

            if (!name || !email || !password) {
                alert(" All fields are required!");
                return;
            }

            try {
                const response = await fetch("https://swarize.in/api/auth/signup", { 
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password, authMethod: "email" })
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    alert(" Signup successful! Redirecting...");
                    window.location.href = "signin.html";
                } else {
                    alert(result.message || " Signup failed. Try again.");
                }
            } catch (error) {
                console.error("Error during signup:", error);
                alert("Something went wrong. Please try again.");
            }
        });
    }

    // Check if on the sign-in page
    const signinForm = document.getElementById("signin-form");
    if (signinForm) {
        console.log(" Sign-in form found. Running signin script.");
        signinForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById("signin-email").value.trim();
            const password = document.getElementById("signin-password").value.trim();

            if (!email || !password) {
                alert(" Please enter both email and password!");
                return;
            }

            try {
                const response = await fetch("https://swarize.in/api/auth/signin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    alert(" Sign-in successful!");
                    window.location.href = "index.html";
                } else {
                    alert(data.message || "Failed to sign in.");
                }
            } catch (error) {
                console.error("Error during sign-in:", error);
                alert(" Something went wrong. Please try again.");
            }
        });
    }

    // Hide unnecessary warnings on pages without forms
    if (!signupForm && !signinForm) {
        console.log(" No signup or signin forms found. Skipping authentication script.");
    }
});








// File: public/js/index-products.js

document.addEventListener('DOMContentLoaded', () => {
    // Sirf un pages par run karo jahan <div id="product-container"> ho
    const productContainer = document.getElementById('product-container');
    if (!productContainer) return;  // Agar container na mile, script skip karo
  
    // Subcategory links ko select karo
    const subcategoryLinks = document.querySelectorAll('.subcategory-list a');
  
    subcategoryLinks.forEach(link => {
      link.addEventListener('click', async event => {
        event.preventDefault();
  
        // URL se subcategory value lo
        const subcategory = new URL(link.href, location.href).searchParams.get('subcategory');
        // Filhaal women's store hardcode kiya hae catei; agar multiplgories ho, 
        // tab dynamic mapping laga sakte ho
        const category = "Women's Store";
  
        try {
          // Correct backend route hit karna
          const res = await fetch(
            `/api/products/category/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}`
          );
          const data = await res.json();
  
          if (data.success) {
            renderProducts(data.products);
          } else {
            productContainer.innerHTML = '<p>No products found.</p>';
          }
        } catch (err) {
          console.error('Error fetching products:', err);
          productContainer.innerHTML = '<p>Error fetching products. Please try again later.</p>';
        }
      });
    });
  
    // Products ko page par render karne wali function
    function renderProducts(products) {
      productContainer.innerHTML = '';  // Clear previous content
  
      if (!products.length) {
        productContainer.innerHTML = '<p>No products found.</p>';
        return;
      }
  
      products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="${p.thumbnailImage}" alt="${p.name}" class="product-image">
          <h3>${p.name}</h3>
          <p>₹${p.price}</p>
          <p>${p.description.slice(0, 60)}…</p>
        `;
        productContainer.appendChild(card);
      });
    }
  });
  






//=========       product slider          ============//
async function fetchProducts() {
  try {
    const res = await fetch('/api/products/all');
    const products = await res.json();

    const slider = document.getElementById('productSlider');
    slider.innerHTML = '';

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'slider-card';
     card.innerHTML = `
  <a href="/product-detail.html?id=${product._id}" style="text-decoration: none; color: inherit;">
    <img src="${product.thumbnailImage}" alt="${product.name}">
    <div class="product-card-content">
      <h4>${product.name}</h4>
      <p class="product-price">₹${product.price}</p>
    </div>
  </a>
`;

      slider.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading products:', err);
  }
}
fetchProducts();







async function fetchReversedProducts() {
  try {
    const res = await fetch('/api/products/all');
    const products = await res.json();

    const slider = document.getElementById('reversedProductSlider');
    slider.innerHTML = '';

    products.reverse().forEach(product => {
      const card = document.createElement('div');
      card.className = 'slider-card';
      
       card.innerHTML = `
  <a href="/product-detail.html?id=${product._id}" style="text-decoration: none; color: inherit;">
    <img src="${product.thumbnailImage}" alt="${product.name}">
    <div class="product-card-content">
      <h4>${product.name}</h4>
      <p class="product-price">₹${product.price}</p>
    </div>
  </a>
`;

      slider.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading reversed products:', err);
  }
}
fetchReversedProducts();
