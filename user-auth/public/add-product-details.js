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


// --- Utilities ---
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

function loadSizeOptions(subcategory) {
  if (["Topwear", "Bottomwear", "Ethnic Wear", "Western Wear", "Winterwear"].includes(subcategory)) {
    return createDropdown("Size", "size", ["XS", "S", "M", "L", "XL", "XXL", "3XL"]);
  }
  if (["Footwear", "Unisex Footwear"].includes(subcategory)) {
    return createDropdown("Size", "size", ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"]);
  }
  if (["Boys Clothing", "Girls Clothing", "Festive Wear"].includes(subcategory)) {
    return createDropdown("Size", "size", ["0-1 Yr", "1-2 Yr", "2-3 Yr", "3-4 Yr", "4-5 Yr", "6-7 Yr"]);
  }
  return createInput("Size", "size", "Enter size");
}

// --- Load fields dynamically ---
function loadFields() {
  const subcategory = data.subcategory || "";
  fieldContainer.innerHTML = "";
  fieldContainer.appendChild(loadSizeOptions(subcategory));
  fieldContainer.appendChild(createColorPalette());
  fieldContainer.appendChild(createDropdown("Material", "material", ["Cotton", "Denim", "Polyester", "Rayon"]));
  fieldContainer.appendChild(createDropdown("Pattern", "pattern", ["Solid", "Striped", "Printed", "Checked"]));
  fieldContainer.appendChild(createDropdown("Wash Care", "washCare", ["Machine Wash", "Hand Wash", "Dry Clean"]));
  fieldContainer.appendChild(createInput("Style/Model", "modelStyle"));
  fieldContainer.appendChild(createInput("Brand (optional)", "brand"));
}
loadFields();

// --- Preview ---
document.getElementById("preview-name").textContent = data.name || "Product Name";
document.getElementById("preview-price").textContent = `₹${data.price || 0}`;
document.getElementById("preview-description").textContent = data.description || "";














// ✅ Handle Submit
document.getElementById("details-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = document.getElementById("message");
  const formData = new FormData();

  
  const storeId = localStorage.getItem("storeId") || "";
  const slug = localStorage.getItem("storeSlug") || "";

  // Metadata from step 1
  formData.append("name", data.name || "");
  formData.append("price", data.price || "");
  formData.append("description", data.description || "");
  formData.append("summary", data.summary || "");
  formData.append("category", data.category || "");
  formData.append("subcategory", data.subcategory || "");
  formData.append("storeId", localStorage.getItem("storeId") || "");

  // Step 2 data
  formData.append("size", document.getElementById("size")?.value || "");
  formData.append("color", document.getElementById("color")?.value || "");
  formData.append("material", document.getElementById("material")?.value || "");
  formData.append("pattern", document.getElementById("pattern")?.value || "");
  formData.append("washCare", document.getElementById("washCare")?.value || "");
  formData.append("modelStyle", document.getElementById("modelStyle")?.value || "");
  formData.append("brand", document.getElementById("brand")?.value || "");
  formData.append("availableIn", document.getElementById("availableIn")?.value || "All Over India");

 // ✅ Add thumbnail from localStorage data
  if (!data.thumbnail || !data.thumbnail.name || !data.thumbnail.type || !data.thumbnail.lastModified) {
    message.textContent = "Thumbnail image is required.";
    message.style.color = "red";
    return;
  }

  const thumbnailBlob = new Blob([new Uint8Array(Object.values(data.thumbnail.data))], { type: data.thumbnail.type });
  const thumbnailFile = new File([thumbnailBlob], data.thumbnail.name, { type: data.thumbnail.type, lastModified: data.thumbnail.lastModified });
  formData.append("thumbnailImage", thumbnailFile);

  // ✅ Extra Images
  if (Array.isArray(data.extraImages)) {
    data.extraImages.forEach((img, index) => {
      if (img && img.name && img.type && img.lastModified) {
        const imgBlob = new Blob([new Uint8Array(Object.values(img.data))], { type: img.type });
        const imgFile = new File([imgBlob], img.name, { type: img.type, lastModified: img.lastModified });
        formData.append("extraImages", imgFile);
      }
    });
  }

  // ✅ Extra Videos
  if (Array.isArray(data.extraVideos)) {
    data.extraVideos.forEach((vid, index) => {
      if (vid && vid.name && vid.type && vid.lastModified) {
        const vidBlob = new Blob([new Uint8Array(Object.values(vid.data))], { type: vid.type });
        const vidFile = new File([vidBlob], vid.name, { type: vid.type, lastModified: vid.lastModified });
        formData.append("extraVideos", vidFile);
      }
    });
  }
   // 🧪 Optional log for debugging
  console.log("Submitting product...");
  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  // ✅ API Call
  try {
    const response = await fetch("/api/products/add", {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    const result = await response.json();

    if (response.ok && result.success) {
      message.textContent = "Product added successfully!";
      message.style.color = "green";
      setTimeout(() => {
        window.location.href = `/store.html?slug=${encodeURIComponent(slug)}`;
      }, 2000);
    } else {
      message.textContent = result.message || "Failed to add product.";
      message.style.color = "red";
    }

  } catch (error) {
    console.error("Submit error:", error);
    message.textContent = "Error adding product.";
    message.style.color = "red";
  }
});




// Size chart modal toggle
const modal = document.getElementById("size-chart-modal");
const btn = document.getElementById("show-size-chart");
const span = document.querySelector(".modal .close");

btn.onclick = () => modal.style.display = "block";
span.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
  if (event.target === modal) modal.style.display = "none";
};
