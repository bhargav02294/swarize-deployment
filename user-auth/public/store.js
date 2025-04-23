document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("/api/store");
  const data = await res.json();

  if (!data.success) {
    return (window.location.href = "create-store.html");
  }

  const store = data.store;
  document.getElementById("store-name").innerText = store.storeName;
  document.getElementById("store-logo").src = "/uploads/" + store.storeLogo;
  document.getElementById("store-description").innerText = store.description;

  const container = document.getElementById("products-container");
  data.products.forEach(product => {
    const item = document.createElement("div");
    item.innerHTML = `
      <img src="/uploads/${product.thumbnailImage}" width="100" />
      <h3>${product.name}</h3>
      <p>Price: ₹${product.price}</p>
      <p>Category: ${product.category}</p>
      <button onclick="deleteProduct('${product._id}')">Delete</button>
    `;
    container.appendChild(item);
  });
});

async function deleteProduct(productId) {
  if (confirm("Delete this product?")) {
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    window.location.reload();
  }
}
