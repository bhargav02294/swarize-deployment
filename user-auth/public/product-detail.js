document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
  
    if (!productId) {
      console.error('❌ Product ID not found in URL');
      return;
    }
  
    const titleEl = document.getElementById('product-title');
    const imageEl = document.getElementById('product-image');
    const priceEl = document.getElementById('product-price');
    const descEl = document.getElementById('product-description');
    const extraImagesEl = document.getElementById('extra-images');
    const extraVideosEl = document.getElementById('extra-videos');
    const tagsEl = document.getElementById('product-tags');
    const storeNameEl = document.getElementById('store-name');
  
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.product) {
          throw new Error('Product not found');
        }
  
        const p = data.product;
  
        // Main image
        const imgUrl = p.thumbnailImage?.startsWith('uploads/')
          ? `https://swarize.in/${p.thumbnailImage}`
          : p.thumbnailImage || 'https://via.placeholder.com/300x300.png?text=No+Image';
  
        imageEl.src = imgUrl;
        imageEl.alt = p.name;
  
        // Title and price
        titleEl.textContent = p.name;
        priceEl.textContent = `₹${p.price}`;
        descEl.textContent = p.description || 'No description available';
  
        // Store name
        storeNameEl.textContent = p.store?.storeName || 'Unknown Store';
  
        // Extra images
        extraImagesEl.innerHTML = '';
        if (Array.isArray(p.extraImages) && p.extraImages.length > 0) {
          p.extraImages.forEach(img => {
            const imgTag = document.createElement('img');
            imgTag.src = img.startsWith('uploads/') ? `https://swarize.in/${img}` : img;
            imgTag.alt = 'Extra image';
            imgTag.className = 'extra-thumb';
            extraImagesEl.appendChild(imgTag);
          });
        }
  
        // Extra videos
        extraVideosEl.innerHTML = '';
        if (Array.isArray(p.extraVideos) && p.extraVideos.length > 0) {
          p.extraVideos.forEach(vid => {
            const video = document.createElement('video');
            video.src = vid;
            video.controls = true;
            video.className = 'extra-video';
            extraVideosEl.appendChild(video);
          });
        }
  
        // Tags
        tagsEl.innerHTML = '';
        if (Array.isArray(p.tags) && p.tags.length > 0) {
          tagsEl.textContent = `Tags: ${p.tags.join(', ')}`;
        }
      })
      .catch(err => {
        console.error('❌ Error fetching product:', err);
        const container = document.getElementById('product-container');
        if (container) {
          container.innerHTML = `<p class="error">Error loading product details.</p>`;
        }
      });
  
    // Add to Cart button
    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', async () => {
        try {
          const res = await fetch('/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId })
          });
  
          const json = await res.json();
          if (json.success) {
            window.location.href = `addtocart.html?id=${productId}`;
          } else {
            alert('❌ Failed to add to cart: ' + json.message);
          }
        } catch (e) {
          console.error('❌ Error adding to cart:', e);
          alert('Error adding to cart.');
        }
      });
    }
  });
  