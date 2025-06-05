// ✅ Enhanced Product Details Form with Subcategory-Based Fields

const data = JSON.parse(localStorage.getItem("basicProductData")) || {};
const fieldContainer = document.getElementById("dynamic-fields");

function createInput(label, id, placeholder = "") {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <label for="${id}">${label}</label>
    <input type="text" id="${id}" name="${id}" placeholder="${placeholder}" />
  `;
  return wrapper;
}

function createDropdown(label, id, options) {
  const wrapper = document.createElement("div");
  const selectOptions = options.map(opt => `<option value="${opt}">${opt}</option>`).join("");
  wrapper.innerHTML = `
    <label for="${id}">${label}</label>
    <select id="${id}" name="${id}">
      <option value="" disabled selected>Select ${label}</option>
      ${selectOptions}
    </select>
  `;
  return wrapper;
}

function createColorPalette() {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<label>Color</label>`;
  const colors = [
    "#000", "#f00", "#0f0", "#00f", "#ff0", "#f0f", "#0ff", "#ccc",
    "#800000", "#FFA500", "#808000", "#800080", "#008080", "#FFD700", "#A52A2A", "#708090"
  ];
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
  const sizeWrapper = document.createElement("div");
  let sizes = [];
  if (["Topwear", "Bottomwear", "Ethnic Wear", "Winterwear", "Western Wear"].includes(subcategory)) {
    sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
  } else if (["Footwear", "Unisex Footwear"].includes(subcategory)) {
    sizes = ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"];
  } else if (["Boys Clothing", "Girls Clothing", "Festive Wear"].includes(subcategory)) {
    sizes = ["0-1 Yr", "1-2 Yr", "2-3 Yr", "3-4 Yr", "4-5 Yr", "6-7 Yr", "8-9 Yr", "10-12 Yr"];
  } else {
    return createInput("Size", "size", "Enter size if applicable");
  }
  return createDropdown("Size", "size", sizes);
}

function loadFields() {
  const subcategory = data.subcategory || "";
  fieldContainer.innerHTML = "";

  fieldContainer.appendChild(loadSizeOptions(subcategory));
  fieldContainer.appendChild(createColorPalette());

  const materialOptions = ["Cotton", "Denim", "Rayon", "Polyester", "Wool", "Silk", "Linen"];
  const patternOptions = ["Solid", "Striped", "Checked", "Floral", "Printed", "Embroidered"];
  const washOptions = ["Machine Wash", "Hand Wash", "Dry Clean"];

  fieldContainer.appendChild(createDropdown("Material", "material", materialOptions));
  fieldContainer.appendChild(createDropdown("Pattern", "pattern", patternOptions));
  fieldContainer.appendChild(createDropdown("Wash Care", "washCare", washOptions));

  fieldContainer.appendChild(createInput("Brand (optional)", "brand"));
  fieldContainer.appendChild(createInput("Style/Model", "modelStyle"));
}

loadFields();

document.getElementById("details-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const details = {
    ...data,
    size: document.getElementById("size")?.value || "",
    color: document.getElementById("color").value,
    material: document.getElementById("material").value,
    pattern: document.getElementById("pattern").value,
    washCare: document.getElementById("washCare").value,
    brand: document.getElementById("brand").value,
    modelStyle: document.getElementById("modelStyle").value
  };

  console.log("Final Product Data:", details);
  alert("Product Added (console logged for now)");
});




// ========== LIVE PREVIEW SETUP ==========

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

const previewCategory = document.createElement("p");
const previewSubcategory = document.createElement("p");
const previewTags = document.createElement("p");
const previewSize = document.createElement("p");
const previewColor = document.createElement("p");
const previewMaterial = document.createElement("p");
const previewModelStyle = document.createElement("p");

const previewContainer = document.querySelector(".preview-container");
previewContainer.append(previewCategory, previewSubcategory, previewTags, previewSize, previewColor, previewMaterial, previewModelStyle);

// Live text preview handlers
document.getElementById("product-name")?.addEventListener("input", (e) => {
  previewName.textContent = e.target.value || "Product Name";
});

document.getElementById("price")?.addEventListener("input", (e) => {
  previewPrice.textContent = e.target.value ? `₹${e.target.value}` : "₹0.00";
});

document.getElementById("description")?.addEventListener("input", (e) => {
  previewDescription.textContent = e.target.value || "Product description will appear here.";
});

// Images preview
function handleImagePreview(fileInput, previewElement) {
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => previewElement.src = e.target.result;
    reader.readAsDataURL(file);
  } else {
    previewElement.src = "";
  }
}

["extraImage1", "extraImage2", "extraImage3", "extraImage4"].forEach((id, idx) => {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener("change", (e) => handleImagePreview(e.target, previewExtraImages[idx]));
  }
});

["extraVideo1", "extraVideo2", "extraVideo3"].forEach((id, index) => {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const video = document.getElementById(`preview-extra-video-${index + 1}`);
      if (file && video) {
        video.src = URL.createObjectURL(file);
        video.style.display = 'block';
      }
    });
  }
});
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







document.getElementById('details-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const messageElement = document.getElementById('message') || document.createElement('div');
  if (!messageElement.id) {
    messageElement.id = "message";
    document.body.appendChild(messageElement);
  }

  const formData = new FormData();

  const availableInInput = document.getElementById("availableIn");
  let availableInValue = availableInInput?.value.trim() || "All Over India";

  formData.append('name', document.getElementById("product-name").value.trim());
  formData.append('price', document.getElementById("price").value.trim());
  formData.append('description', document.getElementById("description").value.trim());
  formData.append('summary', document.getElementById("summary")?.value.trim() || "");
  formData.append('category', document.getElementById("category").value);
  formData.append('subcategory', document.getElementById("subcategory").value);
  formData.append('size', document.getElementById("size")?.value.trim() || "");
  formData.append('color', document.getElementById("color")?.value.trim());
  formData.append('material', document.getElementById("material")?.value.trim());
  formData.append('modelStyle', document.getElementById("modelStyle")?.value.trim());
  formData.append('availableIn', availableInValue);

  const thumbnail = document.getElementById("thumbnail-image").files[0];
  if (thumbnail) {
    formData.append('thumbnailImage', thumbnail);
  } else {
    messageElement.textContent = "Thumbnail image is required.";
    messageElement.style.color = "red";
    return;
  }

  ["extraImage1", "extraImage2", "extraImage3", "extraImage4"].forEach(id => {
    const file = document.getElementById(id)?.files[0];
    if (file) formData.append('extraImages', file);
  });

  ["extraVideo1", "extraVideo2", "extraVideo3"].forEach(id => {
    const file = document.getElementById(id)?.files[0];
    if (file) formData.append('extraVideos', file);
  });

  const storeId = localStorage.getItem("storeId");
  formData.append("storeId", storeId);

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
