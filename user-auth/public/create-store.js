document.getElementById("store-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("storeName", document.getElementById("name").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("logo", document.getElementById("logo").files[0]);

  try {
    const response = await fetch("/api/store/create", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      window.location.href = "store.html";
    } else {
      document.getElementById("store-message").textContent = result.message;
    }
  } catch (err) {
    document.getElementById("store-message").textContent = "Failed to create store";
  }
});
