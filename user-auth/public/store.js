document.addEventListener("DOMContentLoaded", async () => {
  try {
    const sessionRes = await fetch("/api/user/session", { credentials: "include" });
    const sessionData = await sessionRes.json();

    if (!sessionData.success) {
      console.error("User not logged in");
      return;
    }

    const res = await fetch("/api/store/check", { credentials: "include" });
    const data = await res.json();

    if (!data.success || !data.storeExists) {
      window.location.href = "create-store.html";
      return;
    }

    // ✅ Fetch store details if needed here
    // Example: display store name or logo

  } catch (error) {
    console.error("Error loading store data:", error);
  }
});
