// ✅ NEW categoriesData with 4 Main Categories and 10 Subcategories Each
const categoriesData = [
  {
    name: "Women",
    subcategories: [
      "Ethnic Wear", "Western Wear", "Bottomwear", "Winterwear", "Innerwear & Loungewear",
      "Footwear", "Bags & Clutches", "Jewelry & Accessories", "Beauty & Makeup", "Eyewear & Watches"
    ]
  },
  {
    name: "Men",
    subcategories: [
      "Topwear", "Bottomwear", "Ethnic Wear", "Winterwear", "Innerwear & Sleepwear",
      "Footwear", "Accessories", "Eyewear & Watches", "Grooming", "Bags & Utility"
    ]
  },
  {
    name: "Kids",
    subcategories: [
      "Boys Clothing", "Girls Clothing", "Footwear", "Toys & Games", "Remote Toys",
      "Learning & School", "Baby Essentials", "Winterwear", "Accessories", "Festive Wear"
    ]
  },
  {
    name: "Accessories",
    subcategories: [
      "Bags & Travel", "Unisex Footwear", "Mobile Accessories", "Gadgets", "Computer Accessories",
      "Home Decor", "Kitchenware", "Health & Care", "Craft & DIY Kits", "Fashion Accessories"
    ]
  }
];



const categorySelect = document.getElementById("category");
const subcategorySelect = document.getElementById("subcategory");

// Populate categories
categoriesData.forEach((category) => {
  const option = document.createElement("option");
  option.value = category.name;
  option.textContent = category.name;
  categorySelect.appendChild(option);
});

// Update subcategories based on selected category
categorySelect.addEventListener("change", (e) => {
  const selectedCategory = e.target.value;
  const category = categoriesData.find((cat) => cat.name === selectedCategory);
  subcategorySelect.innerHTML = '<option value="" disabled selected>Select a subcategory</option>';
  if (category) {
    category.subcategories.forEach((subcategory) => {
      const option = document.createElement("option");
      option.value = subcategory;
      option.textContent = subcategory;
      subcategorySelect.appendChild(option);
    });
  }
});











// Live preview elements
const previewThumbnail = document.getElementById("preview-thumbnail");
const previewName = document.getElementById("preview-name");
const previewPrice = document.getElementById("preview-price");
const previewDescription = document.getElementById("preview-description");
const previewExtraImages = [
  document.getElementById("preview-extra-image-1"),
  document.getElementById("preview-extra-image-2"),
  document.getElementById("preview-extra-image-3"),
  document.getElementById("preview-extra-image-4"),
];

// Additional preview elements
const previewCategory = document.createElement("p");
const previewSubcategory = document.createElement("p");
const previewTags = document.createElement("p");
const previewSize = document.createElement("p");
const previewColor = document.createElement("p");
const previewMaterial = document.createElement("p");
const previewModelStyle = document.createElement("p");

// Add these elements to the preview container dynamically
const previewContainer = document.querySelector(".preview-container");
previewContainer.append(previewCategory, previewSubcategory, previewTags, previewSize, previewColor, previewMaterial, previewModelStyle);

// Update live preview for text inputs
document.getElementById("product-name").addEventListener("input", (e) => {
  previewName.textContent = e.target.value || "Product Name";
});

document.getElementById("price").addEventListener("input", (e) => {
  const price = e.target.value ? `₹${e.target.value}` : "₹0.00";
  previewPrice.textContent = price;
});

document.getElementById("description").addEventListener("input", (e) => {
  previewDescription.textContent = e.target.value || "Product description will appear here.";
});

// Update live preview for category and subcategory
categorySelect.addEventListener("change", (e) => {
  previewCategory.textContent = `Category: ${e.target.value}`;
});

subcategorySelect.addEventListener("change", (e) => {
  previewSubcategory.textContent = `Subcategory: ${e.target.value}`;
});



// Update live preview for images
const handleImagePreview = (fileInput, previewElement) => {
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewElement.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    previewElement.src = "";
  }
};

document.getElementById("thumbnail-image").addEventListener("change", (e) => {
  handleImagePreview(e.target, previewThumbnail);
});

document.getElementById("extraImage1").addEventListener("change", (e) => {
  handleImagePreview(e.target, previewExtraImages[0]);
});

document.getElementById("extraImage2").addEventListener("change", (e) => {
  handleImagePreview(e.target, previewExtraImages[1]);
});

document.getElementById("extraImage3").addEventListener("change", (e) => {
  handleImagePreview(e.target, previewExtraImages[2]);
});

document.getElementById("extraImage4").addEventListener("change", (e) => {
  handleImagePreview(e.target, previewExtraImages[3]);
});

['extraVideo1', 'extraVideo2', 'extraVideo3'].forEach((id, index) => {
  document.getElementById(id).addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const videoElement = document.getElementById(`preview-extra-video-${index + 1}`);
      videoElement.src = url;
      videoElement.style.display = 'block';
    }
  });
});





// Reset live preview (optional)
function resetLivePreview() {
    document.getElementById('preview-thumbnail').src = '';
    document.getElementById('preview-name').textContent = 'Product Name';
    document.getElementById('preview-price').textContent = '₹0.00';
    document.getElementById('preview-description').textContent = 'Product description will appear here.';
    ['preview-extra-image-1', 'preview-extra-image-2', 'preview-extra-image-3', 'preview-extra-image-4'].forEach(id => {
        document.getElementById(id).src = '';
    });
    ['preview-extra-video-1', 'preview-extra-video-2', 'preview-extra-video-3'].forEach(id => {
        const video = document.getElementById(id);
        video.src = '';
        video.pause();
    });
}



async function fetchStoreDetails() {
  const slug = localStorage.getItem("storeSlug");
  const messageElement = document.getElementById('message');

  if (!slug) {
      messageElement.textContent = "Store info missing. Please open your store first.";
      messageElement.style.color = "red";
      return null;
  }

  try {
      const res = await fetch(`/api/store/${slug}`);
      const data = await res.json();
      if (data.success) {
          localStorage.setItem("storeId", data.store._id);
          localStorage.setItem("storeName", data.store.storeName);
          localStorage.setItem("storeSlug", data.store.slug);
          return data.store;
      } else {
          messageElement.textContent = "Store not found.";
          messageElement.style.color = "red";
          return null;
      }
  } catch (err) {
      console.error("Error fetching store:", err);
      return null;
  }
}










/*
document.getElementById('add-product-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const messageElement = document.getElementById('message');
  const formData = new FormData();

  const availableInInput = document.getElementById("availableIn");
  let availableInValue = availableInInput.value.trim() || "All Over India";

  formData.append('name', document.getElementById("product-name").value.trim());
  formData.append('price', document.getElementById("price").value.trim());
  formData.append('description', document.getElementById("description").value.trim());
  formData.append('summary', document.getElementById("summary").value.trim());
  formData.append('category', document.getElementById("category").value);
  formData.append('subcategory', document.getElementById("subcategory").value);
  formData.append('size', document.getElementById("size").value.trim());
  formData.append('color', document.getElementById("color").value.trim());
  formData.append('material', document.getElementById("material").value.trim());
  formData.append('modelStyle', document.getElementById("model-style").value.trim());
  formData.append('availableIn', availableInValue);

  const thumbnail = document.getElementById("thumbnail-image").files[0];
  if (thumbnail) {
      formData.append('thumbnailImage', thumbnail);
  } else {
      messageElement.textContent = " Thumbnail image is required.";
      messageElement.style.color = "red";
      return;
  }

  // Add extra images to FormData
  ['extraImage1', 'extraImage2', 'extraImage3', 'extraImage4'].forEach(id => {
      const file = document.getElementById(id)?.files[0];
      if (file) {
          formData.append('extraImages', file);
      }
  });

  // Add extra videos to FormData
  ['extraVideo1', 'extraVideo2', 'extraVideo3'].forEach(id => {
      const file = document.getElementById(id)?.files[0];
      if (file) {
          formData.append('extraVideos', file);
      }
  });

  // Log FormData before sending to check the contents
  console.log("Uploading FormData...");
  for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
  }

  // Get the storeId from localStorage
  const storeId = localStorage.getItem("storeId");
  formData.append("storeId", storeId);

  try {
      const response = await fetch("/api/products/add", {
          method: "POST",
          body: formData,
          credentials: "include"
      });

      const result = await response.json();

      if (response.ok && result.success) {
          messageElement.textContent = " Product added successfully!";
          messageElement.style.color = "green";

          // Redirect after success
          setTimeout(() => {
              const storeSlug = localStorage.getItem("storeSlug");
              window.location.href = `/store.html?slug=${encodeURIComponent(storeSlug)}`;
          }, 2000);
      } else {
          messageElement.textContent = result.message || " Failed to add product.";
          messageElement.style.color = "red";
      }

  } catch (error) {
      console.error("Error adding product:", error);
      messageElement.textContent = " Error adding product.";
      messageElement.style.color = "red";
  }
});
*/

















const subcategoryFieldsMap = {
  // WOMEN
  "Ethnic Wear":             { size: "womenClothing",  color: true, material: "clothing", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Western Wear":            { size: "womenClothing",  color: true, material: "clothing", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Bottomwear":              { size: "womenClothing",  color: true, material: "clothing", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Winterwear":              { size: "womenClothing",  color: true, material: "clothing", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Innerwear & Loungewear":  { size: "womenClothing",  color: true, material: "clothing", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Footwear":                { size: "womenFootwear",  color: true, material: "footwear", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Bags & Clutches":         { size: "bags",           color: true, material: "footwear", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Jewelry & Accessories":   { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Beauty & Makeup":         { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Eyewear & Watches":       { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },

  // MEN
  "Topwear":                 { size: "menClothing",    color: true, material: "clothing", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Bottomwear":              { size: "menClothing",    color: true, material: "clothing", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Ethnic Wear":             { size: "menClothing",    color: true, material: "clothing", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Winterwear":              { size: "menClothing",    color: true, material: "clothing", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Innerwear & Sleepwear":   { size: "menClothing",    color: true, material: "clothing", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Footwear":                { size: "menFootwear",    color: true, material: "footwear", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Accessories":             { size: "accessories",    color: true, material: "footwear", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Eyewear & Watches":       { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Grooming":                { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Bags & Utility":          { size: "bags",           color: true, material: "footwear", pattern: true, washCare: true, modelStyle: true, brand: true },

  // KIDS
  "Boys Clothing":           { size: "kidsClothing",   color: true, material: "clothing", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Girls Clothing":          { size: "kidsClothing",   color: true, material: "clothing", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Footwear":                { size: "kidsFootwear",   color: true, material: "footwear", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Toys & Games":            { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Remote Toys":             { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Learning & School":       { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Baby Essentials":         { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Winterwear":              { size: "kidsClothing",   color: true, material: "clothing", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Accessories":             { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Festive Wear":            { size: "kidsClothing",   color: true, material: "clothing", pattern: true, washCare: true, modelStyle: true, brand: true },

  // ACCESSORIES
  "Bags & Travel":           { size: "bags",           color: true, material: "footwear", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Unisex Footwear":         { size: "menFootwear",    color: true, material: "footwear", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Mobile Accessories":      { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Gadgets":                 { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Computer Accessories":    { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Home Decor":              { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Kitchenware":             { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Health & Care":           { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Craft & DIY Kits":        { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true },
  "Fashion Accessories":     { size: "accessories",    color: true, material: "accessory", pattern: true, washCare: true, modelStyle: true, brand: true }
};


document.getElementById("nextBtn").addEventListener("click", () => {
  const name = document.getElementById("product-name").value.trim();
  const price = document.getElementById("price").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;
  const subcategory = document.getElementById("subcategory").value;

  if (!name || !price || !description || !category || !subcategory) {
    alert("Please fill all required fields!");
    return;
  }

  localStorage.setItem("basicProductData", JSON.stringify({ name, price, description, category, subcategory }));

  document.getElementById("basic-info-section").style.display = "none";
  document.getElementById("product-details-section").classList.remove("hidden");
  document.getElementById("submit").style.display = "inline-block";
  document.getElementById("nextBtn").style.display = "none";

  updatePreviewField("name", name);
  updatePreviewField("price", price);
  updatePreviewField("description", description);

  loadFields(subcategory);
});

// ==== Field Creators ====
function updatePreviewField(fieldId, value) {
  const el = document.getElementById(`preview-${fieldId}`);
  if (el) el.textContent = value || "-";
}

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

function loadSizeOptions(type) {
  const sizeOptions = {
    womenClothing: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "Petite"],
    menClothing: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    kidsClothing: ["0-3M", "3-6M", "6-12M", "1-2 Yr", "2-3 Yr", "3-4 Yr", "4-5 Yr", "6-7 Yr", "8-9 Yr", "10-11 Yr", "12-13 Yr", "14-15 Yr"],
    womenFootwear: ["3", "4", "5", "6", "7", "8", "9"],
    menFootwear: ["6", "7", "8", "9", "10", "11", "12"],
    kidsFootwear: ["5", "6", "7", "8", "9", "10", "11", "12", "13"]
  };

  const wrapper = document.createElement("div");
  wrapper.classList.add("field-group");
  wrapper.innerHTML = `<label>Available Sizes</label>`;

  const selectedSizesContainer = document.createElement("div");
  selectedSizesContainer.classList.add("size-options");

  const options = sizeOptions[type] || ["Free Size"];
  options.forEach(size => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "size";
    checkbox.value = size;
    checkbox.id = `size-${size}`;

    const label = document.createElement("label");
    label.htmlFor = `size-${size}`;
    label.textContent = size;
    label.style.marginRight = "10px";

    selectedSizesContainer.appendChild(checkbox);
    selectedSizesContainer.appendChild(label);
  });

  wrapper.appendChild(selectedSizesContainer);

  selectedSizesContainer.addEventListener("change", () => {
    const selected = Array.from(selectedSizesContainer.querySelectorAll("input[type='checkbox']:checked"))
      .map(cb => cb.value)
      .join(", ");
    updatePreviewField("size", selected);
  });

  return wrapper;
}

function createColorPalette() {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<label>Color</label>`;
  const colors = [
    "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff",
    "#ffff00", "#ff00ff", "#00ffff", "#808080", "#800000",
    "#808000", "#008000", "#800080", "#008080", "#000080"
  ];
  const colorBox = document.createElement("div");
  colorBox.className = "color-palette";

  colors.forEach(hex => {
    const swatch = document.createElement("span");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = hex;
    swatch.setAttribute("data-color", hex);
    Object.assign(swatch.style, {
      border: "1px solid #999",
      width: "24px",
      height: "24px",
      display: "inline-block",
      cursor: "pointer",
      marginRight: "6px",
      borderRadius: "4px"
    });

    swatch.addEventListener("click", () => {
      document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("selected"));
      swatch.classList.add("selected");
      const input = document.getElementById("color");
      if (input) input.value = hex;
      updatePreviewField("color", hex);
    });

    colorBox.appendChild(swatch);
  });

  const input = document.createElement("input");
  input.type = "text";
  input.id = "color";
  input.name = "color";
  input.placeholder = "Or enter custom color name";
  input.style.marginTop = "8px";
  input.addEventListener("input", () => {
    updatePreviewField("color", input.value);
  });

  wrapper.appendChild(colorBox);
  wrapper.appendChild(input);

  return wrapper;
}

// ==== Dynamic Field Loader ====
function loadFields(subcategory) {
  const container = document.getElementById("dynamic-fields");
  container.innerHTML = "";
  if (!subcategory) return;

  const config = subcategoryFieldsMap[subcategory] || {};

  if (config.size) container.appendChild(loadSizeOptions(config.size));
  if (config.color) container.appendChild(createColorPalette());

  if (config.material === "clothing") {
    const materialField = createDropdown("Material", "material", [
      "Cotton", "Cotton Blend", "Linen", "Silk", "Satin", "Rayon", "Polyester", "Chiffon",
      "Georgette", "Wool", "Viscose", "Velvet", "Denim", "Net", "Nylon", "Organza", "Modal"
    ]);
    container.appendChild(materialField);
    materialField.querySelector("#material").addEventListener("change", e => updatePreviewField("material", e.target.value));
  } else if (config.material === "footwear") {
    const materialField = createDropdown("Material", "material", [
      "Genuine Leather", "Faux Leather", "PU", "Suede", "Canvas", "Rubber", "EVA", "PVC", "Fabric", "Mesh", "Knit", "Synthetic"
    ]);
    container.appendChild(materialField);
    materialField.querySelector("#material").addEventListener("change", e => updatePreviewField("material", e.target.value));
  }

  if (config.pattern) {
    const patternField = createDropdown("Pattern", "pattern", [
      "Solid", "Striped", "Printed", "Checked", "Floral", "Geometric", "Abstract", "Polka Dots", "Paisley", "Bohemian", "Tribal",
      "Animal Print", "Colorblocked", "Bandhani", "Ikat", "Kalamkari", "Block Print", "Tie-Dye", "Ethnic Motif", "Camouflage"
    ]);
    container.appendChild(patternField);
    patternField.querySelector("#pattern").addEventListener("change", e => updatePreviewField("pattern", e.target.value));
  }

  if (config.washCare) {
    const washCareField = createDropdown("Wash Care", "washCare", [
      "Machine Wash Cold", "Machine Wash Warm", "Hand Wash", "Dry Clean Only", "Do Not Bleach",
      "Do Not Tumble Dry", "Tumble Dry Low", "Do Not Wring", "Wash Inside Out", "Iron on Reverse",
      "Do Not Iron", "Do Not Iron on Print", "Delicate Wash"
    ]);
    container.appendChild(washCareField);
    washCareField.querySelector("#washCare").addEventListener("change", e => updatePreviewField("washCare", e.target.value));
  }

  if (config.modelStyle) {
    const modelStyleField = createInput("Style/Model", "modelStyle");
    container.appendChild(modelStyleField);
    modelStyleField.querySelector("#modelStyle").addEventListener("input", e => updatePreviewField("modelStyle", e.target.value));
  }

  const brandField = createInput("Brand (optional)", "brand");
  container.appendChild(brandField);
  brandField.querySelector("#brand").addEventListener("input", e => updatePreviewField("brand", e.target.value));
}






document.getElementById("nextBtn").addEventListener("click", () => {
  const name = document.getElementById("product-name").value.trim();
  const price = document.getElementById("price").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;
  const subcategory = document.getElementById("subcategory").value;

  if (!name || !price || !description || !category || !subcategory) {
    alert("Please fill all required fields!");
    return;
  }

  localStorage.setItem("basicProductData", JSON.stringify({ name, price, description, category, subcategory }));

  document.getElementById("basic-info-section").style.display = "none";
  document.getElementById("product-details-section").classList.remove("hidden");
  document.getElementById("submit").style.display = "inline-block";
  document.getElementById("nextBtn").style.display = "none";

  updatePreviewField("name", name);
  updatePreviewField("price", price);
  updatePreviewField("description", description);

  loadFields(subcategory);
});








/*
// Mock: Replace with actual dynamic field loading
function loadFields(subcategory) {
  const container = document.getElementById("dynamic-fields");
  container.innerHTML = `<p>Loading fields for <strong>${subcategory}</strong>...</p>`;
}

// Mock: Replace with real preview logic
function updatePreviewField(field, value) {
  const element = document.getElementById(`preview-${field}`);
  if (element) {
    if (field === "price") {
      element.textContent = `₹${value}`;
    } else {
      element.textContent = value;
    }
  }
}
*/


document.getElementById('add-product-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const messageElement = document.getElementById('message') || document.createElement('div');
  if (!document.getElementById('message')) {
    messageElement.id = 'message';
    document.body.appendChild(messageElement);
  }

  const formData = new FormData();

  const availableInInput = document.getElementById("availableIn");
  const availableInValue = availableInInput?.value.trim() || "All Over India";

  // Required Fields
  formData.append('name', document.getElementById("product-name").value.trim());
  formData.append('price', document.getElementById("price").value.trim());
  formData.append('description', document.getElementById("description").value.trim());
  formData.append('summary', document.getElementById("summary")?.value.trim() || "");
  formData.append('category', document.getElementById("category").value);
  formData.append('subcategory', document.getElementById("subcategory").value);
  formData.append('availableIn', availableInValue);

  // Dynamic Fields (check if present before appending)
  // Dynamic Fields (exclude size & brand here)
const optionalFields = ["color", "material", "pattern", "washCare", "modelStyle"];
optionalFields.forEach(fieldId => {
  const fieldEl = document.getElementById(fieldId);
  if (fieldEl && fieldEl.value.trim()) {
    formData.append(fieldId, fieldEl.value.trim());
  }
});

// ✅ Size (checkbox)
const sizeCheckboxes = document.querySelectorAll("input[name='size']:checked");
if (sizeCheckboxes.length > 0) {
  const sizes = Array.from(sizeCheckboxes).map(cb => cb.value);
  sizes.forEach(size => formData.append("size", size));
}

// ✅ Brand
const brandInput = document.getElementById("brand");
if (brandInput && brandInput.value.trim()) {
  formData.append("brand", brandInput.value.trim());
}


  // Handle thumbnail image
  const thumbnail = document.getElementById("thumbnail-image").files[0];
  if (thumbnail) {
    formData.append('thumbnailImage', thumbnail);
  } else {
    messageElement.textContent = "Thumbnail image is required.";
    messageElement.style.color = "red";
    return;
  }

  // Extra Images
  ['extraImage1', 'extraImage2', 'extraImage3', 'extraImage4'].forEach(id => {
    const file = document.getElementById(id)?.files[0];
    if (file) {
      formData.append('extraImages', file);
    }
  });

  // Extra Videos
  ['extraVideo1', 'extraVideo2', 'extraVideo3'].forEach(id => {
    const file = document.getElementById(id)?.files[0];
    if (file) {
      formData.append('extraVideos', file);
    }
  });

  // Store ID from localStorage
  const storeId = localStorage.getItem("storeId");
  if (storeId) formData.append("storeId", storeId);

  // Log FormData entries before sending
  console.log("Uploading FormData...");
  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  try {
    const response = await fetch("/api/products/add", {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    const result = await response.json();

    if (response.ok && result.success) {
      messageElement.textContent = "Product added successfully!";
      messageElement.style.color = "green";

      setTimeout(() => {
        const storeSlug = localStorage.getItem("storeSlug");
        window.location.href = `/store.html?slug=${encodeURIComponent(storeSlug)}`;
      }, 2000);
    } else {
      messageElement.textContent = result.message || "Failed to add product.";
      messageElement.style.color = "red";
    }

  } catch (error) {
    console.error("Error adding product:", error);
    messageElement.textContent = "Error adding product.";
    messageElement.style.color = "red";
  }
});
