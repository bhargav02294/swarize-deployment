document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.getElementById('product-container');
    const titleEl = document.getElementById('subcategory-title');

    // Get subcategory from URL params, default to "All"
    const params = new URLSearchParams(window.location.search);
    const sub = params.get('subcategory') || 'All';
    titleEl.textContent = sub;

    // Fetch products by category and subcategory
    fetch(`https://swarize.in/api/products/category/${encodeURIComponent("Kids' Store")}/${encodeURIComponent(sub)}`)
        .then(res => res.json())
        .then(data => {
            productContainer.innerHTML = '';
            if (!data.success || !data.products.length) {
                productContainer.innerHTML = `<p>No products found in "${sub}".</p>`;
                return;
            }

            data.products.forEach(p => {
                const card = document.createElement('div');
                card.className = 'product-card';

                // Fix image URL if relative path
                const imgUrl = p.thumbnailImage.startsWith('uploads/')
                    ? `https://swarize.in/${p.thumbnailImage}`
                    : p.thumbnailImage;

                card.innerHTML = `
                    <img src="${imgUrl}" alt="${p.name}" class="product-image" onclick="viewProduct('${p._id}')">
                    <h4>${p.name}</h4>
                    <p class="product-price">₹${p.price}</p>
                    <button class="cart-button" onclick="addToCart('${p._id}')">🛒</button>
                `;
                productContainer.appendChild(card);
            });
        })
        .catch(() => {
            productContainer.innerHTML = '<p>Failed to load products. Please try again later.</p>';
        });
});

// Optional: Add these helper functions if not defined elsewhere

function viewProduct(productId) {
    window.location.href = `product-details.html?id=${productId}`;
}
  async function addToCart(id) {
    try {
      const res = await fetch('https://swarize.in/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: id })
      });
      const json = await res.json();
      if (json.success) {
        window.location.href = `addtocart.html?id=${id}`;
      } else {
        alert(' Failed to add to cart: ' + json.message);
      }
    } catch (e) {
      console.error(' Error adding to cart:', e);
      alert('Error adding to cart.');
    }
  }
  