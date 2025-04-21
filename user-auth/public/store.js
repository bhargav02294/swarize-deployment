document.addEventListener("DOMContentLoaded", async function () {
  const storeHeaderSection = document.getElementById("display-store");
  const addProductBtn = document.getElementById("add-product-btn");
  const storeName = document.getElementById("store-name");
  const storeDescription = document.getElementById("store-description");
  const storeLogo = document.getElementById("store-logo");

  const userSession = await fetch("/api/user/session");
  const sessionData = await userSession.json();

  if (!sessionData.userId) {
      window.location.href = "/create-store.html"; // Redirect to create-store.html if user is not logged in
      return;
  }

  const storeResponse = await fetch(`/api/store/${sessionData.userId}`);
  const storeData = await storeResponse.json();

  if (storeData.success) {
      storeHeaderSection.style.display = "block";
      storeName.textContent = storeData.store.name;
      storeDescription.textContent = storeData.store.description;
      storeLogo.src = storeData.store.logo;

      addProductBtn.addEventListener("click", function () {
          window.location.href = "/add-product.html"; // Redirect to add-product page
      });
  } else {
      window.location.href = "/create-store.html"; // Redirect to create-store if no store exists
  }
});
