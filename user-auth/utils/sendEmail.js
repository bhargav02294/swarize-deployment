const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const BRAND_NAME = "Swarize";
const BRAND_COLOR = "#2563eb"; // professional blue
const SUPPORT_EMAIL = "support@swarize.in";

const buildOtpTemplate = (otp, expiryMinutes = 10) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding:26px 32px;text-align:center;background:${BRAND_COLOR};">
              <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:600;">
                ${BRAND_NAME} Verification Code
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:15px;color:#374151;">
                Hello,
              </p>

              <p style="margin:0 0 22px;font-size:15px;color:#374151;line-height:1.6;">
                Use the verification code below to securely continue. This code will expire in 
                <strong>${expiryMinutes} minutes</strong>.
              </p>

              <div style="text-align:center;margin:30px 0;">
                <div style="display:inline-block;padding:16px 30px;font-size:30px;letter-spacing:8px;font-weight:700;color:#111827;background:#eef2ff;border-radius:8px;border:1px solid #e0e7ff;">
                  ${otp}
                </div>
              </div>

              <p style="margin:0 0 18px;font-size:14px;color:#6b7280;line-height:1.6;">
                If you did not request this code, you can safely ignore this email. Someone else may have entered your email address by mistake.
              </p>

              <p style="margin:0;font-size:14px;color:#6b7280;">
                For security reasons, never share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;text-align:center;background:#f9fafb;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.<br/>
              Need help? Contact <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_COLOR};text-decoration:none;">${SUPPORT_EMAIL}</a><br/>
              This is an automated message — please do not reply.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const sendEmail = async ({ to, subject, text, html, otp, expiryMinutes }) => {
  try {
    const fromEmail = `${BRAND_NAME} <noreply@mail.swarize.in>`;

    let finalHtml = html;
    let finalText = text;

    // If OTP exists → build professional template
    if (otp) {
      finalHtml = buildOtpTemplate(otp, expiryMinutes || 10);
      finalText = `Your ${BRAND_NAME} verification code is: ${otp}. This code expires in ${expiryMinutes || 10} minutes.`;
    }

    // Fallback if only text provided
    if (!finalHtml && text) {
      finalHtml = `<pre>${text}</pre>`;
    }

    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: finalHtml,
      text: finalText, // improves inbox delivery
    });

    console.log("📨 Resend Email Sent:", data);
    return true;

  } catch (error) {
    console.error("❌ Error sending email via Resend:", error);
    return false;
  }
};

module.exports = sendEmail;
