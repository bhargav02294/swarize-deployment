document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        document.body.innerHTML = "<h2>Error: No product ID provided.</h2>";
        return;
    }

    try {
        // ✅ Fetch product details
        const productResponse = await fetch(`https://swarize.in/api/products/${productId}`);
        const product = await productResponse.json();

        if (!product || Object.keys(product).length === 0) {
            document.body.innerHTML = "<h2>Product not found.</h2>";
            return;
        }

        // ✅ Fetch Store Name
        const storeSlug = product.storeSlug;
        let storeName = "Unknown Store";
        try {
            const storeRes = await fetch(`https://swarize.in/api/store/${storeSlug}`);
            const storeData = await storeRes.json();
            storeName = storeData.store?.storeName || "Unknown Store";
        } catch (err) {
            console.error("❌ Error fetching store name:", err);
        }

        document.getElementById("preview-store-name").textContent = `Store: ${storeName}`;

        // ✅ Update Product Details
        document.getElementById("preview-name").textContent = product.name || "Product Name";
        document.getElementById("preview-price").textContent = `₹${product.price || "0.00"}`;
        document.getElementById("preview-description").textContent = product.description || "Product description will appear here.";
        document.getElementById("preview-summary").textContent = `Summary: ${product.summary || "-"}`;
        document.getElementById("preview-category").textContent = `Category: ${product.category || "-"}`;
        document.getElementById("preview-subcategory").textContent = `Subcategory: ${product.subcategory || "-"}`;
        document.getElementById("preview-tags").textContent = `Tags: ${product.tags?.join(", ") || "-"}`;
        document.getElementById("preview-size").textContent = `Size: ${product.size || "-"}`;
        document.getElementById("preview-color").textContent = `Color: ${product.color || "-"}`;
        document.getElementById("preview-material").textContent = `Material: ${product.material || "-"}`;
        document.getElementById("preview-model-style").textContent = `Model Style: ${product.modelStyle || "-"}`;
        document.getElementById("preview-available-in").textContent = `Available In: ${product.availableIn || "All over India"}`;

        // ✅ Slider Section
        const sliderContainer = document.getElementById("media-slider");
        const media = [];

        if (product.thumbnailImage) {
            media.push({ type: "image", src: product.thumbnailImage });
        }
        if (product.extraImages?.length) {
            product.extraImages.forEach(url => media.push({ type: "image", src: url }));
        }
        if (product.extraVideos?.length) {
            product.extraVideos.forEach(url => media.push({ type: "video", src: url }));
        }

        let currentIndex = 0;

        function renderSlide(index) {
            sliderContainer.innerHTML = "";
            const item = media[index];

            if (item.type === "image") {
                const img = document.createElement("img");
                img.src = item.src;
                img.style.width = "300px";
                img.style.maxHeight = "300px";
                img.alt = "Media Slide";
                sliderContainer.appendChild(img);
            } else if (item.type === "video") {
                const video = document.createElement("video");
                video.src = item.src;
                video.controls = true;
                video.style.width = "300px";
                video.style.maxHeight = "300px";
                sliderContainer.appendChild(video);
            }
        }

        // Initial Slide
        if (media.length > 0) {
            renderSlide(currentIndex);
        } else {
            sliderContainer.innerHTML = "<p>No media available.</p>";
        }

        // Navigation Buttons
        document.getElementById("prev-slide").addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex--;
                renderSlide(currentIndex);
            }
        });

        document.getElementById("next-slide").addEventListener("click", () => {
            if (currentIndex < media.length - 1) {
                currentIndex++;
                renderSlide(currentIndex);
            }
        });

        // ✅ Add to Cart
        document.querySelector(".add-to-cart").addEventListener("click", async () => {
            try {
                const res = await fetch("https://swarize.in/cart/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId }),
                    credentials: "include"
                });
                const data = await res.json();

                if (data.success) {
                    console.log("✅ Product added to cart");
                    window.location.href = `addtocart.html?id=${productId}`;
                } else {
                    alert("❌ Failed to add to cart: " + data.message);
                }
            } catch (error) {
                console.error("❌ Error adding to cart:", error);
                alert("❌ Error adding product to cart.");
            }
        });

        // ✅ Buy Now
        document.querySelector(".buy-now").addEventListener("click", () => {
            window.location.href = `payment.html?id=${productId}&name=${encodeURIComponent(product.name)}&price=${product.price}`;
        });

        // ✅ Fetch and display reviews
        fetchReviews();

    } catch (error) {
        console.error("❌ Error fetching product:", error);
        document.body.innerHTML = "<h2>Error loading product details.</h2>";
    }

    // ✅ Reviews
    async function fetchReviews() {
        try {
            const response = await fetch(`https://swarize.in/api/reviews/${productId}`);
            const data = await response.json();

            const reviewsContainer = document.getElementById("reviews-container");
            const ratingCount = document.getElementById("rating-count");
            reviewsContainer.innerHTML = "";

            if (!data.success || data.reviews.length === 0) {
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
            console.error("❌ Error fetching reviews:", error);
        }
    }

    // ✅ Submit Review
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
            const userRes = await fetch("/api/user/session", { credentials: "include" });
            const userData = await userRes.json();

            if (!userData.success || !userData.userId) {
                reviewMessage.textContent = "❌ You must be logged in to submit a review.";
                reviewMessage.style.color = "red";
                return;
            }

            const userId = userData.userId;

            const response = await fetch("https://swarize.in/api/reviews/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, rating, comment, userId })
            });

            const data = await response.json();

            if (data.success) {
                reviewMessage.textContent = "✅ Review submitted successfully!";
                reviewMessage.style.color = "green";
                document.getElementById("comment").value = "";
                fetchReviews();
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
