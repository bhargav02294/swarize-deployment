document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        alert("Invalid store link.");
        window.location.href = '/home.html';
        return;
    }

    try {
        const response = await fetch(`https://swarize.in/api/store/${slug}`);
        const result = await response.json();

        if (response.ok && result.success) {
            document.getElementById('store-logo').src = result.store.logoUrl;
            document.getElementById('store-name').textContent = result.store.storeName;
            document.getElementById('store-description').textContent = result.store.description;
        } else {
            alert(result.message || "Store not found.");
            window.location.href = '/home.html';
        }
    } catch (err) {
        console.error('❌ Error loading store:', err);
        alert("Server error, try again later.");
        window.location.href = '/home.html';
    }
});
