document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
  
    if (!productId) {
      alert('❌ No product ID found in URL.');
      return;
    }
  
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
  
      if (!data.success) {
        alert('❌ Product not found.');
        return;
      }
  
      const product = data.product;
  
      // Set thumbnail
      const thumbnail = document.getElementById('preview-thumbnail');
      thumbnail.src = product.thumbnailImage;
      thumbnail.alt = product.name;
  
      // Basic Info
      document.getElementById('preview-name').textContent = product.name;
      document.getElementById('preview-price').textContent = `₹${product.price}`;
      document.getElementById('preview-description').textContent = product.description || 'No description.';
      document.getElementById('preview-summary').innerHTML = `<strong>Summary:</strong> ${product.summary || 'Not available'}`;
  
      // Optional fields
      document.getElementById('preview-available-in').innerHTML = `<strong>Available In:</strong> ${product.availableIn?.join(', ') || 'Not specified'}`;
      document.getElementById('preview-category').innerHTML = `<strong>Category:</strong> ${product.category || 'Not specified'}`;
      document.getElementById('preview-subcategory').innerHTML = `<strong>Subcategory:</strong> ${product.subcategory || 'Not specified'}`;
      document.getElementById('preview-tags').innerHTML = `<strong>Tags:</strong> ${product.tags?.join(', ') || 'None'}`;
      document.getElementById('preview-size').innerHTML = `<strong>Size:</strong> ${product.size || 'Not specified'}`;
      document.getElementById('preview-color').innerHTML = `<strong>Color:</strong> ${product.color || 'Not specified'}`;
      document.getElementById('preview-material').innerHTML = `<strong>Material:</strong> ${product.material || 'Not specified'}`;
      document.getElementById('rating-count').textContent = `(${product.reviews?.length || 0} Reviews)`;
  
      // Extra Images
      const extraImgContainer = document.getElementById('extra-images-container');
      if (product.extraImages?.length) {
        extraImgContainer.innerHTML = '';
        product.extraImages.forEach(img => {
          const i = document.createElement('img');
          i.src = img;
          i.alt = 'Extra Image';
          i.className = 'extra-image';
          extraImgContainer.appendChild(i);
        });
      } else {
        extraImgContainer.textContent = 'No extra images available.';
      }
  
      // Extra Videos
      const extraVideoContainer = document.getElementById('extra-videos-container');
      if (product.extraVideos?.length) {
        extraVideoContainer.innerHTML = '';
        product.extraVideos.forEach(video => {
          const v = document.createElement('video');
          v.src = video;
          v.controls = true;
          v.className = 'extra-video';
          extraVideoContainer.appendChild(v);
        });
      } else {
        extraVideoContainer.textContent = 'No extra videos available.';
      }
  


         // Handle Add to Cart Button
         document.querySelector(".add-to-cart").addEventListener("click", async () => {
            try {
                const response = await fetch("https://swarize.in/cart/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId }),
                    credentials: "include"
                });

                const data = await response.json();
                if (data.success) {
                    console.log("✅ Product added to cart");
                    window.location.href = `addtocart.html?id=${productId}`; // Ensure productId is correct
                } else {
                    alert("❌ Failed to add product to cart: " + data.message);
                }
            } catch (error) {
                console.error("❌ Error adding to cart:", error);
                alert("❌ Error adding product to cart.");
            }
        });

        
    } catch (err) {
      console.error('❌ Error loading product details:', err);
      alert('Error loading product details.');
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






