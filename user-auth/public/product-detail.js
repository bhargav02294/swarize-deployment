document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        document.body.innerHTML = "<h2>Error: No product ID provided.</h2>";
        return;
    }

    // Assuming you have a function to get JWT token from cookies or localStorage
    const token = localStorage.getItem('authToken');  // or use another method to retrieve token

    fetch(`https://swarize.in/api/products/${productId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`  // Send the token in headers for authorization
        },
        credentials: 'include'  // Includes cookies with the request
    })
        .then(response => response.json())
        .then(product => {
            if (!product || Object.keys(product).length === 0) {
                document.body.innerHTML = "<h2>Product not found.</h2>";
                return;
            }

            // Update Product Details
            document.getElementById("preview-name").textContent = product.name || "Product Name";
            document.getElementById("preview-price").textContent = `₹${product.price || "0.00"}`;
            document.getElementById("preview-description").textContent = product.description || "Product description will appear here.";
            document.getElementById("preview-summary").textContent = `Summary: ${product.summary || " - "}`;
            document.getElementById("preview-category").textContent = `Category: ${product.category || " - "}`;
            document.getElementById("preview-subcategory").textContent = `Subcategory: ${product.subcategory || " - "}`;
            document.getElementById("preview-tags").textContent = `Tags: ${product.tags ? product.tags.join(", ") : " - "}`;
            document.getElementById("preview-size").textContent = `Size: ${product.size || " - "}`;
            document.getElementById("preview-color").textContent = `Color: ${product.color || " - "}`;
            document.getElementById("preview-material").textContent = `Material: ${product.material || " - "}`;
            document.getElementById("preview-model-style").textContent = `Model Style: ${product.modelStyle || " - "}`;
            document.getElementById("preview-available-in").textContent = `Available In: ${product.availableIn || "All over India "}`;

            // Thumbnail Image
            if (product.thumbnailImage) {
                document.getElementById("preview-thumbnail").src = product.thumbnailImage;
            }

            // Extra Images
            const extraImagesContainer = document.getElementById("extra-images-container");
            extraImagesContainer.innerHTML = "";
            if (product.extraImages && product.extraImages.length > 0) {
                product.extraImages.forEach(extraImages => {
                    const img = document.createElement("img");
                    img.src = extraImages;
                    img.alt = "Extra Image";
                    img.style.width = "100px";
                    extraImagesContainer.appendChild(img);
                });
            } else {
                extraImagesContainer.innerHTML = "    ";
            }

            // Extra Videos
            const extraVideosContainer = document.getElementById("extra-videos-container");
            extraVideosContainer.innerHTML = "";
            if (product.extraVideos && product.extraVideos.length > 0) {
                product.extraVideos.forEach(videoUrl => {
                    const video = document.createElement("video");
                    video.src = videoUrl;
                    video.controls = true;
                    video.style.width = "150px";
                    extraVideosContainer.appendChild(video);
                });
            } else {
                extraVideosContainer.innerHTML = "    ";
            }

            // Handle Add to Cart Button
            document.querySelector(".add-to-cart").addEventListener("click", async () => {
                try {
                    const response = await fetch("https://swarize.in/cart/add", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`  // Include the token here as well
                        },
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

        })
        .catch(error => {
            console.error("Error fetching product:", error);
            document.body.innerHTML = "<h2>Error loading product details.</h2>";
        });
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






