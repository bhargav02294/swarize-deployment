document.addEventListener('DOMContentLoaded', async () => {
  const storeForm = document.getElementById('storeForm');
  const storeContainer = document.getElementById('storeContainer');
  const sellerId = new URLSearchParams(window.location.search).get('sellerId');
  const loggedInSellerId = localStorage.getItem('sellerId'); // Assuming sellerId is stored on login

  // Show store creation form only if no sellerId in query
  if (!sellerId && storeForm) {
    storeForm.style.display = 'block';
  }

  // Handle store creation form submission
  if (storeForm) {
    storeForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('storeName').value;
      const description = document.getElementById('storeDescription').value;
      const imageInput = document.getElementById('storeImage');

      if (!loggedInSellerId) {
        alert('Please log in to create a store.');
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('sellerId', loggedInSellerId);
      if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
      }

      try {
        const res = await fetch('/api/store', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          alert('Store created successfully!');
          window.location.href = `store.html?sellerId=${loggedInSellerId}`;
        } else {
          alert(data.error || 'Failed to create store.');
        }
      } catch (err) {
        console.error(err);
        alert('Error creating store.');
      }
    });
  }

  // Fetch and display store if sellerId is present
  if (sellerId) {
    try {
      const storeRes = await fetch(`/api/store/${sellerId}`);
      const storeData = await storeRes.json();

      if (!storeRes.ok) {
        throw new Error(storeData.error || 'Failed to fetch store');
      }

      const { name, description, image } = storeData;
      const isOwner = loggedInSellerId === sellerId;

      const logoURL = image ? `/uploads/${image}` : 'default-store-logo.png';

      const storeHTML = `
        <div class="store-card">
          <img src="${logoURL}" alt="${name}" class="store-logo" />
          <h2>${name}</h2>
          <p>${description}</p>
          ${isOwner ? '<button id="addProductBtn">Add Products</button>' : ''}
        </div>
        <div id="productList" class="product-list"></div>
      `;

      storeContainer.innerHTML = storeHTML;

      if (isOwner) {
        const addProductBtn = document.getElementById('addProductBtn');
        addProductBtn.addEventListener('click', () => {
          window.location.href = `add-product.html?sellerId=${sellerId}`;
        });
      }

      // Fetch and display products
      const productsRes = await fetch(`/api/products?sellerId=${sellerId}`);
      const products = await productsRes.json();

      const productList = document.getElementById('productList');

      if (products.length > 0) {
        products.forEach(product => {
          const productCard = document.createElement('div');
          productCard.classList.add('product-card');

          productCard.innerHTML = `
            <h4>${product.name}</h4>
            <p>Price: ₹${product.price}</p>
            <p>${product.description}</p>
            ${isOwner ? `<button class="delete-product" data-id="${product._id}">Delete</button>` : ''}
          `;

          productList.appendChild(productCard);
        });

        // Handle product deletions
        if (isOwner) {
          document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', async () => {
              const productId = button.getAttribute('data-id');
              if (confirm('Are you sure you want to delete this product?')) {
                try {
                  const res = await fetch(`/api/products/${productId}`, {
                    method: 'DELETE',
                  });
                  if (res.ok) {
                    button.parentElement.remove();
                    alert('Product deleted successfully.');
                  } else {
                    alert('Failed to delete product.');
                  }
                } catch (err) {
                  console.error(err);
                  alert('Error deleting product.');
                }
              }
            });
          });
        }
      } else {
        productList.innerHTML = '<p>No products available.</p>';
      }

    } catch (err) {
      console.error(err);
      storeContainer.innerHTML = '<p>Error loading store. Please try again later.</p>';
    }
  }
});
