# Flexible Authentication System - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LOGIN PAGE                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Authentication Method Tabs                       │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │   │
│  │  │  Username   │ │    Email    │ │  WhatsApp   │        │   │
│  │  │ (Always ON) │ │  (Dynamic)  │ │  (Dynamic)  │        │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘        │   │
│  │         ↓              ↓               ↓                  │   │
│  │  [LoginForm]   [EmailForm]    [WhatsAppForm]            │   │
│  │  user+pass     email+code     phone+code               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         ↓                   ↓                   ↓
┌───────────────────────────────────────────────────────────────────┐
│                    FRONTEND SERVICES                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ authConfigService: getAuthMethods(), testConnections()  │   │
│  │ apiClient: login(), makeRequest()                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
         ↓                   ↓                   ↓
  ┌─────────────────────────────────────────────────────────────┐
  │              HTTP API (Port 5001)                           │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │ /api/auth/                                           │   │
  │  │   POST /login (username + password)                  │   │
  │  │   POST /email/request-code (email)                   │   │
  │  │   POST /email/verify-code (email + code)             │   │
  │  │   POST /whatsapp/request-code (phone)                │   │
  │  │   POST /whatsapp/verify-code (phone + code)          │   │
  │  │                                                      │   │
  │  │ /api/config/auth/ (ADMIN)                            │   │
  │  │   GET / (fetch config)                               │   │
  │  │   POST /email (save email config)                    │   │
  │  │   POST /email/test (test SMTP)                       │   │
  │  │   POST /whatsapp (save WhatsApp config)              │   │
  │  │   POST /whatsapp/test (test WhatsApp)                │   │
  │  │   GET /methods (get available methods)               │   │
  │  └──────────────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────────────┘
         ↓                   ↓                   ↓
  ┌─────────────────────────────────────────────────────────────┐
  │              BACKEND SERVICES                              │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │                                                      │   │
  │  │  EmailService              WhatsAppService          │   │
  │  │  ├─ initialize()           ├─ isConfigured()        │   │
  │  │  ├─ testConnection()       ├─ testConnection()      │   │
  │  │  ├─ sendVerificationEmail()├─ sendVerificationCode()│   │
  │  │  └─ sendLoginNotification()└─ handleWebhook()       │   │
  │  │                                                      │   │
  │  │  AuthConfig Model                                    │   │
  │  │  ├─ Email Settings                                   │   │
  │  │  ├─ WhatsApp Settings                                │   │
  │  │  └─ Status Tracking                                  │   │
  │  └──────────────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────────────┘
         ↓                   ↓                   ↓
  ┌─────────────────────────────────────────────────────────────┐
  │              EXTERNAL SERVICES                              │
  │  ┌──────────────────────────────────────────────────────┐   │
  │  │                                                      │   │
  │  │  SMTP Server (Gmail, SendGrid, etc.)                │   │
  │  │  ├─ Receives: sendVerificationEmail()               │   │
  │  │  └─ Sends: Email with OTP code                      │   │
  │  │                                                      │   │
  │  │  WhatsApp Business API                              │   │
  │  │  ├─ Receives: sendVerificationCode()                │   │
  │  │  └─ Sends: WhatsApp message with OTP code           │   │
  │  │                                                      │   │
  │  │  MongoDB (AuthConfig Collection)                    │   │
  │  │  ├─ Stores: Email/WhatsApp configuration            │   │
  │  │  └─ Updates: Test results & timestamps              │   │
  │  └──────────────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Username/Password Login Flow
```
User Input (username/email + password)
    ↓
LoginPage.handleUsernamePasswordLogin()
    ↓
apiClient.login(credential, password)
    ↓
POST /api/auth/login
    ↓
auth.ts: Find user, verify password
    ↓
User found & password valid
    ↓
Generate JWT token
    ↓
Return token + user data
    ↓
Store token in localStorage
    ↓
Redirect to Dashboard
```

### Email Verification Flow
```
User Input (email)
    ↓
LoginPage.handleEmailVerificationRequest()
    ↓
authConfigService.sendEmailVerificationCode(email)
    ↓
POST /api/config/auth/email/send-code
    ↓
authConfig.ts: Find user by email
    ↓
Generate 6-digit code
    ↓
emailService.sendVerificationEmail()
    ↓
SMTP Server sends email to user
    ↓
Return code sent confirmation
    ↓
User receives email with code
    ↓
User Input (verification code)
    ↓
LoginPage: code verification state
    ↓
authConfigService.verifyEmailCode() [FUTURE]
    ↓
POST /api/auth/email/verify-code
    ↓
auth.ts: Verify code, authenticate user
    ↓
Generate JWT token
    ↓
Return token + user data
    ↓
Redirect to Dashboard
```

### WhatsApp Verification Flow
```
User Input (phone number)
    ↓
LoginPage.handleWhatsappVerificationRequest()
    ↓
authConfigService.sendWhatsAppVerificationCode(phoneNumber)
    ↓
POST /api/config/auth/whatsapp/send-code
    ↓
authConfig.ts: Lookup user by phone [FUTURE]
    ↓
Generate 6-digit code
    ↓
whatsappService.sendVerificationCode()
    ↓
WhatsApp Business API sends message to user
    ↓
Return code sent confirmation
    ↓
User receives WhatsApp message with code
    ↓
User Input (verification code)
    ↓
LoginPage: code verification state
    ↓
authConfigService.verifyWhatsAppCode() [FUTURE]
    ↓
POST /api/auth/whatsapp/verify-code
    ↓
auth.ts: Verify code, authenticate user
    ↓
Generate JWT token
    ↓
Return token + user data
    ↓
Redirect to Dashboard
```

### Admin Configuration Flow
```
Admin navigates to Settings → Authentication Configuration
    ↓
AuthConfigSettings component loads
    ↓
authConfigService.getAuthConfig()
    ↓
GET /api/config/auth
    ↓
authConfig.ts: Returns current configuration
    ↓
Component displays current settings
    ↓
Admin toggles Email Auth ON
    ↓
AuthConfigSettings: emailAuthEnabled = true
    ↓
Admin fills in SMTP Server, Port, Username, Password
    ↓
Admin clicks "Test Email Connection"
    ↓
authConfigService.testEmailConnection()
    ↓
POST /api/config/auth/email/test
    ↓
emailService.testConnection()
    ↓
nodemailer.verify() → SMTP server
    ↓
Connection successful or failed
    ↓
Return success/failure to component
    ↓
Display green checkmark or red X
    ↓
Admin saves configuration
    ↓
authConfigService.updateEmailConfig(newConfig)
    ↓
POST /api/config/auth/email
    ↓
authConfig.ts: Save to database
    ↓
Configuration persisted
    ↓
Users see Email tab on login page
```

## Component Interaction Map

### Frontend Components
```
App.tsx (Main App)
├─ LoginPage.tsx
│  ├─ Uses: authConfigService
│  ├─ Uses: apiClient
│  ├─ Uses: useAuth context
│  └─ Renders: Method tabs + login forms
│
└─ SettingsPage.tsx [Future]
   ├─ Renders: AuthConfigSettings
   └─ Uses: authConfigService
      ├─ getAuthConfig()
      ├─ updateEmailConfig()
      ├─ testEmailConnection()
      ├─ updateWhatsAppConfig()
      └─ testWhatsAppConnection()
```

### Backend Modules
```
index.ts (Express App)
├─ Imports: authConfigRoutes
├─ Registers: /api/config routes
│
├─ routes/auth.ts
│  ├─ POST /login (username/password)
│  ├─ POST /email/request-code
│  ├─ POST /email/verify-code
│  ├─ POST /whatsapp/request-code
│  └─ POST /whatsapp/verify-code
│
├─ routes/authConfig.ts
│  ├─ GET /auth (get config)
│  ├─ POST /auth/email (save email config)
│  ├─ POST /auth/email/test (test SMTP)
│  ├─ POST /auth/whatsapp (save WhatsApp config)
│  ├─ POST /auth/whatsapp/test (test WhatsApp)
│  └─ GET /auth/methods (get available methods)
│
├─ models/AuthConfig.ts
│  └─ Mongoose schema for configuration
│
├─ utils/emailService.ts
│  ├─ initialize()
│  ├─ testConnection()
│  ├─ sendVerificationEmail()
│  └─ sendLoginNotification()
│
└─ utils/whatsappService.ts
   ├─ isConfigured()
   ├─ testConnection()
   ├─ sendVerificationCode()
   ├─ sendLoginNotification()
   └─ handleWebhook()
```

## Configuration State Machine

```
Initial State: Email/WhatsApp Disabled
    ↓
Admin toggles Email ON
    ↓
Email Enabled (but not configured)
    ↓
Admin fills SMTP details
    ↓
Admin clicks Test Connection
    ↓
    ├─ Success → emailConfigValid = true → Email Available on Login
    └─ Failure → emailConfigValid = false → Email Disabled on Login
    ↓
Admin toggles Email OFF
    ↓
Email Disabled (Email tab hidden from users)
    ↓
Configuration persisted to database
```

## Security Boundaries

```
┌─────────────────────────────────────────────────┐
│           UNAUTHENTICATED USERS                 │
│  ├─ POST /api/auth/login                        │
│  ├─ POST /api/auth/email/request-code           │
│  ├─ POST /api/auth/email/verify-code            │
│  ├─ POST /api/auth/whatsapp/request-code        │
│  ├─ POST /api/auth/whatsapp/verify-code         │
│  └─ GET /api/config/auth/methods                │
└─────────────────────────────────────────────────┘
                     ↑↓
    [JWT Token & Authentication Context]
                     ↑↓
┌─────────────────────────────────────────────────┐
│           AUTHENTICATED USERS                   │
│  ├─ GET /api/config/auth                        │
│  └─ All other protected routes                  │
└─────────────────────────────────────────────────┘
                     ↑↓
    [Admin Role Check]
                     ↑↓
┌─────────────────────────────────────────────────┐
│           ADMIN USERS ONLY                      │
│  ├─ POST /api/config/auth/email                 │
│  ├─ POST /api/config/auth/email/test            │
│  ├─ POST /api/config/auth/whatsapp              │
│  ├─ POST /api/config/auth/whatsapp/test         │
│  └─ Settings page access                        │
└─────────────────────────────────────────────────┘
```

## Database Schema

```
MongoDB Collections
│
├─ users (existing)
│  ├─ _id: ObjectId
│  ├─ username: String (unique)
│  ├─ email: String
│  ├─ password: String (hashed)
│  ├─ phone: String [OPTIONAL - for WhatsApp]
│  └─ ... other fields
│
└─ authconfigs (new - singleton pattern)
   ├─ _id: ObjectId
   ├─ emailAuthEnabled: Boolean
   ├─ emailSmtpServer: String
   ├─ emailSmtpPort: Number
   ├─ emailSmtpUsername: String
   ├─ emailSmtpPassword: String
   ├─ emailSmtpSecure: Boolean
   ├─ emailFromAddress: String
   ├─ emailVerificationRequired: Boolean
   ├─ emailConfigValid: Boolean
   ├─ lastEmailTestAt: Date
   ├─ whatsappEnabled: Boolean
   ├─ whatsappBusinessAccountId: String
   ├─ whatsappPhoneNumberId: String
   ├─ whatsappAccessToken: String
   ├─ whatsappWebhookToken: String
   ├─ whatsappConfigValid: Boolean
   ├─ lastWhatsappTestAt: Date
   ├─ createdAt: Date
   └─ updatedAt: Date
```

## Dependency Graph

### Backend Dependencies
```
auth.ts
├─ Depends: AuthConfig model
├─ Depends: emailService
├─ Depends: whatsappService
├─ Depends: User model
└─ Depends: JWT config

authConfig.ts
├─ Depends: AuthConfig model
├─ Depends: emailService
└─ Depends: whatsappService

emailService.ts
├─ Depends: AuthConfig model
├─ Depends: nodemailer
└─ Depends: logger

whatsappService.ts
├─ Depends: AuthConfig model
├─ Depends: axios
└─ Depends: logger

index.ts
├─ Imports: authConfig routes
├─ Imports: auth routes
└─ Registers: all routes
```

### Frontend Dependencies
```
LoginPage.tsx
├─ Depends: authConfigService
├─ Depends: apiClient
├─ Depends: useAuth hook
├─ Depends: UI components
└─ Depends: Lucide icons

AuthConfigSettings.tsx
├─ Depends: authConfigService
├─ Depends: UI components
└─ Depends: Lucide icons

authConfigService.ts
└─ Depends: apiClient
```

---

**This architecture ensures:**
- ✅ Separation of concerns
- ✅ Modularity and reusability
- ✅ Security boundaries
- ✅ Scalability
- ✅ Maintainability
- ✅ Clear data flow
- ✅ Extensibility for future features

**Version**: 1.0.0
**Date**: 2026-01-05
