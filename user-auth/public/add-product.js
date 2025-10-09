// ✅ CategoriesData for only Sarees and Dresses
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
const previewColor = document.createElement("p");
const previewMaterial = document.createElement("p");
const previewProductCode = document.createElement("p");

// Add these elements to the preview container dynamically
const previewContainer = document.querySelector(".preview-container");
previewContainer.append(  previewCategory, previewSubcategory, previewColor, previewMaterial, previewProductCode
);

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














// ==== Final Subcategory Fields for Saree and Dress ====
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
  updatePreviewField("category", category);
  updatePreviewField("subcategory", subcategory);

  loadFields(category); // ✅ Use category
});

// ==== Dynamic Field Loader ====
function loadFields(subcategory) {
  const container = document.getElementById("dynamic-fields");
  container.innerHTML = "";
  if (!subcategory) return;

  const config = subcategoryFieldsMap[subcategory];

  // Product Code
  if (config.productCode) {
    const codeField = createInput("Product Code", "productCode", "Enter product code");
    container.appendChild(codeField);
    codeField.querySelector("#productCode").addEventListener("input", e => updatePreviewField("productCode", e.target.value));
  }

  // Material / Fabric
  if (config.material) {
    const materialField = createDropdown("Material / Fabric", "material", [
      "Cotton", "Cotton Blend", "Silk", "Satin", "Rayon", "Polyester", "Chiffon", "Georgette",
      "Wool", "Velvet", "Linen", "Net", "Nylon", "Organza", "Modal"
    ]);
    container.appendChild(materialField);
    materialField.querySelector("#material").addEventListener("change", e => updatePreviewField("material", e.target.value));
  }

  // Color
  if (config.color) {
    container.appendChild(createColorPalette());
  }

  // Pattern
  if (config.pattern) {
    const patternField = createDropdown("Pattern", "pattern", [
      "Solid", "Striped", "Printed", "Checked", "Floral", "Geometric", "Abstract", "Polka Dots",
      "Paisley", "Bohemian", "Tribal", "Animal Print", "Colorblocked", "Bandhani", "Ikat",
      "Kalamkari", "Block Print", "Tie-Dye", "Ethnic Motif", "Camouflage"
    ]);
    container.appendChild(patternField);
    patternField.querySelector("#pattern").addEventListener("change", e => updatePreviewField("pattern", e.target.value));
  }

  // Saree Size & Blouse Size (only for Saree)
  if (config.sareeSize) {
    const sareeSizeField = createInput("Saree Size (meters)", "sareeSize", "e.g., 5.5 meters");
    container.appendChild(sareeSizeField);
    sareeSizeField.querySelector("#sareeSize").addEventListener("input", e => updatePreviewField("sareeSize", e.target.value));
  }

  if (config.blouseSize) {
    const blouseSizeField = createInput("Blouse Size (meters)", "blouseSize", "e.g., 0.8 meters");
    container.appendChild(blouseSizeField);
    blouseSizeField.querySelector("#blouseSize").addEventListener("input", e => updatePreviewField("blouseSize", e.target.value));
  }

  // Available Size (only for Dress)
  if (config.availableSize) {
    container.appendChild(loadSizeOptions("womenClothing")); // XS, S, M, L, XL, XXL, 3XL, 4XL
  }

  // Occasion
  if (config.occasion) {
    const occasionField = createDropdown("Occasion", "occasion", [
      "Casual", "Party", "Wedding", "Festive", "Office", "Formal", "Daily Wear", "Cocktail", "Ethnic", "Bridal"
    ]);
    container.appendChild(occasionField);
    occasionField.querySelector("#occasion").addEventListener("change", e => updatePreviewField("occasion", e.target.value));
  }

  // Wash Care
  if (config.washCare) {
    const washCareField = createDropdown("Wash Care", "washCare", [
      "Machine Wash Cold", "Machine Wash Warm", "Hand Wash", "Dry Clean Only", "Do Not Bleach",
      "Do Not Tumble Dry", "Tumble Dry Low", "Do Not Wring", "Wash Inside Out", "Iron on Reverse",
      "Do Not Iron", "Do Not Iron on Print", "Delicate Wash"
    ]);
    container.appendChild(washCareField);
    washCareField.querySelector("#washCare").addEventListener("change", e => updatePreviewField("washCare", e.target.value));
  }
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
// Dynamic Fields (exclude size & productCode here)
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

// ✅ Product Code (replacing Brand)
const productCodeInput = document.getElementById("productCode");
if (productCodeInput && productCodeInput.value.trim()) {
  formData.append("productCode", productCodeInput.value.trim());
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
