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




function populatePreview() {
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
  const previewExtraVideos = [
    document.getElementById("preview-extra-video-1"),
    document.getElementById("preview-extra-video-2"),
    document.getElementById("preview-extra-video-3"),
  ];

  if (data) {
    previewName.textContent = data.name || "Product Name";
    previewPrice.textContent = `₹${data.price || 0}`;
    previewDescription.textContent = data.description || "";

    // Image files
    if (data.thumbnail) {
      const reader = new FileReader();
      reader.onload = (e) => previewThumbnail.src = e.target.result;
      reader.readAsDataURL(data.thumbnail);
    }

    (data.extraImages || []).forEach((file, i) => {
      if (previewExtraImages[i]) {
        const reader = new FileReader();
        reader.onload = (e) => previewExtraImages[i].src = e.target.result;
        reader.readAsDataURL(file);
      }
    });

    (data.extraVideos || []).forEach((file, i) => {
      if (previewExtraVideos[i]) {
        previewExtraVideos[i].src = URL.createObjectURL(file);
      }
    });
  }
}

populatePreview();






document.getElementById("details-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const messageElement = document.createElement('div');
  document.body.appendChild(messageElement); // Add message div if needed

  const formData = new FormData();
  const availableInInput = document.getElementById("availableIn");
  let availableInValue = availableInInput?.value.trim() || "All Over India";

  formData.append('name', data.name);
  formData.append('price', data.price);
  formData.append('description', data.description);
  formData.append('summary', data.summary);
  formData.append('category', data.category);
  formData.append('subcategory', data.subcategory);
  formData.append('storeId', data.storeId || "");

  formData.append('size', document.getElementById("size")?.value || "");
  formData.append('color', document.getElementById("color").value);
  formData.append('material', document.getElementById("material").value);
  formData.append('pattern', document.getElementById("pattern").value);
  formData.append('washCare', document.getElementById("washCare").value);
  formData.append('brand', document.getElementById("brand").value);
  formData.append('modelStyle', document.getElementById("modelStyle").value);
  formData.append('availableIn', availableInValue);

  // Images and videos
  if (data.thumbnail) formData.append('thumbnailImage', data.thumbnail);
  (data.extraImages || []).forEach(file => formData.append('extraImages', file));
  (data.extraVideos || []).forEach(file => formData.append('extraVideos', file));

  // Submit to server
  try {
    const res = await fetch("/api/products/add", {
      method: "POST",
      body: formData,
      credentials: "include"
    });
    const result = await res.json();
    if (res.ok && result.success) {
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
