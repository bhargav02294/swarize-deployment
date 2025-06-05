const data = JSON.parse(localStorage.getItem("basicProductData")) || {};
const fieldContainer = document.getElementById("dynamic-fields");

// Mapping: subcategory → fields to show
const subcategoryFieldsMap = {
  // --- Women ---
  "Ethnic Wear":        { size: "standard", color: true, material: true, pattern: true, washCare: true, modelStyle: true },
  "Western Wear":       { size: "standard", color: true, material: true, pattern: true, washCare: true, modelStyle: true },
  "Bottomwear":         { size: "standard", color: true, material: true, pattern: true, washCare: true, modelStyle: true },
  "Winterwear":         { size: "standard", color: true, material: true, pattern: true, washCare: true, modelStyle: true },
  "Innerwear & Loungewear": { size: "standard", color: true, material: true, washCare: true, pattern: false, modelStyle: false },
  "Footwear":           { size: "footwear", color: true, material: false, pattern: false, washCare: false, modelStyle: false },
  "Bags & Clutches":    { size: false, color: true, material: true, pattern: false, washCare: false, modelStyle: false },
  "Jewelry & Accessories": { size: false, color: true, material: true, pattern: false, washCare: false, modelStyle: false },
  "Beauty & Makeup":    { size: false, color: false, material: false, pattern: false, washCare: false, modelStyle: false },
  "Eyewear & Watches":  { size: false, color: false, material: false, pattern: false, washCare: false, modelStyle: false },

  // --- Men ---
  "Topwear":            { size: "standard", color: true, material: true, pattern: true, washCare: true, modelStyle: true },
  "Bottomwear":         { size: "standard", color: true, material: true, pattern: true, washCare: true, modelStyle: true },
  "Ethnic Wear":        { size: "standard", color: true, material: true, pattern: true, washCare: true, modelStyle: true },
  "Winterwear":         { size: "standard", color: true, material: true, pattern: true, washCare: true, modelStyle: true },
  "Innerwear & Sleepwear": { size: "standard", color: true, material: true, washCare: true, pattern: false, modelStyle: false },
  "Footwear":           { size: "footwear", color: true, material: false, pattern: false, washCare: false, modelStyle: false },
  "Accessories":        { size: false, color: true, material: true, pattern: false, washCare: false, modelStyle: false },
  "Eyewear & Watches":  { size: false, color: false, material: false, pattern: false, washCare: false, modelStyle: false },
  "Grooming":           { size: false, color: false, material: false, pattern: false, washCare: false, modelStyle: false },
  "Bags & Utility":     { size: false, color: true, material: true, washCare: false, pattern: false, modelStyle: false },

  // --- Kids ---
  "Boys Clothing":      { size: "kids", color: true, material: true, pattern: true, washCare: true, modelStyle: true },
  "Girls Clothing":     { size: "kids", color: true, material: true, pattern: true, washCare: true, modelStyle: true },
  "Footwear":           { size: "footwear", color: true, material: false, pattern: false, washCare: false, modelStyle: false },
  "Toys & Games":       { size: false, color: false, material: false, pattern: false, washCare: false, modelStyle: false },
  "Remote Toys":        { size: false, color: false, material: false, pattern: false, washCare: false, modelStyle: false },
  "Learning & School":  { size: false, color: false, material: false, pattern: false, washCare: false, modelStyle: false },
  "Baby Essentials":    { size: false, color: false, material: false, pattern: false, washCare: false, modelStyle: false },
  "Winterwear":         { size: "kids", color: true, material: true, pattern: true, washCare: true, modelStyle: true },
  "Accessories":        { size: false, color: true, material: true, pattern: false, washCare: false, modelStyle: false },
  "Festive Wear":       { size: "kids", color: true, material: true, pattern: true, washCare: true, modelStyle: true },

  // --- Accessories ---
  "Bags & Travel":      { size: false, color: true, material: true, pattern: false, washCare: false, modelStyle: false },
  "Unisex Footwear":    { size: "footwear", color: true, material: false, pattern: false, washCare: false, modelStyle: false },
  "Mobile Accessories": { size: false, color: false, material: false, pattern: false, washCare: false, modelStyle: false },
  "Gadgets":            { size: false, color: false, material: false, pattern: false, washCare: false, modelStyle: false },
  "Computer Accessories": { size: false, color: false, material: false, pattern: false, washCare: false, modelStyle: false },
  "Home Decor":         { size: false, color: true, material: true, pattern: false, washCare: false, modelStyle: false },
  "Kitchenware":        { size: false, color: false, material: true, pattern: false, washCare: false, modelStyle: false },
  "Health & Care":      { size: false, color: false, material: false, pattern: false, washCare: false, modelStyle: false },
  "Craft & DIY Kits":   { size: false, color: false, material: false, pattern: false, washCare: false, modelStyle: false },
  "Fashion Accessories": { size: false, color: true, material: true, pattern: false, washCare: false, modelStyle: false }
};


function createInput(label, id, placeholder = "") {
  const div = document.createElement("div");
  div.innerHTML = `<label>${label}</label><input type="text" id="${id}" placeholder="${placeholder}" />`;
  return div;
}

function createDropdown(label, id, options) {
  const div = document.createElement("div");
  const opts = options.map(val => `<option value="${val}">${val}</option>`).join("");
  div.innerHTML = `<label>${label}</label><select id="${id}"><option disabled selected>Select ${label}</option>${opts}</select>`;
  return div;
}

function createColorPalette() {
  const div = document.createElement("div");
  div.innerHTML = `<label>Color</label>`;
  const colors = ["#000", "#f00", "#0f0", "#00f", "#ff0", "#ccc"];
  const palette = document.createElement("div");
  palette.className = "color-palette";
  colors.forEach(hex => {
    const swatch = document.createElement("span");
    swatch.className = "color-swatch";
    swatch.style.background = hex;
    swatch.addEventListener("click", () => {
      document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("selected"));
      swatch.classList.add("selected");
      document.getElementById("color").value = hex;
    });
    palette.appendChild(swatch);
  });
  const input = document.createElement("input");
  input.id = "color";
  input.placeholder = "Or enter color";
  div.append(palette, input);
  return div;
}

function loadSizeField(type) {
  if (type === "standard") return createDropdown("Size", "size", ["XS", "S", "M", "L", "XL", "XXL"]);
  if (type === "footwear") return createDropdown("Size", "size", ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9"]);
  if (type === "kids") return createDropdown("Size", "size", ["1-2 Yr", "3-4 Yr", "5-6 Yr"]);
  return createInput("Size", "size");
}

function loadFields() {
  const map = subcategoryFieldsMap[data.subcategory] || {};
  fieldContainer.innerHTML = "";
  if (map.size) fieldContainer.appendChild(loadSizeField(map.size));
  if (map.color) fieldContainer.appendChild(createColorPalette());
  if (map.material) fieldContainer.appendChild(createDropdown("Material", "material", ["Cotton", "Polyester", "Wool"]));
  if (map.modelStyle) fieldContainer.appendChild(createInput("Model/Style", "modelStyle"));
  fieldContainer.appendChild(createInput("Brand (Optional)", "brand"));
}
loadFields();








function populatePreview() {
  document.getElementById("preview-name").textContent = data.name || "Product Name";
  document.getElementById("preview-price").textContent = `₹${data.price || 0}`;
  document.getElementById("preview-description").textContent = data.description || "";
  if (data.thumbnail) {
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById("preview-thumbnail").src = e.target.result;
    };
    reader.readAsDataURL(data.thumbnail);
  }
}
populatePreview();











// Submit Handler
document.getElementById("details-form").addEventListener("submit", async e => {
  e.preventDefault();

  const message = document.getElementById("message");
  const storeId = localStorage.getItem("storeId");
  if (!storeId) {
    message.textContent = "Store not found.";
    message.style.color = "red";
    return;
  }

  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("price", data.price);
  formData.append("description", data.description);
  formData.append("summary", data.summary);
  formData.append("category", data.category);
  formData.append("subcategory", data.subcategory);
  formData.append("storeId", storeId);

  // Dynamic fields
  ["size", "color", "material", "modelStyle", "brand"].forEach(id => {
    const el = document.getElementById(id);
    if (el) formData.append(id, el.value.trim());
  });

  const availableIn = document.getElementById("availableIn").value.trim() || "All Over India";
  formData.append("availableIn", availableIn);

  // Images/Videos
  if (data.thumbnail) formData.append("thumbnailImage", data.thumbnail);
  (data.extraImages || []).forEach(f => f && formData.append("extraImages", f));
  (data.extraVideos || []).forEach(f => f && formData.append("extraVideos", f));

  try {
    const res = await fetch("/api/products/add", {
      method: "POST",
      body: formData,
      credentials: "include"
    });
    const result = await res.json();
    if (res.ok && result.success) {
      message.textContent = "Product added successfully!";
      message.style.color = "green";
      setTimeout(() => {
        window.location.href = `/store.html?slug=${encodeURIComponent(localStorage.getItem("storeSlug"))}`;
      }, 1500);
    } else {
      message.textContent = result.message || "Failed to add product.";
      message.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    message.textContent = "Something went wrong.";
    message.style.color = "red";
  }
});

// Size chart modal
document.getElementById("show-size-chart").addEventListener("click", () => {
  document.getElementById("size-chart-modal").style.display = "block";
});
document.querySelector(".close").addEventListener("click", () => {
  document.getElementById("size-chart-modal").style.display = "none";
});










