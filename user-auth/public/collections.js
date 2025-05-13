document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/api/orders/buyer", { credentials: "include" });
        const data = await response.json();

        console.log(" Orders Response:", data);

        if (!data.success || data.orders.length === 0) {
            document.getElementById("orders-container").innerHTML = "<h2>No Orders Found.</h2>";
            return;
        }

        const ordersContainer = document.getElementById("orders-container");
        ordersContainer.innerHTML = "";

        data.orders.forEach(order => {
            const orderDiv = document.createElement("div");
            orderDiv.classList.add("order-card");

            // ✅ Parse the order date
            let orderDate = "N/A";
            let deliveryDateRange = "N/A";
            if (order.createdAt) {
                const parsedDate = new Date(order.createdAt);
                if (!isNaN(parsedDate.getTime())) {
                    orderDate = parsedDate.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    });

                    // ✅ Calculate expected delivery range (7-9 days later)
                    const deliveryStart = new Date(parsedDate);
                    deliveryStart.setDate(deliveryStart.getDate() + 7);

                    const deliveryEnd = new Date(parsedDate);
                    deliveryEnd.setDate(deliveryEnd.getDate() + 9);

                    deliveryDateRange = `${deliveryStart.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short"
                    })} - ${deliveryEnd.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    })}`;
                }
            }

            // ✅ Show "Received Order" button only if order is "Shipped"
            let receivedButton = "";
            if (order.orderStatus === "Shipped") {
                receivedButton = `<button class="received-btn" data-order-id="${order._id}">Received Order</button>`;
            }

            // ✅ Add order details including the "Received Order" button
            orderDiv.innerHTML = `
                <img src="${order.thumbnailImage}" alt="${order.productName}" class="order-img">
                <h2>${order.productName}</h2>
                <p>₹${order.productPrice}</p>
                <p><strong>Order Status:</strong> ${order.orderStatus}</p>
                <p><strong>Ordered on:</strong> ${orderDate}</p>
                <p><strong>Expected Delivery:</strong> ${deliveryDateRange}</p>
                ${receivedButton}
            `;
            ordersContainer.appendChild(orderDiv);
        });

        // ✅ Add event listener to "Received Order" buttons
        document.querySelectorAll(".received-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const orderId = e.target.getAttribute("data-order-id");

                const confirmReceive = confirm("Confirm that you have received this order?");
                if (!confirmReceive) return;

                try {
                    const response = await fetch(`/api/orders/receive/${orderId}`, {
                        method: "PUT",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" }
                    });

                    const result = await response.json();
                    if (result.success) {
                        alert("Order marked as received!");
                        window.location.reload(); // Refresh page to update UI
                    } else {
                        alert(result.message);
                    }
                } catch (error) {
                    console.error(" Error marking order as received:", error);
                    alert("Error confirming receipt. Please try again.");
                }
            });
        });

    } catch (error) {
        console.error(" Error fetching orders:", error);
        document.getElementById("orders-container").innerHTML = "<h2>Error loading orders.</h2>";
    }
});
