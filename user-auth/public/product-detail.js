document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
  
    if (!productId) {
      document.body.innerHTML = "<h2>Error: No product ID provided.</h2>";
      return;
    }
  
    try {
      const productRes = await fetch(`https://swarize.in/api/products/${productId}`);
      const product = await productRes.json();
  
      if (!product || Object.keys(product).length === 0) {
        document.body.innerHTML = "<h2>Product not found.</h2>";
        return;
      }
  
      // Display product info
      document.getElementById("preview-name").textContent = product.name || "Product Name";
      document.getElementById("preview-price").textContent = `₹${product.price || "0.00"}`;
      document.getElementById("preview-description").textContent = product.description || "Product description will appear here.";
      document.getElementById("preview-summary").textContent = `Summary: ${product.summary || "-"}`;
      document.getElementById("preview-category").textContent = `Category: ${product.category || "-"}`;
      document.getElementById("preview-subcategory").textContent = `Subcategory: ${product.subcategory || "-"}`;
      document.getElementById("preview-tags").textContent = `Tags: ${product.tags ? product.tags.join(", ") : "-"}`;
      document.getElementById("preview-size").textContent = `Size: ${product.size || "-"}`;
      document.getElementById("preview-color").textContent = `Color: ${product.color || "-"}`;
      document.getElementById("preview-material").textContent = `Material: ${product.material || "-"}`;
      document.getElementById("preview-model-style").textContent = `Model Style: ${product.modelStyle || "-"}`;
      document.getElementById("preview-available-in").textContent = `Available In: ${product.availableIn || "All over India"}`;
  
      if (product.thumbnailImage) {
        document.getElementById("preview-thumbnail").src = product.thumbnailImage;
      }
  
      const extraImagesContainer = document.getElementById("extra-images-container");
      extraImagesContainer.innerHTML = "";
      if (product.extraImages?.length > 0) {
        product.extraImages.forEach(imgUrl => {
          const img = document.createElement("img");
          img.src = imgUrl;
          img.alt = "Extra Image";
          img.style.width = "100px";
          extraImagesContainer.appendChild(img);
        });
      }
  
      const extraVideosContainer = document.getElementById("extra-videos-container");
      extraVideosContainer.innerHTML = "";
      if (product.extraVideos?.length > 0) {
        product.extraVideos.forEach(videoUrl => {
          const video = document.createElement("video");
          video.src = videoUrl;
          video.controls = true;
          video.style.width = "150px";
          extraVideosContainer.appendChild(video);
        });
      }
  
      // Add to Cart
      document.querySelector(".add-to-cart").addEventListener("click", async () => {
        try {
          const response = await fetch("https://swarize.in/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ productId })
          });
          const result = await response.json();
          if (result.success) {
            window.location.href = `addtocart.html?id=${productId}`;
          } else {
            alert("❌ Failed to add product to cart: " + result.message);
          }
        } catch (error) {
          console.error("❌ Error adding to cart:", error);
          alert("❌ Error adding product to cart.");
        }
      });
  
      // Buy Now
      document.querySelector(".buy-now").addEventListener("click", () => {
        window.location.href = `payment.html?id=${productId}&name=${encodeURIComponent(product.name)}&price=${product.price}`;
      });
  
      // Fetch Reviews
      fetchReviews();
  
    } catch (error) {
      console.error("❌ Error loading product:", error);
      document.body.innerHTML = "<h2>Error loading product details.</h2>";
    }
  
    async function fetchReviews() {
      try {
        const res = await fetch(`https://swarize.in/api/reviews/${productId}`);
        const data = await res.json();
  
        const reviewsContainer = document.getElementById("reviews-container");
        const ratingCount = document.getElementById("rating-count");
        reviewsContainer.innerHTML = "";
  
        if (!data.success || data.reviews.length === 0) {
          reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
          ratingCount.innerHTML = "★★★★★ ( 0 )";
          return;
        }
  
        let totalRating = 0;
        data.reviews.forEach(r => {
          totalRating += r.rating;
          const div = document.createElement("div");
          div.className = "review";
          div.innerHTML = `
            <p><strong>User:</strong> ${r.userName || "Anonymous"}</p>
            <p><strong>Rating:</strong> ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</p>
            <p><strong>Review:</strong> ${r.comment}</p>
            <p><small>${new Date(r.createdAt).toLocaleString()}</small></p>
          `;
          reviewsContainer.appendChild(div);
        });
  
        const avg = (totalRating / data.reviews.length).toFixed(1);
        ratingCount.innerHTML = `★★★★☆ (${avg})`;
      } catch (e) {
        console.error("❌ Error loading reviews:", e);
      }
    }
  });
  