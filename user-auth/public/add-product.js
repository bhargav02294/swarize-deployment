// ✅ NEW categoriesData with 4 Main Categories and 10 Subcategories Each



const categoriesData = [ { name: "Saree", subcategories: [ "Silk Sarees", "Cotton Sarees", "Chiffon Sarees", "Georgette Sarees", "Designer Sarees", "Party Wear Sarees", "Casual Sarees", "Wedding Sarees", "Printed Sarees", "Embroidered Sarees" ] },
 { name: "Dress", subcategories: [ "Kurtis", "Long Kurtis", "Short Kurtis", "Anarkali Dresses", "A-Line Dresses", "Straight Fit Dresses", "Palazzo Kurtis", "Layered Kurtis", "Lehengas", "Gowns", "Salwar Suits", "Tunics", "Dupattas & Shawls" ] } ];



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
// ==== Additional Preview Elements ====

// Common fields
const previewProductCode = document.createElement("p");
const previewMaterial = document.createElement("p");
const previewColor = document.createElement("p");
const previewPattern = document.createElement("p");
const previewWashCare = document.createElement("p");
const previewOccasion = document.createElement("p");

// Saree-specific
const previewSareeSize = document.createElement("p");
const previewBlouseSize = document.createElement("p");

// Dress-specific
const previewAvailableSize = document.createElement("p");

// Subcategory display (common)
const previewCategory = document.createElement("p");
const previewSubcategory = document.createElement("p");
const previewTags = document.createElement("p");

// ==== Append to preview container dynamically ====
const previewContainer = document.querySelector(".preview-container");
previewContainer.append(
  previewCategory,
  previewSubcategory,
  previewTags,
  previewProductCode,
  previewMaterial,
  previewColor,
  previewPattern,
  previewWashCare,
  previewOccasion,
  previewSareeSize,
  previewBlouseSize,
  previewAvailableSize
);

// ==== Function to update preview dynamically ====
function updatePreviewField(fieldId, value) {
  switch (fieldId) {
    case "category":
      previewCategory.textContent = `Category: ${value}`;
      break;
    case "subcategory":
      previewSubcategory.textContent = `Subcategory: ${value}`;
      break;
    case "productCode":
      previewProductCode.textContent = `Product Code: ${value}`;
      break;
    case "material":
      previewMaterial.textContent = `Material/Fabric: ${value}`;
      break;
    case "color":
      previewColor.textContent = `Color: ${value}`;
      break;
    case "pattern":
      previewPattern.textContent = `Pattern: ${value}`;
      break;
    case "washCare":
      previewWashCare.textContent = `Wash Care: ${value}`;
      break;
    case "occasion":
      previewOccasion.textContent = `Occasion: ${value}`;
      break;
    case "sareeSize":
      previewSareeSize.textContent = `Saree Size: ${value} meters`;
      break;
    case "blouseSize":
      previewBlouseSize.textContent = `Blouse Size: ${value} meters`;
      break;
    case "availableSize":
      previewAvailableSize.textContent = `Available Sizes: ${value}`;
      break;
    case "tags":
      previewTags.textContent = `Tags: ${value}`;
      break;
    default:
      break;
  }
}




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



















// ==== Field Creators ====
function createPreviewElement(label) {
  const p = document.createElement("p");
  p.textContent = `${label}: -`;
  previewContainer.appendChild(p);
  return p;
}

function updatePreviewField(fieldId, value) {
  if (previewFields[fieldId]) {
    previewFields[fieldId].textContent = `${fieldId.replace(/([A-Z])/g, ' $1')}: ${value || "-"}`;
  }
}

// ===== Field Creators =====
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







function createColorPicker() {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<label>Color</label>`;
  
  const colors = [
    "#000000","#ffffff","#ff0000","#00ff00","#0000ff",
    "#ffff00","#ff00ff","#00ffff","#808080","#800000",
    "#808000","#008000","#800080","#008080","#000080"
  ];
  
  const colorBox = document.createElement("div");
  colorBox.className = "color-palette";
  
  colors.forEach(hex => {
    const swatch = document.createElement("span");
    swatch.style.backgroundColor = hex;
    Object.assign(swatch.style, {width:"24px", height:"24px", display:"inline-block", cursor:"pointer", marginRight:"6px", border:"1px solid #999", borderRadius:"4px"});
    swatch.addEventListener("click", () => {
      document.querySelectorAll(".color-swatch").forEach(s=>s.classList.remove("selected"));
      swatch.classList.add("selected");
      colorInput.value = hex;
      updatePreviewField("color", hex);
    });
    swatch.className = "color-swatch";
    colorBox.appendChild(swatch);
  });
  
  const colorInput = document.createElement("input");
  colorInput.type = "text";
  colorInput.id = "color";
  colorInput.placeholder = "Or enter custom color";
  colorInput.addEventListener("input", ()=>updatePreviewField("color", colorInput.value));
  
  wrapper.appendChild(colorBox);
  wrapper.appendChild(colorInput);
  return wrapper;
}



// ==== Dynamic Field Loader ====
// ===== Load Dynamic Fields Based on Subcategory =====
function loadFields(subcategory) {
  const container = document.getElementById("dynamic-fields");
  container.innerHTML = "";
  const category = categorySelect.value;

  // Product Code
  const productCodeField = createInput("Product Code", "productCode");
  productCodeField.querySelector("input").addEventListener("input", e=>updatePreviewField("productCode", e.target.value));
  container.appendChild(productCodeField);

  // Material
  const materialOptions = [
    "Cotton", "Cotton Blend", "Linen", "Silk", "Satin", "Rayon", "Polyester", "Chiffon",
    "Georgette", "Wool", "Viscose", "Velvet", "Denim", "Net", "Nylon", "Organza", "Modal"
  ];
  const materialField = createDropdown("Material/Fabric", "material", materialOptions);
  materialField.querySelector("select").addEventListener("change", e=>updatePreviewField("material", e.target.value));
  container.appendChild(materialField);

  // Color
  container.appendChild(createColorPicker());

  // Pattern
  const patternOptions = [
    "Solid", "Striped", "Printed", "Checked", "Floral", "Geometric", "Abstract", "Polka Dots",
    "Paisley", "Bohemian", "Tribal", "Animal Print", "Colorblocked", "Bandhani", "Ikat",
    "Kalamkari", "Block Print", "Tie-Dye", "Ethnic Motif", "Camouflage"
  ];
  const patternField = createDropdown("Pattern", "pattern", patternOptions);
  patternField.querySelector("select").addEventListener("change", e=>updatePreviewField("pattern", e.target.value));
  container.appendChild(patternField);

  // Occasion
  const occasionOptions = ["Casual", "Party", "Wedding", "Festive", "Office", "Daily Wear"];
  const occasionField = createDropdown("Occasion", "occasion", occasionOptions);
  occasionField.querySelector("select").addEventListener("change", e=>updatePreviewField("occasion", e.target.value));
  container.appendChild(occasionField);

  // Wash Care
  const washCareOptions = [
    "Machine Wash Cold", "Machine Wash Warm", "Hand Wash", "Dry Clean Only", "Do Not Bleach",
    "Do Not Tumble Dry", "Tumble Dry Low", "Do Not Wring", "Wash Inside Out", "Iron on Reverse",
    "Do Not Iron", "Do Not Iron on Print", "Delicate Wash"
  ];
  const washCareField = createDropdown("Wash Care", "washCare", washCareOptions);
  washCareField.querySelector("select").addEventListener("change", e=>updatePreviewField("washCare", e.target.value));
  container.appendChild(washCareField);

  // Category-specific fields
  if(category==="Saree") {
    const sareeSizeField = createInput("Saree Size (meters)", "sareeSize");
    sareeSizeField.querySelector("input").addEventListener("input", e=>updatePreviewField("sareeSize", e.target.value));
    container.appendChild(sareeSizeField);

    const blouseSizeField = createInput("Blouse Size (meters)", "blouseSize");
    blouseSizeField.querySelector("input").addEventListener("input", e=>updatePreviewField("blouseSize", e.target.value));
    container.appendChild(blouseSizeField);
  } else if(category==="Dress") {
    const availableSizes = ["XS","S","M","L","XL","XXL","3XL","4XL"];
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<label>Available Sizes</label>`;
    const sizeContainer = document.createElement("div");
    availableSizes.forEach(size=>{
      const cb = document.createElement("input");
      cb.type="checkbox"; cb.value=size; cb.id=`size-${size}`;
      const lbl = document.createElement("label");
      lbl.htmlFor = `size-${size}`; lbl.textContent=size; lbl.style.marginRight="10px";
      sizeContainer.appendChild(cb); sizeContainer.appendChild(lbl);
      cb.addEventListener("change", ()=>{
        const selected = Array.from(sizeContainer.querySelectorAll("input[type='checkbox']:checked")).map(c=>c.value).join(", ");
        updatePreviewField("availableSize", selected);
      });
    });
    wrapper.appendChild(sizeContainer);
    container.appendChild(wrapper);
  }
}






// ===== Next Button =====
document.getElementById("nextBtn").addEventListener("click", ()=>{
  const name = document.getElementById("product-name").value.trim();
  const price = document.getElementById("price").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;
  const subcategory = document.getElementById("subcategory").value;

  if(!name || !price || !description || !category || !subcategory){
    alert("Please fill all required fields!"); return;
  }

  localStorage.setItem("basicProductData", JSON.stringify({name, price, description, category, subcategory}));

  document.getElementById("basic-info-section").style.display="none";
  document.getElementById("product-details-section").classList.remove("hidden");
  document.getElementById("submit").style.display="inline-block";
  document.getElementById("nextBtn").style.display="none";

  updatePreviewField("name", name);
  updatePreviewField("price", price);
  updatePreviewField("description", description);
  updatePreviewField("category", category);
  updatePreviewField("subcategory", subcategory);

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
const productCodeInput = document.getElementById("productCode");
if (productCodeInput && productCodeInput.value.trim()) {
  formData.append("productCode", productCodeInput.value.trim());
}

// ✅ Optional fields
const optionalFields = ["color", "material", "pattern", "washCare", "modelStyle", "occasion", "sareeSize", "blouseSize"];
optionalFields.forEach(fieldId => {
  const fieldEl = document.getElementById(fieldId);
  if (fieldEl && fieldEl.value.trim()) {
    formData.append(fieldId, fieldEl.value.trim());
  }
});

// ✅ Size
// For Dress: checkbox multi-select (availableSizes)
// For Saree: sareeSize & blouseSize handled above
const sizeCheckboxes = document.querySelectorAll("input[name='availableSizes']:checked");
if (sizeCheckboxes.length > 0) {
  const sizes = Array.from(sizeCheckboxes).map(cb => cb.value);
  sizes.forEach(size => formData.append("availableSizes", size));
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
