document.addEventListener('DOMContentLoaded', function () {
  const storeForm = document.getElementById('store-form');
  const storeMessage = document.getElementById('store-message');
  const storeDetailsSection = document.getElementById('store-details-section');
  const displayStoreSection = document.getElementById('display-store');
  const storeLogoInput = document.getElementById('storeLogo');
  const storeNameInput = document.getElementById('storeName');
  const storeDescriptionInput = document.getElementById('storeDescription');
  const storeNameDisplay = document.getElementById('store-name');
  const storeLogoDisplay = document.getElementById('store-logo');
  const storeDescriptionDisplay = document.getElementById('store-description-display');
  
  const addProductButton = document.getElementById('add-product-btn');

  // On form submission, send the data to the backend
  storeForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('storeLogo', storeLogoInput.files[0]);
    formData.append('storeName', storeNameInput.value);
    formData.append('storeDescription', storeDescriptionInput.value);

    try {
      const response = await fetch('/api/store', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        storeMessage.innerHTML = 'Store created successfully!';
        storeMessage.style.color = 'green';
        // Switch sections to display store info
        storeDetailsSection.style.display = 'none';
        displayStoreSection.style.display = 'block';
        storeNameDisplay.innerHTML = result.store.storeName;
        storeLogoDisplay.src = `/uploads/${result.store.storeLogo}`;
        storeDescriptionDisplay.innerHTML = result.store.description;

        // Enable Add Product button if needed
        addProductButton.style.display = 'block';
      } else {
        storeMessage.innerHTML = result.message;
        storeMessage.style.color = 'red';
      }
    } catch (error) {
      console.error('Error creating store:', error);
      storeMessage.innerHTML = 'Error creating store. Please try again later.';
      storeMessage.style.color = 'red';
    }
  });

  // Fetch and display store details on page load
  async function loadStoreDetails() {
    try {
      const response = await fetch('/api/store/me');
      const result = await response.json();

      if (result.success) {
        storeNameDisplay.innerHTML = result.store.storeName;
        storeLogoDisplay.src = `/uploads/${result.store.storeLogo}`;
        storeDescriptionDisplay.innerHTML = result.store.description;
        storeDetailsSection.style.display = 'none';
        displayStoreSection.style.display = 'block';
      }
    } catch (error) {
      console.error('Error fetching store details:', error);
    }
  }

  // If store exists, load its details when the page is loaded
  loadStoreDetails();
});
