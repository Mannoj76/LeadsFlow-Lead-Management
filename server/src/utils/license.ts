import CryptoJS from 'crypto-js';
import { logger } from './logger.js';

// License validation secret (should match the key used to generate licenses)
const LICENSE_SECRET = 'LEADSFLOW_LICENSE_SECRET_2024';

export interface LicenseData {
  productId: string;
  purchaseCode: string;
  customerEmail: string;
  issuedAt: string;
  expiresAt?: string; // Optional for lifetime licenses
  features: string[];
  maxUsers?: number;
}

export interface LicenseValidationResult {
  valid: boolean;
  error?: string;
  data?: LicenseData;
}

/**
 * Validate a license key
 * License format: BASE64(ENCRYPTED(JSON_DATA))
 */
export function validateLicense(licenseKey: string): LicenseValidationResult {
  try {
    if (!licenseKey || licenseKey.trim().length === 0) {
      return { valid: false, error: 'License key is required' };
    }

    // Decode from base64
    const encryptedData = Buffer.from(licenseKey, 'base64').toString('utf-8');
    
    // Decrypt the license data
    const decrypted = CryptoJS.AES.decrypt(encryptedData, LICENSE_SECRET).toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      return { valid: false, error: 'Invalid license key format' };
    }

    // Parse license data
    const licenseData: LicenseData = JSON.parse(decrypted);

    // Validate required fields
    if (!licenseData.productId || !licenseData.purchaseCode || !licenseData.customerEmail) {
      return { valid: false, error: 'Invalid license data' };
    }

    // Check if license is for LeadsFlow CRM
    if (licenseData.productId !== 'LEADSFLOW_CRM') {
      return { valid: false, error: 'License is not valid for this product' };
    }

    // Check expiration if applicable
    if (licenseData.expiresAt) {
      const expirationDate = new Date(licenseData.expiresAt);
      const now = new Date();
      
      if (now > expirationDate) {
        return { valid: false, error: 'License has expired' };
      }
    }

    logger.info('License validated successfully', { 
      customerEmail: licenseData.customerEmail,
      purchaseCode: licenseData.purchaseCode.substring(0, 8) + '...'
    });

    return { valid: true, data: licenseData };
  } catch (error: any) {
    logger.error('License validation error:', error);
    return { valid: false, error: 'Invalid license key' };
  }
}

/**
 * Generate a license key (for testing purposes)
 * In production, this should be done by a separate license generation service
 */
export function generateLicense(data: LicenseData): string {
  const jsonData = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonData, LICENSE_SECRET).toString();
  return Buffer.from(encrypted).toString('base64');
}

/**
 * Generate a test license for development
 */
export function generateTestLicense(): string {
  const testLicenseData: LicenseData = {
    productId: 'LEADSFLOW_CRM',
    purchaseCode: 'TEST-' + Date.now(),
    customerEmail: 'test@example.com',
    issuedAt: new Date().toISOString(),
    features: ['all'],
    maxUsers: 100,
  };
  
  return generateLicense(testLicenseData);
}

/**
 * Check if license allows a specific feature
 */
export function hasFeature(licenseData: LicenseData, feature: string): boolean {
  return licenseData.features.includes('all') || licenseData.features.includes(feature);
}

/**
 * Check if license allows adding more users
 */
export function canAddUser(licenseData: LicenseData, currentUserCount: number): boolean {
  if (!licenseData.maxUsers) {
    return true; // Unlimited users
  }
  return currentUserCount < licenseData.maxUsers;
}

