// ================== Categories Data ==================
const categoriesData = [
  {
    name: "Saree",
    subcategories: [
      "Silk Sarees",
      "Cotton Sarees",
      "Chiffon Sarees",
      "Georgette Sarees",
      "Designer Sarees",
      "Party Wear Sarees",
      "Casual Sarees",
      "Wedding Sarees",
      "Printed Sarees",
      "Embroidered Sarees"
    ]
  },
  {
    name: "Dress",
    subcategories: [
      "Kurtis",
      "Long Kurtis",
      "Short Kurtis",
      "Anarkali Dresses",
      "A-Line Dresses",
      "Straight Fit Dresses",
      "Palazzo Kurtis",
      "Layered Kurtis",
      "Lehengas",
      "Gowns",
      "Salwar Suits",
      "Tunics",
      "Dupattas & Shawls"
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

  // Update live preview
  previewCategory.textContent = `Category: ${selectedCategory}`;
  previewSubcategory.textContent = "";
});

// ================== Live Preview Elements ==================
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
const previewContainer = document.querySelector(".preview-container");
const previewCategory = document.createElement("p");
const previewSubcategory = document.createElement("p");
const previewColor = document.createElement("p");
const previewMaterial = document.createElement("p");
const previewProductCode = document.createElement("p");

previewContainer.append(previewCategory, previewSubcategory, previewColor, previewMaterial, previewProductCode);

// ================== Helper Functions ==================
function updatePreviewField(field, value) {
  const element = document.getElementById(`preview-${field}`) || {
    textContent: "",
  };
  if (field === "price") {
    element.textContent = `₹${value}`;
  } else {
    element.textContent = value;
  }
}

// Create Input Field
function createInput(labelText, id, placeholder) {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = labelText;
  label.setAttribute("for", id);
  const input = document.createElement("input");
  input.type = "text";
  input.id = id;
  input.placeholder = placeholder;
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  return wrapper;
}

// Create Dropdown Field
function createDropdown(labelText, id, options) {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = labelText;
  label.setAttribute("for", id);
  const select = document.createElement("select");
  select.id = id;
  select.innerHTML = '<option value="" disabled selected>Select</option>';
  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
  wrapper.appendChild(label);
  wrapper.appendChild(select);
  return wrapper;
}

// Color Palette
function createColorPalette() {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <label for="color">Color</label>
    <input type="text" id="color" placeholder="Enter color">`;
  return wrapper;
}

// Size Options
function loadSizeOptions(type) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <label>Available Sizes:</label>
    <label><input type="checkbox" name="size" value="XS"> XS</label>
    <label><input type="checkbox" name="size" value="S"> S</label>
    <label><input type="checkbox" name="size" value="M"> M</label>
    <label><input type="checkbox" name="size" value="L"> L</label>
    <label><input type="checkbox" name="size" value="XL"> XL</label>
    <label><input type="checkbox" name="size" value="XXL"> XXL</label>`;
  return wrapper;
}

// ================== Image & Video Preview ==================
function handleImagePreview(fileInput, previewElement) {
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => previewElement.src = e.target.result;
    reader.readAsDataURL(file);
  } else previewElement.src = "";
}

document.getElementById("thumbnail-image").addEventListener("change", e => handleImagePreview(e.target, previewThumbnail));
['extraImage1','extraImage2','extraImage3','extraImage4'].forEach((id, idx) => {
  document.getElementById(id).addEventListener("change", e => handleImagePreview(e.target, previewExtraImages[idx]));
});
['extraVideo1','extraVideo2','extraVideo3'].forEach((id, idx) => {
  document.getElementById(id).addEventListener("change", e => {
    const file = e.target.files[0];
    if(file) {
      const videoElement = document.getElementById(`preview-extra-video-${idx+1}`);
      videoElement.src = URL.createObjectURL(file);
      videoElement.style.display = 'block';
    }
  });
});

// ================== Subcategory Fields ==================
const subcategoryFieldsMap = {
  "Saree": {
    productCode: true,
    material: true,
    color: true,
    pattern: true,
    sareeSize: true,
    blouseSize: true,
    occasion: true,
    washCare: true
  },
  "Dress": {
    productCode: true,
    material: true,
    color: true,
    pattern: true,
    availableSize: true,
    occasion: true,
    washCare: true
  }
};

// Load dynamic fields
function loadFields(category) {
  const container = document.getElementById("dynamic-fields");
  container.innerHTML = "";
  const config = subcategoryFieldsMap[category];
  if(!config) return;

  // Product Code
  if(config.productCode) {
    const codeField = createInput("Product Code", "productCode", "Enter product code");
    container.appendChild(codeField);
    codeField.querySelector("#productCode").addEventListener("input", e => updatePreviewField("productCode", e.target.value));
  }

  // Material
  if(config.material) {
    const materialField = createDropdown("Material / Fabric","material",[
      "Cotton","Cotton Blend","Silk","Satin","Rayon","Polyester","Chiffon","Georgette",
      "Wool","Velvet","Linen","Net","Nylon","Organza","Modal"
    ]);
    container.appendChild(materialField);
    materialField.querySelector("#material").addEventListener("change", e => updatePreviewField("material", e.target.value));
  }

  // Color
  if(config.color) container.appendChild(createColorPalette());

  // Pattern
  if(config.pattern) {
    const patternField = createDropdown("Pattern","pattern",[
      "Solid","Striped","Printed","Checked","Floral","Geometric","Abstract","Polka Dots",
      "Paisley","Bohemian","Tribal","Animal Print","Colorblocked","Bandhani","Ikat",
      "Kalamkari","Block Print","Tie-Dye","Ethnic Motif","Camouflage"
    ]);
    container.appendChild(patternField);
    patternField.querySelector("#pattern").addEventListener("change", e => updatePreviewField("pattern", e.target.value));
  }

  // Saree Size
  if(config.sareeSize) {
    const field = createInput("Saree Size (meters)","sareeSize","e.g., 5.5 meters");
    container.appendChild(field);
    field.querySelector("#sareeSize").addEventListener("input", e => updatePreviewField("sareeSize", e.target.value));
  }

  // Blouse Size
  if(config.blouseSize) {
    const field = createInput("Blouse Size (meters)","blouseSize","e.g., 0.8 meters");
    container.appendChild(field);
    field.querySelector("#blouseSize").addEventListener("input", e => updatePreviewField("blouseSize", e.target.value));
  }

  // Available Size for Dress
  if(config.availableSize) container.appendChild(loadSizeOptions());

  // Occasion
  if(config.occasion) {
    const occField = createDropdown("Occasion","occasion",[
      "Casual","Party","Wedding","Festive","Office","Formal","Daily Wear","Cocktail","Ethnic","Bridal"
    ]);
    container.appendChild(occField);
    occField.querySelector("#occasion").addEventListener("change", e => updatePreviewField("occasion", e.target.value));
  }

  // Wash Care
  if(config.washCare) {
    const washField = createDropdown("Wash Care","washCare",[
      "Machine Wash Cold","Machine Wash Warm","Hand Wash","Dry Clean Only","Do Not Bleach",
      "Do Not Tumble Dry","Tumble Dry Low","Do Not Wring","Wash Inside Out","Iron on Reverse",
      "Do Not Iron","Do Not Iron on Print","Delicate Wash"
    ]);
    container.appendChild(washField);
    washField.querySelector("#washCare").addEventListener("change", e => updatePreviewField("washCare", e.target.value));
  }
}

// ================== Next Button ==================
document.getElementById("nextBtn").addEventListener("click", () => {
  const name = document.getElementById("product-name").value.trim();
  const price = document.getElementById("price").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;

  if(!name || !price || !description || !category) {
    alert("Please fill all required fields!");
    return;
  }

  localStorage.setItem("basicProductData", JSON.stringify({ name, price, description, category }));

  document.getElementById("basic-info-section").style.display = "none";
  document.getElementById("product-details-section").classList.remove("hidden");
  document.getElementById("submit").style.display = "inline-block";
  document.getElementById("nextBtn").style.display = "none";

  updatePreviewField("name", name);
  updatePreviewField("price", price);
  updatePreviewField("description", description);
  updatePreviewField("category", category);

  loadFields(category);
});

// ================== Form Submission ==================
document.getElementById('add-product-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const messageElement = document.getElementById('message') || document.createElement('div');
  if(!document.getElementById('message')) {
    messageElement.id = 'message';
    document.body.appendChild(messageElement);
  }

  const formData = new FormData();

  const availableInInput = document.getElementById("availableIn");
  formData.append('availableIn', availableInInput?.value.trim() || "All Over India");

  // Required Fields
  ['product-name','price','description','summary','category','subcategory'].forEach(id => {
    const el = document.getElementById(id);
    if(el) formData.append(id.replace('-',''), el.value.trim());
  });

  // Dynamic Fields
  const dynamicIds = ["color","material","pattern","washCare","productCode"];
  dynamicIds.forEach(id => {
    const el = document.getElementById(id);
    if(el && el.value.trim()) formData.append(id, el.value.trim());
  });

  // Sizes
  document.querySelectorAll("input[name='size']:checked").forEach(cb => formData.append("size", cb.value));

  // Thumbnail
  const thumbnail = document.getElementById("thumbnail-image").files[0];
  if(!thumbnail) { messageElement.textContent = "Thumbnail is required"; return; }
  formData.append("thumbnailImage", thumbnail);

  // Extra Images
  ['extraImage1','extraImage2','extraImage3','extraImage4'].forEach(id => {
    const file = document.getElementById(id)?.files[0];
    if(file) formData.append("extraImages", file);
  });

  // Extra Videos
  ['extraVideo1','extraVideo2','extraVideo3'].forEach(id => {
    const file = document.getElementById(id)?.files[0];
    if(file) formData.append("extraVideos", file);
  });

  // Store ID
  const storeId = localStorage.getItem("storeId");
  if(storeId) formData.append("storeId", storeId);

  // Upload
  try {
    const response = await fetch("/api/products/add", { method: "POST", body: formData, credentials: "include" });
    const result = await response.json();
    if(response.ok && result.success) {
      messageElement.textContent = "Product added successfully!";
      messageElement.style.color = "green";
      setTimeout(() => {
        const slug = localStorage.getItem("storeSlug");
        window.location.href = `/store.html?slug=${encodeURIComponent(slug)}`;
      }, 2000);
    } else {
      messageElement.textContent = result.message || "Failed to add product.";
      messageElement.style.color = "red";
    }
  } catch(err) {
    console.error(err);
    messageElement.textContent = "Error adding product.";
    messageElement.style.color = "red";
  }
});
