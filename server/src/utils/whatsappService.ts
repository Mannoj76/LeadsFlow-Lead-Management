import axios from 'axios';
import { AuthConfig } from '../models/AuthConfig.js';
import { logger } from './logger.js';

export interface WhatsAppMessage {
  phoneNumber: string;
  message: string;
  type: 'text' | 'template';
  templateName?: string;
  templateParams?: string[];
}

export class WhatsAppService {
  private baseUrl = 'https://graph.instagram.com/v18.0';

  async isConfigured(): Promise<boolean> {
    try {
      const config = await AuthConfig.findOne();
      return !!(
        config?.whatsappEnabled &&
        config?.whatsappAccessToken &&
        config?.whatsappPhoneNumberId
      );
    } catch (error) {
      logger.error('Error checking WhatsApp configuration:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const config = await AuthConfig.findOne();
      
      if (!config?.whatsappAccessToken || !config?.whatsappPhoneNumberId) {
        throw new Error('WhatsApp credentials not configured');
      }

      const response = await axios.get(
        `${this.baseUrl}/${config.whatsappPhoneNumberId}`,
        {
          headers: {
            Authorization: `Bearer ${config.whatsappAccessToken}`,
          },
        }
      );

      await AuthConfig.updateOne(
        {},
        { whatsappConfigValid: true, lastWhatsappTestAt: new Date() }
      );

      logger.info('WhatsApp connection verified');
      return true;
    } catch (error) {
      logger.error('WhatsApp connection test failed:', error);
      await AuthConfig.updateOne(
        {},
        { whatsappConfigValid: false }
      );
      return false;
    }
  }

  async sendVerificationCode(
    phoneNumber: string,
    verificationCode: string,
    userName: string
  ): Promise<boolean> {
    try {
      const configured = await this.isConfigured();
      if (!configured) {
        throw new Error('WhatsApp service not configured');
      }

      const config = await AuthConfig.findOne();
      if (!config?.whatsappAccessToken || !config?.whatsappPhoneNumberId) {
        throw new Error('WhatsApp credentials missing');
      }

      const message = `Hello ${userName},\n\nYour LeadsFlow CRM verification code is:\n\n${verificationCode}\n\nThis code will expire in 24 hours.`;

      const response = await axios.post(
        `${this.baseUrl}/${config.whatsappPhoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'text',
          text: {
            body: message,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${config.whatsappAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('WhatsApp verification code sent to:', phoneNumber);
      return !!response.data.messages?.[0]?.id;
    } catch (error) {
      logger.error('Failed to send WhatsApp verification code:', error);
      return false;
    }
  }

  async sendLoginNotification(phoneNumber: string, userName: string): Promise<boolean> {
    try {
      const configured = await this.isConfigured();
      if (!configured) {
        return false;
      }

      const config = await AuthConfig.findOne();
      if (!config?.whatsappAccessToken || !config?.whatsappPhoneNumberId) {
        throw new Error('WhatsApp credentials missing');
      }

      const message = `Hello ${userName},\n\nYou logged into LeadsFlow CRM on ${new Date().toLocaleString()}.\n\nIf this wasn't you, contact your administrator.`;

      await axios.post(
        `${this.baseUrl}/${config.whatsappPhoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'text',
          text: {
            body: message,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${config.whatsappAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return true;
    } catch (error) {
      logger.error('Failed to send WhatsApp login notification:', error);
      return false;
    }
  }

  async handleWebhook(data: any): Promise<boolean> {
    try {
      const config = await AuthConfig.findOne();
      if (!config?.whatsappWebhookToken) {
        throw new Error('Webhook token not configured');
      }

      // Verify webhook token
      const token = data.token;
      if (token !== config.whatsappWebhookToken) {
        logger.warn('Invalid WhatsApp webhook token');
        return false;
      }

      logger.info('WhatsApp webhook received:', data);
      return true;
    } catch (error) {
      logger.error('Error handling WhatsApp webhook:', error);
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();
