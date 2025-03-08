document.addEventListener("DOMContentLoaded", async () => {
  // ✅ Check if user is signed in (same as addtocart.js)
  const authResponse = await fetch("/api/bank/is-logged-in", { credentials: "include" });
  const authData = await authResponse.json();

  if (!authData.isLoggedIn) {
      document.body.innerHTML = `
          <h2>You are not signed in. Please sign in to add bank details.</h2>
          <button onclick="window.location.href='signin.html'">Sign In</button>
      `;
      return;
  }

  document.getElementById("bank-details-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const bankName = document.getElementById("bankName").value.trim();
      const accountHolder = document.getElementById("accountHolder").value.trim();
      const accountNumber = document.getElementById("accountNumber").value.trim();
      const ifscCode = document.getElementById("ifscCode").value.trim();
      const messageBox = document.getElementById("message");

      messageBox.textContent = "Processing...";

      try {
          // ✅ Send bank details to backend with session authentication
          const response = await fetch("/api/bank/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include", // ✅ Ensures session cookie is sent
              body: JSON.stringify({ bankName, accountHolder, accountNumber, ifscCode })
          });

          const data = await response.json();
          messageBox.textContent = data.message;
          messageBox.style.color = data.success ? "green" : "red";

          if (data.success) {
              document.getElementById("bank-details-form").reset(); // Clear form on success
          }
      } catch (error) {
          console.error("❌ Error saving bank details:", error);
          messageBox.textContent = "❌ Failed to save bank details.";
          messageBox.style.color = "red";
      }
  });
});
