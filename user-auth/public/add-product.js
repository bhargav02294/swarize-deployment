// add-product.js (complete, self-contained)
// Loads after DOM (make sure your <script src="add-product.js"> is at bottom of HTML or use this file)

document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------
  // Category + Subcategory data
  // ----------------------------
  const categoriesData = [
    {
      name: "Sarees",
      subcategories: [
        "Silk Saree","Cotton Saree","Georgette Saree","Chiffon Saree","Crepe Saree",
        "Linen Saree","Banarasi Saree","Kanjivaram Saree","Paithani Saree","Organza Saree",
        "Tissue Saree","Satin Saree","Net Saree","Printed Saree","Embroidered Saree"
      ]
    },
    {
      name: "Dresses",
      subcategories: [
        "Kurti","Lehenga","Anarkali Dress","Gown","Sharara","Salwar Suit",
        "Palazzo Set","Skirt Set","Indo Western Dress","Co-ord Set","Churidar Set"
      ]
    }
  ];

  // ----------------------------
  // Element references
  // ----------------------------
  const categorySelect = document.getElementById("category");
  const subcategorySelect = document.getElementById("subcategory");
  const nextBtn = document.getElementById("nextBtn");
  const basicInfoSection = document.getElementById("basic-info-section");
  const productDetailsSection = document.getElementById("product-details-section");
  const dynamicFieldsContainer = document.getElementById("dynamic-fields");
  const addProductForm = document.getElementById("add-product-form");

  // live preview elements
  const previewContainer = document.querySelector(".preview-container") || document.body;
  const previewThumbnail = document.getElementById("preview-thumbnail");
  const previewName = document.getElementById("preview-name");
  const previewPrice = document.getElementById("preview-price");
  const previewDescription = document.getElementById("preview-description");
  const previewExtraImages = [
    document.getElementById("preview-extra-image-1"),
    document.getElementById("preview-extra-image-2"),
    document.getElementById("preview-extra-image-3"),
    document.getElementById("preview-extra-image-4")
  ];

  // ----------------------------
  // Populate category select
  // ----------------------------
  if (categorySelect) {
    categoriesData.forEach(cat => {
      const o = document.createElement("option");
      o.value = cat.name;
      o.textContent = cat.name;
      categorySelect.appendChild(o);
    });

    categorySelect.addEventListener("change", (e) => {
      subcategorySelect.innerHTML = '<option value="" disabled selected>Select a subcategory</option>';
      const selected = categoriesData.find(c => c.name === e.target.value);
      if (selected) {
        selected.subcategories.forEach(sub => {
          const o = document.createElement("option");
          o.value = sub;
          o.textContent = sub;
          subcategorySelect.appendChild(o);
        });
      }
      updatePreviewField("category", e.target.value);
      // clear previous subcategory preview
      updatePreviewField("subcategory", "");
    });
  }

  if (subcategorySelect) {
    subcategorySelect.addEventListener("change", (e) => {
      updatePreviewField("subcategory", e.target.value);
    });
  }

  // ----------------------------
  // Preview dynamic elements (created and appended)
  // ----------------------------
  const previewProductCode = createPreviewP("Product Code");
  const previewMaterial = createPreviewP("Material/Fabric");
  const previewColor = createPreviewP("Color");
  const previewPattern = createPreviewP("Pattern");
  const previewWashCare = createPreviewP("Wash Care");
  const previewOccasion = createPreviewP("Occasion");
  const previewSareeSize = createPreviewP("Saree Size");
  const previewBlouseSize = createPreviewP("Blouse Size");
  const previewAvailableSize = createPreviewP("Available Sizes");
  const previewCategory = createPreviewP("Category");
  const previewSubcategory = createPreviewP("Subcategory");
  const previewTags = createPreviewP("Tags");

  // helper to create & append a preview paragraph
  function createPreviewP(label) {
    const p = document.createElement("p");
    p.textContent = `${label}: -`;
    if (previewContainer) previewContainer.appendChild(p);
    return p;
  }

  // update preview by field name
  function updatePreviewField(fieldId, value) {
    const val = (value === undefined || value === null || value === "") ? "-" : value;
    switch (fieldId) {
      case "category": previewCategory.textContent = `Category: ${val}`; break;
      case "subcategory": previewSubcategory.textContent = `Subcategory: ${val}`; break;
      case "productCode": previewProductCode.textContent = `Product Code: ${val}`; break;
      case "material": previewMaterial.textContent = `Material/Fabric: ${val}`; break;
      case "color": previewColor.textContent = `Color: ${val}`; break;
      case "pattern": previewPattern.textContent = `Pattern: ${val}`; break;
      case "washCare": previewWashCare.textContent = `Wash Care: ${val}`; break;
      case "occasion": previewOccasion.textContent = `Occasion: ${val}`; break;
      case "sareeSize": previewSareeSize.textContent = `Saree Size: ${val} meters`; break;
      case "blouseSize": previewBlouseSize.textContent = `Blouse Size: ${val} meters`; break;
      case "availableSize": previewAvailableSize.textContent = `Available Sizes: ${val}`; break;
      case "tags": previewTags.textContent = `Tags: ${val}`; break;
      case "name": if (previewName) previewName.textContent = val; break;
      case "price": if (previewPrice) previewPrice.textContent = (val === "-") ? "₹0.00" : `₹${val}`; break;
      case "description": if (previewDescription) previewDescription.textContent = val; break;
      default: break;
    }
  }

  // wire basic field preview changes
  const nameInput = document.getElementById("product-name");
  if (nameInput) nameInput.addEventListener("input", e => updatePreviewField("name", e.target.value));
  const priceInput = document.getElementById("price");
  if (priceInput) priceInput.addEventListener("input", e => updatePreviewField("price", e.target.value));
  const descInput = document.getElementById("description");
  if (descInput) descInput.addEventListener("input", e => updatePreviewField("description", e.target.value));

  // image preview handlers
  function handleImagePreview(fileInput, previewEl) {
    if (!fileInput || !previewEl) return;
    const file = fileInput.files && fileInput.files[0];
    if (!file) { previewEl.src = ""; return; }
    const reader = new FileReader();
    reader.onload = e => previewEl.src = e.target.result;
    reader.readAsDataURL(file);
  }
  const thumbInput = document.getElementById("thumbnail-image");
  if (thumbInput && previewThumbnail) thumbInput.addEventListener("change", e => handleImagePreview(e.target, previewThumbnail));
  ['extraImage1','extraImage2','extraImage3','extraImage4'].forEach((id, idx) => {
    const inp = document.getElementById(id);
    const prev = previewExtraImages[idx];
    if (inp && prev) inp.addEventListener("change", e => handleImagePreview(e.target, prev));
  });
  ['extraVideo1','extraVideo2','extraVideo3'].forEach((id, idx) => {
    const inp = document.getElementById(id);
    if (inp) inp.addEventListener("change", e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const vid = document.getElementById(`preview-extra-video-${idx+1}`);
      if (vid) { vid.src = url; vid.style.display = "block"; }
    });
  });

  // ----------------------------
  // Field config for categories
  // ----------------------------
  const subcategoryFieldsMap = {
    "Sarees": {
      productCode: true,
      material: true,
      color: true,
      pattern: true,
      sareeSize: true,
      blouseSize: true,
      occasion: true,
      washCare: true
    },
    "Dresses": {
      productCode: true,
      material: true,
      color: true,
      pattern: true,
      availableSize: true,
      occasion: true,
      washCare: true
    }
  };

  // ----------------------------
  // Helpers to create inputs
  // ----------------------------
  function createLabel(text) {
    const l = document.createElement("label");
    l.textContent = text;
    return l;
  }

  function createTextInput(id, placeholder = "", type = "text") {
    const input = document.createElement("input");
    input.type = type;
    input.id = id;
    input.placeholder = placeholder;
    return input;
  }

  function createSelect(id, options = []) {
    const select = document.createElement("select");
    select.id = id;
    const placeholderOpt = document.createElement("option");
    placeholderOpt.value = "";
    placeholderOpt.disabled = true;
    placeholderOpt.selected = true;
    placeholderOpt.textContent = `Select ${id}`;
    select.appendChild(placeholderOpt);
    options.forEach(optVal => {
      const o = document.createElement("option");
      o.value = optVal;
      o.textContent = optVal;
      select.appendChild(o);
    });
    return select;
  }

  function createCheckbox(name, value, id) {
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.name = name;
    cb.value = value;
    if (id) cb.id = id;
    return cb;
  }

  function createColorField() {
    const wrapper = document.createElement("div");
    const label = createLabel("Color:");
    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.id = "colorPicker";
    const text = document.createElement("input");
    text.type = "text";
    text.id = "color";
    text.placeholder = "Enter color name";

    // sync color picker -> text (hex)
    colorPicker.addEventListener("input", () => {
      text.value = colorPicker.value;
      updatePreviewField("color", text.value);
    });
    // text -> preview
    text.addEventListener("input", () => updatePreviewField("color", text.value));
    wrapper.append(label, colorPicker, text);
    return wrapper;
  }

  // ----------------------------
  // Load dynamic fields for a category
  // ----------------------------
  function loadFields(categoryName) {
    dynamicFieldsContainer.innerHTML = ""; // clear
    const cfg = subcategoryFieldsMap[categoryName];
    if (!cfg) return;

    // Product Code
    if (cfg.productCode) {
      dynamicFieldsContainer.append(createLabel("Product Code:"));
      const pc = createTextInput("productCode", "Enter product code");
      pc.addEventListener("input", e => updatePreviewField("productCode", e.target.value));
      dynamicFieldsContainer.appendChild(pc);
    }

    // Material / Fabric
    if (cfg.material) {
      dynamicFieldsContainer.append(createLabel("Material / Fabric:"));
      const matSelect = createSelect("material", [
        "Cotton","Silk","Georgette","Chiffon","Crepe","Linen","Net","Satin","Velvet","Organza","Rayon","Tissue","Wool","Polyester","Blend"
      ]);
      matSelect.addEventListener("change", e => updatePreviewField("material", e.target.value));
      dynamicFieldsContainer.appendChild(matSelect);
    }

    // Color (color picker + text)
    if (cfg.color) {
      dynamicFieldsContainer.appendChild(createColorField());
    }

    // Pattern
    if (cfg.pattern) {
      dynamicFieldsContainer.append(createLabel("Pattern:"));
      const patternSelect = createSelect("pattern", [
        "Plain","Printed","Embroidered","Zari Work","Thread Work","Mirror Work","Digital Print","Handloom","Floral","Striped","Checks","Tie-Dye"
      ]);
      patternSelect.addEventListener("change", e => updatePreviewField("pattern", e.target.value));
      dynamicFieldsContainer.appendChild(patternSelect);
    }

    // Saree size / blouse size (numbers in meters)
    if (cfg.sareeSize) {
      dynamicFieldsContainer.append(createLabel("Saree Size (meters):"));
      const sareeInput = createTextInput("sareeSize", "e.g. 5.5", "number");
      sareeInput.addEventListener("input", e => updatePreviewField("sareeSize", e.target.value));
      dynamicFieldsContainer.appendChild(sareeInput);

      dynamicFieldsContainer.append(createLabel("Blouse Size (meters):"));
      const blouseInput = createTextInput("blouseSize", "e.g. 0.8", "number");
      blouseInput.addEventListener("input", e => updatePreviewField("blouseSize", e.target.value));
      dynamicFieldsContainer.appendChild(blouseInput);
    }

    // available sizes for dresses (checkboxes)
    if (cfg.availableSize) {
      dynamicFieldsContainer.append(createLabel("Available Sizes:"));
      const sizes = ["XS","S","M","L","XL","XXL","3XL","4XL"];
      const sizeWrap = document.createElement("div");
      sizes.forEach(sz => {
        const id = `available-size-${sz}`;
        const cb = createCheckbox("availableSizes", sz, id);
        const lbl = document.createElement("label");
        lbl.htmlFor = id;
        lbl.textContent = sz;
        cb.addEventListener("change", () => {
          const checked = Array.from(document.querySelectorAll("input[name='availableSizes']:checked")).map(c => c.value).join(", ");
          updatePreviewField("availableSize", checked);
        });
        sizeWrap.append(cb, lbl);
      });
      dynamicFieldsContainer.appendChild(sizeWrap);
    }

    // Occasion
    if (cfg.occasion) {
      dynamicFieldsContainer.append(createLabel("Occasion:"));
      const occSel = createSelect("occasion", ["Casual","Festive","Wedding","Party","Traditional","Office Wear","Daily Wear"]);
      occSel.addEventListener("change", e => updatePreviewField("occasion", e.target.value));
      dynamicFieldsContainer.appendChild(occSel);
    }

    // Wash care
    if (cfg.washCare) {
      dynamicFieldsContainer.append(createLabel("Wash Care:"));
      const washSel = createSelect("washCare", ["Dry Clean Only","Hand Wash","Machine Wash","Cold Wash","Do Not Bleach"]);
      washSel.addEventListener("change", e => updatePreviewField("washCare", e.target.value));
      dynamicFieldsContainer.appendChild(washSel);
    }
  }

  // ----------------------------
  // Next button -> show dynamic fields section
  // ----------------------------
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const name = (document.getElementById("product-name") || {}).value?.trim();
      const price = (document.getElementById("price") || {}).value?.trim();
      const description = (document.getElementById("description") || {}).value?.trim();
      const category = (document.getElementById("category") || {}).value;
      const subcategory = (document.getElementById("subcategory") || {}).value;

      if (!name || !price || !description || !category || !subcategory) {
        alert("Please fill all required fields!");
        return;
      }

      localStorage.setItem("basicProductData", JSON.stringify({ name, price, description, category, subcategory }));

      if (basicInfoSection) basicInfoSection.style.display = "none";
      if (productDetailsSection) productDetailsSection.classList.remove("hidden");

      // preview updates
      updatePreviewField("name", name);
      updatePreviewField("price", price);
      updatePreviewField("description", description);
      updatePreviewField("category", category);
      updatePreviewField("subcategory", subcategory);

      // load dynamic fields based on main category (Sarees | Dresses)
      loadFields(category);
    });
  }

  // ----------------------------
  // Form submit - gather data & send
  // ----------------------------
  if (addProductForm) {
    addProductForm.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const messageElement = document.getElementById('message') || (() => {
        const m = document.createElement('div'); m.id = 'message'; document.body.appendChild(m); return m;
      })();

      const formData = new FormData();

      // Basic required
      const nameVal = (document.getElementById("product-name") || {}).value?.trim();
      const priceVal = (document.getElementById("price") || {}).value?.trim();
      const descVal = (document.getElementById("description") || {}).value?.trim();
      const summaryVal = (document.getElementById("summary") || {}).value?.trim() || "";
      const categoryVal = (document.getElementById("category") || {}).value;
      const subcategoryVal = (document.getElementById("subcategory") || {}).value;
      const availableInVal = (document.getElementById("availableIn") || {}).value?.trim() || "All Over India";

      if (!nameVal || !priceVal || !descVal || !categoryVal || !subcategoryVal) {
        messageElement.textContent = "Please fill required fields.";
        messageElement.style.color = "red";
        return;
      }

      formData.append("name", nameVal);
      formData.append("price", priceVal);
      formData.append("description", descVal);
      formData.append("summary", summaryVal);
      formData.append("category", categoryVal);
      formData.append("subcategory", subcategoryVal);
      formData.append("availableIn", availableInVal);

      // Product Code
      const productCodeEl = document.getElementById("productCode");
      if (productCodeEl && productCodeEl.value.trim()) formData.append("productCode", productCodeEl.value.trim());

      // Optional single-value fields
      ["material","pattern","washCare","occasion","sareeSize","blouseSize","color"].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.value !== undefined && String(el.value).trim() !== "") {
          formData.append(id, el.value.trim());
        }
      });

      // availableSizes checkboxes -> multiple entries
      const checkedSizes = Array.from(document.querySelectorAll("input[name='availableSizes']:checked")).map(cb => cb.value);
      if (checkedSizes.length) {
        checkedSizes.forEach(s => formData.append("availableSizes", s));
      }

      // Files: thumbnail required
      const thumbnail = (document.getElementById("thumbnail-image") || {}).files?.[0];
      if (!thumbnail) {
        messageElement.textContent = "Thumbnail image is required.";
        messageElement.style.color = "red";
        return;
      }
      formData.append("thumbnailImage", thumbnail);

      // extra images
      ['extraImage1','extraImage2','extraImage3','extraImage4'].forEach(id => {
        const f = (document.getElementById(id) || {}).files?.[0];
        if (f) formData.append("extraImages", f);
      });
      // extra videos
      ['extraVideo1','extraVideo2','extraVideo3'].forEach(id => {
        const f = (document.getElementById(id) || {}).files?.[0];
        if (f) formData.append("extraVideos", f);
      });

      // storeId if in localStorage
      const storeId = localStorage.getItem("storeId");
      if (storeId) formData.append("storeId", storeId);

      // Debug: show all form data keys (useful in console)
      console.log("Uploading FormData entries:");
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      try {
        const resp = await fetch("/api/products/add", {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        const result = await resp.json();
        if (resp.ok && result.success) {
          messageElement.textContent = "Product added successfully!";
          messageElement.style.color = "green";
          setTimeout(() => {
            const storeSlug = localStorage.getItem("storeSlug");
            window.location.href = `/store.html?slug=${encodeURIComponent(storeSlug || "")}`;
          }, 1200);
        } else {
          messageElement.textContent = result.message || "Failed to add product.";
          messageElement.style.color = "red";
        }
      } catch (err) {
        console.error("Error posting product:", err);
        messageElement.textContent = "Error adding product.";
        messageElement.style.color = "red";
      }
    });
  }

  // End DOMContentLoaded
});
