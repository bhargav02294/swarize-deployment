// =======================================================
// UNIVERSAL WOMEN'S DRESS SIZE CHART (Swarize Standard)
// =======================================================
const sizeChartData = {
  Dresses: {
    Universal: {
      headers: ["Size", "Bust (in)", "Waist (in)", "Hip (in)"],
      rows: [
        ["XS", "32", "26", "34"],
        ["S", "34", "28", "36"],
        ["M", "36", "30", "38"],
        ["L", "38", "32", "40"],
        ["XL", "40", "34", "42"],
        ["XXL", "42", "36", "44"],
        ["3XL", "44", "38", "46"],
      ],
    },
  },

  // CATEGORY MAPPING -> map to USE_DRESS_CHART to reuse Dresses chart
  Kurti: { Universal: "USE_DRESS_CHART" },
  Lehenga: { Universal: "USE_DRESS_CHART" },
  "Anarkali Dress": { Universal: "USE_DRESS_CHART" },
  Gown: { Universal: "USE_DRESS_CHART" },
  Sharara: { Universal: "USE_DRESS_CHART" },
  "Salwar Suit": { Universal: "USE_DRESS_CHART" },
  "Palazzo Set": { Universal: "USE_DRESS_CHART" },
  "Skirt Set": { Universal: "USE_DRESS_CHART" },
  "Indo Western Dress": { Universal: "USE_DRESS_CHART" },
  "Co-ord Set": { Universal: "USE_DRESS_CHART" },
  "Churidar Set": { Universal: "USE_DRESS_CHART" },
};

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) return (document.body.innerHTML = "<h2>No product ID provided.</h2>");

  try {
    const res = await fetch(`https://swarize.in/api/products/detail/${productId}`);
    const { product } = await res.json();

    if (!product) return (document.body.innerHTML = "<h2>Product not found.</h2>");

    // Helper to safely set text
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text || "-";
    };

    // Populate fields
    const fields = {
      "preview-name": product.name,
      "preview-product-code": product.productCode,
      "preview-price": product.price ? `₹${product.price}` : "-",
      "preview-display-price": product.displayPrice ? `₹${product.displayPrice}` : "-",
      "preview-category": product.category,
      "preview-subcategory": product.subcategory,
      "preview-material": product.material,
      "preview-pattern": product.pattern,
      "preview-wash-care": product.washCare,
      "preview-brand": product.brand,
      "preview-model-style": product.modelStyle,
      "preview-occasion": product.occasion,
      "preview-available-in": product.availableIn || "All over India",
      "preview-tags": (product.tags || []).join(", "),
      "preview-description": product.description,
      "preview-summary": product.summary,
      "preview-saree-size": product.sareeSize || "-",
      "preview-blouse-size": product.blouseSize || "-",
    };
    Object.entries(fields).forEach(([id, text]) => setText(id, text));

    // Store link
    const storeEl = document.getElementById("store-link");
    if (storeEl && product.store) {
      storeEl.textContent = product.store.storeName || "Unknown Store";
      if (product.store.slug) {
        storeEl.addEventListener("click", () => {
          window.location.href = `sellers-products.html?slug=${product.store.slug}`;
        });
      }
    }

    // Description toggle (show/hide)
    const showBtn = document.getElementById("toggle-desc-btn");
    const hideBtn = document.getElementById("toggle-less-btn");
    const descContent = document.getElementById("desc-summary-content");
    if (showBtn && hideBtn && descContent) {
      showBtn.addEventListener("click", () => {
        descContent.style.display = "block";
        showBtn.style.display = "none";
      });
      hideBtn.addEventListener("click", () => {
        descContent.style.display = "none";
        showBtn.style.display = "inline-block";
      });
    }

    // ========== IMAGE / VIDEO GALLERY ==========
    const mainImage = document.getElementById("main-preview-image");
    const mainVideo = document.getElementById("main-preview-video");
    const thumbnailRow = document.getElementById("thumbnail-row");

    const mediaItems = [];
    if (product.thumbnailImage) mediaItems.push({ type: "img", src: product.thumbnailImage });
    (product.extraImages || []).forEach((img) => mediaItems.push({ type: "img", src: img }));
    (product.extraVideos || []).forEach((vid) => mediaItems.push({ type: "video", src: vid }));

    function showMedia(item) {
      if (item.type === "img") {
        mainVideo.style.display = "none";
        mainImage.style.display = "block";
        mainImage.src = item.src;
      } else {
        mainImage.style.display = "none";
        mainVideo.style.display = "block";
        mainVideo.src = item.src;
      }
    }
    if (mediaItems.length > 0) showMedia(mediaItems[0]);

    mediaItems.forEach((item) => {
      const thumb = document.createElement("div");
      thumb.className = "thumb-item";
      if (item.type === "img") {
        const img = document.createElement("img");
        img.src = item.src;
        thumb.appendChild(img);
      } else {
        thumb.classList.add("video-thumb");
      }
      thumb.addEventListener("click", () => showMedia(item));
      thumbnailRow.appendChild(thumb);
    });

    // ========== SIZE SELECTION ==========
    const sizeContainer = document.getElementById("preview-size");
    sizeContainer.innerHTML = "";
    const sizes = Array.isArray(product.size)
      ? product.size
      : (product.size || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    if (sizes.length > 0) {
      sizes.forEach((size) => {
        const btn = document.createElement("button");
        btn.textContent = size;
        btn.addEventListener("click", () => {
          document.querySelectorAll(".size-container button").forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
        });
        sizeContainer.appendChild(btn);
      });
    } else sizeContainer.textContent = "-";

    // ========== COLOR SWATCHES ==========
    const colorContainer = document.getElementById("preview-color");
    colorContainer.innerHTML = "";
    const colors = Array.isArray(product.color)
      ? product.color
      : (product.color || "").split(",").map((c) => c.trim()).filter(Boolean);

    if (colors.length > 0) {
      colors.forEach((color) => {
        const swatch = document.createElement("span");
        swatch.className = "color-swatch";
        // Try to accept both named colors and hex — safe fallback
        swatch.style.backgroundColor = color || "#444";
        colorContainer.appendChild(swatch);
      });
    } else {
      colorContainer.textContent = "-";
    }

    // Mobile: move buy buttons below price
    if (window.innerWidth <= 768) {
      const buyBox = document.querySelector(".mobile-buy-box");
      const placeholder = document.getElementById("mobile-buttons-placeholder");
      if (buyBox && placeholder) placeholder.appendChild(buyBox);
    }

    // ===========================
    // CATEGORY-BASED SIZE DISPLAY
    // ===========================
    const rawCategory = (product.category || "").toString().trim().toLowerCase();
    const category = rawCategory.replace(/\s+/g, " ").trim();

    const sareeCategories = ["saree", "sarees"];
    const dressCategories = [
      "kurti",
      "lehenga",
      "anarkali dress",
      "gown",
      "sharara",
      "salwar suit",
      "palazzo set",
      "skirt set",
      "indo western dress",
      "co-ord set",
      "churidar set",
      "dress",
      "dresses",
    ];

    const sizeRow = document.querySelector('#preview-size')?.closest('.selection-row');
    const sizeChartBtn = document.getElementById('size-chart-btn');
    const sareeRow = document.querySelector('#preview-saree-size')?.closest('.selection-row');
    const blouseRow = document.querySelector('#preview-blouse-size')?.closest('.selection-row');

    function hide(el) { if (el) el.style.display = "none"; }
    function show(el) { if (el) el.style.display = "flex"; }

    // hide all initially
    hide(sizeRow);
    if (sizeChartBtn) hide(sizeChartBtn);
    hide(sareeRow);
    hide(blouseRow);

    if (sareeCategories.includes(category)) {
      show(sareeRow);
      show(blouseRow);
      hide(sizeRow);
      if (sizeChartBtn) hide(sizeChartBtn);
    } else if (dressCategories.includes(category)) {
      show(sizeRow);
      if (sizeChartBtn) sizeChartBtn.style.display = "inline-block";
      hide(sareeRow);
      hide(blouseRow);
    } else {
      hide(sizeRow);
      if (sizeChartBtn) hide(sizeChartBtn);
      hide(sareeRow);
      hide(blouseRow);
    }

    // ========== ADD TO CART ==========
    const addToCartBtn = document.querySelector(".add-to-cart");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", async () => {
        try {
          const res = await fetch("https://swarize.in/api/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
            credentials: "include",
          });
          const data = await res.json();
          if (data.success) window.location.href = `addtocart.html?id=${productId}`;
          else alert(data.message || "Failed to add to cart.");
        } catch (err) {
          alert("Error adding product.");
          console.error(err);
        }
      });
    }

    // ========== BUY NOW ==========
    const buyNowBtn = document.querySelector(".buy-now");
    if (buyNowBtn) {
      buyNowBtn.addEventListener("click", () => {
        window.location.href = `payment.html?id=${productId}&name=${encodeURIComponent(product.name)}&price=${product.price}`;
      });
    }

    // ========== SIZE CHART MODAL ELEMENTS (ensure they exist) ==========
    const sizeChartModal = document.getElementById("size-chart-modal");
    const sizeChartOverlay = document.getElementById("size-chart-overlay");
    const sizeChartContent = document.getElementById("size-chart-content");
    const closeSizeChart = document.getElementById("close-size-chart");

    // Safety: if modal elements missing, create them (defensive)
    if (!sizeChartModal || !sizeChartOverlay || !sizeChartContent) {
      console.warn("Size chart modal elements missing from DOM. Creating fallback modal...");

      // create overlay
      const overlay = document.createElement("div");
      overlay.id = "size-chart-overlay";
      overlay.className = "modal-overlay";
      document.body.appendChild(overlay);

      // create modal
      const modal = document.createElement("div");
      modal.id = "size-chart-modal";
      modal.className = "modal";
      modal.innerHTML = `<h3>Size Chart</h3><div id="size-chart-content">Loading...</div><button id="close-size-chart" class="btn close-btn">Close</button>`;
      document.body.appendChild(modal);

      // re-query
      sizeChartModal = document.getElementById("size-chart-modal");
      sizeChartOverlay = document.getElementById("size-chart-overlay");
      sizeChartContent = document.getElementById("size-chart-content");
      closeSizeChart = document.getElementById("close-size-chart");
    }

    // Close handlers
    if (closeSizeChart) {
      closeSizeChart.addEventListener("click", () => {
        if (sizeChartModal) sizeChartModal.style.display = "none";
        if (sizeChartOverlay) sizeChartOverlay.style.display = "none";
      });
    }
    if (sizeChartOverlay) {
      sizeChartOverlay.addEventListener("click", () => {
        if (sizeChartModal) sizeChartModal.style.display = "none";
        if (sizeChartOverlay) sizeChartOverlay.style.display = "none";
      });
    }
    // Escape key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (sizeChartModal) sizeChartModal.style.display = "none";
        if (sizeChartOverlay) sizeChartOverlay.style.display = "none";
      }
    });

    // ========== SIZE CHART BUTTON / HANDLER ==========
    if (sizeChartBtn) {
      sizeChartBtn.addEventListener("click", () => {
        // Determine normalized category name for lookup
        const raw = (product.category || "").toString().trim();
        const normalized = raw.toLowerCase().replace(/\s+/g, " ").trim();

        // try to find a matching key in sizeChartData (case-insensitive)
        let chartKey = null;
        for (const key of Object.keys(sizeChartData)) {
          if (key.toLowerCase() === normalized) {
            chartKey = key;
            break;
          }
        }

        // If exact category key not found, but product is in dressCategories, use Dresses.Universal
        let chartData = null;
        if (chartKey) {
          const candidate = sizeChartData[chartKey];
          if (candidate && candidate.Universal === "USE_DRESS_CHART") {
            chartData = sizeChartData.Dresses.Universal;
          } else if (candidate && candidate.Universal) {
            chartData = candidate.Universal;
          }
        } else if (dressCategories.includes(normalized)) {
          chartData = sizeChartData.Dresses.Universal;
        }

        if (!chartData) {
          sizeChartContent.innerHTML = "<p>No size chart available.</p>";
        } else {
          let html =
            "<table><thead><tr>" +
            chartData.headers.map((h) => `<th>${h}</th>`).join("") +
            "</tr></thead><tbody>";
          chartData.rows.forEach((row) => {
            html += "<tr>" + row.map((d) => `<td>${d}</td>`).join("") + "</tr>";
          });
          html += "</tbody></table>";
          sizeChartContent.innerHTML = html;
        }

        // show modal + overlay
        if (sizeChartModal) sizeChartModal.style.display = "block";
        if (sizeChartOverlay) sizeChartOverlay.style.display = "block";
      });
    }

 
  } catch (err) {
    document.body.innerHTML = "<h2>Failed to load product. Please try again later.</h2>";
    console.error(err);
  }
});
