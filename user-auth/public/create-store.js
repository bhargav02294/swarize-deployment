document.getElementById('store-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = document.getElementById('store-form');
  const formData = new FormData(form);
  const messageBox = document.getElementById('store-message');

  try {
    const response = await fetch('https://swarize-deployment.onrender.com/api/store/create', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const result = await response.json();

    if (result.success) {
      messageBox.innerText = "✅ Store created successfully!";
      window.location.href = `https://swarize.in/store/${result.slug}`;
    } else {
      messageBox.innerText = `❌ ${result.message || 'Failed to create store.'}`;
    }
  } catch (error) {
    console.error("Error creating store:", error);
    messageBox.innerText = "❌ Server error. Please try again.";
  }
});
