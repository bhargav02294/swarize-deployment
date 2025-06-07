document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  if (!productId) {
    document.body.innerHTML = "<h2>No product ID provided.</h2>";
    return;
  }

  try {
    const res = await fetch(`https://swarize.in/api/products/detail/${productId}`);
    const { product } = await res.json();

    if (!product) {
      document.body.innerHTML = "<h2>Product not found.</h2>";
      return;
    }

    // Set product details
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText("preview-name", product.name);
    setText("preview-price", `₹${product.price}`);
    setText("preview-summary", product.summary || "N/A");
    setText("preview-category", product.category || "-");
    setText("preview-subcategory", product.subcategory || "-");
    setText("preview-tags", product.tags?.join(", ") || "-");
    setText("preview-material", product.material || "-");
    setText("preview-pattern", product.pattern || "-");
    setText("preview-wash-care", product.washCare || "-");
    setText("preview-model-style", product.modelStyle || "-");
    setText("preview-brand", product.brand || "-");
    setText("preview-available-in", product.availableIn || "All over India");

    // Description with Show More/Less
    const descEl = document.getElementById("preview-description");
    const showMoreBtn = document.getElementById("show-more-btn");
    if (descEl && showMoreBtn) {
      const fullDesc = product.description || "";
      const shortDesc = fullDesc.substring(0, 200);
      let isExpanded = false;
      descEl.textContent = shortDesc + "...";
      showMoreBtn.textContent = "Show More";

      showMoreBtn.addEventListener("click", () => {
        isExpanded = !isExpanded;
        descEl.textContent = isExpanded ? fullDesc : shortDesc + "...";
        showMoreBtn.textContent = isExpanded ? "Show Less" : "Show More";
      });
    }

    // Store link
    const storeEl = document.getElementById("store-link");
    if (storeEl && product.store?.storeName) {
      storeEl.textContent = product.store.storeName;
      if (product.store.slug) {
        storeEl.addEventListener("click", () => {
          window.location.href = `sellers-products.html?slug=${product.store.slug}`;
        });
      }
    }

    // Media Slider
    const mediaSlider = document.getElementById("media-slider");
    const mediaThumbnails = document.getElementById("media-thumbnails");
    let currentSlide = 0;
    const mediaItems = [];

    if (product.thumbnailImage)
      mediaItems.push({ type: "img", src: product.thumbnailImage });

    (product.extraImages || []).forEach(img => mediaItems.push({ type: "img", src: img }));
    (product.extraVideos || []).forEach(vid => mediaItems.push({ type: "video", src: vid }));

    if (mediaSlider && mediaThumbnails) {
      mediaSlider.innerHTML = "";
      mediaThumbnails.innerHTML = "";

      mediaItems.forEach(({ type, src }, index) => {
        const mediaEl = document.createElement(type);
        mediaEl.src = src;
        mediaEl.classList.add("slider-media");
        if (type === "video") mediaEl.controls = true;
        if (index !== 0) mediaEl.style.display = "none";
        mediaSlider.appendChild(mediaEl);

        const thumbEl = document.createElement("img");
        thumbEl.src = src;
        thumbEl.classList.add("thumbnail");
        thumbEl.addEventListener("click", () => {
          const allMedia = mediaSlider.querySelectorAll(".slider-media");
          allMedia.forEach((el, i) => {
            el.style.display = i === index ? "block" : "none";
          });
          currentSlide = index;
        });
        mediaThumbnails.appendChild(thumbEl);
      });
    }

    // Color Options
    const colorOptions = document.getElementById("color-options");
    if (colorOptions && product.colors?.length) {
      colorOptions.innerHTML = "";
      product.colors.forEach(color => {
        const colorBtn = document.createElement("button");
        colorBtn.className = "color-btn";
        colorBtn.style.backgroundColor = color;
        colorBtn.title = color;
        colorBtn.addEventListener("click", () => {
          document.querySelectorAll(".color-btn").forEach(btn => btn.classList.remove("selected"));
          colorBtn.classList.add("selected");
        });
        colorOptions.appendChild(colorBtn);
      });
    }

    // Size Options
    const sizeOptions = document.getElementById("size-options");
    if (sizeOptions && product.sizes?.length) {
      sizeOptions.innerHTML = "";
      product.sizes.forEach(size => {
        const sizeBtn = document.createElement("button");
        sizeBtn.className = "size-btn";
        sizeBtn.textContent = size;
        sizeBtn.addEventListener("click", () => {
          document.querySelectorAll(".size-btn").forEach(btn => btn.classList.remove("selected"));
          sizeBtn.classList.add("selected");
        });
        sizeOptions.appendChild(sizeBtn);
      });
    }

    // Add to Cart
    const addToCartBtn = document.querySelector(".add-to-cart");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", async () => {
        const selectedSize = document.querySelector(".size-btn.selected")?.textContent;
        const selectedColor = document.querySelector(".color-btn.selected")?.title;
        if (!selectedSize || !selectedColor) {
          alert("Please select size and color.");
          return;
        }
        try {
          const res = await fetch("https://swarize.in/api/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, size: selectedSize, color: selectedColor }),
            credentials: "include"
          });
          const data = await res.json();
          if (data.success) {
            window.location.href = `addtocart.html?id=${productId}`;
          } else {
            alert(data.message || "Error adding to cart.");
          }
        } catch (err) {
          alert("Error adding product to cart.");
        }
      });
    }

    // Buy Now
    const buyNowBtn = document.querySelector(".buy-now");
    if (buyNowBtn) {
      buyNowBtn.addEventListener("click", () => {
        const selectedSize = document.querySelector(".size-btn.selected")?.textContent;
        const selectedColor = document.querySelector(".color-btn.selected")?.title;
        if (!selectedSize || !selectedColor) {
          alert("Please select size and color.");
          return;
        }
        window.location.href = `payment.html?id=${productId}&name=${encodeURIComponent(product.name)}&price=${product.price}&size=${selectedSize}&color=${encodeURIComponent(selectedColor)}`;
      });
    }

    // Fetch Reviews
    if (typeof fetchReviews === "function") {
      fetchReviews();
    }











        

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
