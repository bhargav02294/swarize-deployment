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


// Utility functions
function createInput(label, id, placeholder = "") {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<label for="${id}">${label}</label><input type="text" id="${id}" name="${id}" placeholder="${placeholder}" />`;
  return wrapper;
}

function createDropdown(label, id, options) {
  const wrapper = document.createElement("div");
  const optionsHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join("");
  wrapper.innerHTML = `<label for="${id}">${label}</label><select id="${id}" name="${id}"><option disabled selected>Select ${label}</option>${optionsHTML}</select>`;
  return wrapper;
}

function createColorPalette() {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<label>Color</label>`;
  const colors = ["#000", "#f00", "#0f0", "#00f", "#ff0", "#f0f", "#0ff", "#ccc"];
  const colorBox = document.createElement("div");
  colorBox.className = "color-palette";

  colors.forEach(hex => {
    const swatch = document.createElement("span");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = hex;
    swatch.setAttribute("data-color", hex);
    swatch.addEventListener("click", () => {
      document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("selected"));
      swatch.classList.add("selected");
      document.getElementById("color").value = hex;
    });
    colorBox.appendChild(swatch);
  });

  const input = document.createElement("input");
  input.type = "text";
  input.id = "color";
  input.placeholder = "Or enter custom color name";
  wrapper.append(colorBox, input);
  return wrapper;
}

function loadSizeOptions(type) {
  if (type === "standard") return createDropdown("Size", "size", ["XS", "S", "M", "L", "XL", "XXL", "3XL"]);
  if (type === "footwear") return createDropdown("Size", "size", ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"]);
  if (type === "kids") return createDropdown("Size", "size", ["0-1 Yr", "1-2 Yr", "2-3 Yr", "3-4 Yr", "4-5 Yr", "6-7 Yr"]);
  return createInput("Size", "size", "Enter size");
}

// Load fields based on subcategory
function loadFields() {
  const config = subcategoryFieldsMap[data.subcategory] || {};
  fieldContainer.innerHTML = "";

  if (config.size) fieldContainer.appendChild(loadSizeOptions(config.size));
  if (config.color) fieldContainer.appendChild(createColorPalette());
  if (config.material) fieldContainer.appendChild(createDropdown("Material", "material", ["Cotton", "Denim", "Polyester", "Rayon"]));
  if (config.pattern) fieldContainer.appendChild(createDropdown("Pattern", "pattern", ["Solid", "Striped", "Printed", "Checked"]));
  if (config.washCare) fieldContainer.appendChild(createDropdown("Wash Care", "washCare", ["Machine Wash", "Hand Wash", "Dry Clean"]));
  if (config.modelStyle) fieldContainer.appendChild(createInput("Style/Model", "modelStyle"));
  fieldContainer.appendChild(createInput("Brand (optional)", "brand"));
}
loadFields();

// Preview setup
document.getElementById("preview-name").textContent = data.name || "Product Name";
document.getElementById("preview-price").textContent = `₹${data.price || 0}`;
document.getElementById("preview-description").textContent = data.description || "";

// ✅ Final Submit
document.getElementById("details-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = document.getElementById("message");
  const formData = new FormData();

  const storeId = localStorage.getItem("storeId");
  const slug = localStorage.getItem("storeSlug");

  // Step 1 Data
  formData.append("name", data.name || "");
  formData.append("price", data.price || "");
  formData.append("description", data.description || "");
  formData.append("summary", data.summary || "");
  formData.append("category", data.category || "");
  formData.append("subcategory", data.subcategory || "");
  formData.append("storeId", storeId || "");

  // Step 2 Data
  formData.append("size", document.getElementById("size")?.value || "");
  formData.append("color", document.getElementById("color")?.value || "");
  formData.append("material", document.getElementById("material")?.value || "");
  formData.append("pattern", document.getElementById("pattern")?.value || "");
  formData.append("washCare", document.getElementById("washCare")?.value || "");
  formData.append("modelStyle", document.getElementById("modelStyle")?.value || "");
  formData.append("brand", document.getElementById("brand")?.value || "");
  formData.append("availableIn", document.getElementById("availableIn")?.value || "All Over India");

  // ✅ Thumbnail from localStorage
  if (!data.thumbnail || !data.thumbnail.data) {
    message.textContent = "Thumbnail image is missing.";
    message.style.color = "red";
    return;
  }
  const thumbBlob = new Blob([new Uint8Array(Object.values(data.thumbnail.data))], { type: data.thumbnail.type });
  const thumbFile = new File([thumbBlob], data.thumbnail.name, { type: data.thumbnail.type });
  formData.append("thumbnailImage", thumbFile);

  // ✅ Extra Images
  (data.extraImages || []).forEach((img) => {
    if (img?.data) {
      const blob = new Blob([new Uint8Array(Object.values(img.data))], { type: img.type });
      const file = new File([blob], img.name, { type: img.type });
      formData.append("extraImages", file);
    }
  });

  // ✅ Extra Videos
  (data.extraVideos || []).forEach((vid) => {
    if (vid?.data) {
      const blob = new Blob([new Uint8Array(Object.values(vid.data))], { type: vid.type });
      const file = new File([blob], vid.name, { type: vid.type });
      formData.append("extraVideos", file);
    }
  });

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
        window.location.href = `/store.html?slug=${encodeURIComponent(slug)}`;
      }, 2000);
    } else {
      message.textContent = result.message || "Failed to add product.";
      message.style.color = "red";
    }
  } catch (err) {
    console.error("Submit error:", err);
    message.textContent = "Error adding product.";
    message.style.color = "red";
  }
});

// ✅ Size Chart Modal
const modal = document.getElementById("size-chart-modal");
const btn = document.getElementById("show-size-chart");
const span = document.querySelector(".modal .close");
btn.onclick = () => modal.style.display = "block";
span.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
