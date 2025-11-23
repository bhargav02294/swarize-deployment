// product-detail.js
// Single bundled client script for product detail page.
// - product fetch (https://swarize.in/api/products/detail/:id)
// - add to cart (POST https://swarize.in/api/cart/add)
// - buy now redirect => payment.html
// - reviews fetch & submit (GET /api/products/reviews/:id, POST /api/reviews)
// - login-check for header actions (/api/auth/is-logged-in)
// - dropdowns & mobile menu
// - gallery slider + thumbs + keyboard

(() => {
  const API_BASE = "https://swarize.in";

  // ---------- helpers ----------
  const $ = id => document.getElementById(id);
  const q = (sel, root=document) => root.querySelector(sel);
  const qs = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const html = (s) => { const d=document.createElement('div'); d.innerHTML=s; return d.firstElementChild; };

  // ---------- DOM elements ----------
  const menuToggle = $('menuToggle');
  const mobileMenu = $('mobileMenu');
  const mobileClose = $('mobileClose');
  const mobileLogout = $('mobileLogout');
  const loginDropdown = $('loginDropdown');
  const loginBtn = $('loginBtn');
  const loginContent = $('loginContent');

  // product UI elements
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

  // reviews
  const reviewsContainer = $('reviews-container');
  const submitReviewBtn = $('submit-review');
  const ratingEl = $('rating');
  const commentEl = $('comment');
  const reviewMessage = $('review-message');

  // size chart
  const sizeChartBtn = $('size-chart-btn');
  const sizeChartModal = $('size-chart-modal');
  const sizeChartOverlay = $('size-chart-overlay');
  const closeSizeChart = $('close-size-chart');
  const sizeChartContent = $('size-chart-content');

  // Parse productId
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  if (!productId) {
    document.body.innerHTML = "<h2>No product ID provided.</h2>";
    return;
  }

  // ---------- mobile menu controls ----------
  function openMobileMenu(){
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden','false');
    menuToggle.setAttribute('aria-expanded','true');
    menuToggle.textContent = '✕';
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu(){
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden','true');
    menuToggle.setAttribute('aria-expanded','false');
    menuToggle.textContent = '☰';
    document.body.style.overflow = '';
  }
  menuToggle?.addEventListener('click', ()=> mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu());
  mobileClose?.addEventListener('click', closeMobileMenu);
  mobileLogout?.addEventListener('click', async (e)=>{
    e.preventDefault();
    try {
      const out = await fetch(`${API_BASE}/logout`, { method:'GET', credentials:'include' });
      if (out.ok) window.location.href = '/index.html';
      else alert('Logout failed');
    } catch (err){ console.error(err); alert('Logout error'); }
  });
  document.addEventListener('click', (ev)=>{
    if (!mobileMenu.contains(ev.target) && !menuToggle.contains(ev.target) && mobileMenu.classList.contains('open')) closeMobileMenu();
  });

  // dropdown toggles (login/country/category)
  function toggleDropdown(el){
    if(!el) return;
    const content = el.querySelector('.dropdown-content');
    if (!content) return;
    const isOpen = content.style.display === 'block';
    qs('.dropdown .dropdown-content').forEach(d => d.style.display = 'none');
    if (!isOpen) content.style.display = 'block';
  }
  loginBtn?.addEventListener('click', (e)=>{ e.stopPropagation(); toggleDropdown(loginDropdown); });
  document.querySelectorAll('.country-dropdowner .btn-link').forEach(btn => btn.addEventListener('click',(e)=>{ e.stopPropagation(); toggleDropdown(document.getElementById('countryDropdown'))}));
  document.querySelectorAll('.category-dropdown .btn-link').forEach(btn => btn.addEventListener('click',(e)=>{ e.stopPropagation(); toggleDropdown(document.getElementById('categoryMenu'))}));
  // close all dropdowns on document click
  document.addEventListener('click', ()=> qs('.dropdown .dropdown-content').forEach(d => d.style.display='none'));
  // prevent dropdown from closing when clicking inside
  qs('.dropdown .dropdown-content').forEach(el => el.addEventListener('click', e => e.stopPropagation()));

  // ---------- product fetch ----------
  async function fetchProduct(){
    try {
      const res = await fetch(`${API_BASE}/api/products/detail/${productId}`);
      if (!res.ok) throw new Error('Product fetch failed');
      const json = await res.json();
      const product = json.product;
      if (!product) { document.body.innerHTML = "<h2>Product not found.</h2>"; return; }
      populateProduct(product);
      fetchReviews();
    } catch (err){
      console.error(err);
      document.body.innerHTML = "<h2>Failed to load product. Try again later.</h2>";
    }
  }

  // populate UI fields
  function setText(id, value){
    const el = document.getElementById(id);
    if (el) el.textContent = value == null || value === '' ? '-' : value;
  }

  function populateProduct(product){
    setText('preview-name', product.name);
    setText('preview-product-code', product.productCode || '-');
    setText('preview-price', product.price ? `₹${product.price}` : '-');
    setText('preview-display-price', product.displayPrice ? `₹${product.displayPrice}` : '');
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

    // store link
    if (product.store) {
      const storeEl = storeLinkEl;
      storeEl.textContent = product.store.storeName || 'Unknown Store';
      if (product.store.slug) {
        storeEl.href = `sellers-products.html?slug=${product.store.slug}`;
storeEl.onclick = (e) => {
  e.preventDefault();
  window.location.href = storeEl.href;
};
      }
    }

    // price in panel
    panelPrice && (panelPrice.textContent = product.price ? `₹${product.price}` : '-');

    // sizes
    populateSizes(product.size);

    // colors
    populateColors(product.color);

    // gallery
    populateGallery(product);

    // update buttons dataset for later usage
    addToCartBtn.dataset.productId = product._id;
    buyNowBtn.dataset.productId = product._id;
    panelAddCart.dataset.productId = product._id;
    panelBuyNow.dataset.productId = product._id;
  }

  // sizes array helper
  function populateSizes(sizeField){
    sizeEl.innerHTML = '';
    const sizes = Array.isArray(sizeField) ? sizeField : (sizeField || '').toString().split(',').map(s => s.trim()).filter(Boolean);
    if (sizes.length === 0) {
      sizeEl.textContent = '-';
      return;
    }
    sizes.forEach(sz => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = sz;
      btn.addEventListener('click', ()=>{
        qs('.size-container button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
      sizeEl.appendChild(btn);
    });
  }

  // colors helper
  function populateColors(colorField){
    colorEl.innerHTML = '';
    const colors = Array.isArray(colorField) ? colorField : (colorField || '').toString().split(',').map(c=>c.trim()).filter(Boolean);
    if (colors.length === 0) { colorEl.textContent = '-'; return; }
    colors.forEach(c => {
      const sw = document.createElement('span');
      sw.className = 'color-swatch';
      // If color string like "red" or "#ff0000" works; otherwise fallback to muted
      try { sw.style.backgroundColor = c; } catch(e){ sw.style.backgroundColor = '#777'; }
      sw.title = c;
      sw.addEventListener('click', ()=> {
        qs('.color-swatch').forEach(s => s.classList.remove('selected'));
        sw.classList.add('selected');
      });
      colorEl.appendChild(sw);
    });
  }

  // gallery helper
  let currentSlide = 0;
  function populateGallery(product){
    mediaSlider.innerHTML = '';
    thumbs.innerHTML = '';
    const items = [];
    if (product.thumbnailImage) items.push({ type:'img', src: product.thumbnailImage });
    (product.extraImages||[]).forEach(i=>items.push({ type:'img', src: i }));
    (product.extraVideos||[]).forEach(v=>items.push({ type:'video', src: v }));

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
        el.alt = 'Product media';
      } else {
        el = document.createElement('video');
        el.src = it.src;
        el.controls = true;
      }
      el.className = 'slider-media';
      wrapper.appendChild(el);
      mediaSlider.appendChild(wrapper);

      // thumbnail
      const t = document.createElement('div');
      t.className = 'thumb';
      const thumbInner = document.createElement(it.type);
      thumbInner.src = it.src;
      thumbInner.alt = 'thumb';
      thumbInner.setAttribute('aria-hidden','true');
      t.appendChild(thumbInner);
      t.addEventListener('click', ()=>{
        goToSlide(idx);
      });
      thumbs.appendChild(t);
    });

    // set first active
    goToSlide(0);
  }

  function goToSlide(index){
    const total = mediaSlider.children.length;
    if (total === 0) return;
    currentSlide = Math.max(0, Math.min(index, total-1));
    const width = mediaSlider.offsetWidth || mediaSlider.getBoundingClientRect().width;
    mediaSlider.style.transform = `translateX(-${width*currentSlide}px)`;
    qs('.thumb').forEach((t,i)=> t.classList.toggle('active', i===currentSlide));
  }

  // prev / next
  prevBtn?.addEventListener('click', ()=> goToSlide(currentSlide-1));
  nextBtn?.addEventListener('click', ()=> goToSlide(currentSlide+1));
  // keyboard nav
  document.addEventListener('keydown', (ev)=>{
    if (ev.key === 'ArrowLeft') goToSlide(currentSlide-1);
    if (ev.key === 'ArrowRight') goToSlide(currentSlide+1);
  });
  // resize handler to keep translate correct
  window.addEventListener('resize', ()=> goToSlide(currentSlide));

  // Description toggles
  descToggle?.addEventListener('click', ()=>{
    descContent.hidden = false;
    descToggle.style.display = 'none';
  });
  descLess?.addEventListener('click', ()=>{
    descContent.hidden = true;
    descToggle.style.display = 'inline-block';
  });

  // ADD TO CART
  async function addToCart(productId){
    try {
      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.success) {
        // redirect to cart or visually confirm
        window.location.href = `addtocart.html?id=${productId}`;
      } else {
        alert(data.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding to cart');
    }
  }

  addToCartBtn?.addEventListener('click', ()=> addToCart(productId));
  panelAddCart?.addEventListener('click', ()=> addToCart(productId));

  // BUY NOW
  buyNowBtn?.addEventListener('click', ()=>{
    window.location.href = `payment.html?id=${productId}&name=${encodeURIComponent(nameEl.textContent)}&price=${encodeURIComponent(priceEl.textContent.replace(/[^\d]/g,''))}`;
  });
  panelBuyNow?.addEventListener('click', ()=> buyNowBtn?.click());

  // SIZE CHART modal
  // sizeChartData must be defined globally or generated server-side.
  sizeChartBtn?.addEventListener('click', ()=>{
    // sample: sizeChartData = { "Sarees": { "All": { headers: ["Size","Length"], rows: [["S","5.5"], ["M","6"]]} } }
    const chartData = window.sizeChartData || {};
    const cat = categoryEl.textContent || '';
    const sub = subcategoryEl.textContent || '';
    const chart = (chartData[cat] && chartData[cat][sub]) ? chartData[cat][sub] : null;
    if (!chart) {
      sizeChartContent.innerHTML = "<p>No size chart available for this product.</p>";
    } else {
      let table = '<table><thead><tr>' + chart.headers.map(h=>`<th>${h}</th>`).join('') + '</tr></thead><tbody>';
      chart.rows.forEach(r => table += '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>');
      table += '</tbody></table>';
      sizeChartContent.innerHTML = table;
    }
    sizeChartModal.classList.remove('hidden');
    sizeChartOverlay.classList.remove('hidden');
  });
  closeSizeChart?.addEventListener('click', ()=> { sizeChartModal.classList.add('hidden'); sizeChartOverlay.classList.add('hidden'); });
  sizeChartOverlay?.addEventListener('click', ()=> { sizeChartModal.classList.add('hidden'); sizeChartOverlay.classList.add('hidden'); });

  // REVIEWS: fetch & submit
  async function fetchReviews(){
    try {
      const res = await fetch(`${API_BASE}/api/products/reviews/${productId}`);
      if (!res.ok) throw new Error('Failed to load reviews');
      const json = await res.json();
      const reviews = json.reviews || [];
      if (reviews.length === 0) {
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
      reviewsContainer.innerHTML = '<p>Unable to load reviews.</p>';
    }
  }

  submitReviewBtn?.addEventListener('click', async ()=>{
    try {
      const rating = ratingEl.value;
      const comment = commentEl.value.trim();
      if (!comment) { reviewMessage.textContent = 'Please write a review before submitting.'; return; }
      reviewMessage.textContent = 'Sending...';
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ productId, rating: Number(rating), comment })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        reviewMessage.textContent = 'Thanks — your review is submitted.';
        commentEl.value = '';
        fetchReviews();
      } else {
        reviewMessage.textContent = data.message || 'Review submission failed.';
      }
    } catch (err) {
      console.error(err);
      reviewMessage.textContent = 'Error submitting review.';
    }
  });

  // header login-check to update login UI
  async function initAuthState(){
    try {
      const res = await fetch(`${API_BASE}/api/auth/is-logged-in`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.isLoggedIn) {
        // replace login button with user name & logout
        loginBtn.textContent = data.userName || 'Account';
        // open dropdown shows profile & logout
        loginContent.innerHTML = `<a href="/user-profile.html">Profile</a><a href="#" id="logoutHeader">Logout</a>`;
        document.getElementById('logoutHeader')?.addEventListener('click', async (e)=>{
          e.preventDefault();
          try {
            const out = await fetch(`${API_BASE}/logout`, { method:'GET', credentials:'include' });
            if (out.ok) window.location.href = '/index.html';
            else alert('Logout failed');
          } catch(e){ alert('Logout error'); }
        });
      } else {
        loginBtn.textContent = 'Login';
        loginContent.innerHTML = `<a href="signin.html">Sign In</a><a href="signup.html">Sign Up</a>`;
      }
    } catch (err) {
      console.error('Auth check error', err);
    }
  }

  // initialize
  fetchProduct();
  initAuthState();

})();
