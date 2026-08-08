import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { env } from "@/common/config/env";

/**
 * Thin singleton wrapper around nodemailer.
 *
 * All email sending flows through this class so transport configuration
 * is defined in exactly one place.
 */
export class MailerService {
  private static transporter: Transporter;

  /**
   * Lazily initialise and reuse a single nodemailer transport instance.
   */
  private static getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }

    return this.transporter;
  }

  /**
   * Send an email.
   *
   * @param options - Standard nodemailer mail options (to, subject, html, …).
   */
  static async sendMail(options: SendMailOptions): Promise<void> {
    await this.getTransporter().sendMail({
      from: env.SMTP_FROM,
      ...options,
    });
  }
}
