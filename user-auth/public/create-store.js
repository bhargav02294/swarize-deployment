document.getElementById('storeForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const data = {
    storeName: form.storeName.value,
    slug: form.slug.value,
    logoUrl: form.logoUrl.value,
    bannerUrl: form.bannerUrl.value,
    description: form.description.value,
    socialLinks: {
      instagram: form.instagram.value,
      whatsapp: form.whatsapp.value
    }
  };

  try {
    const response = await fetch('/api/store/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.success) {
      alert('Store created successfully! Redirecting to your store...');
      window.location.href = `/store/${result.slug}`;
    } else {
      alert('Error: ' + result.message);
    }
  } catch (err) {
    console.error('Error creating store:', err);
    alert('Something went wrong.');
  }
});