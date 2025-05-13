document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "https://swarize.in";
  const storesContainer = document.getElementById("stores-container");

  try {
    const res = await fetch(`${API_BASE}/api/store/public`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const stores = data.stores;

    if (!stores || stores.length === 0) {
      storesContainer.innerHTML = "<p>No stores found.</p>";
      return;
    }

    storesContainer.innerHTML = stores.map(store => `
      <div class="store-card">
        <img src="${store.logoUrl}" alt="${store.name}" class="store-logo">
        <h3>${store.storeName}</h3>
        <p>${store.description?.substring(0, 100)}...</p>
        <button onclick="window.location.href='sellers-products.html?slug=${store.slug}'">View Products</button>
      </div>
    `).join("");

  } catch (err) {
    console.error(" Error fetching stores:", err);
    storesContainer.innerHTML = `<p> Failed to fetch stores.</p>`;
  }
});
