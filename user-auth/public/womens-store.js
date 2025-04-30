document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM elements
    const productContainer = document.getElementById('product-container');
    const titleEl = document.getElementById('subcategory-title');
  
    // 2. URL se subcategory nikalo
    const params = new URLSearchParams(window.location.search);
    const sub = params.get('subcategory') || 'All';
  
    // 3. Heading update karo
    titleEl.textContent = sub;
  
    // 4. Backend se fetch karo
    fetch(`/api/products/category/${encodeURIComponent("Women's Store")}/${encodeURIComponent(sub)}`)
      .then(res => res.json())
      .then(data => {
        productContainer.innerHTML = ''; // clear previous
  
        if (!data.success || !data.products.length) {
          productContainer.innerHTML = `<p>No products found in ${sub}.</p>`;
          return;
        }
  
        // 5. Products render karo
        data.products.forEach(p => {
          const card = document.createElement('div');
          card.className = 'product-card';
  
          // Image path fix (agar uploads folder use hua ho)
          const imgUrl = p.thumbnailImage.startsWith('uploads/')
            ? `https://swarize.in/${p.thumbnailImage}`
            : p.thumbnailImage;
  
          card.innerHTML = `
            <img src="${imgUrl}" alt="${p.name}" class="product-image" onclick="viewProduct('${p._id}')">
            <h4>${p.name}</h4>
            <p class="product-price">₹${p.price}</p>
            <button class="cart-button" onclick="addToCart('${p._id}')">🛒 Add to Cart</button>
          `;
          productContainer.appendChild(card);
        });
      })
      .catch(err => {
        console.error('❌ Error loading products:', err);
        productContainer.innerHTML = '<p>Error loading products.</p>';
      });
  });
  
  // Product detail aur cart functions
  function viewProduct(id) {
    window.location.href = `product-detail.html?id=${id}`;
  }
  
  async function addToCart(id) {
    try {
      const res = await fetch('/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: id })
      });
      const json = await res.json();
      if (json.success) {
        window.location.href = `addtocart.html?id=${id}`;
      } else {
        alert('❌ Failed to add to cart: ' + json.message);
      }
    } catch (e) {
      console.error('❌ Error adding to cart:', e);
      alert('Error adding to cart.');
    }
  }
  