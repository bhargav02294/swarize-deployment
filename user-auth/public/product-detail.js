document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) return document.body.innerHTML = "<h2>No product ID provided.</h2>";

  try {
    const res = await fetch(`https://swarize.in/api/products/detail/${productId}`);
    const { product } = await res.json();

    if (!product) return document.body.innerHTML = "<h2>Product not found.</h2>";

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text || "-";
    };

    const fields = {
      "preview-name": product.name,
      "preview-product-code": product.productCode,
      "preview-price": product.price ? `₹${product.price}` : "-",
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
    const storeName = product.store?.storeName;
    const storeSlug = product.store?.slug;
    const storeEl = document.getElementById("store-link");
    if (storeEl && storeName) {
      storeEl.textContent = storeName;
      if (storeSlug) storeEl.addEventListener("click", () => {
        window.location.href = `sellers-products.html?slug=${storeSlug}`;
      });
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

    // ==== REVIEWS PLACEHOLDER ====
    function fetchReviews() {
      const reviewsContainer = document.getElementById("reviews-container");
      if (reviewsContainer) {
        reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
      }
    }

    fetchReviews();

  } catch (err) {
    document.body.innerHTML = "<h2>Failed to load product. Please try again later.</h2>";
    console.error(err);
  }
});







//=========      Search   function    =============//

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
  const searchContainer = document.getElementById('searchBox');

    if (!searchInput || !searchButton || !searchContainer) {
        console.error(" Search input or button not found! Check your HTML.");
        return;
    }

    // ✅ Keyword Mapping to normalize search terms
    // ✅ Keyword Mapping to normalize search terms
const keywordMapping = {
    "t shirt": "T-Shirts", "tshirt": "T-Shirts", "tees": "T-Shirts",
    "shirt": "Shirts",
    "jean": "Jeans", "denim": "Jeans",
    "saree": "Ethnic Wear", "kurti": "Ethnic Wear", "lehenga": "Ethnic Wear",
    "watch": "Eyewear & Watches", "watches": "Eyewear & Watches",
    "shoe": "Footwear", "shoes": "Footwear",
    "wallet": "Accessories", "handbag": "Bags & Clutches", "bags": "Bags & Travel"
};

// ✅ Subcategory Page Mapping (New Pages)
const subcategoryPages = {
    "T-Shirts": "women.html?subcategory=T-Shirts",
    "Jeans": "women.html?subcategory=Jeans",
    "Ethnic Wear": "women.html?subcategory=Ethnic Wear",
    "Eyewear & Watches": "men.html?subcategory=Eyewear & Watches",
    "Footwear": "men.html?subcategory=Footwear",
    "Accessories": "men.html?subcategory=Accessories",
    "Bags & Clutches": "women.html?subcategory=Bags & Clutches",
    "Bags & Travel": "accessories.html?subcategory=Bags & Travel"
};

// ✅ Main Category & Subcategory Mapping (4 Main Category URLs)
const categoryMap = {
    "women.html": [
        "Ethnic Wear", "Western Wear", "Bottomwear", "Winterwear", "Innerwear & Loungewear",
        "Footwear", "Bags & Clutches", "Jewelry & Accessories", "Beauty & Makeup", "Eyewear & Watches"
    ],
    "men.html": [
        "Topwear", "Bottomwear", "Ethnic Wear", "Winterwear", "Innerwear & Sleepwear",
        "Footwear", "Accessories", "Eyewear & Watches", "Grooming", "Bags & Utility"
    ],
    "kids.html": [
        "Boys Clothing", "Girls Clothing", "Footwear", "Toys & Games", "Remote Toys",
        "Learning & School", "Baby Essentials", "Winterwear", "Accessories", "Festive Wear"
    ],
    "accessories.html": [
        "Bags & Travel", "Unisex Footwear", "Mobile Accessories", "Gadgets", "Computer Accessories",
        "Home Decor", "Kitchenware", "Health & Care", "Craft & DIY Kits", "Fashion Accessories"
    ]
};


    // ✅ Combined Search Logic
    function handleSearch() {
        const rawQuery = searchInput.value.trim().toLowerCase();

        if (!rawQuery) {
            alert("Please enter a search term.");
            return;
        }

        const normalized = keywordMapping[rawQuery] || rawQuery;

        // Step 1: Direct match in subcategory pages
        if (subcategoryPages[normalized]) {
            window.location.href = subcategoryPages[normalized];
            return;
        }

        // Step 2: Fuzzy match inside categoryMap
        for (const [page, subcategories] of Object.entries(categoryMap)) {
            for (const subcategory of subcategories) {
                if (subcategory.toLowerCase().includes(normalized)) {
                    window.location.href = `${page}?subcategory=${subcategory}`;
                    return;
                }
            }
        }

        alert("No matching category found. Try searching again!");
    }

    // ✅ UI Expand/Collapse + Search Logic Combined
    searchButton.addEventListener("click", (e) => {
        if (searchContainer.classList.contains("collapsed")) {
            e.preventDefault();
            searchContainer.classList.remove("collapsed");
            searchContainer.classList.add("expanded");
            setTimeout(() => {
                searchInput.focus();
            }, 200);
        } else {
            handleSearch();
        }
    });

    // ✅ Enter key triggers search
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    });

    // ✅ Click outside to collapse
    document.addEventListener("click", (e) => {
        if (!searchContainer.contains(e.target) && searchContainer.classList.contains("expanded")) {
            searchContainer.classList.remove("expanded");
            searchContainer.classList.add("collapsed");
        }
    });
});






//----------------dropdowns   --         login country category    -------------------------//

document.addEventListener('click', function (event) {
    const loginDropdown = document.querySelector('.login-dropdown');
    const countryDropdown = document.querySelector('.country-dropdowner');
    const categoryDropdowns = document.querySelectorAll('.category-dropdown');


    // Toggle Login Dropdown
    if (loginDropdown.contains(event.target)) {
        loginDropdown.classList.toggle('active');
    } else {
        loginDropdown.classList.remove('active');
    }

    // Toggle Country Dropdown
    if (countryDropdown.contains(event.target)) {
        countryDropdown.classList.toggle('active');
    } else {
        countryDropdown.classList.remove('active');
    }
    // Toggle Category Dropdowns
    categoryDropdowns.forEach(dropdown => {
        if (dropdown.contains(event.target)) {
            dropdown.classList.toggle('active');
        } else {
            dropdown.classList.remove('active');
        }
    });
});

// Update Country Flag on Selection


// Prevent Dropdowns from Closing When Clicking Inside
document.querySelector('.login-content').addEventListener('click', (event) => {
    event.stopPropagation();
});

// Prevent Dropdowns from Closing When Clicking Inside
document.querySelectorAll('.dropdown-content').forEach(dropdown => {
    dropdown.addEventListener('click', (event) => {
        event.stopPropagation();
    });
});

