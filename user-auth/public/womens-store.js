document.addEventListener('DOMContentLoaded', () => {
  const productContainer = document.getElementById('product-container');
  const titleEl = document.getElementById('subcategory-title');

  // 1. Get subcategory from URL
  const params = new URLSearchParams(window.location.search);
  const subcategory = params.get('subcategory') || 'All';

  // 2. Update heading
  titleEl.textContent = subcategory;

  // 3. Fetch products from backend
  fetch(`/api/products/category/${encodeURIComponent("Women's Store")}/${encodeURIComponent(subcategory)}`)
    .then(res => res.json())
    .then(data => {
      productContainer.innerHTML = ''; // clear previous

      if (!data.success || !Array.isArray(data.products) || data.products.length === 0) {
        productContainer.innerHTML = `<p>No products found in ${subcategory}.</p>`;
        return;
      }

      // 4. Render products
      data.products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Handle local vs cloud thumbnail path
        const imgUrl = product.thumbnailImage?.startsWith('uploads/')
          ? `https://swarize.in/${product.thumbnailImage}`
          : product.thumbnailImage || '/placeholder.jpg';

        card.innerHTML = `
          <img src="${imgUrl}" alt="${product.name}" class="product-image" onclick="viewProduct('${product._id}')">
          <h4>${product.name}</h4>
          <p class="product-price">₹${product.price}</p>
          <button class="cart-button" onclick="addToCart('${product._id}')">🛒 Add to Cart</button>
        `;

        productContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error('❌ Error loading products:', err);
      productContainer.innerHTML = '<p>Error loading products.</p>';
    });
});

// View product detail page
function viewProduct(id) {
  window.location.href = `product-detail.html?id=${id}`;
}

// Add product to cart
async function addToCart(id) {
  try {
    const res = await fetch('/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // for sending cookies/session
      body: JSON.stringify({ productId: id })
    });

    const json = await res.json();
    if (json.success) {
      window.location.href = `addtocart.html?id=${id}`;
    } else {
      alert('❌ Failed to add to cart: ' + json.message);
    }
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    alert('Error adding to cart.');
  }
}
