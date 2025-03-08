document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/api/orders/seller", { credentials: "include" });
        const data = await response.json();

        console.log("📦 Sales Response:", data);

        if (!data.success || data.sales.length === 0) {
            document.getElementById("sales-container").innerHTML = "<h2>No Sales Found.</h2>";
            return;
        }

        const salesContainer = document.getElementById("sales-container");
        salesContainer.innerHTML = "";

        data.sales.forEach(sale => {
            const saleDiv = document.createElement("div");
            saleDiv.classList.add("sale-card");

            // ✅ Ensure earnings are displayed properly
            let earnings = sale.sellerEarnings !== undefined 
                ? `₹${sale.sellerEarnings.toFixed(2)}` 
                : "Not Set";

            saleDiv.innerHTML = `
                <img src="${sale.thumbnailImage}" alt="${sale.productName}" class="sale-img">
                <h2>${sale.productName}</h2>
                <p>₹${sale.productPrice}</p>
                <p><strong>Order Status:</strong> ${sale.orderStatus}</p>
                <p><strong>Seller Earnings:</strong> ${earnings}</p>
            `;

            salesContainer.appendChild(saleDiv);
        });
    } catch (error) {
        console.error("❌ Error fetching sales:", error);
        document.getElementById("sales-container").innerHTML = "<h2>Error loading sales.</h2>";
    }
});
