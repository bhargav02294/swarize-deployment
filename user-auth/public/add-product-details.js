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
  input.readOnly = true;
  wrapper.append(colorBox, input);
  return wrapper;
}

function loadFields() {
  fieldContainer.innerHTML = "";
  fieldContainer.appendChild(createInput("Length (in cm)", "length"));
  fieldContainer.appendChild(createColorPalette());
  fieldContainer.appendChild(createInput("Material", "material"));
  fieldContainer.appendChild(createInput("Pattern", "pattern"));
  fieldContainer.appendChild(createInput("Wash Care", "washCare"));
  fieldContainer.appendChild(createInput("Brand (optional)", "brand"));
  fieldContainer.appendChild(createInput("Style/Model", "modelStyle"));
  fieldContainer.appendChild(createInput("Size (e.g., S, M, L)", "size")); // or you can show dynamic dropdowns
}

loadFields();

document.getElementById("details-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const details = {
    ...data,
    length: document.getElementById("length").value,
    color: document.getElementById("color").value,
    material: document.getElementById("material").value,
    pattern: document.getElementById("pattern").value,
    washCare: document.getElementById("washCare").value,
    brand: document.getElementById("brand").value,
    modelStyle: document.getElementById("modelStyle").value,
    size: document.getElementById("size").value
  };

  console.log("Final Product Data:", details);
  // TODO: Send data to server via fetch()
  alert("Product Added (console logged for now)");
});
