import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENCRYPTION_KEY = 'default-key-change-in-production';
const CONFIG_FILE_PATH = path.join(__dirname, '../../config.encrypted.json');

function decryptData(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

try {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
        console.log('Encrypted config file not found at:', CONFIG_FILE_PATH);
        process.exit(0);
    }
    const encrypted = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
    const decrypted = decryptData(encrypted);
    const config = JSON.parse(decrypted);

    console.log('--- ACTUAL BACKEND CONFIGURATION ---');
    console.log('MongoDB URI:', config.mongodbUri);
    console.log('Database Name:', config.databaseName);
    console.log('Company Name:', config.companyName);
    console.log('Admin Email:', config.adminEmail);
    console.log('------------------------------------');
} catch (error) {
    console.error('Error decrypting config:', error);
}
