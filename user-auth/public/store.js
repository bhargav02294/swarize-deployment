// public/store.js

// Replace this with actual user data from session/localStorage or backend
const user = JSON.parse(localStorage.getItem('swarizeUser')); // Assume you store signed-in user here
const ownerId = user?._id;
const ownerEmail = user?.email;
const authMethod = user?.authMethod || 'email'; // Optional

const storeForm = document.getElementById('store-form');
const storePage = window.location.pathname.includes('store.html');
const createPage = window.location.pathname.includes('create-store.html');

const backendURL = 'https://swarize-deployment.onrender.com';

// Redirect logic (used on both store.html and create-store.html)
async function checkAndRedirect() {
  try {
    const res = await fetch(`${backendURL}/api/store/check/${ownerId}`);
    const data = await res.json();

    if (data.hasStore && createPage) {
      window.location.href = 'store.html'; // redirect to store if already exists
    } else if (!data.hasStore && storePage) {
      window.location.href = 'create-store.html'; // redirect to create page if no store
    } else if (data.hasStore && storePage) {
      displayStore(data.store);
    }
  } catch (error) {
    console.error('Store check error:', error);
  }
}

// Store creation logic
if (storeForm) {
  storeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('ownerId', ownerId);
    formData.append('ownerEmail', ownerEmail);
    formData.append('authMethod', authMethod);
    formData.append('storeName', document.getElementById('storeName').value);
    formData.append('storeDescription', document.getElementById('storeDescription').value);
    formData.append('storeLogo', document.getElementById('storeLogo').files[0]);

    try {
      const res = await fetch(`${backendURL}/api/store`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert('Store created successfully!');
        window.location.href = 'store.html';
      } else {
        alert(data.message || 'Failed to create store');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  });
}

// Display store on store.html
function displayStore(store) {
  document.getElementById('store-logo').src = backendURL + store.storeLogo;
  document.getElementById('store-name').textContent = store.storeName;
  document.getElementById('store-description-display').textContent = store.description;
  document.getElementById('display-store').style.display = 'block';
}

// Initial call to check and redirect
if (storePage || createPage) {
  if (user && ownerId) {
    checkAndRedirect();
  } else {
    alert('User not found in localStorage. Please sign in again.');
  }
}
