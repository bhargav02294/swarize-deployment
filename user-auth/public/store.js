window.onload = async function() {
  const response = await fetch('/api/store/check-store');
  if (response.status === 200) {
    const store = await response.json();
    if (store) {
      // Display store details
      document.getElementById('store-logo').src = store.logo;
      document.getElementById('store-name').innerText = store.name;
      document.getElementById('store-description').innerText = store.description;

      // Fetch and display products (assuming products are fetched from the backend)
      const productsResponse = await fetch(`/api/store/products/${store._id}`);
      const products = await productsResponse.json();
      const productsList = document.getElementById('products-list');
      products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.innerHTML = `<p>${product.name}</p>`;
        productsList.appendChild(productDiv);
      });
    }
  } else {
    // If not logged in or store does not exist, redirect to create store page
    window.location.href = '/create-store.html';
  }
};
