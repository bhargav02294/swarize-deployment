document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
  
    if (!productId) {
      console.error('❌ Product ID not found in URL');
      return;
    }
  
    const titleEl = document.getElementById('product-title');
    const imageEl = document.getElementById('product-image');
    const priceEl = document.getElementById('product-price');
    const descEl = document.getElementById('product-description');
    const extraImagesEl = document.getElementById('extra-images');
    const extraVideosEl = document.getElementById('extra-videos');
    const tagsEl = document.getElementById('product-tags');
    const storeNameEl = document.getElementById('store-name');
    const previewNameEl = document.getElementById('preview-name');
    const previewPriceEl = document.getElementById('preview-price');
    const previewDescriptionEl = document.getElementById('preview-description');
    const previewSummaryEl = document.getElementById('preview-summary');
    const previewCategoryEl = document.getElementById('preview-category');
    const previewSubcategoryEl = document.getElementById('preview-subcategory');
    const previewTagsEl = document.getElementById('preview-tags');
    const previewSizeEl = document.getElementById('preview-size');
    const previewColorEl = document.getElementById('preview-color');
    const previewMaterialEl = document.getElementById('preview-material');
    const previewModelStyleEl = document.getElementById('preview-model-style');
    const previewAvailableInEl = document.getElementById('preview-available-in');
    const previewThumbnailEl = document.getElementById('preview-thumbnail');
    const extraImagesContainer = document.getElementById('extra-images-container');
    const extraVideosContainer = document.getElementById('extra-videos-container');
  
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.product) {
          throw new Error('Product not found');
        }
  
        const p = data.product;
  
        // Main image
        const imgUrl = p.thumbnailImage?.startsWith('uploads/')
          ? `https://swarize.in/${p.thumbnailImage}`
          : p.thumbnailImage || 'https://via.placeholder.com/300x300.png?text=No+Image';
  
        imageEl.src = imgUrl;
        imageEl.alt = p.name;
        previewThumbnailEl.src = imgUrl;
  
        // Title and price
        titleEl.textContent = p.name;
        previewNameEl.textContent = p.name;
        priceEl.textContent = `₹${p.price}`;
        previewPriceEl.textContent = `₹${p.price}`;
        descEl.textContent = p.description || 'No description available';
        previewDescriptionEl.textContent = p.description || 'Product description will appear here.';
        
        // Summary, category, subcategory
        previewSummaryEl.textContent = `Summary: ${p.summary || '-'}`;
        previewCategoryEl.textContent = `Category: ${p.category || '-'}`;
        previewSubcategoryEl.textContent = `Subcategory: ${p.subcategory || '-'}`;
  
        // Tags
        tagsEl.textContent = `Tags: ${p.tags ? p.tags.join(', ') : '-'}`;
        previewTagsEl.textContent = `Tags: ${p.tags ? p.tags.join(', ') : '-'}`;
  
        // Additional product details
        previewSizeEl.textContent = `Size: ${p.size || '-'}`;
        previewColorEl.textContent = `Color: ${p.color || '-'}`;
        previewMaterialEl.textContent = `Material: ${p.material || '-'}`;
        previewModelStyleEl.textContent = `Model Style: ${p.modelStyle || '-'}`;
        previewAvailableInEl.textContent = `Available In: ${p.availableIn || 'All over India'}`;
  
        // Store name
        storeNameEl.textContent = p.store?.storeName || 'Unknown Store';
  
        // Extra images
        extraImagesContainer.innerHTML = '';
        if (Array.isArray(p.extraImages) && p.extraImages.length > 0) {
          p.extraImages.forEach(img => {
            const imgTag = document.createElement('img');
            imgTag.src = img.startsWith('uploads/') ? `https://swarize.in/${img}` : img;
            imgTag.alt = 'Extra image';
            imgTag.className = 'extra-thumb';
            extraImagesContainer.appendChild(imgTag);
          });
        } else {
          extraImagesContainer.innerHTML = 'No extra images available';
        }
  
        // Extra videos
        extraVideosContainer.innerHTML = '';
        if (Array.isArray(p.extraVideos) && p.extraVideos.length > 0) {
          p.extraVideos.forEach(vid => {
            const video = document.createElement('video');
            video.src = vid;
            video.controls = true;
            video.className = 'extra-video';
            extraVideosContainer.appendChild(video);
          });
        } else {
          extraVideosContainer.innerHTML = 'No extra videos available';
        }
  
      })
      .catch(err => {
        console.error('❌ Error fetching product:', err);
        const container = document.getElementById('product-container');
        if (container) {
          container.innerHTML = `<p class="error">Error loading product details.</p>`;
        }
      });
  
    // Add to Cart button
    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', async () => {
        try {
          const res = await fetch('/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId })
          });
  
          const json = await res.json();
          if (json.success) {
            window.location.href = `addtocart.html?id=${productId}`;
          } else {
            alert('❌ Failed to add to cart: ' + json.message);
          }
        } catch (e) {
          console.error('❌ Error adding to cart:', e);
          alert('Error adding to cart.');
        }
      });
    }
  });
  








document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        document.body.innerHTML = "<h2>Error: No product ID provided.</h2>";
        return;
    }

    fetch(`https://swarize.in/api/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            if (!product || Object.keys(product).length === 0) {
                document.body.innerHTML = "<h2>Product not found.</h2>";
                return;
            }

            // Update Product Details
            document.getElementById("preview-name").textContent = product.name || "Product Name";
            document.getElementById("preview-price").textContent = `₹${product.price || "0.00"}`;

            // Redirect to Payment Page on Buy Now Click
            document.querySelector(".buy-now").addEventListener("click", () => {
                window.location.href = `payment.html?id=${productId}&name=${encodeURIComponent(product.name)}&price=${product.price}`;
            });
        })
        .catch(error => {
            console.error("Error fetching product:", error);
            document.body.innerHTML = "<h2>Error loading product details.</h2>";
        });
});



















document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        document.body.innerHTML = "<h2>Error: No product ID provided.</h2>";
        return;
    }

    try {
        // ✅ Fetch product details
        const productResponse = await fetch(`http://swarize-deployment.onrender.com/api/products/${productId}`);
        const product = await productResponse.json();

        if (!product || Object.keys(product).length === 0) {
            document.body.innerHTML = "<h2>Product not found.</h2>";
            return;
        }

        document.getElementById("preview-name").textContent = product.name;
        document.getElementById("preview-price").textContent = `₹${product.price}`;

        // ✅ Fetch reviews
        fetchReviews();

    } catch (error) {
        console.error("❌ Error fetching product:", error);
        document.body.innerHTML = "<h2>Error loading product details.</h2>";
    }

    // ✅ Fetch and display reviews
    async function fetchReviews() {
        try {
            const response = await fetch(`http://swarize-deployment.onrender.com/api/reviews/${productId}`);
            const data = await response.json();

            const reviewsContainer = document.getElementById("reviews-container");
            const ratingCount = document.getElementById("rating-count");
            reviewsContainer.innerHTML = "";

            if (!data.success || data.reviews.length === 0) {
                reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
                ratingCount.innerHTML = "★★★★★ ( 0 )"; // Default 5-star if no reviews
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

            // ✅ Update average rating
            const avgRating = Math.round(data.avgRating);
            ratingCount.innerHTML = `${"★".repeat(avgRating)}${"☆".repeat(5 - avgRating)} (${data.reviews.length} Reviews)`;

        } catch (error) {
            console.error("❌ Error fetching reviews:", error);
        }
    }

    // ✅ Handle review submission
    document.getElementById("submit-review").addEventListener("click", async () => {
        const rating = parseInt(document.getElementById("rating").value);
        const comment = document.getElementById("comment").value.trim();
        const reviewMessage = document.getElementById("review-message");

        if (!rating || isNaN(rating) || rating < 1 || rating > 5 || !comment) {
            reviewMessage.textContent = "❌ Please provide a valid rating (1-5) and a comment.";
            reviewMessage.style.color = "red";
            return;
        }

        try {
            // ✅ Fetch user session to get userId
            const userResponse = await fetch("/api/user/session", { credentials: "include" });
            const userData = await userResponse.json();

            if (!userData.success || !userData.userId) {
                reviewMessage.textContent = "❌ You must be logged in to submit a review.";
                reviewMessage.style.color = "red";
                return;
            }

            const userId = userData.userId;

            // ✅ Submit the review
            const response = await fetch("http://swarize-deployment.onrender.com/api/reviews/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, rating, comment, userId })
            });

            const data = await response.json();

            if (data.success) {
                reviewMessage.textContent = "✅ Review submitted successfully!";
                reviewMessage.style.color = "green";
                document.getElementById("comment").value = "";
                fetchReviews(); // Refresh reviews
            } else {
                reviewMessage.textContent = `❌ ${data.message}`;
                reviewMessage.style.color = "red";
            }
        } catch (error) {
            console.error("❌ Error submitting review:", error);
            reviewMessage.textContent = "❌ Failed to submit review. Please try again.";
            reviewMessage.style.color = "red";
        }
    });
});






