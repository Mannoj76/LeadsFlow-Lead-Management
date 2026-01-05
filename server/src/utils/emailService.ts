import nodemailer from 'nodemailer';
import { AuthConfig } from '../models/AuthConfig.js';
import { logger } from './logger.js';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  async initialize(): Promise<boolean> {
    try {
      const config = await AuthConfig.findOne();
      
      if (!config?.emailAuthEnabled || !config?.emailSmtpServer) {
        logger.warn('Email service not configured');
        return false;
      }

      this.transporter = nodemailer.createTransport({
        host: config.emailSmtpServer,
        port: config.emailSmtpPort || 587,
        secure: config.emailSmtpSecure ?? true, // TLS/SSL
        auth: {
          user: config.emailSmtpUsername,
          pass: config.emailSmtpPassword,
        },
      });

      // Test connection
      const testResult = await this.testConnection();
      if (!testResult) {
        return false;
      }

      logger.info('Email service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize();
      }

      if (!this.transporter) {
        return false;
      }

      await this.transporter.verify();
      logger.info('Email SMTP connection verified');
      
      // Update config
      await AuthConfig.updateOne(
        {},
        { emailConfigValid: true, lastEmailTestAt: new Date() }
      );
      
      return true;
    } catch (error) {
      logger.error('Email connection test failed:', error);
      await AuthConfig.updateOne(
        {},
        { emailConfigValid: false }
      );
      return false;
    }
  }

  async sendVerificationEmail(
    email: string,
    verificationCode: string,
    userName: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Email service not initialized');
        }
      }

      const config = await AuthConfig.findOne();
      if (!config?.emailFromAddress) {
        throw new Error('Email from address not configured');
      }

      const mailOptions = {
        from: config.emailFromAddress,
        to: email,
        subject: 'LeadsFlow CRM - Email Verification',
        html: `
          <h2>Welcome to LeadsFlow CRM, ${userName}!</h2>
          <p>Please verify your email address using the code below:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
            ${verificationCode}
          </div>
          <p>This code will expire in 24 hours.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info('Verification email sent to:', email);
      return true;
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      return false;
    }
  }

  async sendLoginNotification(email: string, userName: string): Promise<boolean> {
    try {
      if (!this.transporter) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Email service not initialized');
        }
      }

      const config = await AuthConfig.findOne();
      if (!config?.emailFromAddress) {
        throw new Error('Email from address not configured');
      }

      const mailOptions = {
        from: config.emailFromAddress,
        to: email,
        subject: 'LeadsFlow CRM - Login Notification',
        html: `
          <h2>Login Notification</h2>
          <p>Hello ${userName},</p>
          <p>Your account was logged into on ${new Date().toLocaleString()}.</p>
          <p>If this wasn't you, please contact your administrator.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      logger.error('Failed to send login notification:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
