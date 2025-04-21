document.addEventListener("DOMContentLoaded", () => {
    const storeForm = document.getElementById("store-form");
    const message = document.getElementById("store-message");
  
    let ownerId = null;
    let ownerEmail = null;
  
    // Load session first
    fetch("/api/session")
      .then(res => res.json())
      .then(data => {
        if (data && data.userId && data.email) {
          ownerId = data.userId;
          ownerEmail = data.email;
        } else {
          message.textContent = "Missing owner credentials.";
          document.getElementById("save-store-btn").disabled = true;
        }
      })
      .catch(err => {
        console.error("Error fetching session:", err);
        message.textContent = "Error fetching user info.";
      });
  
    storeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      if (!ownerId || !ownerEmail) {
        message.textContent = "Missing owner credentials.";
        return;
      }
  
      const formData = new FormData(storeForm);
      formData.append("ownerId", ownerId);
      formData.append("ownerEmail", ownerEmail);
  
      try {
        const response = await fetch("/api/store", {
          method: "POST",
          body: formData
        });
  
        const result = await response.json();
        if (response.ok) {
          message.textContent = "Store created successfully!";
          window.location.href = "store.html";
        } else {
          message.textContent = result.error || "Error creating store.";
        }
      } catch (error) {
        console.error("Error submitting store form:", error);
        message.textContent = "Something went wrong!";
      }
    });
  });
  