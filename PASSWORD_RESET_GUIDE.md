# Password Reset Guide - LeadsFlow CRM

## Quick Reset (Recommended)

### Option 1: Command Line (Fastest)

Reset password for `sujeet.karn@erpca.com`:

```bash
cd server
npx tsx src/scripts/reset-password.ts sujeet.karn@erpca.com YourNewPassword123
```

**Replace `YourNewPassword123` with your desired password (min 6 characters)**

### Option 2: Interactive Mode

```bash
cd server
npx tsx src/scripts/reset-password.ts
```

Then follow the prompts:
1. Enter email or username: `sujeet.karn@erpca.com`
2. Enter new password: `YourNewPassword123`
3. Confirm: `yes`

---

## Expected Output

```
🔐 LeadsFlow CRM - Password Reset Tool

Connecting to MongoDB...
✅ Connected to MongoDB

🔍 Searching for user: sujeet.karn@erpca.com
✅ Found user: Sujeet Karn (sujeet.karn@erpca.com)
   Role: admin
   Active: true
   Username: sujeet.karn

🔒 Hashing new password with bcrypt (salt rounds: 10)...
💾 Updating password in database...
✅ Password updated successfully!

📋 Login Credentials:
   Email/Username: sujeet.karn@erpca.com
   Password: YourNewPassword123

🌐 You can now login at: http://localhost:3000

Disconnected from MongoDB
```

---

## Troubleshooting

### Error: "User not found"

Check available users:
```bash
npx tsx src/scripts/check-users.ts
```

### Error: "Cannot connect to MongoDB"

1. **Start MongoDB:**
   ```bash
   # Windows
   net start MongoDB
   
   # Or use MongoDB Compass
   ```

2. **Verify MongoDB is running:**
   ```bash
   netstat -ano | findstr :27017
   ```

3. **Check connection string in `server/.env`:**
   ```
   MONGODB_URI=mongodb://localhost:27017
   DATABASE_NAME=leadsflow
   ```

### Error: "Password must be at least 6 characters"

Use a password with 6+ characters:
```bash
npx tsx src/scripts/reset-password.ts sujeet.karn@erpca.com LongerPassword123
```

---

## Manual MongoDB Reset (Backup Method)

If the script doesn't work, you can reset the password manually:

### Step 1: Generate Password Hash

Create a file `generate-hash.js`:
```javascript
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'YourNewPassword123'; // Change this
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Password Hash:', hash);
}

generateHash();
```

Run it:
```bash
cd server
node generate-hash.js
```

Copy the hash output (starts with `$2a$10$...`)

### Step 2: Update MongoDB Directly

**Option A: Using MongoDB Compass**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select database: `leadsflow`
4. Select collection: `users`
5. Find user with email: `sujeet.karn@erpca.com`
6. Click "Edit Document"
7. Replace the `password` field value with the hash from Step 1
8. Click "Update"

**Option B: Using MongoDB Shell**
```bash
mongosh
use leadsflow
db.users.updateOne(
  { email: "sujeet.karn@erpca.com" },
  { $set: { password: "$2a$10$YOUR_HASH_HERE" } }
)
```

Replace `$2a$10$YOUR_HASH_HERE` with the hash from Step 1.

---

## Security Notes

✅ **What the script does:**
- Uses bcrypt with 10 salt rounds (same as User model)
- Hashes password before storing
- Updates `updatedAt` timestamp
- Maintains all existing user data

✅ **What it doesn't do:**
- Never stores plain text passwords
- Doesn't modify user permissions or role
- Doesn't affect other users
- Doesn't bypass authentication

---

## After Password Reset

1. **Login to the application:**
   - Go to: `http://localhost:3000`
   - Email/Username: `sujeet.karn@erpca.com`
   - Password: `YourNewPassword123` (or whatever you set)

2. **Change password in the app:**
   - Go to Settings or Profile
   - Use "Change Password" feature
   - Set a secure password

3. **Verify access:**
   - Check you can access all admin features
   - Verify Users page displays correctly
   - Test creating/editing users

---

## Future: Forgot Password Feature

To implement a proper "Forgot Password" feature, you would need:

1. **Email service** (SendGrid, AWS SES, etc.)
2. **Password reset tokens** (temporary, expiring)
3. **Reset password endpoint** (`POST /api/auth/forgot-password`)
4. **Reset password page** (frontend form)

For now, this script provides a secure way to reset passwords when needed.

---

## Support

If you encounter any issues:

1. Check MongoDB is running
2. Verify connection string in `server/.env`
3. Run `npx tsx src/scripts/check-users.ts` to see all users
4. Check server logs for errors

**Last Updated:** 2026-01-03

