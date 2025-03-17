document.addEventListener("DOMContentLoaded", async () => {
    const productsGrid = document.getElementById("products-grid");

    // Define the categories (10 total)
    const categories = [
        "Women's Store", "Men's Store", "Kids' Store", "Bags and Footwear", 
        "Health and Beauty", "Jewelry and Accessories", "Electronic Accessories", 
        "Sports and Fitness", "Home Decor and Kitchenware", "Art and Craft"
    ];

    // Fetch products from the API
    async function fetchProducts(category) {
        try {
            const response = await fetch(`https://swarize-deployment.onrender.com/api/products/category/${category}`);
            const data = await response.json();

            if (data.success && data.products.length > 0) {
                return data.products.slice(0, 3); // Get only 3 products per category
            }
        } catch (error) {
            console.error(`❌ Error fetching products for ${category}:`, error);
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
                <img src="${imagePath}" alt="${product.name}" class="product-image" onclick="viewProduct('${product._id}')">
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
        const response = await fetch("https://swarize-deployment.onrender.com/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
            credentials: "include"
        });

        const data = await response.json();
        if (data.success) {
            console.log("✅ Product added to cart");
            window.location.href = `addtocart.html?id=${productId}`;
        } else {
            alert("❌ Failed to add product to cart: " + data.message);
        }
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
        alert("❌ Error adding product to cart.");
    }
}












//=========Search=============//


document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");

    if (!searchInput || !searchButton) {
        console.error("🚨 Search input or button not found! Check your HTML.");
        return;
    }





    // ✅ Keyword Mapping to normalize search terms
    const keywordMapping = {
        "t shirt": "t-shirts", "t-shirt": "t-shirts", "tees": "t-shirts",
        "jean": "jeans", "denim": "jeans",
        "saree": "sarees", "kurti": "kurtis", "lehenga": "lehengas",
        "watch": "watches", "shoe": "shoes",
        "wallet": "wallets", "handbag": "handbags"
    };

    // ✅ Define subcategory pages with lowercase keys for correct mapping
    const subcategoryPages = {
        "t-shirts": "womens-store.html?subcategory=T-Shirts",
        "jeans": "womens-store.html?subcategory=Jeans",
        "sarees": "womens-store.html?subcategory=Sarees",
        "lehengas": "womens-store.html?subcategory=Lehengas",
        "watches": "womens-store.html?subcategory=Watches",
        "shoes": "bags-and-footwear.html?subcategory=Shoes",
        "wallets": "bags-and-footwear.html?subcategory=Wallets",
        "handbags": "bags-and-footwear.html?subcategory=Handbags"
    };

    // ✅ Full Category & Subcategory Mapping
     // ✅ Full Category & Subcategory Mapping
     const categoryMap = {
        "womens-store.html": ["Sarees", "Kurtis", "Salwar Suits", "Western Dresses", "Tops", 
            "Leggings", "Palazzo Pants", "Jeans", "T-Shirts", "Nightwear",
            "Lehengas", "Anarkali Suits", "Dupattas", "Gowns",
            "Bras", "Panties", "Shapewear", "Camisoles",
            "Jackets", "Shawls", "Woolen Sweaters", "Scarves",
            "Heels", "Flats", "Bellies", "Sandals", "Wedges", 
            "Sneakers", "Ethnic Mojaris", "Boots",
            "Handbags", "Clutches", "Sunglasses", "Hair Accessories", "Watches"],
        "mens-store.html": ["Shirts", "T-Shirts", "Formal Suits", "Blazers", "Jeans", 
            "Trousers", "Track Pants", "Hoodies", "Shorts",
            "Kurtas", "Sherwanis",
            "Vests", "Boxers", "Briefs",
            "Jackets", "Sweaters", "Gloves", "Caps",
            "Sneakers", "Formal Shoes", "Sandals", "Loafers", 
            "Flip Flops", "Sports Shoes", "Slippers",
            "Wallets", "Belts", "Ties", "Cufflinks", "Sunglasses"],
        "kids-store.html": ["Casual Wear", "Party Wear", "Sleepwear", "School Uniforms", "Ethnic Wear",
            "Educational Toys", "Action Figures", "Dolls", "Puzzle Games", "Remote-Controlled Toys",
            "Bags", "Stationery", "Lunch Boxes", "Water Bottles",
            "Diapers", "Wipes", "Baby Blankets", "Bath Essentials",
            "Sandals", "Sports Shoes", "Slippers", "Casual Shoes", "School Shoes", "Bellies for Girls"],
        "bags-and-footwear.html": ["Backpacks", "Handbags", "Wallets", "Laptop Bags", "Duffel Bags", 
            "Travel Bags", "Sling Bags",
            "Sneakers", "Sandals", "Loafers", "Flip Flops", "Formal Shoes", 
            "Boots", "Ethnic Mojaris", "Sports Shoes"],
        "health-and-beauty.html": ["Moisturizers", "Sunscreens", "Face Wash", "Scrubs", "Face Masks", "Lip Balms",
            "Shampoos", "Conditioners", "Hair Oils", "Serums", "Hair Masks",
            "Lipsticks", "Foundations", "Mascaras", "Eyeliners", "Blush", "Nail Paints",
            "Deodorants", "Perfumes", "Body Wash", "Razors", "Wax Strips",
            "Vitamins", "Protein Powders", "Herbal Supplements", "First Aid Kits", "Masks", "Sanitizers"],
        "jewelry-and-accessories.html": ["Gold-Plated Necklaces", "Kundan Necklaces", "Pearl Necklaces", "Chokers",
            "Stud Earrings", "Danglers", "Chandbalis", "Hoops", "Jhumkas",
            "Beaded Bracelets", "Cuff Bracelets", "Charm Bracelets",
            "Metal Bangles", "Glass Bangles", "Designer Bangles",
            "Adjustable Rings", "Cocktail Rings", "Diamond-Plated Rings",
            "Oxidized Anklets", "Silver Anklets", "Gold-Plated Anklets",
            "Single Stone Nose Pins", "Designer Nose Pins", "Hoop Nose Pins",
            "Watches", "Sunglasses", "Hair Bands", "Hair Clips", "Scarves", "Hats", "Brooches"],
        "electronic-accessories.html": ["Headphones", "Earphones (Wired & Wireless)", "Bluetooth Speakers",
            "Power Banks", "Mobile Chargers", "USB Cables", "Mobile Covers", "Tempered Glass",
            "Mouse", "Keyboards", "Laptop Cooling Pads", "Laptop Bags",
            "Smart Watches", "Fitness Bands", "Portable Fans", "LED Ring Lights"],
        "sports-and-fitness.html": ["Cricket Bats", "Footballs", "Badminton Rackets", "Tennis Balls", "Basketballs",
            "Yoga Mats", "Dumbbells", "Resistance Bands", "Skipping Ropes",
            "Tracksuits", "Sports Bras", "Gym Shorts", "Jerseys",
            "Water Bottles", "Gym Bags", "Sweatbands", "Gloves", "Towel Bands"],
        "home-decor-and-kitchenware.html": ["Paintings", "Wooden Panels", "Posters",
            "Fairy Lights", "Table Lamps", "LED Strips", "Chandeliers",
            "Ceramic Vases", "Glass Vases", "Flower Pots",
            "Figurines", "Mini Statues", "Wall Hangings", "Wind Chimes",
            "Analog Clocks", "Digital Wall Clocks",
            "Door Mats", "Area Rugs", "Carpets",
            "Cushion Covers", "Throw Pillows",
            "Non-Stick Pans", "Pressure Cookers", "Frying Pans",
            "Airtight Containers", "Spice Racks", "Glass Jars",
            "Dinner Sets", "Bowls", "Serving Trays", "Cutlery Sets",
            "Peelers", "Graters", "Juicers", "Vegetable Choppers"],
        "art-and-craft.html": ["Canvas Boards", "Easels", "Paint Brushes", "Acrylic Paints", 
            "Oil Paints", "Watercolors",
            "Sketch Pens", "Charcoal Pencils", "Colored Pencils", "Markers",
            "Origami Kits", "Jewelry Making Kits", "Sewing Kits",
            "Glitter", "Ribbons", "Sequins", "Beads", "Craft Papers",
            "Embroidery Kits", "Knitting Kits", "Calligraphy Sets",
            "Miniature Furniture", "Plastic Models",
            "Silicone Molds", "Pigments", "Resin Mix"]
    };

    // ✅ Combined Search Function
    function handleSearch() {
        let query = searchInput.value.trim().toLowerCase();
        console.log("🔍 Searching for:", query);

        if (query === "") {
            alert("❌ Please enter a search term.");
            return;
        }

        // ✅ Step 1: Normalize the search term using keywordMapping
        let normalizedSearchTerm = keywordMapping[query] || query;

        // ✅ Step 2: Check if subcategory exists in subcategoryPages
        if (subcategoryPages[normalizedSearchTerm]) {
            console.log(`✅ Redirecting to: ${subcategoryPages[normalizedSearchTerm]}`);
            window.location.href = subcategoryPages[normalizedSearchTerm];
            return;
        }

        // ✅ Step 3: Check if it's a related match in categoryMap
        let bestMatchPage = null;
        let bestMatchSubcategory = null;

        for (const [page, subcategories] of Object.entries(categoryMap)) {
            for (const subcategory of subcategories) {
                if (subcategory.toLowerCase().includes(normalizedSearchTerm)) {
                    bestMatchPage = page;
                    bestMatchSubcategory = subcategory;
                }
            }
        }

        // ✅ Redirect to best match if found
        if (bestMatchPage && bestMatchSubcategory) {
            console.log(`🔄 Redirecting to related match: ${bestMatchPage}?subcategory=${bestMatchSubcategory}`);
            window.location.href = `${bestMatchPage}?subcategory=${bestMatchSubcategory}`;
            return;
        }

        // ✅ Step 4: No match found, show alert
        alert("No matching category found. Try searching again!");
    }

    // ✅ Attach Events
    searchButton.addEventListener("click", handleSearch);
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    });
});












document.addEventListener("DOMContentLoaded", function () {
    const slider = document.querySelector(".slider");
    const slides = document.querySelectorAll(".slide");
    let currentIndex = 0;

    function showNextSlide() {
        currentIndex++;
        if (currentIndex >= slides.length) {
            currentIndex = 0; // Reset to first slide
        }
        slider.style.transform = `translateX(-${currentIndex * 100}%)`; // Move left
    }

    setInterval(showNextSlide, 5000); // Change slide every 3 seconds
});



















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
    const categoryButtons = document.querySelectorAll(".category-btn");
    const dropdowns = document.querySelectorAll(".subcategory-list");

    categoryButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent click from propagating to document
            const dropdown = button.nextElementSibling; // Get the related dropdown

            // Close all other dropdowns
            dropdowns.forEach((drop) => {
                if (drop !== dropdown) {
                    drop.style.display = "none";
                    drop.style.opacity = "0";
                }
            });

            // Toggle the clicked dropdown
            if (dropdown.style.display === "flex") {
                dropdown.style.display = "none";
                dropdown.style.opacity = "0";
            } else {
                dropdown.style.display = "flex";
                dropdown.style.opacity = "1";
            }
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
        dropdowns.forEach((dropdown) => {
            dropdown.style.display = "none";
            dropdown.style.opacity = "0";
        });
    });

    // Prevent dropdown from closing when clicking inside
    dropdowns.forEach((dropdown) => {
        dropdown.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    });
});








document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ JavaScript loaded!");

    // Check if on the signup page
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        console.log("✅ Signup form found. Running signup script.");
        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const name = document.getElementById("signup-name").value.trim();
            const email = document.getElementById("signup-email").value.trim();
            const password = document.getElementById("signup-password").value.trim();

            if (!name || !email || !password) {
                alert("⚠️ All fields are required!");
                return;
            }

            try {
                const response = await fetch("https://swarize-deployment.onrender.com/api/auth/signup", { 
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password, authMethod: "email" })
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    alert("✅ Signup successful! Redirecting...");
                    window.location.href = "signin.html";
                } else {
                    alert(result.message || "❌ Signup failed. Try again.");
                }
            } catch (error) {
                console.error("Error during signup:", error);
                alert("❌ Something went wrong. Please try again.");
            }
        });
    }

    // Check if on the sign-in page
    const signinForm = document.getElementById("signin-form");
    if (signinForm) {
        console.log("✅ Sign-in form found. Running signin script.");
        signinForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById("signin-email").value.trim();
            const password = document.getElementById("signin-password").value.trim();

            if (!email || !password) {
                alert("⚠️ Please enter both email and password!");
                return;
            }

            try {
                const response = await fetch("https://swarize-deployment.onrender.com/api/auth/signin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    alert("✅ Sign-in successful!");
                    window.location.href = "index.html";
                } else {
                    alert(data.message || "❌ Failed to sign in.");
                }
            } catch (error) {
                console.error("Error during sign-in:", error);
                alert("❌ Something went wrong. Please try again.");
            }
        });
    }

    // Hide unnecessary warnings on pages without forms
    if (!signupForm && !signinForm) {
        console.log("✅ No signup or signin forms found. Skipping authentication script.");
    }
});












//============products display by subcategory================//
const subcategoryLinks = document.querySelectorAll('.subcategory-list a');

subcategoryLinks.forEach(link => {
    link.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent default link behavior
        const subcategory = link.getAttribute('href').split('=')[1]; // Get subcategory from URL

        try {
            const response = await fetch(`https://swarize.in/api/products?subcategory=${encodeURIComponent(subcategory)}`);
            const data = await response.json();

            if (data.success) {
                displayProducts(data.products); // Call a function to display products
            } else {
                alert('No products found in this subcategory.');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Error fetching products. Please try again later.');
        }
    });
});

// Function to display products (you will need to implement this)
function displayProducts(products) {
    const productContainer = document.getElementById('product-container'); // Adjust based on your HTML structure
    productContainer.innerHTML = ''; // Clear previous products

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('product');
        productElement.innerHTML = `
            <img src="${product.thumbnailImage}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Price: ${product.price}</p>
            <p>${product.description}</p>
        `;
        productContainer.appendChild(productElement);
    });
}


