import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthConfig extends Document {
  // Primary auth method (always enabled)
  primaryMethod: 'username-password';
  
  // Email authentication settings
  emailAuthEnabled: boolean;
  emailSmtpServer?: string;
  emailSmtpPort?: number;
  emailSmtpUsername?: string;
  emailSmtpPassword?: string;
  emailSmtpSecure?: boolean; // TLS/SSL
  emailFromAddress?: string;
  emailVerificationRequired?: boolean;
  
  // WhatsApp integration settings
  whatsappEnabled: boolean;
  whatsappBusinessAccountId?: string;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  whatsappWebhookToken?: string;
  
  // Status tracking
  emailConfigValid?: boolean;
  whatsappConfigValid?: boolean;
  lastEmailTestAt?: Date;
  lastWhatsappTestAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const AuthConfigSchema = new Schema<IAuthConfig>(
  {
    primaryMethod: {
      type: String,
      default: 'username-password',
      immutable: true,
    },
    
    // Email config
    emailAuthEnabled: {
      type: Boolean,
      default: false,
    },
    emailSmtpServer: {
      type: String,
      sparse: true,
    },
    emailSmtpPort: {
      type: Number,
      sparse: true,
    },
    emailSmtpUsername: {
      type: String,
      sparse: true,
    },
    emailSmtpPassword: {
      type: String,
      sparse: true,
    },
    emailSmtpSecure: {
      type: Boolean,
      default: true,
    },
    emailFromAddress: {
      type: String,
      sparse: true,
    },
    emailVerificationRequired: {
      type: Boolean,
      default: true,
    },
    emailConfigValid: {
      type: Boolean,
      default: false,
    },
    lastEmailTestAt: {
      type: Date,
      sparse: true,
    },
    
    // WhatsApp config
    whatsappEnabled: {
      type: Boolean,
      default: false,
    },
    whatsappBusinessAccountId: {
      type: String,
      sparse: true,
    },
    whatsappPhoneNumberId: {
      type: String,
      sparse: true,
    },
    whatsappAccessToken: {
      type: String,
      sparse: true,
    },
    whatsappWebhookToken: {
      type: String,
      sparse: true,
    },
    whatsappConfigValid: {
      type: Boolean,
      default: false,
    },
    lastWhatsappTestAt: {
      type: Date,
      sparse: true,
    },
  },
  { timestamps: true }
);

export const AuthConfig = mongoose.model<IAuthConfig>('AuthConfig', AuthConfigSchema, 'auth_configs');
