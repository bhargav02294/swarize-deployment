// Get the selected category from the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const selectedCategory = urlParams.get('category');

// Display the selected category in the form
document.getElementById('selected-category').textContent = selectedCategory;

// Handle form submission
document.getElementById('product-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const productName = document.getElementById('product-name').value;
    const price = document.getElementById('price').value;

    // Redirect to the appropriate customization page
    if (selectedCategory === 'ebook') {
        window.location.href = `customize-ebook.html?category=${encodeURIComponent(selectedCategory)}&name=${encodeURIComponent(productName)}&price=${encodeURIComponent(price)}`;
    }
    // Add conditions for other categories as necessary
    else {
        alert("Customization for this category is not yet implemented.");
    }
});
