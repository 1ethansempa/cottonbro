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
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@700;900&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Urbanist', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border: 2px solid #000000;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; color: #ffffff;">
                COTTON BRO
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 48px 32px;">
              <h2 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #000000;">
                YOUR LOGIN CODE
              </h2>
              
              <!-- Code Box with offset shadow effect -->
              <div style="position: relative; margin: 24px 0 32px 0;">
                <table cellpadding="0" cellspacing="0" style="margin-left: 4px; margin-top: 4px;">
                  <tr>
                    <td style="background-color: #FDE2E4; border: 2px solid #000000; padding: 24px 40px; text-align: center;">
                      <span style="font-size: 48px; font-weight: 900; letter-spacing: 8px; color: #000000; font-family: 'Urbanist', monospace;">
                        ${code}
                      </span>
                    </td>
                  </tr>
                </table>
                <!-- Shadow layer (positioned behind) -->
                <div style="position: absolute; top: 8px; left: 8px; right: -4px; bottom: -4px; background-color: #000000; z-index: -1;"></div>
              </div>
              
              <!-- Expiry tag -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #E5383B; padding: 6px 12px;">
                    <span style="font-size: 11px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: #ffffff;">
                      EXPIRES IN 10 MIN
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="border-top: 2px solid #000000; padding: 24px 32px; background-color: #FAFAFA;">
              <p style="margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #666666; line-height: 1.6;">
                IF YOU DIDN'T REQUEST THIS CODE, YOU CAN SAFELY IGNORE THIS EMAIL.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Bottom branding -->
        <p style="margin-top: 24px; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #666666;">
          BUILT FOR CREATORS • COTTONBRO.COM
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
