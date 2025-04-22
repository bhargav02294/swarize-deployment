document.addEventListener('DOMContentLoaded', function () {
  // Fetch store data from the backend
  fetch('/api/store')
    .then(response => response.json())
    .then(data => {
      const store = data.store;
      if (store) {
        document.getElementById('store-name').innerText = store.storeName;
        document.getElementById('store-logo').src = `/uploads/${store.storeLogo}`;
        document.getElementById('store-desc').innerText = store.description;

        // Fetch and display products
        fetch(`/api/products?storeId=${store._id}`)
          .then(response => response.json())
          .then(products => {
            const productsList = document.getElementById('products-list');
            products.forEach(product => {
              const productItem = document.createElement('div');
              productItem.classList.add('product-item');
              productItem.innerHTML = `
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <button onclick="deleteProduct('${product._id}')">Delete</button>
              `;
              productsList.appendChild(productItem);
            });
          });
      } else {
        window.location.href = 'create-store.html';  // Redirect to store creation page if no store
      }
    })
    .catch(error => console.log('Error fetching store data:', error));
});

function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Product deleted successfully');
          location.reload();
        } else {
          alert('Error deleting product');
        }
      });
  }
}
