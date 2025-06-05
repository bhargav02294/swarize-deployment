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
  const colors = ["#000", "#f00", "#0f0", "#00f", "#ff0", "#f0f", "#0ff", "#ccc", "#800000", "#FFA500", "#808000", "#800080", "#008080", "#FFD700", "#A52A2A", "#708090"];
  const colorBox = document.createElement("div");
  colorBox.className = "color-palette";
  colors.forEach((hex) => {
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



function loadSizeField(type) {
  if (type === "standard") return createDropdown("Size", "size", ["XS", "S", "M", "L", "XL", "XXL", "3XL"]);
  if (type === "footwear") return createDropdown("Size", "size", ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"]);
  if (type === "kids") return createDropdown("Size", "size", ["0-1 Yr", "1-2 Yr", "2-3 Yr", "3-4 Yr"]);
  return createInput("Size", "size", "Enter size if applicable");
}

function loadFields() {
  const config = subcategoryFieldsMap[data.subcategory] || {};
  fieldContainer.innerHTML = "";

  if (config.size) fieldContainer.appendChild(loadSizeField(config.size));
  if (config.color) fieldContainer.appendChild(createColorPalette());
  if (config.material) fieldContainer.appendChild(createDropdown("Material", "material", ["Cotton", "Denim"]));
  if (config.pattern) fieldContainer.appendChild(createDropdown("Pattern", "pattern", ["Solid", "Striped"]));
  if (config.washCare) fieldContainer.appendChild(createDropdown("Wash Care", "washCare", ["Machine Wash", "Hand Wash"]));
  if (config.modelStyle) fieldContainer.appendChild(createInput("Style/Model", "modelStyle"));

  fieldContainer.appendChild(createInput("Brand (optional)", "brand"));
}

loadFields();








// ------------------ Preview Setup ------------------

function populatePreview() {
  const previewName = document.getElementById("preview-name");
  const previewPrice = document.getElementById("preview-price");
  const previewDesc = document.getElementById("preview-description");
  

  previewName.textContent = data.name || "Product Name";
  previewPrice.textContent = `₹${data.price || 0}`;
  previewDesc.textContent = data.description || "";

}

populatePreview();






// ------------------ Final Submit ------------------

document.getElementById("details-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = document.getElementById("message") || document.createElement("div");
  if (!message.id) {
    message.id = "message";
    document.body.appendChild(message);
  }

  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("price", data.price);
  formData.append("description", data.description);
  formData.append("summary", data.summary);
  formData.append("category", data.category);
  formData.append("subcategory", data.subcategory);
  formData.append("storeId", data.storeId || "");

  formData.append("size", document.getElementById("size")?.value || "");
  formData.append("color", document.getElementById("color")?.value || "");
  formData.append("material", document.getElementById("material")?.value || "");
  formData.append("pattern", document.getElementById("pattern")?.value || "");
  formData.append("washCare", document.getElementById("washCare")?.value || "");
  formData.append("modelStyle", document.getElementById("modelStyle")?.value || "");
  formData.append("brand", document.getElementById("brand")?.value || "");

  if (data.thumbnail) formData.append("thumbnailImage", data.thumbnail);
  (data.extraImages || []).forEach(img => formData.append("extraImages", img));
  (data.extraVideos || []).forEach(vid => formData.append("extraVideos", vid));

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
        const slug = localStorage.getItem("storeSlug");
        window.location.href = `/store.html?slug=${encodeURIComponent(slug)}`;
      }, 2000);
    } else {
      message.textContent = result.message || "Failed to add product.";
      message.style.color = "red";
    }
  } catch (err) {
    console.error("Error:", err);
    message.textContent = "Error adding product.";
    message.style.color = "red";
  }
});









document.getElementById("details-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = document.getElementById("message") || document.createElement("div");
  if (!message.id) {
    message.id = "message";
    document.body.appendChild(message);
  }

  // Safety check
  const storeId = localStorage.getItem("storeId");
  if (!storeId) {
    message.textContent = "Store not found. Please set up your store first.";
    message.style.color = "red";
    return;
  }

  const formData = new FormData();

  // Step 1: basic product data from localStorage
  formData.append("name", data.name || "");
  formData.append("price", data.price || "");
  formData.append("description", data.description || "");
  formData.append("summary", data.summary || "");
  formData.append("category", data.category || "");
  formData.append("subcategory", data.subcategory || "");
  formData.append("storeId", storeId);

  // Step 2: subcategory-specific fields
  formData.append("size", document.getElementById("size")?.value.trim() || "");
  formData.append("color", document.getElementById("color")?.value.trim() || "");
  formData.append("material", document.getElementById("material")?.value.trim() || "");
  formData.append("pattern", document.getElementById("pattern")?.value.trim() || "");
  formData.append("washCare", document.getElementById("washCare")?.value.trim() || "");
  formData.append("modelStyle", document.getElementById("modelStyle")?.value.trim() || "");
  formData.append("brand", document.getElementById("brand")?.value.trim() || "");

  // AvailableIn fallback
  const availableInInput = document.getElementById("availableIn");
  const availableInValue = availableInInput?.value.trim() || "All Over India";
  formData.append("availableIn", availableInValue);

  // Images/videos collected in step 1
  if (data.thumbnail) {
    formData.append("thumbnailImage", data.thumbnail);
  } else {
    message.textContent = "Thumbnail image is required.";
    message.style.color = "red";
    return;
  }

  (data.extraImages || []).forEach(file => {
    if (file) formData.append("extraImages", file);
  });

  (data.extraVideos || []).forEach(file => {
    if (file) formData.append("extraVideos", file);
  });

  // Optional: Preview log
  console.log("Submitting product...");
  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  // Step 3: Send API request
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
        const slug = localStorage.getItem("storeSlug");
        window.location.href = `/store.html?slug=${encodeURIComponent(slug)}`;
      }, 2000);
    } else {
      message.textContent = result.message || "Failed to add product.";
      message.style.color = "red";
    }

  } catch (err) {
    console.error("Submission error:", err);
    message.textContent = "An error occurred while submitting.";
    message.style.color = "red";
  }
});
