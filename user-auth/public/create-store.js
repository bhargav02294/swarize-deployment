document.getElementById('store-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const message = document.getElementById('store-message');

  try {
      const response = await fetch('https://swarize.in/api/store/create', {
          method: 'POST',
          body: formData,
          credentials: 'include'
      });

      const result = await response.json();

      if (response.ok && result.success) {
          message.textContent = "✅ Store created successfully!";
          window.location.href = `/store.html?slug=${result.slug}`;
      } else {
          message.textContent = `❌ ${result.message}`;
      }

  } catch (err) {
      console.error("❌ Error creating store:", err);
      message.textContent = "❌ Server error. Try again later.";
  }
});
