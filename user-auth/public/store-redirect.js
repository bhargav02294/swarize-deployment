fetch("/api/store/check")
  .then(res => res.json())
  .then(data => {
    if (data.hasStore) {
      window.location.href = "store.html";
    } else {
      window.location.href = "create-store.html";
    }
  })
  .catch(err => {
    console.error("Redirect check failed", err);
    window.location.href = "signin.html";
  });
