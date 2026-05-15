import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { createTransport, type Transporter } from "nodemailer";

@Injectable()
export class MailService {
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

  async sendOtpEmail(to: string, code: string): Promise<void> {
    const safeTo = to.replace(/[\r\n]/g, "");

    try {
      await this.transporter.sendMail({
        from: `"Cotton Bro" <${this.fromAddress}>`,
        to: safeTo,
        subject: "Your login code",
        text: `Use ${code} to continue to Cotton Bro.\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.\n\n— Cotton Bro`,
        html: renderOtpHtml(code),
      });

      console.log(`[MailService] OTP email sent to ${safeTo}`);
    } catch (err) {
      console.error("[MailService] Failed to send OTP email:", err);
      throw new InternalServerErrorException(
        "Failed to send verification email",
      );
    }
  }

  async sendAccountReinstatementEmail(
    to: string,
    restoreUrl: string,
    expiresAt: Date,
  ): Promise<void> {
    const safeTo = to.replace(/[\r\n]/g, "");
    const expiryText = expiresAt.toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    try {
      await this.transporter.sendMail({
        from: `"Cotton Bro" <${this.fromAddress}>`,
        to: safeTo,
        subject: "Restore your Cotton Bro account",
        text: `We received a request to restore a deleted Cotton Bro account.\n\nRestore your account here: ${restoreUrl}\n\nThis restore link is available until ${expiryText}.\n\nIf you didn't request this, you can ignore this email. Your account will remain deleted.\n\n— Cotton Bro`,
        html: renderAccountReinstatementHtml(restoreUrl, expiryText),
      });

      console.log(
        `[MailService] Account reinstatement email sent to ${safeTo}`,
      );
    } catch (err) {
      console.error(
        "[MailService] Failed to send account reinstatement email:",
        err,
      );
      throw new InternalServerErrorException(
        "Failed to send account reinstatement email",
      );
    }
  }

  async sendWelcomeEmail(to: string, preferencesUrl: string): Promise<void> {
    const safeTo = to.replace(/[\r\n]/g, "");

    try {
      await this.transporter.sendMail({
        from: `"Cotton Bro" <${this.fromAddress}>`,
        to: safeTo,
        subject: "Welcome to Cotton Bro",
        text: `Welcome to Cotton Bro.\n\nYour account is ready. You can manage whether you receive marketing updates, creator inspiration, and campaign ideas here: ${preferencesUrl}\n\nMarketing emails are optional. You can opt in or change your preference anytime.\n\n— Cotton Bro`,
        html: renderWelcomeHtml(preferencesUrl),
      });

      console.log(`[MailService] Welcome email sent to ${safeTo}`);
    } catch (err) {
      console.error("[MailService] Failed to send welcome email:", err);
      throw new InternalServerErrorException("Failed to send welcome email");
    }
  }
}

function renderWelcomeHtml(preferencesUrl: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Urbanist:wght@500;700;900&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: 'DM Sans', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 40px 18px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 28px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
          <tr>
            <td style="padding: 24px 30px; border-bottom: 1px solid #eeeeee;">
              <h1 style="margin: 0; font-family: 'Urbanist', Arial, sans-serif; font-size: 18px; font-weight: 900; letter-spacing: -0.02em; line-height: 1; text-transform: uppercase; color: #000000;">
                COTTON<span style="color: #e60000;">BRO</span><span style="display: inline-block; margin-left: 4px; width: 8px; height: 8px; border-radius: 999px; background-color: #e60000;"></span>
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 54px 30px 42px 30px;">
              <p style="margin: 0 0 18px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; line-height: 1.5; text-transform: uppercase; color: #737373;">
                Account ready
              </p>
              <h2 style="margin: 0; max-width: 470px; font-family: 'Urbanist', Arial, sans-serif; font-size: 54px; font-weight: 700; letter-spacing: 0; line-height: 0.92; color: #000000;">
                Welcome to Cotton Bro.
              </h2>
              <p style="margin: 26px 0 0 0; max-width: 430px; font-size: 15px; font-weight: 500; line-height: 1.75; color: #5f5f5f;">
                Your account is ready. Marketing emails are optional, and you can choose whether to receive product updates, inspiration, and campaign ideas.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-top: 28px;">
                <tr>
                  <td style="background-color: #000000; border-radius: 999px;">
                    <a href="${preferencesUrl}" style="display: inline-block; padding: 17px 28px; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; border-radius: 999px;">
                      Manage email preferences
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #111111; padding: 24px 30px;">
              <p style="margin: 0; font-size: 12px; font-weight: 500; line-height: 1.7; color: #d4d4d4;">
                You can opt in, opt out, or change this preference anytime from your account settings.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderAccountReinstatementHtml(
  restoreUrl: string,
  expiryText: string,
) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Urbanist:wght@500;700;900&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: 'DM Sans', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 40px 18px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 28px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
          <tr>
            <td style="padding: 24px 30px; border-bottom: 1px solid #eeeeee;">
              <h1 style="margin: 0; font-family: 'Urbanist', Arial, sans-serif; font-size: 18px; font-weight: 900; letter-spacing: -0.02em; line-height: 1; text-transform: uppercase; color: #000000;">
                COTTON<span style="color: #e60000;">BRO</span><span style="display: inline-block; margin-left: 4px; width: 8px; height: 8px; border-radius: 999px; background-color: #e60000;"></span>
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 54px 30px 42px 30px;">
              <p style="margin: 0 0 18px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; line-height: 1.5; text-transform: uppercase; color: #737373;">
                Account restoration
              </p>
              <h2 style="margin: 0; max-width: 470px; font-family: 'Urbanist', Arial, sans-serif; font-size: 54px; font-weight: 700; letter-spacing: 0; line-height: 0.92; color: #000000;">
                Restore your account.
              </h2>
              <p style="margin: 26px 0 0 0; max-width: 430px; font-size: 15px; font-weight: 500; line-height: 1.75; color: #5f5f5f;">
                We received a request to restore a deleted account. You can restore it within 30 days and continue where you left off.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-top: 28px;">
                <tr>
                  <td style="background-color: #000000; border-radius: 999px;">
                    <a href="${restoreUrl}" style="display: inline-block; padding: 17px 28px; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; border-radius: 999px;">
                      Restore my account
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0 0; font-size: 12px; font-weight: 600; line-height: 1.7; color: #737373;">
                This link is available until ${expiryText}.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #111111; padding: 24px 30px;">
              <p style="margin: 0; font-size: 12px; font-weight: 500; line-height: 1.7; color: #d4d4d4;">
                If you did not request this, you can ignore this email. Your account will remain deleted.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderOtpHtml(code: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Urbanist:wght@500;700;900&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: 'DM Sans', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 40px 18px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 28px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
          <tr>
            <td style="padding: 24px 30px; border-bottom: 1px solid #eeeeee;">
              <h1 style="margin: 0; font-family: 'Urbanist', Arial, sans-serif; font-size: 18px; font-weight: 900; letter-spacing: -0.02em; line-height: 1; text-transform: uppercase; color: #000000;">
                COTTON<span style="color: #e60000;">BRO</span><span style="display: inline-block; margin-left: 4px; width: 8px; height: 8px; border-radius: 999px; background-color: #e60000;"></span>
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 54px 30px 38px 30px;">
              <p style="margin: 0 0 18px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; line-height: 1.5; text-transform: uppercase; color: #737373;">
                Secure account access
              </p>
              <h2 style="margin: 0; max-width: 470px; font-family: 'Urbanist', Arial, sans-serif; font-size: 56px; font-weight: 700; letter-spacing: 0; line-height: 0.92; color: #000000;">
                Continue to Cotton Bro.
              </h2>
              <p style="margin: 24px 0 0 0; max-width: 410px; font-size: 15px; font-weight: 500; line-height: 1.75; color: #5f5f5f;">
                Use this one-time code to sign in or create your account.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #111111; padding: 34px 30px 38px 30px;">
              <p style="margin: 0 0 18px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; line-height: 1.5; text-transform: uppercase; color: #a3a3a3;">
                One-time password
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #333333; border-radius: 20px; border-collapse: separate; border-spacing: 0; overflow: hidden;">
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
                Enter this code to continue to your Cotton Bro account.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #e60000; padding: 16px 30px;">
              <p style="margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; line-height: 1.5; color: #ffffff;">
                This code expires in 10 minutes
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 30px; border-top: 1px solid #e5e5e5;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 0 18px 0; border-bottom: 1px solid #e5e5e5;">
                    <p style="margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; line-height: 1.5; color: #000000;">
                      This code can be used once to sign in to Cotton Bro.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 0 0 0;">
                    <p style="margin: 0; font-size: 12px; font-weight: 500; line-height: 1.7; color: #737373;">
                      If you did not request this, you can ignore this email. Your account stays protected.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin: 28px 0 0 0; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; line-height: 1.5; color: #a3a3a3;">
          Cottonbro.com
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
