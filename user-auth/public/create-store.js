document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createStoreForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch("/api/store/create", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = "store.html";
      } else {
        alert(result.message || "Error creating store");
      }
    } catch (error) {
      console.error("Store creation failed:", error);
      alert("Store creation failed.");
    }
  });
});
