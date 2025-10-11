//=================   product section    ======================//


document.addEventListener("DOMContentLoaded", async () => {
    const productsGrid = document.getElementById("products-grid");

    // ✅ Define NEW 4 Main Categories
    const categories = [
        "Women", "Men", "Kids", "Accessories"
    ];

    // ✅ Fetch products from the API
    async function fetchProducts(category) {
        try {
            const formattedCategory = encodeURIComponent(category);
            const response = await fetch(`https://swarize.in/api/products/category/${formattedCategory}`);

            const data = await response.json();

            if (data.success && data.products.length > 0) {
                return data.products.slice(0, 2);
            }
        } catch (error) {
            console.error(`Error fetching products for ${category}:`, error);
        }
        return [];
    }

    async function loadProducts() {
        productsGrid.innerHTML = "";

        for (let i = 0; i < categories.length; i += 2) {
            const row = document.createElement("div");
            row.classList.add("product-row");

            // First category
            const category1 = categories[i];
            const products1 = await fetchProducts(category1);
            const categorySection1 = createCategorySection(category1, products1);
            row.appendChild(categorySection1);

            // Second category (if exists)
            if (i + 1 < categories.length) {
                const category2 = categories[i + 1];
                const products2 = await fetchProducts(category2);
                const categorySection2 = createCategorySection(category2, products2);
                row.appendChild(categorySection2);
            }

            productsGrid.appendChild(row);
        }
    }

    function createCategorySection(category, products) {
        const categorySection = document.createElement("div");
        categorySection.classList.add("category-section");
        categorySection.innerHTML = `<h3>${category}</h3><div class="category-products"></div>`;

        const productRow = categorySection.querySelector(".category-products");

        products.forEach(product => {
            const imagePath = product.thumbnailImage.startsWith("uploads/")
                ? `https://swarize.in/${product.thumbnailImage}`
                : product.thumbnailImage;

            const productItem = document.createElement("div");
            productItem.classList.add("product-card");
            productItem.innerHTML = `
                <img src="${imagePath}" alt="${product.name} - Buy online at Swarize" class="product-image" onclick="viewProduct('${product._id}')">
                <h4>${product.name}</h4>
                <p class="product-price">₹${product.price}</p>
                <div class="star-rating">★★★★★</div>
                <button class="cart-button" onclick="addToCart('${product._id}')">🛒</button>
            `;

            productRow.appendChild(productItem);
        });

        return categorySection;
    }

    loadProducts();
});

// ✅ Function to view product details
function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// ✅ Function to add product to cart
async function addToCart(productId) {
    try {
        const response = await fetch("https://swarize.in/api/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
            credentials: "include"
        });

        const data = await response.json();

        if (data.success) {
            console.log(" Product added to cart");
            window.location.href = `addtocart.html?id=${productId}`;
        } else {
            alert(" Failed to add product to cart: " + data.message);
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        alert(" Error adding product to cart.");
    }
}









async function loadSection(section) {
  const resp = await fetch(`/api/products/section?section=${section}`);
  const data = await resp.json();
  const container = document.getElementById("products-container");
  container.innerHTML = "";

  data.products.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${p.thumbnailImage}" width="150" />
      <h4>${p.name}</h4>
      <p>₹${p.price}</p>
      <p>${p.category} - ${p.subcategory}</p>
    `;
    container.appendChild(div);
  });
}

// Button event listeners
document.getElementById("btn-saree").addEventListener("click", () => loadSection("saree"));
document.getElementById("btn-dress").addEventListener("click", () => loadSection("dress"));
document.getElementById("btn-festive").addEventListener("click", () => loadSection("festive-edit"));
document.getElementById("btn-elegance").addEventListener("click", () => loadSection("everyday-elegance"));
document.getElementById("btn-under999").addEventListener("click", () => loadSection("under999"));








//=========      Search   function    =============//

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
  const searchContainer = document.getElementById('searchBox');

    if (!searchInput || !searchButton || !searchContainer) {
        console.error(" Search input or button not found! Check your HTML.");
        return;
    }

    // ✅ Keyword Mapping to normalize search terms
    // ✅ Keyword Mapping to normalize search terms
const keywordMapping = {
    "t shirt": "T-Shirts", "tshirt": "T-Shirts", "tees": "T-Shirts",
    "shirt": "Shirts",
    "jean": "Jeans", "denim": "Jeans",
    "saree": "Ethnic Wear", "kurti": "Ethnic Wear", "lehenga": "Ethnic Wear",
    "watch": "Eyewear & Watches", "watches": "Eyewear & Watches",
    "shoe": "Footwear", "shoes": "Footwear",
    "wallet": "Accessories", "handbag": "Bags & Clutches", "bags": "Bags & Travel"
};

// ✅ Subcategory Page Mapping (New Pages)
const subcategoryPages = {
    "T-Shirts": "women.html?subcategory=T-Shirts",
    "Jeans": "women.html?subcategory=Jeans",
    "Ethnic Wear": "women.html?subcategory=Ethnic Wear",
    "Eyewear & Watches": "men.html?subcategory=Eyewear & Watches",
    "Footwear": "men.html?subcategory=Footwear",
    "Accessories": "men.html?subcategory=Accessories",
    "Bags & Clutches": "women.html?subcategory=Bags & Clutches",
    "Bags & Travel": "accessories.html?subcategory=Bags & Travel"
};

// ✅ Main Category & Subcategory Mapping (4 Main Category URLs)
const categoryMap = {
    "women.html": [
        "Ethnic Wear", "Western Wear", "Bottomwear", "Winterwear", "Innerwear & Loungewear",
        "Footwear", "Bags & Clutches", "Jewelry & Accessories", "Beauty & Makeup", "Eyewear & Watches"
    ],
    "men.html": [
        "Topwear", "Bottomwear", "Ethnic Wear", "Winterwear", "Innerwear & Sleepwear",
        "Footwear", "Accessories", "Eyewear & Watches", "Grooming", "Bags & Utility"
    ],
    "kids.html": [
        "Boys Clothing", "Girls Clothing", "Footwear", "Toys & Games", "Remote Toys",
        "Learning & School", "Baby Essentials", "Winterwear", "Accessories", "Festive Wear"
    ],
    "accessories.html": [
        "Bags & Travel", "Unisex Footwear", "Mobile Accessories", "Gadgets", "Computer Accessories",
        "Home Decor", "Kitchenware", "Health & Care", "Craft & DIY Kits", "Fashion Accessories"
    ]
};


     function handleSearch() {
        const rawQuery = searchInput.value.trim().toLowerCase();

        if (!rawQuery) {
            alert("Please enter a search term.");
            return;
        }

        const normalized = keywordMapping[rawQuery] || rawQuery;

        // Step 1: Direct match in subcategory pages
        if (subcategoryPages[normalized]) {
            window.location.href = subcategoryPages[normalized];
            return;
        }

        // Step 2: Fuzzy match inside categoryMap
        for (const [page, subcategories] of Object.entries(categoryMap)) {
            for (const subcategory of subcategories) {
                if (subcategory.toLowerCase().includes(normalized)) {
                    window.location.href = `${page}?subcategory=${subcategory}`;
                    return;
                }
            }
        }

        alert("No matching category found. Try searching again!");
    }

    // ✅ UI Expand/Collapse + Search Logic Combined
    searchButton.addEventListener("click", (e) => {
        if (searchContainer.classList.contains("collapsed")) {
            e.preventDefault();
            searchContainer.classList.remove("collapsed");
            searchContainer.classList.add("expanded");
            setTimeout(() => {
                searchInput.focus();
            }, 200);
        } else {
            handleSearch();
        }
    });

    // ✅ Enter key triggers search
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    });

    // ✅ Click outside to collapse
    document.addEventListener("click", (e) => {
        if (!searchContainer.contains(e.target) && searchContainer.classList.contains("expanded")) {
            searchContainer.classList.remove("expanded");
            searchContainer.classList.add("collapsed");
        }
    });
});









//-------------home section image slider-------------------//

document.addEventListener("DOMContentLoaded", function () {
    const slider = document.querySelector(".slider");
    const slides = document.querySelectorAll(".slide");
    let currentIndex = 0;

    function showNextSlide() {
        currentIndex++;
        if (currentIndex >= slides.length) {
            currentIndex = 0; // Loop back
        }
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    setInterval(showNextSlide, 5000); // 5 seconds per slide
});















//----------------dropdowns   --         login country category    -------------------------//

document.addEventListener('click', function (event) {
    const loginDropdown = document.querySelector('.login-dropdown');
    const countryDropdown = document.querySelector('.country-dropdowner');
    const categoryDropdowns = document.querySelectorAll('.category-dropdown');


    // Toggle Login Dropdown
    if (loginDropdown.contains(event.target)) {
        loginDropdown.classList.toggle('active');
    } else {
        loginDropdown.classList.remove('active');
    }

    // Toggle Country Dropdown
    if (countryDropdown.contains(event.target)) {
        countryDropdown.classList.toggle('active');
    } else {
        countryDropdown.classList.remove('active');
    }
    // Toggle Category Dropdowns
    categoryDropdowns.forEach(dropdown => {
        if (dropdown.contains(event.target)) {
            dropdown.classList.toggle('active');
        } else {
            dropdown.classList.remove('active');
        }
    });
});

// Update Country Flag on Selection


// Prevent Dropdowns from Closing When Clicking Inside
document.querySelector('.login-content').addEventListener('click', (event) => {
    event.stopPropagation();
});

// Prevent Dropdowns from Closing When Clicking Inside
document.querySelectorAll('.dropdown-content').forEach(dropdown => {
    dropdown.addEventListener('click', (event) => {
        event.stopPropagation();
    });
});











document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const subcategory = params.get("subcategory");

    console.log("Selected subcategory:", subcategory);

    // ❗ Define the buttons and dropdowns correctly
    const categoryButtons = document.querySelectorAll(".category-btn");
    const dropdowns = document.querySelectorAll(".subcategory-list");

    categoryButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const dropdown = button.nextElementSibling;

            // Close other dropdowns
            dropdowns.forEach((drop) => {
                if (drop !== dropdown) {
                    drop.style.display = "none";
                    drop.style.opacity = "0";
                }
            });

            // Toggle this dropdown
            if (dropdown.style.display === "flex") {
                dropdown.style.display = "none";
                dropdown.style.opacity = "0";
            } else {
                dropdown.style.display = "flex";
                dropdown.style.opacity = "1";
            }
        });
    });

    // Close dropdowns on outside click
    document.addEventListener("click", () => {
        dropdowns.forEach((dropdown) => {
            dropdown.style.display = "none";
            dropdown.style.opacity = "0";
        });
    });

    // Prevent closing when clicking inside the dropdown
    dropdowns.forEach((dropdown) => {
        dropdown.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    });
});





//==================     sign in sign up CHECK      ==============================//

document.addEventListener("DOMContentLoaded", function () {
    console.log(" JavaScript loaded!");

    // Check if on the signup page
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        console.log(" Signup form found. Running signup script.");
        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const name = document.getElementById("signup-name").value.trim();
            const email = document.getElementById("signup-email").value.trim();
            const password = document.getElementById("signup-password").value.trim();

            if (!name || !email || !password) {
                alert(" All fields are required!");
                return;
            }

            try {
                const response = await fetch("https://swarize.in/api/auth/signup", { 
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password, authMethod: "email" })
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    alert(" Signup successful! Redirecting...");
                    window.location.href = "signin.html";
                } else {
                    alert(result.message || " Signup failed. Try again.");
                }
            } catch (error) {
                console.error("Error during signup:", error);
                alert("Something went wrong. Please try again.");
            }
        });
    }

    // Check if on the sign-in page
    const signinForm = document.getElementById("signin-form");
    if (signinForm) {
        console.log(" Sign-in form found. Running signin script.");
        signinForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById("signin-email").value.trim();
            const password = document.getElementById("signin-password").value.trim();

            if (!email || !password) {
                alert(" Please enter both email and password!");
                return;
            }

            try {
                const response = await fetch("https://swarize.in/api/auth/signin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    alert(" Sign-in successful!");
                    window.location.href = "index.html";
                } else {
                    alert(data.message || "Failed to sign in.");
                }
            } catch (error) {
                console.error("Error during sign-in:", error);
                alert(" Something went wrong. Please try again.");
            }
        });
    }

    // Hide unnecessary warnings on pages without forms
    if (!signupForm && !signinForm) {
        console.log(" No signup or signin forms found. Skipping authentication script.");
    }
});








// File: public/js/index-products.js

document.addEventListener('DOMContentLoaded', () => {
    // Sirf un pages par run karo jahan <div id="product-container"> ho
    const productContainer = document.getElementById('product-container');
    if (!productContainer) return;  // Agar container na mile, script skip karo
  
    // Subcategory links ko select karo
    const subcategoryLinks = document.querySelectorAll('.subcategory-list a');
  
    subcategoryLinks.forEach(link => {
      link.addEventListener('click', async event => {
        event.preventDefault();
  
        // URL se subcategory value lo
        const subcategory = new URL(link.href, location.href).searchParams.get('subcategory');
        // Filhaal women's store hardcode kiya hae catei; agar multiplgories ho, 
        // tab dynamic mapping laga sakte ho
        const category = "Women's Store";
  
        try {
          // Correct backend route hit karna
          const res = await fetch(
            `/api/products/category/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}`
          );
          const data = await res.json();
  
          if (data.success) {
            renderProducts(data.products);
          } else {
            productContainer.innerHTML = '<p>No products found.</p>';
          }
        } catch (err) {
          console.error('Error fetching products:', err);
          productContainer.innerHTML = '<p>Error fetching products. Please try again later.</p>';
        }
      });
    });
  
    // Products ko page par render karne wali function
    function renderProducts(products) {
      productContainer.innerHTML = '';  // Clear previous content
  
      if (!products.length) {
        productContainer.innerHTML = '<p>No products found.</p>';
        return;
      }
  
      products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="${p.thumbnailImage}" alt="${p.name}" class="product-image">
          <h3>${p.name}</h3>
          <p>₹${p.price}</p>
          <p>${p.description.slice(0, 60)}…</p>
        `;
        productContainer.appendChild(card);
      });
    }
  });
  






//=========       product slider          ============//
async function fetchProducts() {
  try {
    const res = await fetch('/api/products/all');
    const products = await res.json();

    const slider = document.getElementById('productSlider');
    slider.innerHTML = '';

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'slider-card';
     card.innerHTML = `
  <a href="/product-detail.html?id=${product._id}" style="text-decoration: none; color: inherit;">
    <img src="${product.thumbnailImage}" alt="${product.name}">
    <div class="product-card-content">
      <h4>${product.name}</h4>
      <p class="product-price">₹${product.price}</p>
    </div>
  </a>
`;

      slider.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading products:', err);
  }
}
fetchProducts();







async function fetchReversedProducts() {
  try {
    const res = await fetch('/api/products/all');
    const products = await res.json();

    const slider = document.getElementById('reversedProductSlider');
    slider.innerHTML = '';

    products.reverse().forEach(product => {
      const card = document.createElement('div');
      card.className = 'slider-card';
      
       card.innerHTML = `
  <a href="/product-detail.html?id=${product._id}" style="text-decoration: none; color: inherit;">
    <img src="${product.thumbnailImage}" alt="${product.name}">
    <div class="product-card-content">
      <h4>${product.name}</h4>
      <p class="product-price">₹${product.price}</p>
    </div>
  </a>
`;

      slider.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading reversed products:', err);
  }
}
fetchReversedProducts();
