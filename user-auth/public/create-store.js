document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const form = e.target;
    const storeName = form.querySelector('#storeName').value.trim();
    const description = form.querySelector('#description').value.trim();
    const logoFile = form.querySelector('#logo').files[0];
  
    const formData = new FormData();
    formData.append('storeName', storeName);
    formData.append('description', description);
    if (logoFile) formData.append('logo', logoFile);
  
    console.log('Form data being submitted:', storeName);
  
    try {
      const res = await fetch('/api/store/create', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
  
      const data = await res.json();
  
      if (res.ok) {
        localStorage.setItem('storeSlug', data.slug);
        window.location.href = `/store.html?slug=${data.slug}`;
      } else {
        alert(data.message || 'Error creating store');
      }
    } catch (err) {
      console.error('❌ Store create error:', err);
      alert('Something went wrong');
    }
  });
  