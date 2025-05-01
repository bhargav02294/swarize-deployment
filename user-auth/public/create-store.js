document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const storeName = form.querySelector('#storeName').value.trim();
  const description = form.querySelector('#description').value.trim();
  const logo = form.querySelector('#logo').files[0];

  const formData = new FormData();
  formData.append("storeName", storeName);
  formData.append("description", description);
  if (logo) formData.append("logo", logo);

  try {
    const res = await fetch("/api/store/create", {
      method: "POST",
      body: formData,
      credentials: 'include'
    });

    const result = await res.json();
    if (res.ok && result.success) {
      localStorage.setItem("storeSlug", result.slug);
      location.href = `/store.html?slug=${result.slug}`;
    } else {
      alert(result.message || "❌ Failed to create store");
    }
  } catch (err) {
    console.error("❌ Store create error:", err);
    alert("Something went wrong");
  }
});
