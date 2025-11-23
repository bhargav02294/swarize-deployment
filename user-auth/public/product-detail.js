// product-detail.js
// Cleaned product detail logic — uses existing backend endpoints exactly as provided.

document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://swarize.in";

  // helpers
  const $ = id => document.getElementById(id);
  const qs = sel => Array.from(document.querySelectorAll(sel));

  // DOM
  const mediaSlider = $("media-slider");
  const thumbs = $("thumbs");
  const prevBtn = $("prevBtn");
  const nextBtn = $("nextBtn");

  const nameEl = $("preview-name");
  const priceEl = $("preview-price");
  const displayPriceEl = $("preview-display-price");
  const productCodeEl = $("preview-product-code");
  const categoryEl = $("preview-category");
  const subcategoryEl = $("preview-subcategory");
  const colorEl = $("preview-color");
  const sizeEl = $("preview-size");
  const sareeSizeEl = $("preview-saree-size");
  const blouseSizeEl = $("preview-blouse-size");

  const descToggle = $("toggle-desc-btn");
  const descLess = $("toggle-less-btn");
  const descContent = $("desc-summary-content");

  const mobileAddCart = $("mobileAddCart");
  const mobileBuyNow = $("mobileBuyNow");
  const panelAddCart = $("panelAddCart");
  const panelBuyNow = $("panelBuyNow");
  const panelPrice = $("panelPrice");
  const panelDisplayPrice = $("panel-display-price");

  const panelStoreLink = $("panel-store-link");
  const storeLink = $("store-link");

  const sizeChartBtn = $("size-chart-btn");
  const sizeChartModal = $("size-chart-modal");
  const sizeChartOverlay = $("size-chart-overlay");
  const sizeChartContent = $("size-chart-content");
  const closeSizeChart = $("close-size-chart");

  const reviewsContainer = $("reviews-container");
  const submitReviewBtn = $("submit-review");
  const ratingEl = $("rating");
  const commentEl = $("comment");
  const reviewMessage = $("review-message");

  // mobile menu
  const mobileMenuToggle = $("mobileMenuToggle");
  const mobileMenu = $("mobileMenu");
  const mobileMenuClose = $("mobileMenuClose");

  // parse product id
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  if (!productId) {
    document.body.innerHTML = "<h2>No product ID provided.</h2>";
    return;
  }

  // safety: modal hidden by default (CSS .hidden); ensure hidden at start
  sizeChartModal.classList.add("hidden");
  sizeChartOverlay.classList.add("hidden");

  // mobile menu toggles
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("open");
      mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
      mobileMenuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      mobileMenu.setAttribute("aria-hidden", "true");
    });
  }

  // gallery navigation
  let currentSlide = 0;
  function goToSlide(index) {
    const total = mediaSlider.children.length;
    if (!total) return;
    currentSlide = Math.max(0, Math.min(index, total - 1));
    const width = mediaSlider.offsetWidth || mediaSlider.getBoundingClientRect().width;
    mediaSlider.style.transform = `translateX(-${width * currentSlide}px)`;
    qs(".thumb").forEach((t, i) => t.classList.toggle("active", i === currentSlide));
  }
  prevBtn?.addEventListener("click", () => goToSlide(currentSlide - 1));
  nextBtn?.addEventListener("click", () => goToSlide(currentSlide + 1));
  window.addEventListener("resize", () => goToSlide(currentSlide));
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goToSlide(currentSlide - 1);
    if (e.key === "ArrowRight") goToSlide(currentSlide + 1);
  });

  // description toggles
  if (descToggle && descLess && descContent) {
    descToggle.addEventListener("click", () => {
      descContent.hidden = false;
      descToggle.style.display = "none";
    });
    descLess.addEventListener("click", () => {
      descContent.hidden = true;
      descToggle.style.display = "inline-block";
    });
  }

  // populate sizes
  function populateSizes(sizeField) {
    sizeEl.innerHTML = "";
    const list = Array.isArray(sizeField) ? sizeField : (sizeField || "").toString().split(",").map(s => s.trim()).filter(Boolean);
    if (!list.length) {
      sizeEl.textContent = "-";
      return;
    }
    list.forEach(s => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = s;
      b.addEventListener("click", () => {
        qs(".size-container button").forEach(x => x.classList.remove("selected"));
        b.classList.add("selected");
      });
      sizeEl.appendChild(b);
    });
  }

  // populate colors
  function populateColors(colorField) {
    colorEl.innerHTML = "";
    const list = Array.isArray(colorField) ? colorField : (colorField || "").toString().split(",").map(c => c.trim()).filter(Boolean);
    if (!list.length) { colorEl.textContent = "-"; return; }
    list.forEach(c => {
      const sw = document.createElement("span");
      sw.className = "color-swatch";
      try { sw.style.backgroundColor = c; } catch (e) { sw.style.backgroundColor = "#777"; }
      sw.title = c;
      sw.addEventListener("click", () => {
        qs(".color-swatch").forEach(x => x.classList.remove("selected"));
        sw.classList.add("selected");
      });
      colorEl.appendChild(sw);
    });
  }

  // gallery populate
  function populateGallery(product) {
    mediaSlider.innerHTML = "";
    thumbs.innerHTML = "";
    const items = [];
    if (product.thumbnailImage) items.push({ type: "img", src: product.thumbnailImage });
    (product.extraImages || []).forEach(i => items.push({ type: "img", src: i }));
    (product.extraVideos || []).forEach(v => items.push({ type: "video", src: v }));

    items.forEach((it, idx) => {
      const wrapper = document.createElement("div");
      wrapper.style.minWidth = "100%";
      wrapper.style.height = "100%";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.justifyContent = "center";

      let el;
      if (it.type === "img") {
        el = document.createElement("img");
        el.src = it.src;
        el.alt = "Product image";
      } else {
        el = document.createElement("video");
        el.src = it.src;
        el.controls = true;
      }
      el.className = "slider-media";
      wrapper.appendChild(el);
      mediaSlider.appendChild(wrapper);

      // thumb
      const t = document.createElement("div");
      t.className = "thumb";
      const thumbInner = document.createElement(it.type === "img" ? "img" : "video");
      thumbInner.src = it.src;
      thumbInner.alt = "thumb";
      thumbInner.setAttribute("aria-hidden", "true");
      thumbInner.style.width = "100%";
      thumbInner.style.height = "100%";
      thumbInner.style.objectFit = "cover";
      t.appendChild(thumbInner);
      t.addEventListener("click", () => goToSlide(idx));
      thumbs.appendChild(t);
    });

    goToSlide(0);
  }

  // store link safe setup
  function setupStoreLink(el, slug, name) {
    if (!el) return;
    el.textContent = name || "Unknown Store";
    if (slug) {
      const href = `sellers-products.html?slug=${encodeURIComponent(slug)}`;
      el.setAttribute("href", href);
      el.onclick = function (e) {
        e.preventDefault();
        window.location.href = href;
      };
    } else {
      el.removeAttribute("href");
    }
  }

  // Add to cart flow
  async function addToCart(productId) {
    try {
      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = `addtocart.html?id=${productId}`;
      } else {
        alert(data.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding to cart");
    }
  }

  // Buy now flow
  function buyNow(productId, name, price) {
    // price should be a number; strip non-numeric
    const numericPrice = (price + "").replace(/[^\d.]/g, "");
    window.location.href = `payment.html?id=${encodeURIComponent(productId)}&name=${encodeURIComponent(name)}&price=${encodeURIComponent(numericPrice)}`;
  }

  // size chart safe open
  function openSizeChart(category, subcategory) {
    const chart = (window.sizeChartData && window.sizeChartData[category] && window.sizeChartData[category][subcategory]) ? window.sizeChartData[category][subcategory] : null;
    if (!chart) {
      sizeChartContent.innerHTML = "<p>No size chart available for this product.</p>";
    } else {
      let table = "<table><thead><tr>";
      table += chart.headers.map(h => `<th>${h}</th>`).join("");
      table += "</tr></thead><tbody>";
      chart.rows.forEach(r => {
        table += "<tr>" + r.map(c => `<td>${c}</td>`).join("") + "</tr>";
      });
      table += "</tbody></table>";
      sizeChartContent.innerHTML = table;
    }
    sizeChartModal.classList.remove("hidden");
    sizeChartOverlay.classList.remove("hidden");
  }
  closeSizeChart?.addEventListener("click", () => {
    sizeChartModal.classList.add("hidden");
    sizeChartOverlay.classList.add("hidden");
  });
  sizeChartOverlay?.addEventListener("click", () => {
    sizeChartModal.classList.add("hidden");
    sizeChartOverlay.classList.add("hidden");
  });

  // reviews
  async function fetchReviews() {
    try {
      const res = await fetch(`${API_BASE}/api/products/reviews/${encodeURIComponent(productId)}`);
      if (!res.ok) throw new Error("Failed to load reviews");
      const json = await res.json();
      const reviews = json.reviews || [];
      if (!reviews.length) {
        reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
        return;
      }
      reviewsContainer.innerHTML = reviews.map(r => {
        const name = r.userName || "Anonymous";
        const date = new Date(r.createdAt || Date.now()).toLocaleString();
        const stars = "★".repeat(r.rating || 0) + "☆".repeat(5 - (r.rating || 0));
        return `<div class="review-item"><div class="review-meta"><strong>${name}</strong> · <span>${date}</span> · <span>${stars}</span></div><div class="review-body">${r.comment || ""}</div></div>`;
      }).join("");
    } catch (err) {
      console.warn("Reviews load failed", err);
      reviewsContainer.innerHTML = "<p>Unable to load reviews.</p>";
    }
  }

  submitReviewBtn?.addEventListener("click", async () => {
    try {
      const rating = Number(ratingEl.value);
      const comment = commentEl.value.trim();
      if (!comment) { reviewMessage.textContent = "Please write a review before submitting."; return; }
      reviewMessage.textContent = "Sending...";
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        reviewMessage.textContent = "Thanks — your review is submitted.";
        commentEl.value = "";
        fetchReviews();
      } else {
        reviewMessage.textContent = data.message || "Review submission failed.";
      }
    } catch (err) {
      console.error(err);
      reviewMessage.textContent = "Error submitting review.";
    }
  });

  // attach add-to-cart / buy events (delegate later after populate)
  function attachActionHandlers(product) {
    // mobile buttons
    mobileAddCart?.addEventListener("click", () => addToCart(product._id));
    mobileBuyNow?.addEventListener("click", () => buyNow(product._id, product.name, product.price));

    // panel buttons (desktop)
    panelAddCart?.addEventListener("click", () => addToCart(product._id));
    panelBuyNow?.addEventListener("click", () => buyNow(product._id, product.name, product.price));
  }

  // fetch product and populate
  (async function fetchAndPopulate() {
    try {
      const res = await fetch(`${API_BASE}/api/products/detail/${encodeURIComponent(productId)}`);
      if (!res.ok) throw new Error("Product fetch failed");
      const json = await res.json();
      const product = json.product;
      if (!product) {
        document.body.innerHTML = "<h2>Product not found.</h2>";
        return;
      }

      // basic fields
      nameEl.textContent = product.name || "-";
      productCodeEl.textContent = product.productCode || "-";
      categoryEl.textContent = product.category || "-";
      subcategoryEl.textContent = product.subcategory || "-";
      priceEl.textContent = product.price ? `₹${product.price}` : "-";
      displayPriceEl.textContent = (product.displayPrice && Number(product.displayPrice) > 0) ? `₹${product.displayPrice}` : "";
      // panel prices
      panelPrice && (panelPrice.textContent = product.price ? `₹${product.price}` : "-");
      panelDisplayPrice && (panelDisplayPrice.textContent = (product.displayPrice && Number(product.displayPrice) > 0) ? `₹${product.displayPrice}` : "");

      // description summary
      $("preview-description").textContent = product.description || "-";
      $("preview-summary").textContent = product.summary || "-";

      // saree / blouse
      sareeSizeEl.textContent = product.sareeSize ?? "-";
      blouseSizeEl.textContent = product.blouseSize ?? "-";

      // specs
      $("preview-material").textContent = product.material || "-";
      $("preview-pattern").textContent = product.pattern || "-";
      $("preview-wash-care").textContent = product.washCare || "-";
      $("preview-model-style").textContent = product.modelStyle || "-";
      $("preview-occasion").textContent = product.occasion || "-";
      $("preview-available-in").textContent = product.availableIn || "All over India";

      // tags (if present)
      $("preview-tags").textContent = (product.tags || []).join(", ");

      // sizes & colors & gallery
      populateSizes(product.size);
      populateColors(product.color);
      populateGallery(product);

      // store link (both inline and panel)
      setupStoreLink(storeLink, product.store?.slug, product.store?.storeName);
      setupStoreLink(panelStoreLink, product.store?.slug, product.store?.storeName);

      // size chart button — safe
      sizeChartBtn?.addEventListener("click", () => {
        const cat = product.category || "";
        const sub = product.subcategory || "";
        openSizeChart(cat, sub);
      });

      // attach actions
      attachActionHandlers(product);

      // reviews
      fetchReviews();

    } catch (err) {
      console.error(err);
      document.body.innerHTML = "<h2>Failed to load product. Please try again later.</h2>";
    }
  })();

});
