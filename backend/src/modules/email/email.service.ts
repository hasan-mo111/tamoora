// backend/src/modules/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private readonly fromAddress: string;
  private readonly fromName: string;
  private readonly enabled: boolean;
  private isDemoMode: boolean = false; // ✅ حذفت readonly

  constructor(private readonly configService: ConfigService) {
    this.fromAddress =
      this.configService.get<string>('EMAIL_FROM_ADDRESS') ||
      'onboarding@resend.dev';
    this.fromName =
      this.configService.get<string>('EMAIL_FROM_NAME') || 'منصة طامورة';
    this.enabled =
      this.configService.get<string>('EMAIL_ENABLED', 'true') === 'true';

    if (!this.enabled) {
      this.logger.warn('📧 Email service is DISABLED via EMAIL_ENABLED=false');
      this.isDemoMode = true;
      return;
    }

    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    // ✅ فحص شامل للـ API Key
    if (
      !apiKey ||
      apiKey === 're_xxxxxxxxxxxxx' ||
      apiKey === 're_your_key_here' ||
      apiKey.trim() === ''
    ) {
      this.logger.warn(
        '⚠️ RESEND_API_KEY is missing or placeholder - Running in DEMO mode',
      );
      this.isDemoMode = true;
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      this.logger.log('✅ Resend HTTP API initialized successfully');
      this.logger.log(`📧 From: ${this.fromName} <${this.fromAddress}>`);
    } catch (error: any) {
      this.logger.error(`❌ Failed to initialize Resend: ${error.message}`);
      this.isDemoMode = true;
    }
  }

  async sendOtpEmail(
    email: string,
    code: string,
    expiresMinutes: number = 10,
  ): Promise<boolean> {
    // ✅ وضع Demo
    if (this.isDemoMode || !this.resend) {
      this.logger.warn(`📧 [DEMO MODE] OTP for ${email}: ${code}`);
      this.logger.warn(
        `📧 [DEMO MODE] This code would expire in ${expiresMinutes} minutes`,
      );
      return false;
    }

    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0070d4 0%, #0059a8 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: white; width: 70px; height: 70px; border-radius: 16px; display: inline-block; line-height: 70px; font-size: 36px; font-weight: bold; color: #0070d4; margin-bottom: 16px;">ط</div>
          <h1 style="color: white; margin: 0; font-size: 28px;">منصة طامورة</h1>
          <p style="color: #b3dfff; margin: 8px 0 0 0;">الاستثمار التشاركي الآمن</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937;">🔐 رمز التحقق الخاص بك</h2>
          <p>استخدم الرمز التالي للتحقق من بريدك الإلكتروني:</p>
          <div style="background: #f0f7ff; border: 2px dashed #0070d4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #0070d4; letter-spacing: 8px;">${code}</span>
          </div>
          <div style="background: #fffbeb; border-right: 4px solid #f59e0b; padding: 12px; border-radius: 8px;">
            <p style="color: #92400e; margin: 0;">⏱️ ينتهي صلاحية الرمز خلال <strong>${expiresMinutes} دقائق</strong></p>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">🔒 <strong>تنبيه أمني:</strong> لا تشارك هذا الرمز مع أي شخص.</p>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: 0;">
          <p style="color: #6b7280; margin: 0; font-size: 13px;">© ${new Date().getFullYear()} منصة طامورة</p>
        </div>
      </div>
    `;

    try {
      this.logger.log(`📤 Sending OTP email to: ${email}`);
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromAddress}>`,
        to: email,
        subject: `${code} هو رمز التحقق الخاص بك | منصة طامورة`,
        html,
      });

      if (error) {
        this.logger.error(`❌ Resend API error: ${error.message}`);
        this.logger.error(`❌ Error details: ${JSON.stringify(error)}`);
        return false;
      }

      this.logger.log(
        `✅ Email sent successfully via Resend | ID: ${data?.id}`,
      );
      return true;
    } catch (error: any) {
      this.logger.error(`❌ Failed to send email: ${error.message}`);
      this.logger.error(`❌ Stack: ${error.stack}`);
      return false;
    }
  }

  async sendWelcomeEmail(
    email: string,
    firstName: string,
  ): Promise<boolean> {
    if (this.isDemoMode || !this.resend) {
      this.logger.warn(`📧 [DEMO MODE] Welcome email for: ${email}`);
      return false;
    }

    try {
      const { error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromAddress}>`,
        to: email,
        subject: `مرحباً ${firstName} في منصة طامورة 🎉`,
        html: `<div dir="rtl" style="font-family: Arial; padding: 20px;"><h1 style="color: #0070d4;">مرحباً ${firstName}! 👋</h1><p>شكراً لانضمامك إلى منصة طامورة.</p></div>`,
      });

      if (error) {
        this.logger.error(`❌ Welcome email error: ${error.message}`);
        return false;
      }
      return true;
    } catch (error: any) {
      this.logger.error(`❌ Welcome email failed: ${error.message}`);
      return false;
    }
  }
}
