document.addEventListener("DOMContentLoaded", async () => { 
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const productName = urlParams.get("name");
    const productPrice = parseFloat(urlParams.get("price"));

    if (!productId || !productName || !productPrice) {
        document.body.innerHTML = "<h2>Error: Missing product details.</h2>";
        return;
    }

    document.getElementById("product-name").textContent = productName;
    document.getElementById("product-price").textContent = `${productPrice}`;
    document.getElementById("final-price").textContent = productPrice;

    const messageBox = document.getElementById("message");
    const payNowBtn = document.getElementById("pay-now-btn");
    const applyPromoBtn = document.getElementById("apply-promo-btn");

    let finalPrice = productPrice;

    try {
        // ✅ Step 1: Check if user is logged in
        const userResponse = await fetch("/api/user/session", { credentials: "include" });
        const userData = await userResponse.json();

        if (!userResponse.ok || !userData.success || !userData.userId) {
            console.error(" User Session Error:", userData.message);
            messageBox.textContent = " Please log in before proceeding.";
            messageBox.style.color = "red";
            return;
        }

        const buyerId = userData.userId;
        const userEmail = userData.email;

        console.log("🔹 Buyer ID:", buyerId, "🔹 Email:", userEmail);

        // 🟢 STEP 2 REMOVED — "Check profile complete" ❌
        // 🟢 STEP 3 REMOVED — "Check bank details" ❌

        // 🔵 Allow payment directly
        messageBox.innerHTML = "Proceed with Payment.";
        messageBox.style.color = "green";
        payNowBtn.classList.remove("hidden");

        // ============================
        // 🎁 APPLY PROMO CODE SECTION
        // ============================
        applyPromoBtn.addEventListener("click", async () => {
            const promoCode = document.getElementById("promo-code")?.value.trim();
            const promoMessage = document.getElementById("promo-message");

            if (!promoCode) {
                promoMessage.textContent = " Please enter a promo code.";
                promoMessage.style.color = "red";
                return;
            }

            try {
                const promoResponse = await fetch("/api/promocode/apply", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ userId: buyerId, promoCode, productPrice })
                });

                const promoData = await promoResponse.json();

                if (!promoData.success) {
                    promoMessage.textContent = promoData.message;
                    promoMessage.style.color = "red";
                    return;
                }

                finalPrice = parseFloat(promoData.finalAmount);
                document.getElementById("final-price").textContent = `₹${finalPrice}`;
                promoMessage.textContent = ` Promo Applied! New Price: ₹${finalPrice}`;
                promoMessage.style.color = "green";

            } catch (error) {
                console.error("Promo Code Error:", error);
                promoMessage.textContent = "Error applying promo code.";
                promoMessage.style.color = "red";
            }
        });

        // ============================
        // 💳 RAZORPAY PAYMENT SECTION
        // ============================
        payNowBtn.addEventListener("click", async () => {
            try {
                const orderResponse = await fetch("/api/payment/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ amount: Math.round(finalPrice) })
                });

                const order = await orderResponse.json();

                if (!order.success) {
                    throw new Error(order.message || "Order creation failed.");
                }

                var options = {
                    key: "rzp_live_zWGkMsnbOyIT0L", // ✅ Replace with your Razorpay Live Key  
                    amount: finalPrice,
                    currency: "INR",
                    name: "Swarize",
                    description: productName,
                    order_id: order.orderId,
                    handler: async function (response) {
                        const appliedPromoCode = document.getElementById("promo-code")?.value.trim() || null;

                        const saveOrder = await fetch("/api/orders/create", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                                productId,
                                buyerId,
                                paymentId: response.razorpay_payment_id,
                                promoCode: appliedPromoCode || null
                            })
                        });

                        const saveOrderData = await saveOrder.json();

                        if (!saveOrderData.success) {
                            throw new Error(saveOrderData.message);
                        }

                        window.location.href = `payment.html?success=true&paymentId=${response.razorpay_payment_id}`;
                    },
                    prefill: { name: "Customer", email: userEmail }
                };

                var rzp = new Razorpay(options);
                rzp.open();

            } catch (error) {
                console.error("Payment Error:", error);
                messageBox.textContent = "Payment failed. Please try again.";
                messageBox.style.color = "red";
            }
        });

    } catch (error) {
        console.error("Session/Profile Error:", error);
        messageBox.textContent = "Error loading payment page.";
        messageBox.style.color = "red";
    }
});


