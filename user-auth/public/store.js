document.addEventListener('DOMContentLoaded', async function () {
  const storeDetailsElement = document.getElementById('storeDetails');
  const userId = sessionStorage.getItem('userId'); // Assuming you store userId in sessionStorage or via session

  if (!userId) {
    window.location.href = '/login.html'; // Redirect to login if userId is not available
    return;
  }

  try {
    // Fetch the store details from the backend
    const response = await fetch(`/api/store/get-store/${userId}`);

    if (response.ok) {
      const storeData = await response.json();
      if (storeData) {
        // Display the store details
        document.getElementById('storeName').innerText = storeData.storeName;
        document.getElementById('storeLogo').src = `/uploads/${storeData.storeLogo}`;
        document.getElementById('storeDescription').innerText = storeData.description;
      } else {
        alert("Store not found.");
      }
    } else {
      alert('Failed to load store data.');
    }
  } catch (error) {
    console.error('Error fetching store data:', error);
    alert('An error occurred while loading your store.');
  }

  // Logout functionality
  document.getElementById('logoutBtn').addEventListener('click', async function () {
    try {
      const response = await fetch('/api/user/logout', { method: 'POST' });
      if (response.ok) {
        sessionStorage.removeItem('userId'); // Clear the userId from sessionStorage
        window.location.href = '/login.html'; // Redirect to login page
      } else {
        alert('Failed to log out.');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('An error occurred while logging out.');
    }
  });
});
