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

















/* ============================================
   FIRST SECTION — Saree (same layout)
=============================================== */


document.addEventListener("DOMContentLoaded", async () => {
  const track = document.getElementById("trending-track");
  if (!track) return;

  // Safe JSON fetch/parser
  async function fetchProducts() {
    try {
      const res = await fetch("/api/products/all");
      const text = await res.text();
      try { return JSON.parse(text); }
      catch { 
        // fallback if endpoint returns {products:[]}
        try { return JSON.parse(text).products || []; } catch { return []; }
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
      return [];
    }
  }

  function resolveImagePath(path) {
    if (!path) return "/assets/img-placeholder.png";
    if (typeof path === "string" && (path.startsWith("uploads/") || path.startsWith("/uploads/"))) {
      return `https://swarize.in/${path.replace(/^\/+/, "")}`;
    }
    return path;
  }

  // Build the 3 big cards
  const all = await fetchProducts();
  const selected = (Array.isArray(all) ? all : (Array.isArray(all.products) ? all.products : [])).slice(0, 3);

  // Fallback dummy if no products
  if (!selected.length) {
    track.innerHTML = `
      <div class="big-card">
        <div class="card-media"><img src="/assets/img-placeholder.png" alt="No product"></div>
        <div class="card-info"><h3>No products found</h3><div class="price">—</div></div>
      </div>`;
    return;
  }

  track.innerHTML = selected.map(p => {
    const img = resolveImagePath(p.thumbnailImage || p.image || "");
    const safeName = (p.name || "Product").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const price = p.price ? Number(p.price).toLocaleString("en-IN") : "-";
    return `
      <div class="big-card" role="link" tabindex="0" data-id="${p._id}">
        <div class="card-media">
          <img src="${img}" alt="${safeName}">
        </div>
        <div class="card-info">
          <h3>${safeName}</h3>
          <div class="price">₹${price}</div>
          <div class="cta">Tap to view details</div>
        </div>
      </div>`;
  }).join("");

  // Make whole card clickable and keyboard accessible
  track.querySelectorAll(".big-card").forEach(card => {
    card.addEventListener("click", e => {
      const id = card.dataset.id;
      if (id) window.location.href = `product-detail.html?id=${id}`;
    });
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        const id = card.dataset.id;
        if (id) window.location.href = `product-detail.html?id=${id}`;
      }
    });
  });
});






/* ============================================
   SECOND SECTION — DRESSES (same layout)
=============================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const sareeTrack = document.getElementById("saree-track");
  const dressTrack = document.getElementById("dress-track");

  // ----------- Fetch All Products -----------
  async function fetchProducts() {
    try {
      const res = await fetch("/api/products/all");
      const text = await res.text();

      try { return JSON.parse(text); }
      catch {
        try { return JSON.parse(text).products || []; }
        catch { return []; }
      }
    } catch {
      return [];
    }
  }

  function resolveImage(path) {
    if (!path) return "/assets/img-placeholder.png";
    if (path.startsWith("uploads/") || path.startsWith("/uploads/"))
      return `https://swarize.in/${path.replace(/^\/+/, "")}`;
    return path;
  }

  function formatPrice(p) {
    return p ? Number(p).toLocaleString("en-IN") : "-";
  }

  // ----------- Build Cards -----------
  function buildCards(track, products) {
    if (!track) return;

    if (!products.length) {
      track.innerHTML = `<p style="color:#fff;">No products found</p>`;
      return;
    }

    track.innerHTML = products.map(p => {
      const img = resolveImage(p.thumbnailImage);
      const name = (p.name || "").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const price = formatPrice(p.price);

      return `
        <div class="big-card" data-id="${p._id}">
          <div class="card-media">
            <img src="${img}" alt="${name}">
          </div>

          <div class="card-info">
            <h3>${name}</h3>
            <div class="price">₹${price}</div>
            <div class="cta">See Details</div>
          </div>
        </div>
      `;
    }).join("");

    // Make cards clickable
    track.querySelectorAll(".big-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        if (id) window.location.href = `product-detail.html?id=${id}`;
      });
    });
  }

  // ----------- Main Logic -----------
  const all = await fetchProducts();

  const sarees = all.filter(p => (p.category || "").toLowerCase().includes("saree")).slice(0, 3);
  const dresses = all.filter(p => (p.category || "").toLowerCase().includes("dress")).slice(0, 3);

  buildCards(sareeTrack, sarees);
  buildCards(dressTrack, dresses);
});











// ===================== PINTEREST STYLE PRODUCT GRID (Paginated) ===================== //
// ======= Pinterest - Premium Renderer ==========
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("pinterest-grid");
  const loader = document.getElementById("grid-loader");
  const loadMoreBtn = document.getElementById("load-more-btn");

  let allProducts = [];
  let index = 0;
  const perPage = 12; // change as needed
  let isLoading = false;

  // safe JSON parse
  async function safeParse(res) {
    const text = await res.text();
    try { return JSON.parse(text); } catch { return {}; }
  }

  // resolves image path (use your resolveImagePath from elsewhere if available)
  function resolveImagePath(path) {
    if (!path) return "/assets/img-placeholder.png";
    if (path.startsWith("uploads/") || path.startsWith("/uploads/")) {
      return `https://swarize.in/${path.replace(/^\/+/, "")}`;
    }
    return path;
  }

  function formatPrice(p) { return p ? Number(p).toLocaleString("en-IN") : "-"; }

  // render a batch of products
  function renderBatch() {
    const slice = allProducts.slice(index, index + perPage);
    if (!slice.length) {
      loadMoreBtn.style.display = "none";
      return;
    }

    const frag = document.createDocumentFragment();
    slice.forEach((prod, i) => {
      const card = document.createElement("article");
      card.className = "pinterest-card reveal";
      card.setAttribute("tabindex", "0");
      card.dataset.id = prod._id || "";

      // Use a low-quality placeholder if available (thumbnailImageLow) else tiny blurred inline
      const full = resolveImagePath(prod.thumbnailImage || prod.image || "");
      const lq = prod.thumbnailLow || prod.blurDataURL || "";

      // structure
      card.innerHTML = `
        <div class="wish" aria-hidden="true">♡</div>
        <img data-src="${full}" src="${lq || ''}" alt="${escapeHtml(prod.name || 'Product')}" loading="lazy">
        
        <div class="price-chip">₹${formatPrice(prod.price)}</div>
      `;

      // attach click => open product (no button)
      card.addEventListener("click", (e) => {
        if (e.target.closest('.wish')) {
          // wishlist toggle (visual only)
          card.querySelector('.wish').textContent = card.querySelector('.wish').textContent === '♥' ? '♡' : '♥';
          card.querySelector('.wish').classList.toggle('active');
          return;
        }
        window.location.href = `product-detail.html?id=${prod._id}`;
      });

      // ensure keyboard accessible
      card.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") card.click();
      });

      frag.appendChild(card);
    });

    grid.appendChild(frag);
    index += perPage;
    attachLazyAndReveal();
  }

  // Lazy load images + progressive blur -> full
  function attachLazyAndReveal() {
    const imgs = grid.querySelectorAll('img[data-src]');
    const options = { rootMargin: '200px 0px', threshold: 0.01 };

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const src = img.dataset.src;
        if (!src) { obs.unobserve(img); return; }

        // preload full image
        const full = new Image();
        full.src = src;
        full.onload = () => {
          img.style.transition = 'filter 400ms ease, transform 500ms';
          img.src = src;
          img.style.filter = 'none';
        };
        obs.unobserve(img);
      });
    }, options);

    imgs.forEach(img => {
      // make placeholder look blur if it's a data url or small image
      img.style.filter = img.src ? 'blur(8px) saturate(.9)' : 'blur(10px)';
      io.observe(img);
    });

    // reveal animation observer (stagger)
    const reveals = grid.querySelectorAll('.reveal:not(.in-view)');
    let delay = 0;
    reveals.forEach(el => {
      setTimeout(() => el.classList.add('in-view'), delay);
      delay += 60;
    });

    // attach tilt / mouse parallax per card
    grid.querySelectorAll('.pinterest-card').forEach(card => {
      if (card.dataset.tiltAttached) return;
      card.dataset.tiltAttached = '1';
      card.addEventListener('pointermove', handleTilt);
      card.addEventListener('pointerleave', resetTilt);
      function handleTilt(e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const tiltX = (py - 0.5) * 6; // tilt intensity
        const tiltY = (px - 0.5) * -8;
        card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px) scale(1.01)`;
        card.classList.add('tilt');
      }
      function resetTilt() {
        card.style.transform = '';
        card.classList.remove('tilt');
      }
    });
  }

  // fetch all products once
  async function fetchAll() {
    try {
      loader.style.display = 'block';
      isLoading = true;
      const res = await fetch('/api/products/all', { credentials: 'include' });
      const data = await safeParse(res);
      // support different shapes returned from backend
      if (Array.isArray(data)) allProducts = data;
      else if (data && Array.isArray(data.products)) allProducts = data.products;
      else allProducts = [];

      // if there are lots of products, randomize heights lightly for Pinterest feel
      allProducts = allProducts.map((p, i) => {
        // Keep original, but add tiny random factor used by CSS heights if needed
        p._rnd = 0.9 + Math.random() * 0.5; // use to vary height if desired
        return p;
      });

      renderBatch();
      // enable infinite scroll
      observeScroll();
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      isLoading = false;
      loader.style.display = 'none';
    }
  }

  // Infinite scroll: when user scrolls near bottom of grid, load next batch
  function observeScroll() {
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    grid.parentElement.appendChild(sentinel);

    const io = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting && !isLoading && index < allProducts.length) {
          isLoading = true;
          renderBatch();
          isLoading = false;
        }
      });
    }, { root: null, rootMargin: '800px 0px' });

    io.observe(sentinel);
  }

  // Load more button
  loadMoreBtn.addEventListener('click', () => {
    if (!isLoading) renderBatch();
  });

  // small utility to escape HTML
  function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g, c=>{
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  // init
  fetchAll();
});











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



