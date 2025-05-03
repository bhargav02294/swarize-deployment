document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "https://swarize.in";
  const storesContainer = document.getElementById("stores-container");

  try {
    const res = await fetch(`${API_BASE}/api/store/all`, {
      method: "GET",
      credentials: "include"
    });

    const data = await res.json();

    if (data.success) {
      const stores = data.stores;

      if (!stores.length) {
        storesContainer.innerHTML = "<p>No sellers found.</p>";
        return;
      }

      storesContainer.innerHTML = stores.map(store => `
        <div class="store-card">
          <img src="${store.logoUrl}" alt="${store.name}">
          <h2>${store.name}</h2>
          <p>${store.description}</p>
          <button onclick="window.location.href='sellers-products.html?slug=${store.slug}'">View Products</button>
        </div>
      `).join("");

    } else {
      storesContainer.innerHTML = `<p>❌ Failed to fetch sellers.</p>`;
    }

  } catch (err) {
    console.error("❌ Error fetching sellers:", err);
    storesContainer.innerHTML = `<p>❌ Server error loading sellers.</p>`;
  }
});
