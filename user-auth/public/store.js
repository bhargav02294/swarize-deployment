
document.addEventListener('DOMContentLoaded', async () => {
  const storeSection = document.getElementById('display-store');
  const storeNameElem = document.getElementById('store-name');
  const storeLogoElem = document.getElementById('store-logo');
  const storeDescElem = document.getElementById('store-desc');
  const productsList = document.getElementById('products-list');
  const addProductBtn = document.getElementById('add-product-btn');

  try {
      // Get session info
      const sessionRes = await fetch('https://swarize-deployment.onrender.com/api/user/session', {
          credentials: 'include'
      });
      const sessionData = await sessionRes.json();

      if (!sessionData.userId) {
          window.location.href = 'https://swarize.in/not-signed-in.html';
          return;
      }

      // Get store info for logged-in user
      const storeRes = await fetch('https://swarize-deployment.onrender.com/api/store/mystore', {
          credentials: 'include'
      });

      const storeData = await storeRes.json();

      if (storeRes.ok && storeData.store) {
          const { storeName, storeLogo, description } = storeData.store;

          storeNameElem.textContent = storeName;
          storeLogoElem.src = `https://swarize-deployment.onrender.com/uploads/${storeLogo}`;
          storeDescElem.textContent = description;

          storeSection.style.display = 'block';

          // TODO: Fetch and display products here
          productsList.innerHTML = '<p>No products yet. Use "Add Products" to list your first product.</p>';
      } else {
          window.location.href = 'https://swarize.in/create-store.html';
      }

  } catch (err) {
      console.error("Error loading store:", err);
      alert("Failed to load store info. Please try again.");
  }

  // Add Products button
  addProductBtn.addEventListener('click', () => {
      window.location.href = 'https://swarize.in/add-product.html';
  });
});
