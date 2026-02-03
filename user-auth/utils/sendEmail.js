const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text, html, otp }) => {
    try {
        const fromEmail = "Swarize <noreply@mail.swarize.in>"; // ✅ Use your verified domain

        let finalHtml = html;

        // ✅ If OTP provided → build professional template
        if (otp) {
            finalHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>${subject}</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:20px 0;">
                    <tr>
                        <td align="center">
                            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
                                
                                <tr>
                                    <td style="padding:24px 32px;text-align:center;background:#111827;">
                                        <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:600;">
                                            Swarize Security Verification
                                        </h1>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:32px;">
                                        <p style="margin:0 0 16px 0;font-size:15px;color:#374151;">
                                            Hi there,
                                        </p>

                                        <p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.6;">
                                            Use the verification code below to continue signing in. This code is valid for <strong>10 minutes</strong>.
                                        </p>

                                        <div style="text-align:center;margin:30px 0;">
                                            <div style="display:inline-block;padding:14px 28px;font-size:28px;letter-spacing:6px;font-weight:700;color:#111827;background:#f3f4f6;border-radius:6px;border:1px solid #e5e7eb;">
                                                ${otp}
                                            </div>
                                        </div>

                                        <p style="margin:0 0 20px 0;font-size:14px;color:#6b7280;line-height:1.6;">
                                            If you didn’t request this code, you can ignore this email.
                                        </p>

                                        <p style="margin:0;font-size:14px;color:#6b7280;">
                                            For security reasons, do not share this code.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:20px 32px;text-align:center;background:#f9fafb;font-size:12px;color:#9ca3af;">
                                        © ${new Date().getFullYear()} Swarize. All rights reserved.<br/>
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
        }

        // fallback
        if (!finalHtml && text) {
            finalHtml = `<pre>${text}</pre>`;
        }

        const data = await resend.emails.send({
            from: fromEmail,
            to,
            subject,
            html: finalHtml,
        });

        console.log("📨 Resend Email Sent:", data);
        return true;

    } catch (error) {
        console.error("❌ Error sending email via Resend:", error);
        return false;
    }
};

module.exports = sendEmail;
