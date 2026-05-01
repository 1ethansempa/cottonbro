import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from "@nestjs/common";
import { createTransport, type Transporter } from "nodemailer";

@Injectable()
export class MailService implements OnModuleInit {
  private readonly transporter: Transporter;
  private readonly fromAddress: string;

  constructor() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const from = process.env.SMTP_FROM || user;

    if (!host) throw new Error("[MailService] SMTP_HOST is not configured");
    if (!port) throw new Error("[MailService] SMTP_PORT is not configured");
    if (!user) throw new Error("[MailService] SMTP_USER is not configured");
    if (!pass) throw new Error("[MailService] SMTP_PASS is not configured");
    if (!from) throw new Error("[MailService] SMTP_FROM is not configured");

    const portNum = Number(port);
    if (!Number.isFinite(portNum) || portNum <= 0) {
      throw new Error("[MailService] SMTP_PORT must be a valid number");
    }

    // 465 = TLS on connect, 587 = STARTTLS (secure: false)
    const secure = portNum === 465;

    this.fromAddress = from;

    this.transporter = createTransport({
      host,
      port: portNum,
      secure,
      auth: { user, pass },
      //Max time to establish the TCP connection.
      connectionTimeout: 10_000,
      //If the SMTP host is unreachable or firewalled, your request fails fast instead of hanging indefinitely.
      greetingTimeout: 10_000,
      //Max idle time for the socket during the whole SMTP conversation.
      socketTimeout: 20_000,
      // Optional: helps with bursts; safe to keep on
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    });
  }

  async onModuleInit() {
    // Fail fast if credentials/host/port are wrong
    await this.transporter.verify();
  }

  async sendOtpEmail(to: string, code: string): Promise<void> {
    const safeTo = to.replace(/[\r\n]/g, "");

    try {
      await this.transporter.sendMail({
        from: `"Cotton Bro" <${this.fromAddress}>`,
        to: safeTo,
        subject: "Your login code",
        text: `YOUR VERIFICATION CODE: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.\n\n— COTTON BRO`,
        html: renderOtpHtml(code),
      });

      console.log(`[MailService] OTP email sent to ${safeTo}`);
    } catch (err) {
      console.error("[MailService] Failed to send OTP email:", err);
      throw new InternalServerErrorException(
        "Failed to send verification email"
      );
    }
  }
}

function renderOtpHtml(code: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@500;700;900&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Urbanist', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e5e5e5; border-collapse: collapse;">
          <tr>
            <td style="padding: 22px 28px; border-bottom: 1px solid #e5e5e5;">
              <h1 style="margin: 0; font-size: 18px; font-weight: 900; letter-spacing: -0.02em; line-height: 1; text-transform: uppercase; color: #000000;">
                COTTON BRO
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 44px 28px 36px 28px;">
              <p style="margin: 0 0 18px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; line-height: 1.5; text-transform: uppercase; color: #737373;">
                Create your brand. Design. Launch. Get paid.
              </p>
              <h2 style="margin: 0; max-width: 430px; font-size: 48px; font-weight: 900; letter-spacing: -0.04em; line-height: 0.9; text-transform: uppercase; color: #000000;">
                Enter your<br>studio code.
              </h2>
            </td>
          </tr>
          <tr>
            <td style="background-color: #111111; padding: 34px 28px 38px 28px;">
              <p style="margin: 0 0 18px 0; font-size: 10px; font-weight: 900; letter-spacing: 0.3em; line-height: 1.5; text-transform: uppercase; color: #a3a3a3;">
                One-time password
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #333333; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="background-color: #000000; padding: 26px 20px;">
                          <span style="font-size: 38px; font-weight: 900; letter-spacing: 0.24em; line-height: 1; color: #ffffff; font-family: 'Courier New', Courier, monospace;">
                            ${code}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin: 22px 0 0 0; font-size: 13px; font-weight: 500; color: #d4d4d4; line-height: 1.7;">
                Enter this code to sign in and keep building your next drop.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #e60000; padding: 16px 28px;">
              <p style="margin: 0; font-size: 10px; font-weight: 900; letter-spacing: 0.2em; line-height: 1.5; text-transform: uppercase; color: #ffffff;">
                This code expires in 10 minutes
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px; border-top: 1px solid #e5e5e5;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 0 18px 0; border-bottom: 1px solid #e5e5e5;">
                    <p style="margin: 0; font-size: 10px; font-weight: 900; letter-spacing: 0.2em; line-height: 1.5; text-transform: uppercase; color: #000000;">
                      Design. Create. Sell. Earn.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 0 0 0;">
                    <p style="margin: 0; font-size: 12px; font-weight: 500; line-height: 1.7; color: #737373;">
                      If you didn't request this, you can ignore this email. Your account stays protected.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin: 28px 0 0 0; font-size: 10px; font-weight: 900; letter-spacing: 0.2em; line-height: 1.5; text-transform: uppercase; color: #a3a3a3;">
          Cottonbro.com &bull; Built for creators
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
