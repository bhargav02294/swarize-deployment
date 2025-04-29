// Sample data for categories and subcategories
const categoriesData = [
  {
    name: "Women's Store",
    subcategories: ["Sarees", "Kurtis", "Salwar Suits", "Western Dresses", "Tops", 
      "Leggings", "Palazzo Pants", "Jeans", "T-Shirts", "Nightwear",
      "Lehengas", "Anarkali Suits", "Dupattas", "Gowns",
      "Bras", "Panties", "Shapewear", "Camisoles",
      "Jackets", "Shawls", "Woolen Sweaters", "Scarves",
      "Heels", "Flats", "Bellies", "Sandals", "Wedges", 
      "Sneakers", "Ethnic Mojaris", "Boots",
      "Handbags", "Clutches", "Sunglasses", "Hair Accessories", "Watches"],
  },
  {
    name: "Men's Store",
    subcategories: [ "Shirts", "T-Shirts", "Formal Suits", "Blazers", "Jeans", 
      "Trousers", "Track Pants", "Hoodies", "Shorts",
      "Kurtas", "Sherwanis",
      "Vests", "Boxers", "Briefs",
      "Jackets", "Sweaters", "Gloves", "Caps",
      "Sneakers", "Formal Shoes", "Sandals", "Loafers", 
      "Flip Flops", "Sports Shoes", "Slippers",
      "Wallets", "Belts", "Ties", "Cufflinks", "Sunglasses"],
  },
  {
    name: "Kids' Store",
    subcategories: ["Casual Wear", "Party Wear", "Sleepwear", "School Uniforms", "Ethnic Wear",
      "Educational Toys", "Action Figures", "Dolls", "Puzzle Games", "Remote-Controlled Toys",
      "Bags", "Stationery", "Lunch Boxes", "Water Bottles",
      "Diapers", "Wipes", "Baby Blankets", "Bath Essentials",
      "Sandals", "Sports Shoes", "Slippers", "Casual Shoes", "School Shoes", "Bellies for Girls"],
  },
  {
    name: "Bags and Footwear",
    subcategories: ["Backpacks", "Handbags", "Wallets", "Laptop Bags", "Duffel Bags", 
      "Travel Bags", "Sling Bags",
      "Sneakers", "Sandals", "Loafers", "Flip Flops", "Formal Shoes", 
      "Boots", "Ethnic Mojaris", "Sports Shoes"],
  },
  {
    name: "Health and Beauty",
    subcategories: ["Moisturizers", "Sunscreens", "Face Wash", "Scrubs", "Face Masks", "Lip Balms",
      "Shampoos", "Conditioners", "Hair Oils", "Serums", "Hair Masks",
      "Lipsticks", "Foundations", "Mascaras", "Eyeliners", "Blush", "Nail Paints",
      "Deodorants", "Perfumes", "Body Wash", "Razors", "Wax Strips",
      "Vitamins", "Protein Powders", "Herbal Supplements", "First Aid Kits", "Masks", "Sanitizers",],
  },
  {
    name: "Jewelry and Accessories",
    subcategories: ["Gold-Plated Necklaces", "Kundan Necklaces", "Pearl Necklaces", "Chokers",
      "Stud Earrings", "Danglers", "Chandbalis", "Hoops", "Jhumkas",
      "Beaded Bracelets", "Cuff Bracelets", "Charm Bracelets",
      "Metal Bangles", "Glass Bangles", "Designer Bangles",
      "Adjustable Rings", "Cocktail Rings", "Diamond-Plated Rings",
      "Oxidized Anklets", "Silver Anklets", "Gold-Plated Anklets",
      "Single Stone Nose Pins", "Designer Nose Pins", "Hoop Nose Pins",
      "Watches", "Sunglasses", "Hair Bands", "Hair Clips", "Scarves", "Hats", "Brooches",],
  },
  {
    name: "Electronic Accessories",
    subcategories: ["Headphones", "Earphones (Wired & Wireless)", "Bluetooth Speakers",
      "Power Banks", "Mobile Chargers", "USB Cables", "Mobile Covers", "Tempered Glass",
      "Mouse", "Keyboards", "Laptop Cooling Pads", "Laptop Bags",
      "Smart Watches", "Fitness Bands", "Portable Fans", "LED Ring Lights",],
  },
  {
    name: "Sports and Fitness",
    subcategories: ["Cricket Bats", "Footballs", "Badminton Rackets", "Tennis Balls", "Basketballs",
      "Yoga Mats", "Dumbbells", "Resistance Bands", "Skipping Ropes",
      "Tracksuits", "Sports Bras", "Gym Shorts", "Jerseys",
      "Water Bottles", "Gym Bags", "Sweatbands", "Gloves", "Towel Bands",],
  },
  {
    name: "Home Decor and Kitchenware",
    subcategories: [ "Paintings", "Wooden Panels", "Posters",
      "Fairy Lights", "Table Lamps", "LED Strips", "Chandeliers",
      "Ceramic Vases", "Glass Vases", "Flower Pots",
      "Figurines", "Mini Statues", "Wall Hangings", "Wind Chimes",
      "Analog Clocks", "Digital Wall Clocks",
      "Door Mats", "Area Rugs", "Carpets",
      "Cushion Covers", "Throw Pillows",
      "Non-Stick Pans", "Pressure Cookers", "Frying Pans",
      "Airtight Containers", "Spice Racks", "Glass Jars",
      "Dinner Sets", "Bowls", "Serving Trays", "Cutlery Sets",
      "Peelers", "Graters", "Juicers", "Vegetable Choppers",],
  },
  {
    name: "Art and Craft",
    subcategories: ["Canvas Boards", "Easels", "Paint Brushes", "Acrylic Paints", 
      "Oil Paints", "Watercolors",
      "Sketch Pens", "Charcoal Pencils", "Colored Pencils", "Markers",
      "Origami Kits", "Jewelry Making Kits", "Sewing Kits",
      "Glitter", "Ribbons", "Sequins", "Beads", "Craft Papers",
      "Embroidery Kits", "Knitting Kits", "Calligraphy Sets",
      "Miniature Furniture", "Plastic Models",
      "Silicone Molds", "Pigments", "Resin Mix"],
  },
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

// Update live preview for tags
document.getElementById("tags").addEventListener("input", (e) => {
  previewTags.textContent = `Tags: ${e.target.value || "None"}`;
});

// Update live preview for optional fields
document.getElementById("size").addEventListener("input", (e) => {
  previewSize.textContent = `Size: ${e.target.value || "Not specified"}`;
});

document.getElementById("color").addEventListener("input", (e) => {
  previewColor.textContent = `Color: ${e.target.value || "Not specified"}`;
});

document.getElementById("material").addEventListener("input", (e) => {
  previewMaterial.textContent = `Material: ${e.target.value || "Not specified"}`;
});

document.getElementById("model-style").addEventListener("input", (e) => {
  previewModelStyle.textContent = `Model/Style: ${e.target.value || "Not specified"}`;
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



// Select the form
const form = document.getElementById('add-product-form');
const messageElement = document.getElementById('message');

document.getElementById("add-product-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const availableInInput = document.getElementById("availableIn");
  let availableInValue = availableInInput.value.trim();
  if (!availableInValue) {
    availableInValue = "All Over India";
  }

  const formData = new FormData();
  formData.append('name', document.getElementById("product-name").value);
  formData.append('price', document.getElementById("price").value);
  formData.append('description', document.getElementById("description").value);
  formData.append('summary', document.getElementById("summary").value);
  formData.append('category', document.getElementById("category").value);
  formData.append('subcategory', document.getElementById("subcategory").value);
  formData.append('tags', document.getElementById("tags").value);
  formData.append('size', document.getElementById("size").value);
  formData.append('color', document.getElementById("color").value);
  formData.append('material', document.getElementById("material").value);
  formData.append('modelStyle', document.getElementById("model-style").value);
  formData.append("availableIn", availableInValue);

  const thumbnail = document.getElementById("thumbnail-image").files[0];
  if (thumbnail) {
    formData.append('thumbnailImage', thumbnail);
  }

  ['extraImage1', 'extraImage2', 'extraImage3', 'extraImage4'].forEach(id => {
    const file = document.getElementById(id).files[0];
    if (file) {
      formData.append('extraImages', file);
    }
  });

  ['extraVideo1', 'extraVideo2', 'extraVideo3'].forEach(id => {
    const file = document.getElementById(id).files[0];
    if (file) {
      formData.append('extraVideos', file);
    }
  });

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

      // ✅ Redirect with storeId or storeName
      const storeId = sessionStorage.getItem("storeId") || localStorage.getItem("storeId");
      const storeName = sessionStorage.getItem("storeName") || localStorage.getItem("storeName");

      let redirectUrl = "store.html";
      if (storeId) {
        redirectUrl += `?storeId=${encodeURIComponent(storeId)}`;
      } else if (storeName) {
        redirectUrl += `?storeName=${encodeURIComponent(storeName)}`;
      }

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);

    } else {
      // ✅ Handle API error response clearly
      console.error("Server responded with error:", result.message);
      messageElement.textContent = result.message || "Error adding product.";
      messageElement.style.color = "red";
    }

  } catch (error) {
    console.error("Error adding product:", error);
    messageElement.textContent = "Error adding product.";
    messageElement.style.color = "red";
  }
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



