document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("store-form");

  fetch("/api/store/check")
    .then(res => res.json())
    .then(data => {
      if (data.exists) {
        window.location.href = "store.html";
      }
    });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const logo = document.getElementById("logo").files[0];

    if (!name || !description || !logo) {
      alert("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("logo", logo);

    try {
      const response = await fetch("/api/store", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = "store.html";
      } else {
        alert(result.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Store creation failed:", err);
      alert("Something went wrong. Please try again.");
    }
  });
});
