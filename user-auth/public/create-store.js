document.addEventListener("DOMContentLoaded", function () {
  const storeForm = document.getElementById("store-form");
  const storeMessage = document.getElementById("store-message");

  storeForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(storeForm);

      const response = await fetch("/api/store/create", {
          method: "POST",
          body: formData,
      });

      const data = await response.json();

      if (data.success) {
          storeMessage.textContent = "Store created successfully!";
          setTimeout(() => {
              window.location.href = "/store.html"; // Redirect to the store page
          }, 2000);
      } else {
          storeMessage.textContent = data.message || "Something went wrong. Please try again.";
      }
  });
});
