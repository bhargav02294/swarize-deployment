// product-detail.js
// Fetch product, populate fields, and provide a clean gallery (no slider).
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
      if (el) el.textContent = text ?? "-";
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
      "preview-saree-size": product.sareeSize ?? "-",
      "preview-blouse-size": product.blouseSize ?? "-"
    };

    Object.entries(fields).forEach(([id, text]) => setText(id, text));
    // Also set compact price element (right column)
    document.getElementById('preview-price-compact')?.textContent = product.price ? `₹${product.price}` : "-";

    // Store info
    const storeEl = document.getElementById("store-link");
    if (storeEl && product.store) {
      storeEl.textContent = product.store.storeName || "Unknown Store";
      if (product.store.slug) {
        storeEl.addEventListener("click", (e) => {
          e.preventDefault();
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

    // SIZE selection logic (unchanged)
    const sizeContainer = document.getElementById("preview-size");
    sizeContainer.innerHTML = "";
    const sizes = Array.isArray(product.size) ? product.size : (product.size || "").toString().split(",").map(s => s.trim()).filter(Boolean);
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

    // COLOR swatches (unchanged)
    const colorContainer = document.getElementById("preview-color");
    colorContainer.innerHTML = "";
    const colors = Array.isArray(product.color) ? product.color : (product.color || "").toString().split(",").map(c => c.trim()).filter(Boolean);
    if (colors.length > 0) {
      colors.forEach(color => {
        const swatch = document.createElement("span");
        swatch.className = "color-swatch";
        swatch.title = color;
        swatch.style.backgroundColor = color || "#ccc";
        colorContainer.appendChild(swatch);
      });
    } else colorContainer.textContent = "-";

    // === GALLERY (NO SLIDER): build main media and thumbnails ===
    const mainMediaWrap = document.getElementById('main-media');
    const thumbsRow = document.getElementById('thumbs-row');

    // collect media items: thumbnailImage first (full size main), then extraImages, then extraVideos
    const mediaItems = [];
    if (product.thumbnailImage) mediaItems.push({ type: "img", src: product.thumbnailImage, id: "thumb-main" });
    (product.extraImages || []).forEach((img, idx) => mediaItems.push({ type: "img", src: img, id: `img-${idx}` }));
    (product.extraVideos || []).forEach((vid, idx) => mediaItems.push({ type: "video", src: vid, id: `vid-${idx}` }));

    // Build main media (default: first item)
    function setMainMedia(item) {
      if (!item) return;
      // clear
      mainMediaWrap.innerHTML = "";
      // remove selection on thumbs then set .selected on matching thumb element
      thumbsRow.querySelectorAll('.thumb').forEach(t => t.classList.remove('selected'));
      const thumbEl = thumbsRow.querySelector(`[data-src="${item.src}"]`);
      if (thumbEl) thumbEl.classList.add('selected');

      if (item.type === "img") {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = product.name || "Product image";
        img.loading = "eager";
        mainMediaWrap.appendChild(img);
      } else if (item.type === "video") {
        const video = document.createElement('video');
        video.src = item.src;
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        // autoplay will be attempted on user click via thumbnail; if we call play immediately after creation it may fail unless click triggered
        mainMediaWrap.appendChild(video);
        // try to play (if allowed)
        video.pause();
        // small delay to ensure appended
        setTimeout(()=> {
          // Try to play; if browser prevents autoplay it will only play when user interacts with video controls
          video.play().catch(()=>{ /* ignore autoplay block */ });
        }, 120);
      }
    }

    // Build thumbnails
    thumbsRow.innerHTML = "";
    mediaItems.forEach((item, idx) => {
      const t = document.createElement('div');
      t.className = 'thumb';
      t.setAttribute('role','button');
      t.setAttribute('tabindex','0');
      t.setAttribute('data-type', item.type);
      t.setAttribute('data-src', item.src);

      if (item.type === "img") {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = product.name || "thumb";
        t.appendChild(img);
      } else if (item.type === "video") {
        // create thumbnail from video src if possible (video poster). If video has no poster, show first frame fallback - browser doesn't do that automatically for <video> element in thumbnail
        // We'll append a <video> element (muted, short preload) scaled to thumb size (will show poster or first frame) and overlay SVG play icon
        const vid = document.createElement('video');
        vid.src = item.src;
        vid.muted = true;
        vid.playsInline = true;
        vid.preload = "metadata";
        vid.style.objectFit = "cover";
        vid.style.width = "100%";
        vid.style.height = "100%";
        t.appendChild(vid);

        // overlay play icon (SVG)
        const overlay = document.createElement('div');
        overlay.className = 'play-overlay';
        overlay.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>`;
        t.appendChild(overlay);
      }

      // click handler: set main media to this item, and if video, try to play
      const activate = async () => {
        setMainMedia(item);
        // if video - ensure play
        if (item.type === "video") {
          // wait for video element in DOM
          setTimeout(() => {
            const v = mainMediaWrap.querySelector('video');
            if (v) {
              v.currentTime = 0;
              // try to unmute only after user gesture; we'll leave it muted false so user hears audio when they clicked thumbnail (click counts as gesture)
              v.muted = false;
              v.play().catch(()=>{ /* ignore autoplay issues */ });
            }
          }, 80);
        }
      };

      // click and keyboard enter/space
      t.addEventListener('click', (e)=> {
        e.preventDefault();
        activate();
      });
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });

      thumbsRow.appendChild(t);
    });

    // set initial main media (thumbnailImage or first media item)
    if (mediaItems.length > 0) setMainMedia(mediaItems[0]);

    // === end gallery ===

    // ==== ADD TO CART (kept intact) ====
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
          else alert(data.message || "Failed to add to cart.");
        } catch (err) {
          alert("Error adding product to cart.");
        }
      });
    }

    // ==== BUY NOW (kept intact) ====
    const buyNowBtn = document.querySelector(".buy-now");
    if (buyNowBtn) {
      buyNowBtn.addEventListener("click", () => {
        window.location.href = `payment.html?id=${productId}&name=${encodeURIComponent(product.name)}&price=${product.price}`;
      });
    }

    // ==== SIZE CHART (kept intact) ====
    const sizeChartBtn = document.getElementById("size-chart-btn");
    const sizeChartModal = document.getElementById("size-chart-modal");
    const sizeChartOverlay = document.getElementById("size-chart-overlay");
    const closeSizeChart = document.getElementById("close-size-chart");
    const sizeChartContent = document.getElementById("size-chart-content");

    if (sizeChartBtn) {
      sizeChartBtn.addEventListener("click", () => {
        const chartData = (typeof sizeChartData !== 'undefined') ? sizeChartData[product.category]?.[product.subcategory] : null;
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
    }
    if (closeSizeChart) closeSizeChart.addEventListener("click", () => { sizeChartModal.style.display = "none"; sizeChartOverlay.style.display = "none"; });

    // ==== REVIEWS (kept minimal, unchanged) ====
    function fetchReviews() {
      const reviewsContainer = document.getElementById("reviews-container");
      if (reviewsContainer) {
        // Placeholder (replace with real API later)
        reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
      }
    }
    fetchReviews();

  } catch (err) {
    document.body.innerHTML = "<h2>Failed to load product. Please try again later.</h2>";
    console.error(err);
  }
});
