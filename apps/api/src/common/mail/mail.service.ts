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
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Urbanist', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #000000; border: 1px solid #333333; border-radius: 24px; overflow: hidden;">
          <tr>
            <td style="padding: 40px 0 32px 0; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; color: #ffffff;">
                COTTON BRO
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 48px 40px; text-align: center;">
              <h2 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase;">
                One-Time Password
              </h2>
              <p style="margin: 0 0 32px 0; font-size: 14px; color: #ffffff; line-height: 1.6;">
                Enter this code to sign in to your creative studio.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #111111; border: 1px solid #333333; border-radius: 16px; padding: 24px 48px;">
                          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #93C5FD; font-family: monospace;">
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
        <p style="margin-top: 32px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #404040;">
          COTTONBRO.COM • BUILT FOR CREATORS
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
