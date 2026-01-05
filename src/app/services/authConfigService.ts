import { apiClient } from './apiClient';

export interface AuthMethod {
  enabled: boolean;
  name: string;
  requiresVerification: boolean;
  configValid: boolean;
}

export interface AuthMethods {
  username: AuthMethod;
  email: AuthMethod;
  whatsapp: AuthMethod;
}

export interface AuthConfig {
  emailAuthEnabled: boolean;
  emailVerificationRequired: boolean;
  emailConfigValid: boolean;
  whatsappEnabled: boolean;
  whatsappConfigValid: boolean;
  lastEmailTestAt?: string;
  lastWhatsappTestAt?: string;
}

export const authConfigService = {
  // Get available authentication methods
  async getAuthMethods(): Promise<AuthMethods> {
    try {
      const response = await apiClient.get('/config/auth/methods');
      return response.data.methods;
    } catch (error) {
      console.error('Error fetching auth methods:', error);
      // Return default methods if API fails
      return {
        username: {
          enabled: true,
          name: 'Username/Password',
          requiresVerification: false,
          configValid: true,
        },
        email: {
          enabled: false,
          name: 'Email',
          requiresVerification: false,
          configValid: false,
        },
        whatsapp: {
          enabled: false,
          name: 'WhatsApp',
          requiresVerification: true,
          configValid: false,
        },
      };
    }
  },

  // Get current auth configuration
  async getAuthConfig(): Promise<AuthConfig> {
    try {
      const response = await apiClient.get('/config/auth');
      return response.data;
    } catch (error) {
      console.error('Error fetching auth config:', error);
      return {
        emailAuthEnabled: false,
        emailVerificationRequired: false,
        emailConfigValid: false,
        whatsappEnabled: false,
        whatsappConfigValid: false,
      };
    }
  },

  // Update email configuration
  async updateEmailConfig(config: {
    emailAuthEnabled: boolean;
    emailSmtpServer: string;
    emailSmtpPort: number;
    emailSmtpUsername: string;
    emailSmtpPassword: string;
    emailSmtpSecure: boolean;
    emailFromAddress: string;
    emailVerificationRequired: boolean;
  }) {
    return apiClient.post('/config/auth/email', config);
  },

  // Test email connectivity
  async testEmailConnection(): Promise<boolean> {
    try {
      const response = await apiClient.post('/config/auth/email/test', {});
      return response.data.success;
    } catch (error) {
      console.error('Error testing email:', error);
      return false;
    }
  },

  // Update WhatsApp configuration
  async updateWhatsAppConfig(config: {
    whatsappEnabled: boolean;
    whatsappBusinessAccountId: string;
    whatsappPhoneNumberId: string;
    whatsappAccessToken: string;
    whatsappWebhookToken: string;
  }) {
    return apiClient.post('/config/auth/whatsapp', config);
  },

  // Test WhatsApp connectivity
  async testWhatsAppConnection(): Promise<boolean> {
    try {
      const response = await apiClient.post('/config/auth/whatsapp/test', {});
      return response.data.success;
    } catch (error) {
      console.error('Error testing WhatsApp:', error);
      return false;
    }
  },

  // Send verification code via email
  async sendEmailVerificationCode(email: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/config/auth/email/send-code', {
        email,
      });
      return response.data.success;
    } catch (error) {
      console.error('Error sending email code:', error);
      return false;
    }
  },

  // Send verification code via WhatsApp
  async sendWhatsAppVerificationCode(phoneNumber: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/config/auth/whatsapp/send-code', {
        phoneNumber,
      });
      return response.data.success;
    } catch (error) {
      console.error('Error sending WhatsApp code:', error);
      return false;
    }
  },
};
