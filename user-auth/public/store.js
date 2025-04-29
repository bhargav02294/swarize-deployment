document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        alert("Invalid store link.");
        window.location.href = '/home.html';
        return;
    }

    try {
        const response = await fetch(`https://swarize.in/api/store/${slug}`);
        const result = await response.json();

        if (response.ok && result.success) {
            document.getElementById('store-logo').src = result.store.logoUrl;
            document.getElementById('store-name').textContent = result.store.storeName;
            document.getElementById('store-description').textContent = result.store.description;
        } else {
            alert(result.message || "Store not found.");
            window.location.href = '/home.html';
        }
    } catch (err) {
        console.error('❌ Error loading store:', err);
        alert("Server error, try again later.");
        window.location.href = '/home.html';
    }
});




document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("product-container");
  
    try {
      const res = await fetch("https://swarize.in/api/products/all");
      const data = await res.json();
  
      if (data.success) {
        const products = data.products;
  
        if (products.length === 0) {
          container.innerHTML = "<p>No products found.</p>";
          return;
        }
  
        products.forEach(product => {
          const card = document.createElement("div");
          card.className = "product-card";
  
          card.innerHTML = `
            <img src="${product.thumbnailImage}" alt="${product.name}" class="product-thumbnail" />
            <h3>${product.name}</h3>
            <p>₹${product.price}</p>
            <p>${product.description.slice(0, 60)}...</p>
            <div class="extra-images">
              ${product.extraImages?.map(img => `<img src="${img}" class="extra-image" />`).join("") || ""}
            </div>
            <div class="extra-videos">
              ${product.extraVideos?.map(video => `
                <video src="${video}" controls class="extra-video"></video>
              `).join("") || ""}
            </div>
          `;
  
          container.appendChild(card);
        });
  
      } else {
        container.innerHTML = "<p>Failed to load products.</p>";
      }
  
    } catch (error) {
      console.error("Error loading products:", error);
      document.getElementById("product-container").innerHTML = "<p>Error fetching products</p>";
    }
  });
  