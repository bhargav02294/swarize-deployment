const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend
 * @param {Object} options
 * @param {String} options.to
 * @param {String} options.subject
 * @param {String} options.text
 * @param {String} [options.html]
 */
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const fromEmail = process.env.FROM_EMAIL || "Devalayaum <noreply@resend.dev>";

        const data = await resend.emails.send({
            from: fromEmail,
            to,
            subject,
            html: html || `<pre>${text}</pre>`
        });

        console.log("📨 Resend Email Sent:", data);
        return true;
    } catch (error) {
        console.error("❌ Error sending email via Resend:", error);
        return false;
    }
};

module.exports = sendEmail;
