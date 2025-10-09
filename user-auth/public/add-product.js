// ✅ NEW categoriesData with 4 Main Categories and 10 Subcategories Each
// ✅ Category and Subcategory Data
const categoriesData = [
  {
    name: "Sarees",
    subcategories: [
      "Silk Saree", "Cotton Saree", "Georgette Saree", "Chiffon Saree", "Crepe Saree",
      "Linen Saree", "Banarasi Saree", "Kanjivaram Saree", "Paithani Saree", "Organza Saree",
      "Tissue Saree", "Satin Saree", "Net Saree", "Printed Saree", "Embroidered Saree"
    ],
  },
  {
    name: "Dresses",
    subcategories: [
      "Kurti", "Lehenga", "Anarkali Dress", "Gown", "Sharara", "Salwar Suit",
      "Palazzo Set", "Skirt Set", "Indo Western Dress", "Co-ord Set", "Churidar Set"
    ],
  },
];


// ✅ Load Categories and Subcategories
document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category");
  const subcategorySelect = document.getElementById("subcategory");

  categoriesData.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.name;
    opt.textContent = cat.name;
    categorySelect.appendChild(opt);
  });

  categorySelect.addEventListener("change", e => {
    subcategorySelect.innerHTML = '<option value="" disabled selected>Select a subcategory</option>';
    const selectedCategory = categoriesData.find(c => c.name === e.target.value);
    if (selectedCategory) {
      selectedCategory.subcategories.forEach(sub => {
        const opt = document.createElement("option");
        opt.value = sub;
        opt.textContent = sub;
        subcategorySelect.appendChild(opt);
      });
    }
  });
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









const subcategoryFieldsMap = {
  Sarees: {
    productCode: true,
    material: true,
    color: true,
    pattern: true,
    sareeSize: true,
    blouseSize: true,
    occasion: true,
    washCare: true,
  },
  Dresses: {
    productCode: true,
    material: true,
    color: true,
    pattern: true,
    availableSize: true,
    occasion: true,
    washCare: true,
  },
};








// Dynamic Fields Loader
// ================================
function loadFields(categoryName) {
  const container = document.getElementById("dynamic-fields");
  container.innerHTML = ""; // clear previous fields

  const fieldSet = subcategoryFieldsMap[categoryName];
  if (!fieldSet) return;

  // Product Code
  if (fieldSet.productCode) {
    const label = document.createElement("label");
    label.textContent = "Product Code:";
    const input = document.createElement("input");
    input.type = "text";
    input.id = "productCode";
    container.append(label, input);
  }

  // Material / Fabric
  if (fieldSet.material) {
    const label = document.createElement("label");
    label.textContent = "Material / Fabric:";
    const select = document.createElement("select");
    select.id = "material";
    [
      "", "Cotton", "Silk", "Georgette", "Chiffon", "Crepe", "Linen", "Net", "Satin", "Velvet", "Organza", "Rayon", "Tissue", "Wool", "Polyester", "Blend"
    ].forEach(type => {
      const opt = document.createElement("option");
      opt.value = type;
      opt.textContent = type || "Select Material";
      select.appendChild(opt);
    });
    container.append(label, select);
  }

  // Color
  if (fieldSet.color) {
    const label = document.createElement("label");
    label.textContent = "Color:";
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.id = "colorPicker";
    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.id = "color";
    textInput.placeholder = "Enter color name";
    container.append(label, colorInput, textInput);
  }

  // Pattern
  if (fieldSet.pattern) {
    const label = document.createElement("label");
    label.textContent = "Pattern:";
    const select = document.createElement("select");
    select.id = "pattern";
    [
      "", "Plain", "Printed", "Embroidered", "Zari Work", "Thread Work", "Mirror Work",
      "Digital Print", "Handloom", "Floral", "Striped", "Checks", "Tie-Dye"
    ].forEach(type => {
      const opt = document.createElement("option");
      opt.value = type;
      opt.textContent = type || "Select Pattern";
      select.appendChild(opt);
    });
    container.append(label, select);
  }

  // Saree Size
  if (fieldSet.sareeSize) {
    const label = document.createElement("label");
    label.textContent = "Saree Size (in meters):";
    const input = document.createElement("input");
    input.type = "number";
    input.id = "sareeSize";
    input.placeholder = "Enter saree length";
    container.append(label, input);
  }

  // Blouse Size
  if (fieldSet.blouseSize) {
    const label = document.createElement("label");
    label.textContent = "Blouse Size (in meters):";
    const input = document.createElement("input");
    input.type = "number";
    input.id = "blouseSize";
    input.placeholder = "Enter blouse length";
    container.append(label, input);
  }

  // Available Sizes (for Dresses)
  if (fieldSet.availableSize) {
    const label = document.createElement("label");
    label.textContent = "Available Sizes:";
    container.appendChild(label);

    const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];
    sizes.forEach(size => {
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = `size-${size}`;
      cb.name = "availableSizes";
      cb.value = size;
      const lbl = document.createElement("label");
      lbl.setAttribute("for", cb.id);
      lbl.textContent = size;
      container.append(cb, lbl);
    });
  }

  // Occasion
  if (fieldSet.occasion) {
    const label = document.createElement("label");
    label.textContent = "Occasion:";
    const select = document.createElement("select");
    select.id = "occasion";
    [
      "", "Casual", "Festive", "Wedding", "Party", "Traditional", "Office Wear", "Daily Wear"
    ].forEach(type => {
      const opt = document.createElement("option");
      opt.value = type;
      opt.textContent = type || "Select Occasion";
      select.appendChild(opt);
    });
    container.append(label, select);
  }

  // Wash Care
  if (fieldSet.washCare) {
    const label = document.createElement("label");
    label.textContent = "Wash Care:";
    const select = document.createElement("select");
    select.id = "washCare";
    [
      "", "Dry Clean Only", "Hand Wash", "Machine Wash", "Cold Wash", "Do Not Bleach"
    ].forEach(type => {
      const opt = document.createElement("option");
      opt.value = type;
      opt.textContent = type || "Select Wash Care";
      select.appendChild(opt);
    });
    container.append(label, select);
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
 // ✅ Product Code
  const productCodeInput = document.getElementById("productCode");
  if (productCodeInput && productCodeInput.value.trim()) {
    formData.append("productCode", productCodeInput.value.trim());
  }

  // ✅ Optional Fields
  const optionalFields = ["color", "material", "pattern", "washCare", "occasion", "sareeSize", "blouseSize"];
  optionalFields.forEach(fieldId => {
    const fieldEl = document.getElementById(fieldId);
    if (fieldEl && fieldEl.value.trim()) {
      formData.append(fieldId, fieldEl.value.trim());
    }
  });

  // ✅ Size Checkboxes
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
