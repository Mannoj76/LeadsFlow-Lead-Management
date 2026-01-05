import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import CryptoJS from 'crypto-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Encryption key for sensitive data (generated during setup)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  mongodb: {
    uri: process.env.MONGODB_URI || '',
    databaseName: process.env.DATABASE_NAME || 'leadsflow',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
    expiresIn: '7d',
  },
  
  license: {
    key: process.env.LICENSE_KEY || '',
  },
  
  app: {
    name: process.env.APP_NAME || 'LeadsFlow CRM',
    setupCompleted: process.env.SETUP_COMPLETED === 'true',
  },
};

// Configuration file path for encrypted settings
const CONFIG_FILE_PATH = path.join(__dirname, '../../config.encrypted.json');

export interface EncryptedConfig {
  mongodbUri: string;
  databaseName: string;
  jwtSecret: string;
  licenseKey: string;
  setupCompleted: boolean;
  companyName: string;
  companyEmail: string;
  adminEmail: string;
  createdAt: string;
}

// Encrypt data
export function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

// Decrypt data
export function decryptData(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Save encrypted configuration
export function saveEncryptedConfig(configData: EncryptedConfig): void {
  const encrypted = encryptData(JSON.stringify(configData));
  fs.writeFileSync(CONFIG_FILE_PATH, encrypted, 'utf-8');
}

// Load encrypted configuration
export function loadEncryptedConfig(): EncryptedConfig | null {
  try {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      return null;
    }
    const encrypted = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
    const decrypted = decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error loading encrypted config:', error);
    return null;
  }
}

// Update environment variables from encrypted config
export function updateConfigFromEncrypted(): boolean {
  const encryptedConfig = loadEncryptedConfig();
  if (!encryptedConfig) {
    return false;
  }
  
  // Update in-memory config
  config.mongodb.uri = encryptedConfig.mongodbUri;
  config.mongodb.databaseName = encryptedConfig.databaseName;
  config.jwt.secret = encryptedConfig.jwtSecret;
  config.license.key = encryptedConfig.licenseKey;
  config.app.setupCompleted = encryptedConfig.setupCompleted;
  
  return true;
}

// Check if setup is required
export function isSetupRequired(): boolean {
  // Check if encrypted config exists and is valid
  const encryptedConfig = loadEncryptedConfig();
  if (!encryptedConfig || !encryptedConfig.setupCompleted) {
    return true;
  }
  
  // Validate required fields
  if (!encryptedConfig.mongodbUri || !encryptedConfig.licenseKey) {
    return true;
  }
  
  return false;
}

// Initialize configuration on startup
updateConfigFromEncrypted();

