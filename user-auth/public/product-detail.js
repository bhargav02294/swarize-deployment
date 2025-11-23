// product-detail.js
// Clean, robust product detail script
(() => {
  const API_BASE = "https://swarize.in";

  // helpers
  const $ = id => document.getElementById(id);
  const qs = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // DOM elements
  const menuToggle = $('menuToggle');
  const mobileMenu = $('mobileMenu');
  const mobileClose = $('mobileClose');
  const mobileLogout = $('mobileLogout');

  const loginBtn = $('loginBtn');
  const loginContent = $('loginContent');

  const mediaSlider = $('media-slider');
  const thumbs = $('thumbs');
  const prevBtn = $('prevBtn');
  const nextBtn = $('nextBtn');

  const nameEl = $('preview-name');
  const priceEl = $('preview-price');
  const displayPriceEl = $('preview-display-price');
  const productCodeEl = $('preview-product-code');
  const categoryEl = $('preview-category');
  const subcategoryEl = $('preview-subcategory');

  const colorEl = $('preview-color');
  const sizeEl = $('preview-size');
  const sareeSizeEl = $('preview-saree-size');
  const blouseSizeEl = $('preview-blouse-size');

  const descToggle = $('toggle-desc-btn');
  const descLess = $('toggle-less-btn');
  const descContent = $('desc-summary-content');

  const addToCartBtn = $('addToCartBtn');
  const buyNowBtn = $('buyNowBtn');
  const panelAddCart = $('panelAddCart');
  const panelBuyNow = $('panelBuyNow');
  const panelPrice = $('panelPrice');

  const storeLinkEl = $('store-link');

  const reviewsContainer = $('reviews-container');
  const submitReviewBtn = $('submit-review');
  const ratingEl = $('rating');
  const commentEl = $('comment');
  const reviewMessage = $('review-message');

  const sizeChartBtn = $('size-chart-btn');
  const sizeChartModal = $('size-chart-modal');
  const sizeChartOverlay = $('size-chart-overlay');
  const closeSizeChart = $('close-size-chart');
  const sizeChartContent = $('size-chart-content');

  // product id
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  if (!productId) {
    document.body.innerHTML = "<h2>No product ID provided.</h2>";
    return;
  }

  /* --- mobile menu handlers --- */
  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    if (menuToggle) { menuToggle.setAttribute('aria-expanded', 'true'); menuToggle.textContent = '✕'; }
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (menuToggle) { menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.textContent = '☰'; }
    document.body.style.overflow = '';
  }
  menuToggle?.addEventListener('click', () => mobileMenu?.classList.contains('open') ? closeMobileMenu() : openMobileMenu());
  mobileClose?.addEventListener('click', closeMobileMenu);
  mobileLogout?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const out = await fetch(`${API_BASE}/logout`, { method: 'GET', credentials: 'include' });
      if (out.ok) window.location.href = '/index.html';
      else alert('Logout failed');
    } catch (err) { console.error(err); alert('Logout error'); }
  });
  document.addEventListener('click', (ev) => {
    if (!mobileMenu?.contains(ev.target) && !menuToggle?.contains(ev.target) && mobileMenu?.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  /* --- dropdown toggles --- */
  function toggleDropdownRoot(el) {
    if (!el) return;
    const content = el.querySelector('.dropdown-content');
    if (!content) return;
    const isOpen = content.style.display === 'block';
    qs('.dropdown .dropdown-content').forEach(d => d.style.display = 'none');
    content.style.display = isOpen ? 'none' : 'block';
  }
  loginBtn?.addEventListener('click', (e) => { e.stopPropagation(); toggleDropdownRoot(document.getElementById('loginDropdown')); });
  document.addEventListener('click', () => qs('.dropdown .dropdown-content').forEach(d => d.style.display = 'none'));
  qs('.dropdown .dropdown-content').forEach(el => el.addEventListener('click', e => e.stopPropagation()));

  /* --- product fetch & populate --- */
  async function fetchProduct() {
    try {
      const res = await fetch(`${API_BASE}/api/products/detail/${productId}`);
      if (!res.ok) throw new Error('Product fetch failed');
      const json = await res.json();
      const product = json.product;
      if (!product) { document.body.innerHTML = "<h2>Product not found.</h2>"; return; }
      populateProduct(product);
      await fetchReviews();
    } catch (err) {
      console.error(err);
      document.body.innerHTML = "<h2>Failed to load product. Try again later.</h2>";
    }
  }

  function setText(id, text) {
    const el = $(id);
    if (!el) return;
    el.textContent = (text === null || text === undefined || text === '') ? '-' : text;
  }

  function populateProduct(product) {
    setText('preview-name', product.name);
    setText('preview-product-code', product.productCode || '-');

    // displayPrice should be small and crossed out above main price
    const displayPrice = product.displayPrice && Number(product.displayPrice) > 0 ? `₹${product.displayPrice}` : '';
    if (displayPriceEl) displayPriceEl.textContent = displayPrice;

    setText('preview-price', product.price ? `₹${product.price}` : '-');
    setText('preview-category', product.category || '-');
    setText('preview-subcategory', product.subcategory || '-');
    setText('preview-material', product.material || '-');
    setText('preview-pattern', product.pattern || '-');
    setText('preview-wash-care', product.washCare || '-');
    setText('preview-model-style', product.modelStyle || '-');
    setText('preview-occasion', product.occasion || '-');
    setText('preview-available-in', product.availableIn || 'All over India');
    setText('preview-description', product.description || '-');
    setText('preview-summary', product.summary || '-');
    setText('preview-saree-size', product.sareeSize || '-');
    setText('preview-blouse-size', product.blouseSize || '-');

    // store link (must be anchor)
    if (product.store) {
      storeLinkEl.textContent = product.store.storeName || 'Unknown Store';
      if (product.store.slug) {
        // set href and a safe click handler; ensure element is anchor
        storeLinkEl.setAttribute('href', `sellers-products.html?slug=${product.store.slug}`);
        storeLinkEl.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = storeLinkEl.getAttribute('href');
        });
      }
    }

    if (panelPrice) panelPrice.textContent = product.price ? `₹${product.price}` : '-';

    populateSizes(product.size);
    populateColors(product.color);
    populateGallery(product);

    // attach product id for cart/buy usage
    if (addToCartBtn) addToCartBtn.dataset.productId = product._id;
    if (buyNowBtn) buyNowBtn.dataset.productId = product._id;
    if (panelAddCart) panelAddCart.dataset.productId = product._id;
    if (panelBuyNow) panelBuyNow.dataset.productId = product._id;
  }

  function parseArrayField(field) {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    return field.toString().split(',').map(s => s.trim()).filter(Boolean);
  }

  function populateSizes(sizeField) {
    if (!sizeEl) return;
    sizeEl.innerHTML = '';
    const sizes = parseArrayField(sizeField);
    if (!sizes.length) { sizeEl.textContent = '-'; return; }
    sizes.forEach(sz => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = sz;
      btn.addEventListener('click', () => {
        qs('.size-container button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
      sizeEl.appendChild(btn);
    });
  }

  function populateColors(colorField) {
    if (!colorEl) return;
    colorEl.innerHTML = '';
    const colors = parseArrayField(colorField);
    if (!colors.length) { colorEl.textContent = '-'; return; }
    colors.forEach(c => {
      const sw = document.createElement('span');
      sw.className = 'color-swatch';
      try { sw.style.backgroundColor = c; } catch (e) { sw.style.backgroundColor = '#777'; }
      sw.title = c;
      sw.addEventListener('click', () => {
        qs('.color-swatch').forEach(s => s.classList.remove('selected'));
        sw.classList.add('selected');
      });
      colorEl.appendChild(sw);
    });
  }

  // Gallery
  let currentSlide = 0;
  function populateGallery(product) {
    if (!mediaSlider || !thumbs) return;
    mediaSlider.innerHTML = '';
    thumbs.innerHTML = '';
    const items = [];
    if (product.thumbnailImage) items.push({ type: 'img', src: product.thumbnailImage });
    (product.extraImages || []).forEach(i => items.push({ type: 'img', src: i }));
    (product.extraVideos || []).forEach(v => items.push({ type: 'video', src: v }));

    items.forEach((it, idx) => {
      const wrapper = document.createElement('div');
      wrapper.style.minWidth = '100%';
      wrapper.style.height = '100%';
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = 'center';

      let el;
      if (it.type === 'img') {
        el = document.createElement('img');
        el.src = it.src;
        el.alt = 'Product image';
      } else {
        el = document.createElement('video');
        el.src = it.src;
        el.controls = true;
      }
      el.className = 'slider-media';
      wrapper.appendChild(el);
      mediaSlider.appendChild(wrapper);

      // thumb
      const t = document.createElement('div');
      t.className = 'thumb';
      const thumbInner = document.createElement(it.type);
      thumbInner.src = it.src;
      thumbInner.setAttribute('aria-hidden', 'true');
      thumbInner.style.width = '100%';
      thumbInner.style.height = '100%';
      thumbInner.style.objectFit = 'cover';
      t.appendChild(thumbInner);
      t.addEventListener('click', () => goToSlide(idx));
      thumbs.appendChild(t);
    });

    goToSlide(0);
  }

  function goToSlide(index) {
    const total = mediaSlider.children.length;
    if (total === 0) return;
    currentSlide = Math.max(0, Math.min(index, total - 1));
    const width = mediaSlider.offsetWidth || mediaSlider.getBoundingClientRect().width;
    mediaSlider.style.transform = `translateX(-${width * currentSlide}px)`;
    qs('.thumb').forEach((t, i) => t.classList.toggle('active', i === currentSlide));
  }

  prevBtn?.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn?.addEventListener('click', () => goToSlide(currentSlide + 1));
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowLeft') goToSlide(currentSlide - 1);
    if (ev.key === 'ArrowRight') goToSlide(currentSlide + 1);
  });
  window.addEventListener('resize', () => goToSlide(currentSlide));

  // Description toggle
  descToggle?.addEventListener('click', () => {
    if (!descContent) return;
    descContent.hidden = false;
    descToggle.style.display = 'none';
  });
  descLess?.addEventListener('click', () => {
    if (!descContent) return;
    descContent.hidden = true;
    descToggle.style.display = 'inline-block';
  });

  // Add to cart (single implementation)
  async function addToCart(productIdLocal) {
    if (!productIdLocal) { alert('Invalid product.'); return; }
    try {
      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: productIdLocal })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = `addtocart.html?id=${productIdLocal}`;
      } else {
        alert(data.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding to cart');
    }
  }

  addToCartBtn?.addEventListener('click', () => addToCart(productId));
  panelAddCart?.addEventListener('click', () => addToCart(productId));

  // Buy now
  buyNowBtn?.addEventListener('click', () => {
    const pText = (priceEl && priceEl.textContent) ? priceEl.textContent.replace(/[^\d.]/g, '') : '';
    const name = encodeURIComponent(nameEl ? nameEl.textContent : 'product');
    window.location.href = `payment.html?id=${productId}&name=${name}&price=${pText}`;
  });
  panelBuyNow?.addEventListener('click', () => buyNowBtn?.click());

  // Size chart open only on click
  sizeChartBtn?.addEventListener('click', () => {
    const chartData = window.sizeChartData || {};
    const cat = categoryEl?.textContent || '';
    const sub = subcategoryEl?.textContent || '';
    const chart = chartData[cat] && chartData[cat][sub] ? chartData[cat][sub] : null;
    if (!chart) {
      sizeChartContent.innerHTML = "<p>No size chart available for this product.</p>";
    } else {
      let table = '<table><thead><tr>' + chart.headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
      chart.rows.forEach(r => table += '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>');
      table += '</tbody></table>';
      sizeChartContent.innerHTML = table;
    }
    sizeChartModal?.classList.remove('hidden');
    sizeChartOverlay?.classList.remove('hidden');
    sizeChartOverlay?.classList.add('visible');
  });
  closeSizeChart?.addEventListener('click', () => {
    sizeChartModal?.classList.add('hidden');
    sizeChartOverlay?.classList.remove('visible');
    sizeChartOverlay?.classList.add('hidden');
  });
  sizeChartOverlay?.addEventListener('click', () => {
    sizeChartModal?.classList.add('hidden');
    sizeChartOverlay?.classList.remove('visible');
    sizeChartOverlay?.classList.add('hidden');
  });

  // Reviews: fetch & submit
  async function fetchReviews() {
    try {
      const res = await fetch(`${API_BASE}/api/products/reviews/${productId}`);
      if (!res.ok) throw new Error('Failed to load reviews');
      const json = await res.json();
      const reviews = json.reviews || [];
      if (!reviews.length) {
        reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
        return;
      }
      reviewsContainer.innerHTML = reviews.map(r => {
        const name = r.userName || 'Anonymous';
        const date = new Date(r.createdAt || r.date || Date.now()).toLocaleString();
        const stars = '★'.repeat(r.rating || 0) + '☆'.repeat(5 - (r.rating || 0));
        return `<div class="review-item"><div class="review-meta"><strong>${name}</strong> · <span>${date}</span> · <span>${stars}</span></div><div class="review-body">${r.comment || ''}</div></div>`;
      }).join('');
    } catch (err) {
      console.warn('Reviews load failed', err);
      if (reviewsContainer) reviewsContainer.innerHTML = '<p>Unable to load reviews.</p>';
    }
  }

  submitReviewBtn?.addEventListener('click', async () => {
    try {
      const rating = Number(ratingEl?.value || 5);
      const comment = (commentEl?.value || '').trim();
      if (!comment) { if (reviewMessage) reviewMessage.textContent = 'Please write a review before submitting.'; return; }
      if (reviewMessage) reviewMessage.textContent = 'Sending...';
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (reviewMessage) reviewMessage.textContent = 'Thanks — your review is submitted.';
        if (commentEl) commentEl.value = '';
        await fetchReviews();
      } else {
        if (reviewMessage) reviewMessage.textContent = data.message || 'Review submission failed.';
      }
    } catch (err) {
      console.error(err);
      if (reviewMessage) reviewMessage.textContent = 'Error submitting review.';
    }
  });

  // header auth check (update login)
  async function initAuthState() {
    try {
      const res = await fetch(`${API_BASE}/api/auth/is-logged-in`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.isLoggedIn) {
        if (loginBtn) loginBtn.textContent = data.userName || 'Account';
        if (loginContent) loginContent.innerHTML = `<a href="/user-profile.html">Profile</a><a href="#" id="logoutHeader">Logout</a>`;
        const logoutHeader = document.getElementById('logoutHeader');
        logoutHeader?.addEventListener('click', async (e) => {
          e.preventDefault();
          try {
            const out = await fetch(`${API_BASE}/logout`, { method: 'GET', credentials: 'include' });
            if (out.ok) window.location.href = '/index.html';
            else alert('Logout failed');
          } catch (err) { alert('Logout error'); }
        });
      } else {
        if (loginBtn) loginBtn.textContent = 'Login';
        if (loginContent) loginContent.innerHTML = `<a href="signin.html">Sign In</a><a href="signup.html">Sign Up</a>`;
      }
    } catch (err) {
      console.error('Auth check error', err);
    }
  }

  // init
  fetchProduct();
  initAuthState();

})();
