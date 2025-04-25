document.getElementById('store-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = document.getElementById('store-form');
  const formData = new FormData(form);
  const message = document.getElementById('store-message');

  try {
    const response = await fetch('https://swarize-deployment.onrender.com/api/store/create', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server Error Text:", errorText);
      throw new Error("Store creation failed.");
    }

    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Invalid JSON returned from server.");
    }

    const data = await response.json();

    if (data.success) {
      message.textContent = "✅ Store created successfully!";
      window.location.href = `/store.html`;
    } else {
      message.textContent = `❌ ${data.message}`;
    }

  } catch (err) {
    console.error("Error creating store:", err);
    message.textContent = "❌ Could not create store. Please try again.";
  }
});
