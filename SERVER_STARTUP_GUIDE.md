# 🚀 LeadsFlow CRM - Server Startup Guide

## ⚡ Quick Start (Recommended)

### Option 1: PowerShell Script (Best for Development)
```powershell
.\START_SERVERS.ps1
```
✓ Automatic dependency installation
✓ Clean process management
✓ Status verification
✓ Beautiful formatted output

### Option 2: Batch Script
```bash
START_SERVERS.bat
```
✓ Works on any Windows system
✓ Opens servers in separate windows
✓ Easy to use

---

## 🔧 Manual Startup (Terminal by Terminal)

### Terminal 1: Backend Server
```powershell
cd server
npm install
npm run dev
```
Expected output:
```
2026-01-05 12:00:00 [info]: Connected to MongoDB database: leadsflow
2026-01-05 12:00:00 [info]: Database connected successfully
2026-01-05 12:00:00 [info]: LeadsFlow CRM Server running on port 5001
```

### Terminal 2: Frontend Server
```powershell
npm install
npm run dev
```
Expected output:
```
VITE v6.3.5  ready in 734 ms
➜  Local:   http://localhost:3000/
```

---

## ✅ Verification

### Check if servers are running:
```powershell
# Backend
curl http://localhost:5001/health

# Frontend
curl http://localhost:3000
```

### Expected responses:
- Backend: JSON with `{"status":"ok",...}`
- Frontend: HTML page loads

---

## 🐛 Troubleshooting

### Problem: "Port already in use"

**Solution 1: Kill existing processes**
```powershell
Get-Process node | Stop-Process -Force
Start-Sleep 2
.\START_SERVERS.ps1
```

**Solution 2: Use different ports**
```powershell
# In server/.env
PORT=5002

# In vite.config.ts
server: { port: 3001 }
```

### Problem: "npm ERR! Cannot find module"

**Solution:**
```powershell
# Clear and reinstall
rm -r server/node_modules
rm -r node_modules
npm cache clean --force
.\START_SERVERS.ps1
```

### Problem: "Database connection failed"

**Solution 1: Check MongoDB Atlas connection**
```powershell
# Verify in server/.env
MONGODB_URI=your_connection_string_here
```

**Solution 2: Test connection manually**
```powershell
cd server
npm run check-users
```

### Problem: "TypeScript compilation error"

**Solution:**
```powershell
cd server
npm run build  # Check for errors
npm run dev
```

### Problem: "Servers start but frontend is blank"

**Solution:**
```powershell
# Clear cache and rebuild
rm -r src/dist
npm cache clean --force
npm run dev
```

---

## 🚀 Production Startup

For production, use `npm run build` and `npm run start`:

### Backend Production
```powershell
cd server
npm run build
npm run start
```

### Frontend Production
```powershell
npm run build
npm run preview
```

---

## 📊 Server Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite Dev) | 3000 | http://localhost:3000 |
| Backend (Express) | 5001 | http://localhost:5001 |
| API Health | 5001 | http://localhost:5001/health |
| API Docs | 5001 | http://localhost:5001/api |

---

## 🔍 Diagnostics

Run the diagnostic script to check everything:
```powershell
.\DIAGNOSE.ps1
```

This will verify:
- Node.js and npm versions
- Project structure
- Key files existence
- Port availability
- Dependencies installation

---

## 📝 Logs and Debugging

### View backend logs
```powershell
Get-Content "server/logs/*.log" -Tail 50
```

### View server startup logs
```powershell
# The terminal window will show real-time logs
# Look for messages like:
# - "Database connected successfully"
# - "Server running on port 5001"
# - Any error messages
```

### Enable debug mode
```powershell
# In server/.env
DEBUG=leadsflow:*
LOG_LEVEL=debug
```

---

## 🎯 Common Workflows

### Development Setup
```powershell
# First time setup
npm install
cd server && npm install && cd ..

# Start development servers
.\START_SERVERS.ps1

# Frontend will be available at http://localhost:3000
# Backend will be available at http://localhost:5001
```

### Daily Development
```powershell
# Just run the startup script
.\START_SERVERS.ps1
```

### After Code Changes
```powershell
# Servers auto-reload on file changes
# Just save your files and refresh browser
```

### Testing API Endpoints
```powershell
# Login
$body = @{email="sujeet.karn@erpca.com"; password="Admin@123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -Body $body -ContentType "application/json"

# Get users (with token)
$headers = @{Authorization="Bearer YOUR_TOKEN"}
Invoke-RestMethod -Uri "http://localhost:5001/api/users" -Method GET -Headers $headers
```

---

## 🔐 Environment Setup

Create `.env` file in server directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leadsflow?retryWrites=true&w=majority
DATABASE_NAME=leadsflow

# JWT
JWT_SECRET=your_secret_key_here

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (Optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Logging
LOG_LEVEL=info
DEBUG=false
```

---

## ⚙️ Vite Configuration

Frontend runs on port 3000 with proxy to backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:5001'
  }
}
```

This means:
- Frontend calls `http://localhost:3000/api/users`
- Automatically proxies to `http://localhost:5001/api/users`

---

## 📚 Further Help

- **Backend Issues**: Check `server/src/index.ts` startup logic
- **Frontend Issues**: Check `vite.config.ts` and `src/main.tsx`
- **Database Issues**: Verify MongoDB connection string in `.env`
- **API Issues**: Check routes in `server/src/routes/`

---

## ✨ Quick Commands Reference

```powershell
# Start everything (Recommended)
.\START_SERVERS.ps1

# Diagnose issues
.\DIAGNOSE.ps1

# Kill all Node processes
Get-Process node | Stop-Process -Force

# Check port 3000
netstat -ano | findstr :3000

# Check port 5001
netstat -ano | findstr :5001

# Test backend health
curl http://localhost:5001/health

# Clean install
rm -r server/node_modules, node_modules
npm cache clean --force
npm install
cd server && npm install && cd ..
.\START_SERVERS.ps1
```

---

**Status**: ✅ Both servers should now start reliably and stay running!
