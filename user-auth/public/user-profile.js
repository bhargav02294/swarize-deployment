document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/get-user-profile');
    const data = await response.json();

    if (response.ok) {
      document.getElementById('name').value = data.userName;
      document.getElementById('email').value = data.email;
      document.getElementById('phone').value = data.phone;
      document.getElementById('gender').value = data.gender;
      document.getElementById('birthdate').value = data.birthdate;
      document.getElementById('street-address').value = data.streetAddress || ''; 
      document.getElementById('city').value = data.city || ''; 
      document.getElementById('district').value = data.district || ''; 
      document.getElementById('state').value = data.state || ''; 
      document.getElementById('zip').value = data.zip || ''; 
    } else {
      document.getElementById('message').textContent = data.message;
    }
  } catch (error) {
    document.getElementById('message').textContent = 'Error loading profile data.';
  }
});

// The submit event listener for updating the profile
document.getElementById('userProfileForm').addEventListener('submit', async (e) => {
  e.preventDefault(); 

  // Retrieve form values
  const phone = document.getElementById('phone').value;
  const gender = document.getElementById('gender').value;
  const birthdate = document.getElementById('birthdate').value;
  const streetAddress = document.getElementById('street-address').value;
  const city = document.getElementById('city').value;
  const district = document.getElementById('district').value;
  const state = document.getElementById('state').value;
  const zip = document.getElementById('zip').value;

  try {
    const response = await fetch('/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, gender, birthdate, streetAddress, city, district, state, zip }),
    });

    const result = await response.json();
    document.getElementById('message').textContent = result.message;

    if (response.ok) {
      document.getElementById('message').style.color = 'green';
      setTimeout(() => {
        window.location.href = '/home.html';
      }, 1000);
    }
  } catch (error) {
    document.getElementById('message').textContent = 'Failed to update profile.';
  }
});
