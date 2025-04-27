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
            message.style.color = "green";
            message.textContent = "✅ Store created successfully!";
            setTimeout(() => {
                // Redirect to store page (with slug)
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
