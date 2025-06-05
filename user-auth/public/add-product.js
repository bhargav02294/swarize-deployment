// ✅ NEW categoriesData with 4 Main Categories and 10 Subcategories Each
const categoriesData = [
  {
    name: "Women",
    subcategories: [
      "Ethnic Wear", "Western Wear", "Bottomwear", "Winterwear", "Innerwear & Loungewear",
      "Footwear", "Bags & Clutches", "Jewelry & Accessories", "Beauty & Makeup", "Eyewear & Watches"
    ]
  },
  {
    name: "Men",
    subcategories: [
      "Topwear", "Bottomwear", "Ethnic Wear", "Winterwear", "Innerwear & Sleepwear",
      "Footwear", "Accessories", "Eyewear & Watches", "Grooming", "Bags & Utility"
    ]
  },
  {
    name: "Kids",
    subcategories: [
      "Boys Clothing", "Girls Clothing", "Footwear", "Toys & Games", "Remote Toys",
      "Learning & School", "Baby Essentials", "Winterwear", "Accessories", "Festive Wear"
    ]
  },
  {
    name: "Accessories",
    subcategories: [
      "Bags & Travel", "Unisex Footwear", "Mobile Accessories", "Gadgets", "Computer Accessories",
      "Home Decor", "Kitchenware", "Health & Care", "Craft & DIY Kits", "Fashion Accessories"
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







const nextBtn = document.getElementById("nextBtn");
nextBtn.addEventListener("click", () => {
  const name = document.getElementById("product-name").value.trim();
  const price = document.getElementById("price").value.trim();
  const desc = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;
  const subcategory = document.getElementById("subcategory").value;

  if (!name || !price || !desc || !category || !subcategory) {
    alert("Please fill all required fields.");
    return;
  }

  const formData = {
    name,
    price,
    description: desc,
    summary: document.getElementById("summary").value.trim(),
    category,
    subcategory,
    storeId: localStorage.getItem("storeId") || ""
  };

  // Handle image and video uploads
  const thumbnail = document.getElementById("thumbnail-image").files[0];
  if (!thumbnail) {
    alert("Thumbnail image is required.");
    return;
  }
  formData.thumbnail = thumbnail;

  formData.extraImages = [];
  ['extraImage1', 'extraImage2', 'extraImage3', 'extraImage4'].forEach(id => {
    const file = document.getElementById(id)?.files[0];
    if (file) formData.extraImages.push(file);
  });

  formData.extraVideos = [];
  ['extraVideo1', 'extraVideo2', 'extraVideo3'].forEach(id => {
    const file = document.getElementById(id)?.files[0];
    if (file) formData.extraVideos.push(file);
  });

  // Save to localStorage (as JSON + base64 for files if needed)
  localStorage.setItem("basicProductData", JSON.stringify(formData));

  // ✅ Redirect properly to details page
  window.location.href = "add-product-details.html";
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



