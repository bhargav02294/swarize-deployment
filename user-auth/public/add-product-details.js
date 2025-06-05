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
