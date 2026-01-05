# Flexible Authentication - Quick Start Guide

## For Administrators

### Accessing Authentication Settings

1. Login as admin user
2. Click **Settings** in the sidebar
3. Scroll to **"Authentication Configuration"** section
4. Three cards appear: Username, Email, WhatsApp

### Enabling Email Authentication

**Prerequisites**: SMTP server credentials (Gmail, SendGrid, custom SMTP, etc.)

**Steps**:
1. Click **"Enable"** on Email card
2. Fill in SMTP Details:
   - **SMTP Server**: `smtp.gmail.com` (for Gmail)
   - **SMTP Port**: `587` (for Gmail with TLS)
   - **SMTP Username**: `your-email@gmail.com`
   - **SMTP Password**: `app-password` (Gmail) or SMTP password
   - **Enable TLS/SSL**: ✓ (Check)
   - **From Address**: `noreply@company.com`
3. Click **"Test Email Connection"**
4. Green checkmark = Success, Red X = Failed
5. Configuration auto-saves on test success

**Gmail Setup Example**:
```
SMTP Server: smtp.gmail.com
Port: 587
Username: your.email@gmail.com
Password: Your App Password (generate at myaccount.google.com/apppasswords)
TLS/SSL: Enabled
From Address: your.email@gmail.com
```

### Enabling WhatsApp Authentication

**Prerequisites**: 
- WhatsApp Business Account
- Phone Number registered with WhatsApp Business
- Meta Business Platform access

**Steps**:
1. Click **"Enable"** on WhatsApp card
2. Fill in WhatsApp Details:
   - **Business Account ID**: (from Meta Business Platform)
   - **Phone Number ID**: (from WhatsApp Business Account settings)
   - **Access Token**: (generate from Meta Business Platform)
   - **Webhook Token**: (create any secure string, e.g., `abc123xyz789...`)
3. Click **"Test WhatsApp Connection"**
4. Green checkmark = Success, Red X = Failed
5. Configuration auto-saves on test success

**Webhook Token Example**:
Use any secure random string, e.g.:
```
wh_abc123xyz789qwertyuiopasdfghjkl
```

### Disabling Authentication Methods

1. Click **"Disable"** button on any method card
2. Method is immediately disabled
3. Users cannot use this method on login page

### Testing Connectivity

- **Email**: Click "Test Email Connection" button
  - Verifies SMTP server accessibility
  - Confirms authentication credentials
  - Updates last tested timestamp

- **WhatsApp**: Click "Test WhatsApp Connection" button
  - Verifies WhatsApp Business API access
  - Confirms credentials and permissions
  - Updates last tested timestamp

---

## For End Users

### Login Methods

After admin configures authentication, users see multiple login tabs:

#### Username/Password (Always Available)
1. Click **Username** tab
2. Enter username or email
3. Enter password
4. Click **Sign In**
5. Redirected to dashboard

#### Email Verification (if enabled)
1. Click **Email** tab
2. Enter your email address
3. Click **Send Verification Code**
4. Check your email for 6-digit code
5. Copy code and enter in verification field
6. Click **Verify Code**
7. Redirected to dashboard

#### WhatsApp Verification (if enabled)
1. Click **WhatsApp** tab
2. Enter phone number with country code: `+1 (555) 123-4567` or `+15551234567`
3. Click **Send Verification Code via WhatsApp**
4. Check WhatsApp for message with 6-digit code
5. Copy code and enter in verification field
6. Click **Verify Code**
7. Redirected to dashboard

**Phone Number Format**: Include country code, e.g.
- USA: `+1` prefix
- India: `+91` prefix
- UK: `+44` prefix
- See: https://en.wikipedia.org/wiki/List_of_country_calling_codes

### Troubleshooting

**"Email authentication not available"**
- Admin has not enabled email authentication
- Email service test failed (invalid SMTP settings)
- Contact your admin to configure email

**"WhatsApp authentication not available"**
- Admin has not enabled WhatsApp authentication
- WhatsApp service test failed (invalid API credentials)
- Contact your admin to configure WhatsApp

**"Didn't receive verification code"**
- Check spam/junk folder (email)
- Check WhatsApp chat history (WhatsApp)
- Ensure email/phone number is correct
- Click "Send Verification Code" again
- Contact your admin if problem persists

**"Verification code invalid"**
- Code expires after 24 hours
- Code is single-use (can't reuse same code)
- Request a new code and try again
- Ensure code typed exactly as received

---

## Common Scenarios

### Scenario 1: Admin Sets Up Gmail Email Login

**What Admin Does**:
1. Settings → Authentication Configuration
2. Email card → Enable
3. Enter Gmail credentials (generate app password)
4. Test connection → ✓ Success
5. Enable on production

**What Users See**:
- Email tab appears on login page
- Can login with email + verification code
- Code sent to their email address

### Scenario 2: Admin Adds WhatsApp for Support Team

**What Admin Does**:
1. Create WhatsApp Business Account
2. Register phone number with WhatsApp
3. Generate Meta Platform access token
4. Settings → Authentication Configuration
5. WhatsApp card → Enable
6. Enter credentials and test
7. Enable on production

**What Users See**:
- WhatsApp tab appears on login page (if phone number configured)
- Can login using WhatsApp verification
- Gets OTP via WhatsApp message

### Scenario 3: Disable Email, Keep Username Only

**What Admin Does**:
1. Settings → Authentication Configuration
2. Email card → Disable
3. Email tab disappears immediately

**What Users See**:
- Only Username and WhatsApp tabs available
- Email login option removed
- Must use username/password or WhatsApp

---

## Configuration Checklist

### Email Setup Checklist
- [ ] SMTP server address obtained
- [ ] SMTP port confirmed (typically 587 or 465)
- [ ] Username and password/app-password obtained
- [ ] TLS/SSL setting matches server requirements
- [ ] From address configured
- [ ] Test connection successful
- [ ] Email tested with actual address
- [ ] Users can receive verification codes

### WhatsApp Setup Checklist
- [ ] WhatsApp Business Account created
- [ ] Phone number registered with WhatsApp
- [ ] Meta Business Platform access confirmed
- [ ] Business Account ID obtained
- [ ] Phone Number ID obtained
- [ ] Access Token generated
- [ ] Webhook Token created and documented
- [ ] Test connection successful
- [ ] WhatsApp messages received on test

---

## Best Practices

1. **Always Test Before Enabling**
   - Use "Test Connection" button
   - Confirm green checkmark before enabling

2. **Keep Credentials Secure**
   - Don't share SMTP passwords
   - Don't share WhatsApp access tokens
   - Use app-specific passwords (Gmail)

3. **Monitor Configuration**
   - Check "Last tested" timestamps
   - Re-test monthly to catch credential expiration
   - Watch for failed test results

4. **User Communication**
   - Inform users of available login methods
   - Provide country codes for WhatsApp (USA = +1, etc.)
   - Document which method to use for support requests

5. **Fallback Planning**
   - Always keep username/password enabled
   - Have alternative email if email auth fails
   - Test WhatsApp separately before announcing

6. **Security**
   - Verify email addresses during signup
   - Verify phone numbers during WhatsApp setup
   - Implement rate limiting on code requests
   - Monitor failed verification attempts

---

## Support Contacts

**Email Configuration Issues**
- Gmail: Ensure "Less secure app" is off and app password generated
- SendGrid: Verify API key and SMTP credentials
- Custom SMTP: Check with your email provider

**WhatsApp Configuration Issues**
- Meta Business Support: https://business.facebook.com/help
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp

**General Issues**
- Contact your LeadsFlow CRM administrator
- Check authentication configuration test results
- Review error messages in settings panel

---

**Last Updated**: 2026-01-05
**Version**: 1.0.0
