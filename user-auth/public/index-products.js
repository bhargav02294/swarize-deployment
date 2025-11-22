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











// ===================== PINTEREST STYLE PRODUCT GRID (Paginated) ===================== //

document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("pinterest-grid");
  const loader = document.getElementById("grid-loader");
  const loadMoreBtn = document.getElementById("load-more-btn");

  let allProducts = [];
  let currentIndex = 0;
  const perPage = 12; // load 12 products at a time

  // Safe JSON parse
  async function safeParseJson(response) {
    const text = await response.text();
    try { return JSON.parse(text); } 
    catch (err) { throw new Error("Invalid JSON"); }
  }

  // Fetch all products
  async function fetchAllProducts() {
    try {
      loader.style.display = "block";
      const res = await fetch("/api/products/all", { method: "GET", credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await safeParseJson(res);
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.products)) return data.products;
      return [];
    } catch (err) {
      console.error("Error loading products:", err);
      return [];
    } finally {
      loader.style.display = "none";
    }
  }

  // Resolve image path
  function resolveImagePath(path) {
    if (!path) return "/assets/img-placeholder.png";
    if (path.startsWith("uploads/") || path.startsWith("/uploads/"))
      return `https://swarize.in/${path.replace(/^\/+/, "")}`;
    return path;
  }

  // Escape HTML
  function escapeHtml(str) {
    return str ? str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
                 .replace(/"/g,"&quot;").replace(/'/g,"&#039;") : "";
  }

  // Format price
  function formatPrice(p) { return p ? Number(p).toLocaleString("en-IN") : "-"; }

  // Render products
  function renderProducts() {
    const productsToShow = allProducts.slice(currentIndex, currentIndex + perPage);
    productsToShow.forEach(product => {
      const imgPath = resolveImagePath(product.thumbnailImage);
      const card = document.createElement("div");
      card.classList.add("pinterest-card");
      card.innerHTML = `
        <img src="${imgPath}" alt="${escapeHtml(product.name)}" loading="lazy" onclick="viewProduct('${product._id}')">
        <div class="price-overlay">₹${formatPrice(product.price)}</div>
      `;
      gridContainer.appendChild(card);
    });
    currentIndex += perPage;

    // Hide Load More button if all loaded
    if (currentIndex >= allProducts.length) loadMoreBtn.style.display = "none";
  }

  // Load initial products
  async function init() {
    allProducts = await fetchAllProducts();
    if (!allProducts || allProducts.length === 0) {
      gridContainer.innerHTML = "<p>No products available 🛍️</p>";
      loadMoreBtn.style.display = "none";
      return;
    }
    renderProducts();
  }

  // Load more products
  loadMoreBtn.addEventListener("click", () => { renderProducts(); });

  // Global redirect function
  window.viewProduct = function(id) {
    window.location.href = `product-detail.html?id=${id}`;
  };

  init();
});



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
  











// CURSOR
// CUSTOM CURSOR FIXED
const cursor = document.querySelector('.cursor');

document.addEventListener('pointermove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

// OPTIONAL: click expand animation
document.addEventListener('pointerdown', () => cursor.classList.add('cursor--big'));
document.addEventListener('pointerup', () => cursor.classList.remove('cursor--big'));

// LOGIN DROPDOWN toggle
document.querySelectorAll('.login-toggle').forEach(btn=>{
  btn.addEventListener('click', e=>{
    e.stopPropagation();
    const parent = btn.closest('.login-dropdown');
    parent.classList.toggle('open');
  });
});
document.addEventListener('click', ()=> document.querySelectorAll('.login-dropdown.open').forEach(d=> d.classList.remove('open')));



function goToSlide(index) {
  slides[currentIndex].classList.remove("active");
  dots[currentIndex].classList.remove("active");

  currentIndex = index;

  slides[currentIndex].classList.add("active");
  dots[currentIndex].classList.add("active");

  // restart dot timer animation
  dots.forEach(dot => dot.style.animation = "none");
  void dots[currentIndex].offsetWidth;
}



// Basic floating animation for images
document.querySelectorAll('.category-image img').forEach(img => {
  let offset = 0;
  setInterval(() => {
    offset += 0.03;
    img.style.transform = `translateY(${Math.sin(offset) * 5}px) scale(1)`;
  }, 30);
});





