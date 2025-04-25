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

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status ${response.status}: ${errorText}`);
    }

    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();

      if (result.success) {
        messageBox.innerText = "✅ Store created successfully!";
        setTimeout(() => {
          window.location.href = `https://swarize.in/store/${result.slug}`;
        }, 1000);
      } else {
        messageBox.innerText = `❌ ${result.message || 'Failed to create store.'}`;
      }
    } else {
      throw new Error("Server returned non-JSON response");
    }

  } catch (error) {
    console.error("Error creating store:", error);
    messageBox.innerText = "❌ Server error. Please try again.";
  }
});
