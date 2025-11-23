document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) return document.body.innerHTML = "<h2>No product ID provided.</h2>";

  try {
    const res = await fetch(`https://swarize.in/api/products/detail/${productId}`);
    const { product } = await res.json();

    if (!product) return document.body.innerHTML = "<h2>Product not found.</h2>";

    // Helper to safely set text
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text || "-";
    };

    // Fill all product fields
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
      "preview-blouse-size": product.blouseSize || "-"
    };

    Object.entries(fields).forEach(([id, text]) => setText(id, text));

    // Store info
    const storeEl = document.getElementById("store-link");
    if (storeEl && product.store) {
      storeEl.textContent = product.store.storeName || "Unknown Store";
      if (product.store.slug) {
        storeEl.addEventListener("click", () => {
          window.location.href = `sellers-products.html?slug=${product.store.slug}`;
        });
      }
    }

    // Description toggle
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

    // ==== SIZE SELECTION ====
    const sizeContainer = document.getElementById("preview-size");
    sizeContainer.innerHTML = "";
    const sizes = Array.isArray(product.size)
      ? product.size
      : (product.size || "").split(",").map(s => s.trim()).filter(Boolean);
    if (sizes.length > 0) {
      sizes.forEach(size => {
        const btn = document.createElement("button");
        btn.textContent = size;
        btn.addEventListener("click", () => {
          document.querySelectorAll(".size-container button").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
        });
        sizeContainer.appendChild(btn);
      });
    } else sizeContainer.textContent = "-";

    // ==== COLOR SWATCHES ====
    const colorContainer = document.getElementById("preview-color");
    colorContainer.innerHTML = "";
    const colors = Array.isArray(product.color)
      ? product.color
      : (product.color || "").split(",").map(c => c.trim()).filter(Boolean);
    if (colors.length > 0) {
      colors.forEach(color => {
        const swatch = document.createElement("span");
        swatch.className = "color-swatch";
        swatch.style.backgroundColor = color;
        colorContainer.appendChild(swatch);
      });
    } else colorContainer.textContent = "-";

    // ==== MEDIA SLIDER ====
    const mediaSlider = document.getElementById("media-slider");
    let currentSlide = 0;
    if (mediaSlider) {
      mediaSlider.innerHTML = "";
      const mediaItems = [];

      if (product.thumbnailImage) mediaItems.push({ type: "img", src: product.thumbnailImage });
      (product.extraImages || []).forEach(img => mediaItems.push({ type: "img", src: img }));
      (product.extraVideos || []).forEach(vid => mediaItems.push({ type: "video", src: vid }));

      mediaItems.forEach(({ type, src }) => {
        const wrapper = document.createElement("div");
        wrapper.style.minWidth = "100%";
        wrapper.style.height = "100%";
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.justifyContent = "center";

        const el = document.createElement(type);
        el.src = src;
        el.classList.add("slider-media");
        if (type === "video") el.controls = true;

        wrapper.appendChild(el);
        mediaSlider.appendChild(wrapper);
      });
    }

    window.moveSlide = function (direction) {
      const totalItems = mediaSlider.children.length;
      const containerWidth = mediaSlider.offsetWidth;
      currentSlide = Math.max(0, Math.min(currentSlide + direction, totalItems - 1));
      mediaSlider.style.transform = `translateX(-${containerWidth * currentSlide}px)`;
    };

    // ==== ADD TO CART ====
    const addToCartBtn = document.querySelector(".add-to-cart");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", async () => {
        try {
          const res = await fetch("https://swarize.in/api/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
            credentials: "include"
          });
          const data = await res.json();
          if (data.success) window.location.href = `addtocart.html?id=${productId}`;
          else alert(data.message);
        } catch (err) {
          alert("Error adding product to cart.");
        }
      });
    }

    // ==== BUY NOW ====
    const buyNowBtn = document.querySelector(".buy-now");
    if (buyNowBtn) {
      buyNowBtn.addEventListener("click", () => {
        window.location.href = `payment.html?id=${productId}&name=${encodeURIComponent(product.name)}&price=${product.price}`;
      });
    }

    // ==== SIZE CHART ====
    const sizeChartBtn = document.getElementById("size-chart-btn");
    const sizeChartModal = document.getElementById("size-chart-modal");
    const sizeChartOverlay = document.getElementById("size-chart-overlay");
    const closeSizeChart = document.getElementById("close-size-chart");
    const sizeChartContent = document.getElementById("size-chart-content");

    sizeChartBtn.addEventListener("click", () => {
      const chartData = sizeChartData[product.category]?.[product.subcategory];
      if (!chartData) {
        sizeChartContent.innerHTML = "<p>No size chart available.</p>";
      } else {
        let table = '<table><thead><tr>' + chartData.headers.map(h => `<th>${h}</th>`).join("") + '</tr></thead><tbody>';
        chartData.rows.forEach(row => {
          table += '<tr>' + row.map(d => `<td>${d}</td>`).join("") + '</tr>';
        });
        table += '</tbody></table>';
        sizeChartContent.innerHTML = table;
      }
      sizeChartModal.style.display = "block";
      sizeChartOverlay.style.display = "block";
    });

    closeSizeChart.addEventListener("click", () => {
      sizeChartModal.style.display = "none";
      sizeChartOverlay.style.display = "none";
    });

    // ==== REVIEWS ====
    function fetchReviews() {
      const reviewsContainer = document.getElementById("reviews-container");
      if (reviewsContainer) {
        // Placeholder for future API reviews
        reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
      }
    }
    fetchReviews();

  } catch (err) {
    document.body.innerHTML = "<h2>Failed to load product. Please try again later.</h2>";
    console.error(err);
  }
});





