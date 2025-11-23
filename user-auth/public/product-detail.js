// product-detail.js
// Gallery + product loading + interactions
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  if (!productId) {
    document.body.innerHTML = "<h2 style='padding:40px;color:#fff'>No product ID provided.</h2>";
    return;
  }

  // DOM refs
  const mainImage = document.getElementById("main-image");
  const mainVideo = document.getElementById("main-video");
  const thumbnailTrack = document.getElementById("thumbnail-track");
  const previewName = document.getElementById("preview-name");
  const previewPrice = document.getElementById("preview-price");
  const previewDisplay = document.getElementById("preview-display-price");
  const previewPrice2 = document.getElementById("preview-price-2");
  const previewDisplay2 = document.getElementById("preview-display-price-2");
  const previewProductCode = document.getElementById("preview-product-code");
  const previewCategory = document.getElementById("preview-category");
  const previewSubcategory = document.getElementById("preview-subcategory");
  const previewMaterial = document.getElementById("preview-material");
  const previewPattern = document.getElementById("preview-pattern");
  const previewWashCare = document.getElementById("preview-wash-care");
  const previewModelStyle = document.getElementById("preview-model-style");
  const previewOccasion = document.getElementById("preview-occasion");
  const previewAvailableIn = document.getElementById("preview-available-in");
  const previewTags = document.getElementById("preview-tags");
  const previewDescription = document.getElementById("preview-description");
  const previewSummary = document.getElementById("preview-summary");
  const previewColor = document.getElementById("preview-color");
  const previewSize = document.getElementById("preview-size");
  const storeLinkBtn = document.getElementById("store-link");
  const addToCartBtn = document.getElementById("add-to-cart");
  const buyNowBtn = document.getElementById("buy-now");

  try {
    const res = await fetch(`https://swarize.in/api/products/detail/${productId}`);
    const json = await res.json();
    const product = json.product;
    if (!product) {
      document.body.innerHTML = "<h2 style='padding:40px;color:#fff'>Product not found.</h2>";
      return;
    }

    // Helper to set
    const setText = (el, val) => { if (!el) return; el.textContent = (val === null || val === undefined || val === "") ? "-" : val; };

    // Basic fields
    setText(previewName, product.name);
    setText(previewProductCode, product.productCode || "-");
    setText(previewCategory, product.category || "-");
    setText(previewSubcategory, product.subcategory || "-");
    setText(previewMaterial, product.material || "-");
    setText(previewPattern, product.pattern || "-");
    setText(previewWashCare, product.washCare || "-");
    setText(previewModelStyle, product.modelStyle || "-");
    setText(previewOccasion, product.occasion || "-");
    setText(previewAvailableIn, product.availableIn || "All over India");
    setText(previewTags, (product.tags || []).join(", "));
    setText(previewDescription, product.description || "-");
    setText(previewSummary, product.summary || "-");

    // Prices
    const priceText = product.price ? `₹${product.price}` : "-";
    const displayText = product.displayPrice ? `₹${product.displayPrice}` : "";
    setText(previewPrice, priceText);
    setText(previewDisplay, displayText);
    setText(previewPrice2, priceText);
    setText(previewDisplay2, displayText);

    // Store link
    if (product.store) {
      storeLinkBtn.textContent = product.store.storeName || "Unknown Store";
      if (product.store.slug) {
        storeLinkBtn.addEventListener("click", () => {
          window.location.href = `sellers-products.html?slug=${product.store.slug}`;
        });
      }
    }

    // Sizes
    previewSize.innerHTML = "";
    const sizes = Array.isArray(product.size) ? product.size : (product.size || "").toString().split(",").map(s=>s.trim()).filter(Boolean);
    if (sizes.length) {
      sizes.forEach(sz => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "size-btn";
        btn.textContent = sz;
        btn.addEventListener("click", () => {
          previewSize.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
          btn.classList.add("selected");
        });
        previewSize.appendChild(btn);
      });
    } else {
      previewSize.textContent = "-";
    }

    // Colors
    previewColor.innerHTML = "";
    const colors = Array.isArray(product.color) ? product.color : (product.color || "").toString().split(",").map(c=>c.trim()).filter(Boolean);
    if (colors.length) {
      colors.forEach(c => {
        const span = document.createElement("span");
        span.className = "color-swatch";
        span.title = c;
        // If color is a hex or recognized color, use directly; else fallback to gray
        try { span.style.backgroundColor = c || "#999"; } catch(e) { span.style.backgroundColor = "#999"; }
        previewColor.appendChild(span);
      });
    } else previewColor.textContent = "-";

    // MEDIA: prepare items (thumbs + main)
    const mediaItems = [];
    if (product.thumbnailImage) mediaItems.push({ type: "img", src: product.thumbnailImage });
    (product.extraImages || []).forEach(url => mediaItems.push({ type: "img", src: url }));
    (product.extraVideos || []).forEach(url => mediaItems.push({ type: "video", src: url }));

    // Render thumbnails horizontally
    thumbnailTrack.innerHTML = "";
    let selectedIndex = 0;

    function setMainTo(index) {
      const item = mediaItems[index];
      if (!item) return;
      // highlight selected thumb
      thumbnailTrack.querySelectorAll(".thumb").forEach((t, i) => t.classList.toggle("selected", i === index));
      // set main display
      if (item.type === "img") {
        mainVideo.style.display = "none";
        mainVideo.pause?.();
        mainImage.style.display = "block";
        mainImage.src = item.src;
      } else {
        mainImage.style.display = "none";
        mainVideo.style.display = "block";
        mainVideo.src = item.src;
      }
      selectedIndex = index;
    }

    mediaItems.forEach((m, i) => {
      const thumb = document.createElement("button");
      thumb.className = "thumb";
      thumb.type = "button";
      if (m.type === "img") {
        const img = document.createElement("img");
        img.src = m.src;
        img.alt = `thumb-${i}`;
        thumb.appendChild(img);
      } else {
        const vid = document.createElement("video");
        vid.src = m.src;
        vid.muted = true;
        vid.playsInline = true;
        vid.preload = "metadata";
        thumb.appendChild(vid);
      }
      thumb.addEventListener("click", () => setMainTo(i));
      thumbnailTrack.appendChild(thumb);
    });

    // default to first
    if (mediaItems.length) setMainTo(0);

    // DESCRIPTION toggle
    const showBtn = document.getElementById("toggle-desc-btn");
    const hideBtn = document.getElementById("toggle-less-btn");
    const descContent = document.getElementById("desc-summary-content");
    if (showBtn && hideBtn && descContent) {
      showBtn.addEventListener("click", () => {
        descContent.style.display = "block";
        descContent.setAttribute("aria-hidden","false");
        showBtn.style.display = "none";
      });
      hideBtn.addEventListener("click", () => {
        descContent.style.display = "none";
        descContent.setAttribute("aria-hidden","true");
        showBtn.style.display = "inline-block";
      });
    }

    // ADD TO CART
    addToCartBtn?.addEventListener("click", async () => {
      try {
        const r = await fetch("https://swarize.in/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId })
        });
        const d = await r.json();
        if (d.success) window.location.href = `addtocart.html?id=${productId}`;
        else alert(d.message || "Failed to add to cart.");
      } catch (err) {
        console.error(err);
        alert("Error adding to cart.");
      }
    });

    // BUY NOW
    buyNowBtn?.addEventListener("click", () => {
      const price = product.price || 0;
      window.location.href = `payment.html?id=${productId}&name=${encodeURIComponent(product.name)}&price=${price}`;
    });

    // SIZE CHART modal (sizeChartData must be globally available if used)
    const sizeChartBtn = document.getElementById("size-chart-btn");
    const sizeChartModal = document.getElementById("size-chart-modal");
    const sizeChartOverlay = document.getElementById("size-chart-overlay");
    const closeSizeChart = document.getElementById("close-size-chart");
    const sizeChartContent = document.getElementById("size-chart-content");

    sizeChartBtn?.addEventListener("click", () => {
      // If sizeChartData defined, populate; otherwise show fallback
      try {
        const chartData = window.sizeChartData?.[product.category]?.[product.subcategory];
        if (!chartData) {
          sizeChartContent.innerHTML = "<p>No size chart available.</p>";
        } else {
          let html = "<table style='width:100%;border-collapse:collapse'><thead><tr>";
          chartData.headers.forEach(h => html += `<th style="text-align:left;padding:8px;border-bottom:1px solid rgba(255,255,255,0.04)">${h}</th>`);
          html += "</tr></thead><tbody>";
          chartData.rows.forEach(row => {
            html += "<tr>";
            row.forEach(cell => html += `<td style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.02)">${cell}</td>`);
            html += "</tr>";
          });
          html += "</tbody></table>";
          sizeChartContent.innerHTML = html;
        }
      } catch (e) {
        sizeChartContent.innerHTML = "<p>No size chart available.</p>";
      }
      sizeChartOverlay.style.display = "block";
      sizeChartModal.style.display = "block";
      sizeChartOverlay.setAttribute("aria-hidden","false");
      sizeChartModal.setAttribute("aria-hidden","false");
    });

    closeSizeChart?.addEventListener("click", () => {
      sizeChartOverlay.style.display = "none";
      sizeChartModal.style.display = "none";
      sizeChartOverlay.setAttribute("aria-hidden","true");
      sizeChartModal.setAttribute("aria-hidden","true");
    });

    sizeChartOverlay?.addEventListener("click", () => {
      sizeChartOverlay.style.display = "none";
      sizeChartModal.style.display = "none";
    });

    // REVIEWS placeholder
    const reviewsContainer = document.getElementById("reviews-container");
    reviewsContainer.innerHTML = "<p>No reviews yet.</p>";

    // Submit review (placeholder)
    document.getElementById("submit-review")?.addEventListener("click", async () => {
      const rating = document.getElementById("rating").value;
      const comment = document.getElementById("comment").value;
      try {
        // if you have reviews endpoint, call it here. For now show success message.
        document.getElementById("review-message").textContent = "Thank you — your review was submitted (placeholder).";
      } catch (e) {
        alert("Failed to submit review.");
      }
    });

  } catch (err) {
    console.error(err);
    document.body.innerHTML = "<h2 style='padding:40px;color:#fff'>Failed to load product. Please try again later.</h2>";
  }
});
