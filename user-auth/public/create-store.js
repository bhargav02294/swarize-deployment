// public/create-store.js
document.addEventListener("DOMContentLoaded", () => {
  const storeForm = document.getElementById("store-form");
  const storeMessage = document.getElementById("store-message");

  storeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const name = document.getElementById("name").value;
    const logo = document.getElementById("logo").files[0];
    const description = document.getElementById("description").value;

    if (!name || !logo || !description) {
      storeMessage.textContent = "All fields are required.";
      return;
    }

    formData.append("name", name);
    formData.append("logo", logo);
    formData.append("description", description);

    try {
      const res = await fetch("/api/store", {
        method: "POST",
        credentials: "include",
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        storeMessage.textContent = "✅ Store created successfully!";
        window.location.href = "store.html";
      } else {
        storeMessage.textContent = `❌ ${data.message}`;
      }
    } catch (err) {
      console.error("Store creation error:", err);
      storeMessage.textContent = "Something went wrong. Please try again.";
    }
  });
});
