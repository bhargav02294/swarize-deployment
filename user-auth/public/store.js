document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/store");
    const data = await res.json();

    if (!data.success || !data.store) {
      window.location.href = "create-store.html";
      return;
    }

    const store = data.store;

    document.getElementById("store-name").innerText = store.name;
    document.getElementById("store-description").innerText = store.description;

    const logoImg = document.getElementById("store-logo");
    if (logoImg) {
      logoImg.src = store.logoUrl;
    }
  } catch (err) {
    console.error("Error loading store:", err);
    window.location.href = "create-store.html";
  }
});
