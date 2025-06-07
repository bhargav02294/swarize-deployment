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
    
      "preview-subcategory": `Subcategory: ${product.subcategory || "-"}`,
      "preview-material": `Material: ${product.material || "-"}`,
      "preview-pattern": `Pattern: ${product.pattern || "-"}`,
      "preview-wash-care": `Wash Care: ${product.washCare || "-"}`,
      "preview-model-style": `Model Style: ${product.modelStyle || "-"}`,
      "preview-brand": `Brand: ${product.brand || "-"}`,
      "preview-available-in": `Available In: ${product.availableIn || "All over India"}`,
      "preview-description": product.description,
      "preview-summary": `Summary: ${product.summary || "N/A"}`,
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

    document.getElementById("toggle-desc-btn").addEventListener("click", () => {
  document.getElementById("desc-summary-content").style.display = "block";
  document.getElementById("toggle-desc-btn").style.display = "none";
});

document.getElementById("toggle-less-btn").addEventListener("click", () => {
  document.getElementById("desc-summary-content").style.display = "none";
  document.getElementById("toggle-desc-btn").style.display = "inline-block";
});

    // ==== SIZE ====
const sizeContainer = document.getElementById("preview-size");
sizeContainer.innerHTML = "";

const sizes = Array.isArray(product.size)
  ? product.size
  : (product.size || "").split(",").map(s => s.trim()).filter(Boolean);

let selectedSize = null;

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
