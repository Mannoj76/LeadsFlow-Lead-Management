# LeadsFlow CRM - Login Credentials

## ✅ Correct Login Credentials

**Use your username (NOT email) to login:**

- **Username**: `sujeet.karn`
- **Password**: `Admin@123`

## Why the Error Occurred

You were trying to login with the email address `sujeet.karn@erpca.com`, but the system was looking for the username `sujeet.karn`.

The login field accepts EITHER:
1. **Username**: `sujeet.karn` ✅ (This is what the account is stored as)
2. **Email**: `sujeet.karn@erpca.com` (Only if the account is set up with this email)

## How Backend Authentication Works

The backend searches for users using this logic:

```typescript
const user = await User.findOne({
  $or: [
    { username: email.toLowerCase() },  // Searches for username field
    { email: email.toLowerCase() }      // Also searches for email field
  ]
});
```

This means:
- If you enter `sujeet.karn` → Finds user by username ✅
- If you enter `sujeet.karn@erpca.com` → Only finds user if email is set to this ❌ (depends on how user was created)

## Try Now

1. Go to http://localhost:3000
2. Enter **username**: `sujeet.karn`  
3. Enter **password**: `Admin@123`
4. Click Sign In

If it still doesn't work, MongoDB might not be running. Check and restart it.
