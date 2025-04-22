document.addEventListener("DOMContentLoaded", async () => {
    try {
      const sessionRes = await fetch("/api/user/session", { credentials: "include" });
      const sessionData = await sessionRes.json();
  
      if (!sessionData.success || !sessionData.userId) {
        console.error("User not logged in");
        return;
      }
  
      const storeCheckRes = await fetch("/api/store/check", { credentials: "include" });
      const storeData = await storeCheckRes.json();
  
      if (storeData.success && storeData.storeExists) {
        window.location.href = "store.html";
      } else {
        window.location.href = "create-store.html";
      }
    } catch (err) {
      console.error("Error during redirection:", err);
    }
  });
  