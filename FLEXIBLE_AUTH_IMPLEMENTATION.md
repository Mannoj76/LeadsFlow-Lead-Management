# Flexible Authentication Configuration System

## Overview

LeadsFlow CRM now supports a flexible, configurable authentication system with multiple authentication methods:

1. **Username/Password** (Primary - Always Available)
   - Traditional username or email with password login
   - Reliable fallback method
   - No additional configuration required

2. **Email-Based Authentication** (Optional)
   - Users receive verification codes via email
   - Requires SMTP server configuration
   - Email validation workflow with OTP codes

3. **WhatsApp Authentication** (Optional)
   - Users receive verification codes via WhatsApp
   - Requires WhatsApp Business API integration
   - SMS/OTP verification via WhatsApp

## Architecture

### Database Models

#### AuthConfig Model
Stores authentication method configurations and settings:

```typescript
{
  // Email Configuration
  emailAuthEnabled: boolean;
  emailSmtpServer: string;
  emailSmtpPort: number;
  emailSmtpUsername: string;
  emailSmtpPassword: string;
  emailSmtpSecure: boolean; // TLS/SSL
  emailFromAddress: string;
  emailVerificationRequired: boolean;
  emailConfigValid: boolean; // Last test result
  
  // WhatsApp Configuration
  whatsappEnabled: boolean;
  whatsappBusinessAccountId: string;
  whatsappPhoneNumberId: string;
  whatsappAccessToken: string;
  whatsappWebhookToken: string;
  whatsappConfigValid: boolean; // Last test result
  
  // Tracking
  lastEmailTestAt: Date;
  lastWhatsappTestAt: Date;
}
```

### Backend Services

#### EmailService (`/server/src/utils/emailService.ts`)
Handles email operations:

- `initialize()` - Initialize SMTP transporter from configuration
- `testConnection()` - Verify SMTP connectivity
- `sendVerificationEmail()` - Send OTP verification code
- `sendLoginNotification()` - Send login alert email (optional)

#### WhatsAppService (`/server/src/utils/whatsappService.ts`)
Handles WhatsApp operations:

- `isConfigured()` - Check if WhatsApp is enabled and configured
- `testConnection()` - Verify WhatsApp API connectivity
- `sendVerificationCode()` - Send OTP via WhatsApp
- `sendLoginNotification()` - Send login alert via WhatsApp
- `handleWebhook()` - Process WhatsApp webhooks

### API Endpoints

#### Authentication Configuration Routes (`/api/config/auth`)

**GET /api/config/auth**
Returns current authentication configuration (non-sensitive fields)

Response:
```json
{
  "emailAuthEnabled": true,
  "emailVerificationRequired": false,
  "emailConfigValid": true,
  "whatsappEnabled": false,
  "whatsappConfigValid": false,
  "lastEmailTestAt": "2026-01-05T12:00:00Z"
}
```

**POST /api/config/auth/email**
Update email configuration

Request:
```json
{
  "emailAuthEnabled": true,
  "emailSmtpServer": "smtp.gmail.com",
  "emailSmtpPort": 587,
  "emailSmtpUsername": "your-email@gmail.com",
  "emailSmtpPassword": "app-password",
  "emailSmtpSecure": true,
  "emailFromAddress": "noreply@leadsflow.com",
  "emailVerificationRequired": false
}
```

**POST /api/config/auth/email/test**
Test email SMTP connectivity

Response:
```json
{
  "success": true,
  "message": "Email service is working"
}
```

**POST /api/config/auth/whatsapp**
Update WhatsApp configuration

Request:
```json
{
  "whatsappEnabled": true,
  "whatsappBusinessAccountId": "123456789",
  "whatsappPhoneNumberId": "987654321",
  "whatsappAccessToken": "your-access-token",
  "whatsappWebhookToken": "your-webhook-token"
}
```

**POST /api/config/auth/whatsapp/test**
Test WhatsApp API connectivity

**GET /api/config/auth/methods**
Get available authentication methods

Response:
```json
{
  "methods": {
    "username": {
      "enabled": true,
      "name": "Username/Password",
      "requiresVerification": false,
      "configValid": true
    },
    "email": {
      "enabled": true,
      "name": "Email",
      "requiresVerification": false,
      "configValid": true
    },
    "whatsapp": {
      "enabled": false,
      "name": "WhatsApp",
      "requiresVerification": true,
      "configValid": false
    }
  }
}
```

#### Authentication Routes

**POST /api/auth/email/request-code**
Request email verification code

Request:
```json
{
  "email": "user@example.com"
}
```

**POST /api/auth/email/verify-code**
Verify email code and login

Request:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**POST /api/auth/whatsapp/request-code**
Request WhatsApp verification code

Request:
```json
{
  "phoneNumber": "+11234567890"
}
```

**POST /api/auth/whatsapp/verify-code**
Verify WhatsApp code and login

Request:
```json
{
  "phoneNumber": "+11234567890",
  "code": "123456"
}
```

### Frontend Components

#### AuthConfigSettings Component
Admin panel for configuring authentication methods:

- **Email Configuration Section**
  - Toggle email authentication on/off
  - Configure SMTP server, port, username, password
  - Enable/disable TLS/SSL
  - Set "From" email address
  - Test SMTP connection with visual feedback
  - Display last test timestamp

- **WhatsApp Configuration Section**
  - Toggle WhatsApp authentication on/off
  - Configure WhatsApp Business Account ID
  - Configure Phone Number ID and Access Token
  - Set Webhook Token
  - Test WhatsApp API connectivity
  - Display last test timestamp

#### Enhanced LoginPage Component
Multi-method login interface:

- **Authentication Method Tabs**
  - Username/Password tab (always available)
  - Email tab (if configured and valid)
  - WhatsApp tab (if configured and valid)
  - Visual indicators for unconfigured methods

- **Username/Password Tab**
  - Standard login form
  - Password visibility toggle
  - Demo credentials display

- **Email Tab**
  - Two-step workflow:
    1. Enter email address → Send verification code
    2. Enter verification code → Login
  - Option to switch emails

- **WhatsApp Tab**
  - Two-step workflow:
    1. Enter phone number → Send verification code via WhatsApp
    2. Enter verification code → Login
  - Option to switch phone numbers
  - Country code reminder

#### AuthConfigService (`/src/app/services/authConfigService.ts`)
Frontend service for authentication configuration:

```typescript
- getAuthMethods() - Fetch available methods
- getAuthConfig() - Fetch current configuration
- updateEmailConfig(config) - Update email settings
- testEmailConnection() - Test email SMTP
- updateWhatsAppConfig(config) - Update WhatsApp settings
- testWhatsAppConnection() - Test WhatsApp API
- sendEmailVerificationCode(email) - Request email OTP
- sendWhatsAppVerificationCode(phoneNumber) - Request WhatsApp OTP
```

## Setup Instructions

### 1. Enable Email Authentication

#### Gmail Configuration Example

1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate an App Password
4. In Admin Settings → Authentication:
   - Toggle "Email Authentication" ON
   - SMTP Server: `smtp.gmail.com`
   - SMTP Port: `587`
   - SMTP Username: `your-email@gmail.com`
   - SMTP Password: `app-password`
   - Enable TLS/SSL: Check
   - From Address: `your-email@gmail.com`
5. Click "Test Email Connection"
6. Success message indicates working configuration

#### Custom SMTP Configuration

1. Obtain SMTP server details from your email provider
2. In Admin Settings → Authentication:
   - Fill in SMTP server details
   - Configure authentication credentials
   - Test connection before saving

### 2. Enable WhatsApp Authentication

1. Register WhatsApp Business Account
2. Create and configure a Phone Number ID
3. Generate an Access Token
4. Create a Webhook Token (can be any secure string)
5. In Admin Settings → Authentication:
   - Toggle "WhatsApp Authentication" ON
   - Enter Business Account ID
   - Enter Phone Number ID
   - Enter Access Token
   - Enter Webhook Token
6. Click "Test WhatsApp Connection"
7. Success message indicates working configuration

### 3. Configure User Phone Numbers

For WhatsApp authentication to work, users must have phone numbers:

```typescript
// In User model
{
  phone: '+1234567890' // E.164 format
}
```

## Security Considerations

### Verification Codes
- **Storage**: In production, store verification codes in Redis with 24-hour expiration
- **Format**: 6-digit numeric codes
- **Reuse**: Single-use codes that expire after validation
- **Rate Limiting**: Implement rate limiting on code request/verification endpoints

### Passwords & Tokens
- **SMTP Passwords**: Never expose in API responses or logs
- **Access Tokens**: Never expose in API responses; only transmit via secure HTTPS
- **Webhook Token**: Use strong, randomly generated tokens (minimum 32 characters)

### Email Configuration
- **TLS/SSL**: Always enable for production
- **From Address**: Use verified sender address
- **Rate Limiting**: Limit email sending to 5 emails per minute per user

### WhatsApp Configuration
- **Access Token**: Rotate tokens regularly
- **Webhook Verification**: Validate webhook tokens on all incoming requests
- **Phone Number Verification**: Verify phone numbers in E.164 format

## Usage Workflows

### User Login Flow: Email Method

1. User selects "Email" login tab
2. Enters email address
3. System sends 6-digit code to email
4. User receives email with code
5. User enters code in verification field
6. System verifies code and logs user in
7. JWT token issued, user redirected to dashboard

### User Login Flow: WhatsApp Method

1. User selects "WhatsApp" login tab
2. Enters phone number with country code
3. System sends 6-digit code via WhatsApp
4. User receives WhatsApp message with code
5. User enters code in verification field
6. System verifies code and logs user in
7. JWT token issued, user redirected to dashboard

### Admin Configuration Workflow

1. Admin navigates to Settings → Authentication Configuration
2. Chooses authentication method to configure
3. Toggles method ON
4. Enters configuration details (SMTP or WhatsApp credentials)
5. Clicks "Test Connection" button
6. System displays success/failure with detailed error messages
7. Configuration saved to database
8. Users can immediately use configured method on login page

## Troubleshooting

### Email Connection Test Fails

**Symptoms**: "Connection Failed" message after test

**Solutions**:
- Verify SMTP server address and port
- Check username/password credentials
- Confirm TLS/SSL setting matches server requirements
- Check firewall/network access to SMTP server
- Review SMTP server logs for rejection reasons

### WhatsApp Connection Test Fails

**Symptoms**: "Connection Failed" message after test

**Solutions**:
- Verify access token is valid and not expired
- Confirm Phone Number ID is correct
- Check WhatsApp Business Account is active
- Verify network connectivity to WhatsApp API
- Review WhatsApp Business Platform logs

### Verification Code Not Received

**For Email**:
- Check email spam folder
- Verify email address is correct
- Check email server logs
- Verify SMTP authentication credentials

**For WhatsApp**:
- Confirm phone number format (E.164: +country-area-number)
- Verify WhatsApp account is active on that number
- Check WhatsApp Business Account message quota

### Login Always Shows Username/Password Tab

**Causes**:
- Email/WhatsApp authentication not enabled
- Configuration test failed (method marked as invalid)

**Solutions**:
- Enable desired authentication method
- Run connectivity test
- Fix configuration issues revealed by test
- Refresh login page

## Future Enhancements

1. **SMS Authentication**: Add SMS OTP via Twilio
2. **Social Login**: Add Google, Microsoft, GitHub OAuth
3. **Biometric Authentication**: Add fingerprint/face recognition
4. **Two-Factor Authentication**: Require additional verification for all methods
5. **Session Management**: Add device management and remote logout
6. **Login History**: Track all login attempts and methods used
7. **Passwordless**: Enable passwordless phone-based authentication
8. **Rate Limiting**: Implement progressive delays on failed attempts

## API Rate Limits

- **Login Attempts**: 5 per minute per IP
- **Verification Code Requests**: 3 per minute per email/phone
- **Configuration Updates**: 10 per hour per admin user
- **Connection Tests**: 5 per minute (to avoid API quota issues)

## Support

For issues with authentication configuration:

1. Check connection tests return success
2. Review error messages in admin panel
3. Check server logs for detailed error information
4. Verify credentials and configuration details
5. Contact email/SMS provider support if tests fail

## Files Modified/Created

**Created:**
- `/server/src/models/AuthConfig.ts` - Authentication configuration schema
- `/server/src/utils/emailService.ts` - Email service utility
- `/server/src/utils/whatsappService.ts` - WhatsApp service utility
- `/server/src/routes/authConfig.ts` - Authentication configuration routes
- `/src/app/services/authConfigService.ts` - Frontend auth service
- `/src/app/components/AuthConfigSettings.tsx` - Admin settings UI

**Modified:**
- `/server/src/index.ts` - Added authConfig routes import and registration
- `/server/src/routes/auth.ts` - Added email and WhatsApp verification endpoints
- `/src/app/components/LoginPage.tsx` - Enhanced with multi-method authentication UI

## Dependencies

**Backend (New):**
- `nodemailer@^6.9.0` - Email sending
- `axios@^1.4.0` - HTTP client for WhatsApp API

**Frontend:**
- Existing: React, Lucide React for icons

---

**Last Updated**: 2026-01-05
**Version**: 1.0.0
