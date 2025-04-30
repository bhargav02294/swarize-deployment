document.getElementById('store-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const storeName = formData.get('storeName').trim(); // Ensure no spaces in storeName

    // Validate if storeName is empty
    const message = document.getElementById('store-message');
    if (!storeName) {
        message.style.color = "red";
        message.textContent = "❌ Store name is required.";
        return;
    }

    try {
        // Logging to check formData before submission
        console.log('Form data being submitted:', storeName);

        const response = await fetch('https://swarize.in/api/store/create', {
            method: 'POST',
            body: formData,
            credentials: 'include' // Ensure session/cookie is sent
        });

        const result = await response.json();

        if (response.ok && result.success) {
            message.style.color = "green";
            message.textContent = "✅ Store created successfully!";

            // Save the store slug
            localStorage.setItem("storeSlug", result.slug);

            setTimeout(() => {
                window.location.href = `/store.html?slug=${result.slug}`;
            }, 1500);
        } else {
            message.style.color = "red";
            message.textContent = `❌ ${result.message || "Something went wrong"}`;
        }
    } catch (error) {
        console.error('❌ Error creating store:', error);
        message.style.color = "red";
        message.textContent = "❌ Unexpected server response.";
    }
});
