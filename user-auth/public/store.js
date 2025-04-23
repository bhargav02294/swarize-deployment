document.addEventListener("DOMContentLoaded", () => {
  const storeName = document.getElementById("store-name");
  const storeLogo = document.getElementById("store-logo");
  const storeDesc = document.getElementById("store-desc");
  const productsList = document.getElementById("products-list");

  fetch("/api/store")
    .then(res => res.json())
    .then(data => {
      if (!data.store) return;

      document.getElementById("display-store").style.display = "block";
      storeName.textContent = data.store.storeName;
      storeLogo.src = data.store.storeLogo;
      storeDesc.textContent = data.store.description;

      productsList.innerHTML = "";
      data.products.forEach(product => {
        const div = document.createElement("div");
        div.innerHTML = `
          <p><strong>${product.name}</strong></p>
          <img src="${product.thumbnailImage}" width="100"/>
          <p>Price: ₹${product.price}</p>
          <p>Category: ${product.category}</p>
          <button data-id="${product._id}" class="remove-btn">Remove</button>
          <hr>
        `;
        productsList.appendChild(div);
      });

      productsList.addEventListener("click", async (e) => {
        if (e.target.classList.contains("remove-btn")) {
          const id = e.target.getAttribute("data-id");
          const confirmDelete = confirm("Are you sure to delete?");
          if (confirmDelete) {
            await fetch(`/api/store/product/${id}`, { method: "DELETE" });
            location.reload();
          }
        }
      });
    });
});
