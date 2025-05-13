document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        document.body.innerHTML = "<h2>Error: No product ID provided.</h2>";
        return;
    }

    try {
        const productResponse = await fetch(`https://swarize.in/api/products/detail/${productId}`);
const product = (await productResponse.json()).product;


        if (!product || Object.keys(product).length === 0) {
            document.body.innerHTML = "<h2>Product not found.</h2>";
            return;
        }

        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        const setSrc = (id, url) => {
            const el = document.getElementById(id);
            if (el && url) el.src = url;
        };

        // Set basic product text info
        setText("preview-name", product.name || "Product Name");
        setText("preview-price", `₹${product.price || "0.00"}`);
        const storeSlug = product.store?.slug;
        const storeName = product.store?.storeName;
        
        const storeLinkEl = document.getElementById("store-link");
        if (storeLinkEl && storeName) {
            storeLinkEl.textContent = storeName;
            if (storeSlug) {
                storeLinkEl.addEventListener("click", () => {
                    window.location.href = `sellers-products.html?slug=${storeSlug}`;
                });
            }
        }
        

        setText("preview-description", product.description || "No description.");
        setText("preview-summary", `Summary: ${product.summary || "-"}`);
        setText("preview-category", `Category: ${product.category || "-"}`);
        setText("preview-subcategory", `Subcategory: ${product.subcategory || "-"}`);
        setText("preview-tags", `Tags: ${product.tags?.join(", ") || "-"}`);
        setText("preview-size", `Size: ${product.size || "-"}`);
        setText("preview-color", `Color: ${product.color || "-"}`);
        setText("preview-material", `Material: ${product.material || "-"}`);
        setText("preview-model-style", `Model Style: ${product.modelStyle || "-"}`);
        setText("preview-available-in", `Available In: ${product.availableIn || "All over India"}`);

        // Handle slider media
        const mediaSlider = document.getElementById("media-slider");
        let currentSlide = 0;

        if (mediaSlider) {
            mediaSlider.innerHTML = "";

            // Add thumbnail first
            if (product.thumbnailImage) {
                const thumb = document.createElement("img");
                thumb.src = product.thumbnailImage;
                thumb.alt = "Main Image";
                thumb.classList.add("slider-media");
                mediaSlider.appendChild(thumb);

                setSrc("preview-thumbnail", product.thumbnailImage);
            }

            // Add extra images
            if (product.extraImages?.length) {
                product.extraImages.forEach(url => {
                    const img = document.createElement("img");
                    img.src = url;
                    img.alt = "Extra Image";
                    img.classList.add("slider-media");
                    mediaSlider.appendChild(img);
                });
            }

            // Add extra videos
            if (product.extraVideos?.length) {
                product.extraVideos.forEach(url => {
                    const video = document.createElement("video");
                    video.src = url;
                    video.controls = true;
                    video.classList.add("slider-media");
                    mediaSlider.appendChild(video);
                });
            }
        }

        // Slider movement
window.moveSlide = function(direction) {
    const items = mediaSlider.children.length;
    const itemWidth = mediaSlider.children[0] ? mediaSlider.children[0].offsetWidth : 160; // removed +10
    currentSlide += direction;

    if (currentSlide < 0) currentSlide = 0;
    if (currentSlide >= items) currentSlide = items - 1;

    const offset = itemWidth * currentSlide;
    mediaSlider.style.transform = `translateX(-${offset}px)`;
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
