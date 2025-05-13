document.getElementById("contactForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;
    const responseMessage = document.getElementById("responseMessage");

    responseMessage.textContent = "Sending message...";
    responseMessage.style.color = "#007bff"; // Blue color while sending

    try {
        const response = await fetch("https://swarize.in/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message }),
        });

        const data = await response.json();

        if (response.ok) {
            responseMessage.textContent = "Message sent successfully! ";
            responseMessage.style.color = "green";
            document.getElementById("contactForm").reset(); // Clear the form
        } else {
            responseMessage.textContent = data.error || "Something went wrong! ";
            responseMessage.style.color = "red";
        }
    } catch (error) {
        responseMessage.textContent = "Failed to send message. Please try again later. ";
        responseMessage.style.color = "red";
    }
});
