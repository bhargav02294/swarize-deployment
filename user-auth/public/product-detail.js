// =======================================================
// UNIVERSAL WOMEN'S DRESS SIZE CHART (Swarize Standard)
// =======================================================
const sizeChartData = {

  Dresses: {
    Universal: {
      headers: ["Size", "Bust (in)", "Waist (in)", "Hip (in)"],
      rows: [
        ["XS", "32", "26", "34"],
        ["S",  "34", "28", "36"],
        ["M",  "36", "30", "38"],
        ["L",  "38", "32", "40"],
        ["XL", "40", "34", "42"],
        ["XXL","42", "36", "44"],
        ["3XL","44", "38", "46"]
      ]
    }
  },

  // CATEGORY MAPPING
  
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
  "Churidar Set": { Universal: "USE_DRESS_CHART" }

};



document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId)
    return (document.body.innerHTML = "<h2>No product ID provided.</h2>");

  try {
    const res = await fetch(`https://swarize.in/api/products/detail/${productId}`);
    const { product } = await res.json();

    if (!product)
      return (document.body.innerHTML = "<h2>Product not found.</h2>");

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
      "preview-blouse-size": product.blouseSize || "-",
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

    // ================================
    // NEW IMAGE / VIDEO GALLERY
    // ================================
    const mainImage = document.getElementById("main-preview-image");
    const mainVideo = document.getElementById("main-preview-video");
    const thumbnailRow = document.getElementById("thumbnail-row");

    const mediaItems = [];

    // 1) Thumbnail image first (main image)
    if (product.thumbnailImage)
      mediaItems.push({ type: "img", src: product.thumbnailImage });

    // 2) Extra images
    (product.extraImages || []).forEach((img) =>
      mediaItems.push({ type: "img", src: img })
    );

    // 3) Extra videos
    (product.extraVideos || []).forEach((vid) =>
      mediaItems.push({ type: "video", src: vid })
    );

    // Initial main media
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

    // Show first media by default
    if (mediaItems.length > 0) showMedia(mediaItems[0]);

    // Create thumbnails row
    mediaItems.forEach((item, index) => {
      const thumb = document.createElement("div");
      thumb.className = "thumb-item";

      if (item.type === "img") {
        const img = document.createElement("img");
        img.src = item.src;
        thumb.appendChild(img);
      } else {
        thumb.classList.add("video-thumb"); // black + play icon
      }

      thumb.addEventListener("click", () => showMedia(item));
      thumbnailRow.appendChild(thumb);
    });

    // =======================================
    // SIZE SELECTION
    // =======================================
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
          document
            .querySelectorAll(".size-container button")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
        });
        sizeContainer.appendChild(btn);
      });
    } else sizeContainer.textContent = "-";

    // =======================================
    // COLOR SWATCHES
    // =======================================
    const colorContainer = document.getElementById("preview-color");
    colorContainer.innerHTML = "";
    const colors = Array.isArray(product.color)
  ? product.color
  : (product.color || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

if (colors.length > 0) {
  colors.forEach((color) => {
    const swatch = document.createElement("span");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = color;
    colorContainer.appendChild(swatch);
  });
} else {
  colorContainer.textContent = "-";
}
// Move Buy Buttons Under Price on Mobile
if (window.innerWidth <= 768) {
  const buyBox = document.querySelector(".mobile-buy-box");
  const placeholder = document.getElementById("mobile-buttons-placeholder");

  if (buyBox && placeholder) {
    placeholder.appendChild(buyBox);
  }
}


// ================================
// CATEGORY-BASED SIZE DISPLAY LOGIC
// ================================
const category = (product.category || "").toLowerCase();

// UI ELEMENTS
const sizeRow = document.querySelector('#preview-size')?.closest('.selection-row');
const sizeChartBtn = document.getElementById('size-chart-btn');

const sareeRow = document.querySelector('#preview-saree-size')?.closest('.selection-row');
const blouseRow = document.querySelector('#preview-blouse-size')?.closest('.selection-row');

function hide(el) {
  if (el) el.style.display = "none";
}

function show(el) {
  if (el) el.style.display = "flex";
}

// RESET TO HIDE EVERYTHING INITIALLY
hide(sizeRow);
hide(sizeChartBtn);
hide(sareeRow);
hide(blouseRow);

// APPLY CATEGORY LOGIC
if (category === "sarees" || category === "saree") {

  // Show Saree Details
  show(sareeRow);
  show(blouseRow);

  // Hide Dress Size
  hide(sizeRow);
  hide(sizeChartBtn);

} else if (category === "dresses" || category === "dress") {

  // Show Dress Size & Size Chart
  show(sizeRow);
  sizeChartBtn.style.display = "inline-block";

  // Hide Saree Size
  hide(sareeRow);
  hide(blouseRow);

} else {

  // Unknown category → hide all size features
  hide(sizeRow);
  hide(sizeChartBtn);
  hide(sareeRow);
  hide(blouseRow);
}




    // =======================================
    // ADD TO CART
    // =======================================
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
          if (data.success)
            window.location.href = `addtocart.html?id=${productId}`;
          else alert(data.message);
        } catch (err) {
          alert("Error adding product.");
        }
      });
    }

    // =======================================
    // BUY NOW
    // =======================================
    const buyNowBtn = document.querySelector(".buy-now");
    if (buyNowBtn) {
      buyNowBtn.addEventListener("click", () => {
        window.location.href = `payment.html?id=${productId}&name=${encodeURIComponent(
          product.name
        )}&price=${product.price}`;
      });
    }
// =======================================
// SIZE CHART HANDLER
// =======================================
sizeChartBtn.addEventListener("click", () => {
  const categoryName = product.category;

  let chartData;

  // Check if category has a direct match
  if (sizeChartData[categoryName]) {

    // If category says "USE_DRESS_CHART" → load universal dress chart
    if (sizeChartData[categoryName].Universal === "USE_DRESS_CHART") {
      chartData = sizeChartData.Dresses.Universal;
    } else {

      // If category has its own chart
      chartData = sizeChartData[categoryName].Universal;
    }

  } else {
    chartData = null;
  }

  // If no size chart available
  if (!chartData) {
    sizeChartContent.innerHTML = "<p>No size chart available.</p>";
  } else {
    let table =
      "<table><thead><tr>" +
      chartData.headers.map((h) => `<th>${h}</th>`).join("") +
      "</tr></thead><tbody>";

    chartData.rows.forEach((row) => {
      table +=
        "<tr>" + row.map((d) => `<td>${d}</td>`).join("") + "</tr>";
    });

    table += "</tbody></table>";
    sizeChartContent.innerHTML = table;
  }

  sizeChartModal.style.display = "block";
  sizeChartOverlay.style.display = "block";
});

    // =======================================
    // REVIEWS (placeholder)
    // =======================================
    function fetchReviews() {
      const reviewsContainer = document.getElementById("reviews-container");
      if (reviewsContainer) {
        reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
      }
    }
    fetchReviews();
  } catch (err) {
    document.body.innerHTML =
      "<h2>Failed to load product. Please try again later.</h2>";
    console.error(err);
  }
});
