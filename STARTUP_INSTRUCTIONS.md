# Startup Instructions - LeadsFlow CRM

## Summary of Recent Changes

Fixed the issue where users were not displaying in the frontend:

1. **Backend Schema Updated** - Added `username` field to User model
2. **Frontend Updated** - Changed to use API service instead of localStorage  
3. **API Integration Fixed** - All service calls now properly async/await
4. **Vite Proxy Configured** - Frontend proxies `/api` requests to backend

---

## Quick Start

### 1. Start MongoDB
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### 2. Run Migration (First Time Only)
```bash
cd server
npx tsx src/scripts/migrate-add-username.ts
```

This adds `username` field to existing users.

### 3. Start Backend
```bash
cd server
npm run dev
```

Expected: `LeadsFlow CRM Server running on port 5000`

### 4. Start Frontend
```bash
npm run dev
```

Expected: `Local: http://localhost:3001/`

### 5. Access Application
Open browser: `http://localhost:3001`

---

## Verification

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3001
- [ ] MongoDB connected
- [ ] Users displaying in Users page
- [ ] Can create/edit/delete users

---

## Troubleshooting

**Port 5000 in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /F /PID <PID>
```

**MongoDB not connected:**
- Check MongoDB is running: `mongosh`
- Verify `server/.env` has correct connection string

**Users not displaying:**
- Check browser console for errors
- Verify backend is running: `curl http://localhost:5000/api/users`
- Clear localStorage and login again

---

## API Endpoints

### Auth
- `POST /api/auth/login` - Login (username/email + password)
- `GET /api/auth/me` - Get current user

### Users (Admin Only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Leads
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

---

## Database Schema

### Users Collection
```javascript
{
  username: String (required, unique),  // Login identifier
  name: String (required),              // Full name
  email: String (optional),             // Optional email
  phone: String (optional),             // Optional phone
  password: String (required, hashed),  // Hashed password
  role: String (admin|manager|sales),   // User role
  department: String (optional),        // Department
  isActive: Boolean,                    // Account status
  lastLogin: Date (optional),           // Last login
  createdAt: Date,
  updatedAt: Date
}
```

---

For detailed troubleshooting, see `TROUBLESHOOTING_USERS_DISPLAY.md`

**Last Updated:** 2026-01-03

