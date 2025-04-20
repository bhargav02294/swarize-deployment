document.addEventListener("DOMContentLoaded", () => {
    const sellerId = localStorage.getItem("sellerId");
    const createForm = document.getElementById("store-form");
    const msg = document.getElementById("store-message");
  
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const formData = new FormData();
      formData.append("storeName", document.getElementById("storeName").value);
      formData.append("storeDescription", document.getElementById("storeDescription").value);
      formData.append("storeLogo", document.getElementById("storeLogo").files[0]);
      formData.append("sellerId", sellerId);
  
      try {
        const res = await fetch("/api/store", {
          method: "POST",
          body: formData,
        });
  
        const data = await res.json();
  
        if (res.ok) {
          msg.textContent = "Store created! Redirecting...";
          setTimeout(() => {
            window.location.href = `store.html?sellerId=${sellerId}`;
          }, 2000);
        } else {
          msg.textContent = data.error || "Failed to create store.";
        }
      } catch (error) {
        msg.textContent = "An error occurred. Please try again.";
      }
    });
  });
  