document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.getElementById('product-container');
    const titleEl = document.getElementById('subcategory-title');
  
    const params = new URLSearchParams(window.location.search);
    const sub = params.get('subcategory') || 'All';
    titleEl.textContent = sub;
  
    fetch(`https://swarize.in/api/products/category/${encodeURIComponent("Home Decor and Kitchenware")}/${encodeURIComponent(sub)}`)
      .then(res => res.json())
      .then(data => {
        productContainer.innerHTML = '';
        if (!data.success || !data.products.length) {
          productContainer.innerHTML = `<p>No products found in ${sub}.</p>`;
          return;
        }
  
        data.products.forEach(p => {
          const card = document.createElement('div');
          card.className = 'product-card';
  
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
      .catch(err => {
        console.error(' Error loading products:', err);
        productContainer.innerHTML = '<p>Error loading products.</p>';
      });
  });
  
  function viewProduct(id) {
    window.location.href = `product-detail.html?id=${id}`;
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
  