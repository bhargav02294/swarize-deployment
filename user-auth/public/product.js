// products.js
const fetchProducts = async (category, subcategory) => {
    const response = await fetch(`/api/products?category=${category}&subcategory=${subcategory}`);
    const products = await response.json();
    displayProducts(products);
};

const displayProducts = (products) => {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = ''; // Clear existing products

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product';
        productElement.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Price: $${product.price}</p>
        `;
        productsContainer.appendChild(productElement);
    });
};

// Example usage
const category = 'women'; // Replace with the selected category
const subcategory = 'dresses'; // Replace with the selected subcategory
fetchProducts(category, subcategory);
