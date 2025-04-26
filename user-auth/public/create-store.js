document.getElementById('store-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const message = document.getElementById('store-message');

  try {
    const response = await fetch('/api/store/create', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const result = await response.json();
    if (result.success) {
      message.textContent = "✅ Store created!";
      window.location.href = `/store.html?slug=${result.slug}`;
    } else {
      message.textContent = `❌ ${result.message}`;
    }

  } catch (err) {
    console.error("❌ Error creating store:", err);
    message.textContent = "❌ Server error. Try again.";
  }
});
