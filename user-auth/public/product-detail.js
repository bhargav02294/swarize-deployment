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
      if (el) el.textContent = text;
    };

    const fields = {
      "preview-name": product.name,
      "preview-price": `₹${product.price}`,
    
      "preview-subcategory": `${product.subcategory || "-"}`,
      "preview-material": `${product.material || "-"}`,
      "preview-pattern": `${product.pattern || "-"}`,
      "preview-wash-care": `${product.washCare || "-"}`,
      "preview-model-style": `${product.modelStyle || "-"}`,
      "preview-brand": `${product.brand || " "}`,
      "preview-available-in": `${product.availableIn || "All over India"}`,
      "preview-description": product.description,
      "preview-summary": `${product.summary || " "}`,
    };

    Object.entries(fields).forEach(([id, text]) => setText(id, text));

    const storeName = product.store?.storeName;
    const storeSlug = product.store?.slug;
    const storeEl = document.getElementById("store-link");
    if (storeEl && storeName) {
      storeEl.textContent = storeName;
      if (storeSlug) {
        storeEl.addEventListener("click", () => {
          window.location.href = `sellers-products.html?slug=${storeSlug}`;
        });
      }
    }


 document.getElementById("preview-name").textContent = product.name || "-";
    document.getElementById("preview-price").textContent = product.price ? `₹${product.price}` : "-";
    document.getElementById("preview-description").textContent = product.description || "-";

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


    // ==== SIZE ====
const sizeContainer = document.getElementById("preview-size");
sizeContainer.innerHTML = "";

const sizes = Array.isArray(product.size)
  ? product.size
  : (product.size || "").split(",").map(s => s.trim()).filter(Boolean);

const selectedSize = document.getElementById("selected-size")?.value || "";

if (sizes.length > 0) {
  sizes.forEach(size => {
    const btn = document.createElement("button");
    btn.textContent = size;

    btn.addEventListener("click", () => {
      // Unselect all
      document.querySelectorAll(".size-container button").forEach(b => b.classList.remove("selected"));
      // Select current
      btn.classList.add("selected");
      selectedSize = size;
      console.log("Selected size:", selectedSize);
      // You can save to localStorage or prepare to submit in cart logic
    });

    sizeContainer.appendChild(btn);
  });
} else {
  sizeContainer.textContent = "-";
}

  

const sizeChartBtn = document.getElementById("size-chart-btn");
const sizeChartModal = document.getElementById("size-chart-modal");
const sizeChartOverlay = document.getElementById("size-chart-overlay");
const closeSizeChart = document.getElementById("close-size-chart");
const sizeChartContent = document.getElementById("size-chart-content");

const sizeChartData = {
  Women: {
    "Ethnic Wear": {
      headers: ["Size", "Bust (in)", "Waist (in)", "Hip (in)", "Length (in)"],
      rows: [
        ["S", "34", "28", "36", "50"],
        ["M", "36", "30", "38", "51"],
        ["L", "38", "32", "40", "52"],
        ["XL", "40", "34", "42", "53"],
        ["2XL", "42", "36", "44", "54"],
        ["3XL", "44", "38", "46", "55"]
      ]
    },
    "Western Wear": {
      headers: ["Size", "Bust", "Waist", "Length"],
      rows: [
        ["XS", "32", "24", "20"],
        ["S", "34", "26", "22"],
        ["M", "36", "28", "24"],
        ["L", "38", "30", "26"],
        ["XL", "40", "32", "28"],
        ["2XL", "42", "34", "30"]
      ]
    },
    "Bottomwear": {
      headers: ["Size", "Waist", "Hip", "Inseam"],
      rows: [
        ["26", "26", "34", "28"],
        ["28", "28", "36", "29"],
        ["30", "30", "38", "30"],
        ["32", "32", "40", "31"],
        ["34", "34", "42", "32"],
        ["36", "36", "44", "32"]
      ]
    },
    "Winterwear": {
      headers: ["Size", "Chest", "Sleeve", "Length"],
      rows: [
        ["S", "34", "22", "26"],
        ["M", "36", "23", "27"],
        ["L", "38", "24", "28"],
        ["XL", "40", "25", "29"],
        ["2XL", "42", "26", "30"]
      ]
    },
    "Innerwear & Loungewear": {
      headers: ["Size", "Bust", "Waist", "Length"],
      rows: [
        ["S", "32", "26", "28"],
        ["M", "34", "28", "29"],
        ["L", "36", "30", "30"],
        ["XL", "38", "32", "31"],
        ["2XL", "40", "34", "32"]
      ]
    },
    "Footwear": {
      headers: ["UK", "US", "EU", "Foot Length (cm)"],
      rows: [
        ["3", "5", "36", "22.5"],
        ["4", "6", "37", "23.5"],
        ["5", "7", "38", "24.5"],
        ["6", "8", "39", "25"],
        ["7", "9", "40", "25.5"],
        ["8", "10", "41", "26"]
      ]
    }
  },

  Men: {
    "Topwear": {
      headers: ["Size", "Chest", "Waist", "Sleeve", "Length"],
      rows: [
        ["S", "36", "30", "22", "26"],
        ["M", "38", "32", "23", "27"],
        ["L", "40", "34", "24", "28"],
        ["XL", "42", "36", "25", "29"],
        ["2XL", "44", "38", "26", "30"],
        ["3XL", "46", "40", "27", "31"]
      ]
    },
    "Bottomwear": {
      headers: ["Waist", "Inseam", "Hip"],
      rows: [
        ["28", "28", "36"],
        ["30", "30", "38"],
        ["32", "32", "40"],
        ["34", "32", "42"],
        ["36", "34", "44"],
        ["38", "34", "46"],
        ["40", "36", "48"]
      ]
    },
    "Ethnic Wear": {
      headers: ["Size", "Chest", "Waist", "Length"],
      rows: [
        ["S", "36", "30", "40"],
        ["M", "38", "32", "42"],
        ["L", "40", "34", "43"],
        ["XL", "42", "36", "44"],
        ["2XL", "44", "38", "45"]
      ]
    },
    "Winterwear": {
      headers: ["Size", "Chest", "Sleeve", "Length"],
      rows: [
        ["S", "36", "22", "26"],
        ["M", "38", "23", "27"],
        ["L", "40", "24", "28"],
        ["XL", "42", "25", "29"],
        ["2XL", "44", "26", "30"]
      ]
    },
    "Innerwear & Sleepwear": {
      headers: ["Size", "Chest", "Waist", "Length"],
      rows: [
        ["S", "34", "28", "26"],
        ["M", "36", "30", "27"],
        ["L", "38", "32", "28"],
        ["XL", "40", "34", "29"],
        ["2XL", "42", "36", "30"]
      ]
    },
    "Footwear": {
      headers: ["UK", "US", "EU", "Foot Length (cm)"],
      rows: [
        ["6", "7", "40", "25"],
        ["7", "8", "41", "25.5"],
        ["8", "9", "42", "26"],
        ["9", "10", "43", "27"],
        ["10", "11", "44", "28"],
        ["11", "12", "45", "29"],
        ["12", "13", "46", "30"]
      ]
    }
  },

  Kids: {
    "Boys Clothing": {
      headers: ["Size", "Age", "Height", "Chest", "Waist", "Hip"],
      rows: [
        ["2T", "2", "33-36", "21", "18", "22"],
        ["4T", "4", "39-42", "23", "20", "24"],
        ["6", "6", "45-48", "25", "22", "26"],
        ["8", "8", "51-54", "27", "24", "28"],
        ["10", "10", "55-58", "29", "26", "30"],
        ["12", "12", "59-62", "31", "28", "32"]
      ]
    },
    "Girls Clothing": {
      headers: ["Size", "Age", "Height", "Chest", "Waist", "Hip"],
      rows: [
        ["2T", "2", "33-36", "21", "18", "22"],
        ["4T", "4", "39-42", "23", "20", "24"],
        ["6", "6", "45-48", "25", "22", "26"],
        ["8", "8", "51-54", "27", "24", "28"],
        ["10", "10", "55-58", "29", "26", "30"],
        ["12", "12", "59-62", "31", "28", "32"]
      ]
    },
    "Winterwear": {
      headers: ["Size", "Age", "Chest", "Length", "Sleeve"],
      rows: [
        ["XS", "2-3", "22", "18", "12"],
        ["S", "4-5", "24", "20", "14"],
        ["M", "6-7", "26", "22", "16"],
        ["L", "8-9", "28", "24", "18"],
        ["XL", "10-12", "30", "26", "20"]
      ]
    },
    "Festive Wear": {
      headers: ["Size", "Age", "Chest", "Waist", "Height"],
      rows: [
        ["S", "2-4", "22", "20", "36"],
        ["M", "4-6", "24", "22", "40"],
        ["L", "6-8", "26", "24", "45"],
        ["XL", "8-10", "28", "26", "50"],
        ["2XL", "10-12", "30", "28", "55"]
      ]
    },
    "Footwear": {
      headers: ["UK", "US", "EU", "Age", "Foot Length (cm)"],
      rows: [
        ["7C", "8C", "24", "2", "15"],
        ["8C", "9C", "25", "3", "15.5"],
        ["10C", "11C", "27", "5", "17"],
        ["12C", "13C", "30", "7", "18.5"],
        ["1Y", "2Y", "32", "9", "20"],
        ["3Y", "4Y", "35", "12", "21.5"]
      ]
    }
  },

  Accessories: {
    "Unisex Footwear": {
      headers: ["UK", "US", "EU", "Foot Length (cm)"],
      rows: [
        ["4", "5", "37", "23"],
        ["5", "6", "38", "24"],
        ["6", "7", "39", "25"],
        ["7", "8", "40", "26"],
        ["8", "9", "41", "27"],
        ["9", "10", "42", "28"],
        ["10", "11", "43", "29"],
        ["11", "12", "44", "30"]
      ]
    }
  }
};


sizeChartBtn.addEventListener("click", () => {
  const category = product.category;
  const subcategory = product.subcategory;

  const chartData = sizeChartData[category]?.[subcategory];

  if (!chartData) {
    sizeChartContent.innerHTML = "<p>No size chart available for this subcategory.</p>";
  } else {
    let table = '<table><thead><tr>' + chartData.headers.map(h => `<th>${h}</th>`).join("") + '</tr></thead><tbody>';
    for (const row of chartData.rows) {
      table += '<tr>' + row.map(d => `<td>${d}</td>`).join("") + '</tr>';
    }
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







    // ==== COLOR ====
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
    } else {
      colorContainer.textContent = " ";
    }


    const mediaSlider = document.getElementById("media-slider");
let currentSlide = 0;

if (mediaSlider) {
  mediaSlider.innerHTML = "";
  const mediaItems = [];

  if (product.thumbnailImage)
    mediaItems.push({ type: "img", src: product.thumbnailImage });

  (product.extraImages || []).forEach(img => mediaItems.push({ type: "img", src: img }));
  (product.extraVideos || []).forEach(vid => mediaItems.push({ type: "video", src: vid }));

  // Create a wrapper div for each media so it always fits container width
  mediaItems.forEach(({ type, src }) => {
    const wrapper = document.createElement("div");
    wrapper.style.minWidth = "100%";  // Ensures one item per view
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
            if (data.success) {
                window.location.href = `addtocart.html?id=${productId}`;
            } else {
                alert(" " + data.message);
            }
        } catch (err) {
            alert(" Error adding product to cart.");
        }
    });
}


        const buyNowBtn = document.querySelector(".buy-now");
        if (buyNowBtn) {
            buyNowBtn.addEventListener("click", () => {
                window.location.href = `payment.html?id=${productId}&name=${encodeURIComponent(product.name)}&price=${product.price}`;
            });
        }

        fetchReviews();











        

        // Update SEO meta dynamically
document.title = `${product.name} | Swarize`;

document.getElementById("dynamic-title").textContent = `${product.name} | Swarize`;

const desc = product.description?.slice(0, 150) || "Explore this product on Swarize.";
const keywords = [product.name, product.category, product.subcategory, product.tags?.join(", ") || ""].join(", ");

document.getElementById("meta-description").setAttribute("content", desc);
document.getElementById("meta-keywords").setAttribute("content", keywords);

document.getElementById("og-title").setAttribute("content", product.name);
document.getElementById("og-description").setAttribute("content", desc);
document.getElementById("og-image").setAttribute("content", product.thumbnailImage || "/default-thumbnail.jpg");
document.getElementById("og-url").setAttribute("content", window.location.href);

document.getElementById("twitter-title").setAttribute("content", product.name);
document.getElementById("twitter-description").setAttribute("content", desc);
document.getElementById("twitter-image").setAttribute("content", product.thumbnailImage || "/default-thumbnail.jpg");

    } 
    
    
    catch (err) {
        console.error(" Error fetching product:", err);
        document.body.innerHTML = "<h2>Error loading product details.</h2>";
    }

    async function fetchReviews() {
        try {
            const response = await fetch(`https://swarize.in/api/reviews/${productId}`);
            const data = await response.json();

            const reviewsContainer = document.getElementById("reviews-container");
            const ratingCount = document.getElementById("rating-count");

            if (!reviewsContainer || !ratingCount) return;

            reviewsContainer.innerHTML = "";

            if (!data.success || !data.reviews.length) {
                reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
                ratingCount.innerHTML = "★★★★★ ( 0 )";
                return;
            }

            let totalRating = 0;

            data.reviews.forEach(review => {
                totalRating += review.rating;
                const reviewDiv = document.createElement("div");
                reviewDiv.classList.add("review");
                reviewDiv.innerHTML = `
                    <p><strong>User:</strong> ${review.userName || "Anonymous"}</p>
                    <p><strong>Rating:</strong> ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</p>
                    <p><strong>Review:</strong> ${review.comment}</p>
                    <p><small>${new Date(review.createdAt).toLocaleString()}</small></p>
                `;
                reviewsContainer.appendChild(reviewDiv);
            });

            const avgRating = Math.round(data.avgRating);
            ratingCount.innerHTML = `${"★".repeat(avgRating)}${"☆".repeat(5 - avgRating)} (${data.reviews.length} Reviews)`;
        } catch (error) {
            console.error(" Error fetching reviews:", error);
        }
    }

    const submitBtn = document.getElementById("submit-review");
    if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
            const rating = parseInt(document.getElementById("rating")?.value || 0);
            const comment = document.getElementById("comment")?.value.trim();
            const reviewMessage = document.getElementById("review-message");

            if (!rating || isNaN(rating) || rating < 1 || rating > 5 || !comment) {
                if (reviewMessage) {
                    reviewMessage.textContent = " Please provide a valid rating (1-5) and a comment.";
                    reviewMessage.style.color = "red";
                }
                return;
            }

            try {
                const userRes = await fetch("/api/user/session", { credentials: "include" });
                const userData = await userRes.json();

                if (!userData.success || !userData.userId) {
                    if (reviewMessage) {
                        reviewMessage.textContent = " You must be logged in to submit a review.";
                        reviewMessage.style.color = "red";
                    }
                    return;
                }

                const response = await fetch("https://swarize.in/api/reviews/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId, rating, comment, userId: userData.userId })
                });

                const data = await response.json();

                if (data.success) {
                    if (reviewMessage) {
                        reviewMessage.textContent = "Review submitted successfully!";
                        reviewMessage.style.color = "green";
                        document.getElementById("comment").value = "";
                    }
                    fetchReviews();
                } else {
                    if (reviewMessage) {
                        reviewMessage.textContent = " Failed to submit review.";
                        reviewMessage.style.color = "red";
                    }
                }
            } catch (err) {
                if (reviewMessage) {
                    reviewMessage.textContent = " Error submitting review.";
                    reviewMessage.style.color = "red";
                }
            }
        });
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









document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) return;

  try {
    const res = await fetch(`/api/products/${productId}`);
    const result = await res.json();
    if (!result.success) return console.error("Product not found");
    const p = result.product;

    // Update meta and title
    document.title = `${p.name} | Swarize`;
    document.getElementById('dynamic-title').textContent = document.title;
    document.getElementById('meta-description').content = p.summary || p.description || '';
    document.getElementById('meta-keywords').content = p.tags?.join(', ') || '';
    document.getElementById('og-title').content = p.name;
    document.getElementById('og-description').content = p.summary || '';
    document.getElementById('og-image').content = p.thumbnailImage || '/default-thumbnail.jpg';
    document.getElementById('og-url').content = window.location.href;
    document.getElementById('twitter-title').content = p.name;
    document.getElementById('twitter-description').content = p.summary || '';
    document.getElementById('twitter-image').content = p.thumbnailImage || '/default-thumbnail.jpg';

    // Images & slider
    const slider = document.getElementById('media-slider');
    slider.innerHTML = '';
    const allMedia = [p.thumbnailImage, ...(p.extraImages || []), ...(p.extraVideos || [])];
    allMedia.forEach(src => {
      let el;
      if (src.endsWith('.mp4') || src.endsWith('.webm')) {
        el = document.createElement('video');
        el.src = src;
        el.controls = true;
      } else {
        el = document.createElement('img');
        el.src = src;
      }
      el.classList.add('media-item');
      el.addEventListener('click', () => document.getElementById('preview-name').scrollIntoView());
      slider.appendChild(el);
    });

    // Store info
    document.getElementById('store-link').textContent = p.sellerStoreName || 'Unknown Store';

    // Product name & prices
    document.getElementById('preview-name').textContent = p.name || '-';
    const priceEl = document.getElementById('preview-price');
    if (p.displayPrice && p.displayPrice > 0) {
      priceEl.innerHTML = `<span class="original-price">₹${p.displayPrice}</span> <span class="discount">₹${p.price}</span>`;
    } else {
      priceEl.textContent = `₹${p.price}`;
    }

    // Color
    const colorContainer = document.getElementById('preview-color');
    colorContainer.style.backgroundColor = p.color || '#fff';
    document.getElementById('preview-color-text').textContent = p.color || '-';

    // Size / Available Sizes
    document.getElementById('preview-size').textContent = p.availableSizes?.join(' / ') || '-';
    document.getElementById('preview-saree-size').textContent = p.sareeSize ? `${p.sareeSize} meters` : '-';
    document.getElementById('preview-blouse-size').textContent = p.blouseSize ? `${p.blouseSize} meters` : '-';

    // Other attributes
    document.getElementById('preview-category').textContent = p.category || '-';
    document.getElementById('preview-subcategory').textContent = p.subcategory || '-';
    document.getElementById('preview-product-code').textContent = p.productCode || '-';
    document.getElementById('preview-material').textContent = p.material || '-';
    document.getElementById('preview-pattern').textContent = p.pattern || '-';
    document.getElementById('preview-wash-care').textContent = p.washCare || '-';
    document.getElementById('preview-occasion').textContent = p.occasion || '-';
    document.getElementById('preview-available-in').textContent = p.availableIn || 'All Over India';

    // Description & summary
    document.getElementById('preview-description').textContent = p.description || '-';
    document.getElementById('preview-summary').textContent = p.summary || '-';

    // Tags (optional, can be shown somewhere)
    if (p.tags && p.tags.length) {
      const tagsContainer = document.createElement('div');
      tagsContainer.classList.add('tags');
      tagsContainer.textContent = 'Tags: ' + p.tags.join(', ');
      document.querySelector('.product-details-section').appendChild(tagsContainer);
    }

  } catch (err) {
    console.error("Error loading product details:", err);
  }

  // Description collapsible toggle
  const toggleDescBtn = document.getElementById('toggle-desc-btn');
  const descContent = document.getElementById('desc-summary-content');
  const toggleLessBtn = document.getElementById('toggle-less-btn');
  toggleDescBtn.addEventListener('click', () => descContent.style.display = 'block');
  toggleLessBtn.addEventListener('click', () => descContent.style.display = 'none');

});
