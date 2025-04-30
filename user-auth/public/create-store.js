document.getElementById('store-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const message = document.getElementById('store-message');

    try {
        const response = await fetch('https://swarize.in/api/store/create', {
            method: 'POST',
            body: formData,
            credentials: 'include'  // Ensure cookies are sent with the request
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Save storeId and storeName to localStorage
            localStorage.setItem("storeId", result.store._id);
            localStorage.setItem("storeName", result.store.name);

            // Show success message
            message.style.color = "green";
            message.textContent = "✅ Store created successfully!";

            // Redirect with storeId and storeName in the URL
            setTimeout(() => {
                window.location.href = `/store.html?storeId=${encodeURIComponent(result.store._id)}&storeName=${encodeURIComponent(result.store.name)}`;
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
