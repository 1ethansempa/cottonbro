import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { createTransport, type Transporter } from "nodemailer";

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      console.warn("[MailService] SMTP_USER or SMTP_PASS not configured");
    }

    // Zoho SMTP settings
    this.transporter = createTransport({
      host: process.env.SMTP_HOST || "smtp.zoho.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  }

  /**
   * Sends an OTP code email to the user
   */
  async sendOtpEmail(to: string, code: string): Promise<void> {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "support@cottonbro.com";

    try {
      await this.transporter.sendMail({
        from: `"Cotton Bro" <${from}>`,
        to,
        subject: "YOUR LOGIN CODE",
        text: `YOUR VERIFICATION CODE: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.\n\n— COTTON BRO`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@500;700;900&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Urbanist', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #000000; border: 1px solid #333333; border-radius: 24px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 0 32px 0; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; color: #ffffff;">
                COTTON BRO
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 48px 40px; text-align: center;">
              <h2 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase;">
                One-Time Password
              </h2>
              
              <p style="margin: 0 0 32px 0; font-size: 14px; color: #ffffff; line-height: 1.6;">
                Enter this code to sign in to your creative studio.
              </p>
              
              <!-- Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #111111; border: 1px solid #333333; border-radius: 16px; padding: 24px 48px;">
                          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #22D3EE; font-family: monospace;">
                            ${code}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 32px 0 0 0; font-size: 12px; color: #6B7280;">
                This code expires in 10 minutes.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Footer -->
        <p style="margin-top: 32px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #404040;">
          COTTONBRO.COM • BUILT FOR CREATORS
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      });
      console.log(`[MailService] OTP email sent to ${to}`);
    } catch (err) {
      console.error("[MailService] Failed to send OTP email:", err);
      throw new InternalServerErrorException("Failed to send verification email");
    }
  }
}
