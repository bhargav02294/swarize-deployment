document.getElementById("store-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const res = await fetch("/api/store", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  document.getElementById("message").innerText = data.message;

  if (data.success) {
    setTimeout(() => {
      window.location.href = "store.html";
    }, 1000);
  }
});
