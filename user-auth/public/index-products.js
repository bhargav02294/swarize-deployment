// ================= PRODUCT CAROUSEL + CATEGORY LOADER ================= //
document.addEventListener("DOMContentLoaded", async () => {
  const carouselTrack = document.getElementById("product-track");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");

  const categories = ["Sarees", "Dresses"];

  /* ---------- Safe JSON Parser ---------- */
  async function safeParseJson(response) {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      console.error("⚠️ Invalid JSON:", text.slice(0, 100));
      return {};
    }
  }

  /* ---------- Fetch All Products ---------- */
  async function fetchAllProducts() {
    try {
      const res = await fetch("/api/products/all");
      const data = await safeParseJson(res);
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.products)) return data.products;
      return [];
    } catch (err) {
      console.error("Error fetching all products:", err);
      return [];
    }
  }

  /* ---------- Fetch by Category ---------- */
  async function fetchProductsByCategory(category) {
    try {
      const formatted = encodeURIComponent(category);
      const res = await fetch(`/api/products/category/${formatted}`);
      const data = await safeParseJson(res);
      if (data && Array.isArray(data.products)) return data.products;
      if (Array.isArray(data)) return data;
      return [];
    } catch (err) {
      console.error("Error fetching category:", category, err);
      return [];
    }
  }

  /* ---------- Utility: Image Path Resolver ---------- */
  function resolveImagePath(path) {
    if (!path) return "/assets/img-placeholder.png";
    if (path.startsWith("uploads/") || path.startsWith("/uploads/")) {
      return `https://swarize.in/${path.replace(/^\/+/, "")}`;
    }
    return path;
  }

  /* ---------- Helpers ---------- */
  const formatPrice = p => (p ? Number(p).toLocaleString("en-IN") : "-");
  const escapeHtml = text => String(text || "").replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));

  /* ---------- Render Carousel ---------- */
  async function buildProductCarousel() {
    if (!carouselTrack) return;
    carouselTrack.innerHTML = "";

    const allProducts = await fetchAllProducts();
    if (!allProducts.length) {
      carouselTrack.innerHTML = `<p class="no-products">No products found 🛍️</p>`;
      return;
    }

    allProducts.forEach(prod => {
      const card = document.createElement("div");
      card.classList.add("product-card");
      card.innerHTML = `
        <img src="${resolveImagePath(prod.thumbnailImage)}" alt="${escapeHtml(prod.name)}">
        <div class="product-info">
          <h3>${escapeHtml(prod.name)}</h3>
          <p>₹${formatPrice(prod.price)}</p>
          <button class="quick-view-btn" onclick="viewProduct('${prod._id}')">Quick View</button>
        </div>
      `;
      carouselTrack.appendChild(card);
    });

    // Navigation Buttons
    nextBtn?.addEventListener("click", () =>
      carouselTrack.scrollBy({ left: 300, behavior: "smooth" })
    );
    prevBtn?.addEventListener("click", () =>
      carouselTrack.scrollBy({ left: -300, behavior: "smooth" })
    );

    // Drag Scroll Fix (only product movement)
    let isDown = false;
    let startX;
    let scrollLeft;

    carouselTrack.addEventListener("mousedown", e => {
      isDown = true;
      carouselTrack.classList.add("active");
      startX = e.pageX - carouselTrack.offsetLeft;
      scrollLeft = carouselTrack.scrollLeft;
    });

    carouselTrack.addEventListener("mouseleave", () => (isDown = false));
    carouselTrack.addEventListener("mouseup", () => (isDown = false));

    carouselTrack.addEventListener("mousemove", e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carouselTrack.offsetLeft;
      const walk = (x - startX) * 1.5; // scroll speed
      carouselTrack.scrollLeft = scrollLeft - walk;
    });
  }

  /* ---------- Render Categories (Grid style, optional) ---------- */
  async function buildCategoryGrid() {
    const grid = document.getElementById("products-grid");
    if (!grid) return;

    grid.innerHTML = "";
    for (const category of categories) {
      const products = await fetchProductsByCategory(category);
      if (!products.length) continue;

      const section = document.createElement("section");
      section.classList.add("category-block");
      section.innerHTML = `
        <h2 class="section-title">${category}</h2>
        <div class="carousel-wrapper">
          <button class="carousel-btn prev"><</button>
          <div class="carousel-track inner-track"></div>
          <button class="carousel-btn next">></button>
        </div>
      `;
      grid.appendChild(section);

      const innerTrack = section.querySelector(".inner-track");
      products.slice(0, 10).forEach(prod => {
        const card = document.createElement("div");
        card.classList.add("product-card");
        card.innerHTML = `
          <img src="${resolveImagePath(prod.thumbnailImage)}" alt="${escapeHtml(prod.name)}">
          <div class="product-info">
            <h3>${escapeHtml(prod.name)}</h3>
            <p>₹${formatPrice(prod.price)}</p>
            <button class="quick-view-btn" onclick="viewProduct('${prod._id}')">Quick View</button>
          </div>
        `;
        innerTrack.appendChild(card);
      });
    }
  }

  await Promise.all([
    buildProductCarousel(),
    buildCategoryGrid()
  ]);
});

/* ---------- Global helpers ---------- */
function viewProduct(id) {
  window.location.href = `product-detail.html?id=${id}`;
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
