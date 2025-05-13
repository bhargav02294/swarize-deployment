document.addEventListener("DOMContentLoaded", async () => { 
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const productName = urlParams.get("name");
    const productPrice = parseFloat(urlParams.get("price")); // 🔹 Convert to number

    if (!productId || !productName || !productPrice) {
        document.body.innerHTML = "<h2>Error: Missing product details.</h2>";
        return;
    }

    document.getElementById("product-name").textContent = productName;
    document.getElementById("product-price").textContent = `${productPrice}`;
    document.getElementById("final-price").textContent = productPrice; // Set initial final price

    const messageBox = document.getElementById("message");
    const payNowBtn = document.getElementById("pay-now-btn");
    const addBankBtn = document.getElementById("add-bank-btn");
    const applyPromoBtn = document.getElementById("apply-promo-btn");
    let finalPrice = productPrice; // 🔹 Ensure finalPrice is a number

    try {
        // ✅ Step 1: Fetch user ID from session
        const userResponse = await fetch("/api/user/session", { credentials: "include" });
        const userData = await userResponse.json();

        if (!userResponse.ok || !userData.success || !userData.userId) {
            console.error(" User Session Error:", userData.message);
            messageBox.textContent = " Please log in before proceeding.";
            messageBox.style.color = "red";
            return;
        }

        const buyerId = userData.userId;  // 🔹 Get Buyer ID
        const userEmail = userData.email;
        console.log("🔹 Buyer ID:", buyerId, "🔹 Email:", userEmail);

        // ✅ Step 2: Check if Profile is Complete
        const profileResponse = await fetch("/api/user/check-profile", { credentials: "include" });
        const profileData = await profileResponse.json();

        if (!profileResponse.ok || !profileData.success) {
            console.error(" Profile Check Failed:", profileData.message);
            messageBox.innerHTML = ` Profile incomplete. Please complete your profile before proceeding.<br>`;
            messageBox.style.color = "red";

            const completeProfileBtn = document.createElement("button");
            completeProfileBtn.textContent = "Complete Profile";
            completeProfileBtn.classList.add("profile-btn");
            completeProfileBtn.onclick = () => window.location.href = "user-profile.html"; 
            messageBox.appendChild(completeProfileBtn);
            return;
        }

        // ✅ Step 3: Check if Bank Details are Saved
        const bankResponse = await fetch("/api/bank/check", { credentials: "include" });
        const bankData = await bankResponse.json();

        if (!bankResponse.ok || !bankData.success) {
            console.error(" Bank Check Failed:", bankData.message);
            messageBox.innerHTML = ` No bank details found. Please add your bank details first.<br>`;
            messageBox.style.color = "red";

            addBankBtn.classList.remove("hidden");
            addBankBtn.addEventListener("click", () => {
                window.location.href = "bank-details.html"; 
            });
            return;
        }


          // ✅ If Profile & Bank Details are Complete, Show Pay Now Button
          messageBox.innerHTML = "✅ Profile & Bank details verified. Proceed with payment.";
          messageBox.style.color = "green";
          payNowBtn.classList.remove("hidden");
  
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
                  console.log(" Promo Code Response:", promoData);
  
                  if (!promoData.success) {
                      promoMessage.textContent = ` ${promoData.message}`;
                      promoMessage.style.color = "red";
                      return;
                  }
  
                  // ✅ Apply 5% Discount
                  finalPrice = parseFloat(promoData.finalAmount);
                  document.getElementById("final-price").textContent = `₹${finalPrice}`;
                  promoMessage.textContent = ` Promo Code Applied! Discounted Price: ₹${finalPrice}`;
                  promoMessage.style.color = "green";
  
              } catch (error) {
                  console.error(" Error verifying promo code:", error);
                  promoMessage.textContent = " Failed to verify promo code. Please try again.";
                  promoMessage.style.color = "red";
              }
          });
        
        // ✅ Handle Razorpay Payment on Click
        payNowBtn.addEventListener("click", async () => {
            try {
                console.log("Creating Razorpay order...");
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

                console.log(" Razorpay Order Created:", order);

                var options = {
                    key: "rzp_live_zWGkMsnbOyIT0L", // ✅ Replace with your Razorpay Live Key  
                    amount: finalPrice,
                    currency: order.currency,
                    name: "Swarize",
                    description: productName,
                    order_id: order.orderId,
                    handler: async function (response) {
                        alert(" Payment Successful! Recording Order...");
                        console.log(" Razorpay Payment ID:", response.razorpay_payment_id);
                        const appliedPromoCode = document.getElementById("promo-code")?.value.trim() || null;

                        // ✅ Save Order in Database
                        const saveOrder = await fetch("/api/orders/create", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                                productId,
                                buyerId,  
                                paymentId: response.razorpay_payment_id,
                                promoCode: appliedPromoCode || null // ✅ Include promo code if applied

                            })
                        });

                        const saveOrderData = await saveOrder.json();
                        console.log(" Order Save Response:", saveOrderData);

                        if (!saveOrderData.success) {
                            throw new Error(saveOrderData.message || "Failed to save order.");
                        }



                         
                        

                        // ✅ Redirect to confirmation page
                        window.location.href = `payment.html?success=true&paymentId=${response.razorpay_payment_id}`;
                    },
                    prefill: { name: "Customer Name", email: userEmail }
                };

                var rzp = new Razorpay(options);
                rzp.open();
            } catch (error) {
                console.error(" Error processing payment:", error);
                messageBox.innerHTML = "Payment processing failed. Please try again.";
                messageBox.style.color = "red";
            }
        });

    } catch (error) {
        console.error(" Error checking user session/profile/bank details:", error);
        messageBox.textContent = " Error checking user information.";
        messageBox.style.color = "red";
    }
});

