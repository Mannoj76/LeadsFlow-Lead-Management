# Troubleshooting Guide: Users Not Displaying

## Problem Summary

Users are not displaying properly in the LeadsFlow CRM application. The MongoDB database contains user data, but the frontend Users page is not showing them.

---

## Root Causes Identified

### 1. **Frontend Using localStorage Instead of API**
- **Issue**: The `UsersPage` component was importing `userService` from `dataService.ts` (localStorage-based) instead of `apiService.ts` (API-based)
- **Impact**: Frontend was reading from localStorage instead of fetching from MongoDB
- **Fix**: Updated import to use `apiService.ts`

### 2. **Backend Schema Mismatch**
- **Issue**: Backend User model had `email` as primary identifier, but frontend expected `username`
- **Impact**: Type mismatch between frontend and backend
- **Fix**: Updated backend User model to include `username` field and made `email` optional

### 3. **Missing Async/Await**
- **Issue**: Service calls in frontend were not awaited
- **Impact**: Data not loaded properly
- **Fix**: Added `async/await` to all service calls

### 4. **Backend Server Not Running**
- **Issue**: Backend server on port 5000 was not running or had port conflicts
- **Impact**: API requests failing
- **Fix**: Killed conflicting process and restarted server

---

## Changes Made

### Backend Changes

#### 1. **Updated User Model** (`server/src/models/User.ts`)
```typescript
// Added fields:
- username: string (required, unique)
- phone?: string (optional)
- department?: string (optional)
- lastLogin?: Date (optional)

// Changed fields:
- email: string -> email?: string (now optional)
- role: 'admin' | 'sales' -> 'admin' | 'manager' | 'sales'
```

#### 2. **Updated User Routes** (`server/src/routes/users.ts`)
- GET `/api/users` - Returns all user fields including username
- GET `/api/users/:id` - Returns single user with all fields
- POST `/api/users` - Creates user with username (required)
- PUT `/api/users/:id` - Updates user fields including username
- DELETE `/api/users/:id` - Deletes user

#### 3. **Updated Auth Routes** (`server/src/routes/auth.ts`)
- POST `/api/auth/login` - Accepts username OR email for login
- Updates `lastLogin` timestamp on successful login
- Returns full user object with all fields

#### 4. **Updated Auth Middleware** (`server/src/middleware/auth.ts`)
- JWT payload includes `username` instead of `email`
- Supports 'manager' role

### Frontend Changes

#### 1. **Updated UsersPage** (`src/app/components/UsersPage.tsx`)
```typescript
// Changed import:
import { userService } from '../services/apiService'; // Was: dataService

// Made all service calls async:
const loadUsers = async () => {
  const allUsers = await userService.getAll();
  setUsers(allUsers);
};

const handleSubmit = async (e: React.FormEvent) => {
  await userService.create(userData);
  await loadUsers();
};
```

---

## Migration Steps

### Step 1: Run Migration Script
```bash
cd server
npx tsx src/scripts/migrate-add-username.ts
```

This script:
- Adds `username` field to all existing users
- Generates username from email (prefix before @)
- Ensures all usernames are unique

### Step 2: Start Backend Server
```bash
cd server
npm run dev
```

Expected output:
```
Connected to MongoDB database: leadsflow
Database connected successfully
LeadsFlow CRM Server running on port 5000
```

### Step 3: Start Frontend
```bash
npm run dev
```

Expected output:
```
VITE v6.3.5  ready in 724 ms
➜  Local:   http://localhost:3001/
```

### Step 4: Verify API Connection
Open browser console and check for:
- No CORS errors
- Successful API calls to `/api/users`
- Users displaying in the Users page

---

## Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3001
- [ ] MongoDB connected successfully
- [ ] Migration script completed
- [ ] All users have `username` field
- [ ] Users page displays all users from database
- [ ] Can create new user
- [ ] Can edit existing user
- [ ] Can delete user
- [ ] Can toggle user active/inactive status

---

## Common Issues & Solutions

### Issue 1: Port 5000 Already in Use
**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /F /PID <PID>

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Issue 2: MongoDB Connection Failed
**Error**: `Failed to connect to MongoDB`

**Solution**:
1. Check MongoDB is running: `mongosh`
2. Verify connection string in `server/.env`
3. Check database name matches

### Issue 3: Users Still Not Displaying
**Possible Causes**:
1. Frontend still using old dataService
2. Backend not returning data
3. CORS issues

**Debug Steps**:
```bash
# Check API endpoint directly
curl http://localhost:5000/api/users

# Check browser console for errors
# Check Network tab for API calls
```

### Issue 4: Authentication Errors
**Error**: `Authentication required` or `Invalid token`

**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Login again
3. Check JWT token in localStorage: `localStorage.getItem('auth_token')`

---

## API Endpoints Reference

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Authentication
- `POST /api/auth/login` - Login (username or email + password)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (required, unique),
  name: String (required),
  email: String (optional),
  phone: String (optional),
  password: String (required, hashed),
  role: String (admin|manager|sales),
  department: String (optional),
  isActive: Boolean,
  lastLogin: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Next Steps

1. **Run Migration**: Execute the migration script to add username to existing users
2. **Restart Backend**: Restart the backend server to apply schema changes
3. **Test Frontend**: Verify users display correctly
4. **Update Other Components**: Check if other components (Leads, Dashboard, etc.) need similar updates

---

**Last Updated**: 2026-01-03  
**Status**: Ready for testing

