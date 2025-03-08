const axios = require("axios");

// ✅ Configure WhatsApp API (Twilio, Meta, or another service)
const WHATSAPP_API_URL = "https://api.whatsapp.com/send"; // Replace with actual API URL
const WHATSAPP_API_KEY = "YOUR_WHATSAPP_API_KEY"; // Replace with your API Key

/**
 * ✅ Send a WhatsApp message with the promo code
 * @param {string} phoneNumber - User's WhatsApp number
 * @param {string} message - Message content
 */
async function sendWhatsAppMessage(phoneNumber, message) {
    try {
        const response = await axios.post(WHATSAPP_API_URL, {
            phone: phoneNumber,
            text: message,
            apiKey: WHATSAPP_API_KEY,
        });

        console.log("✅ WhatsApp Message Sent:", response.data);
        return { success: true };
    } catch (error) {
        console.error("❌ Error Sending WhatsApp Message:", error.response?.data || error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { sendWhatsAppMessage };
