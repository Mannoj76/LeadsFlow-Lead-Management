# LeadsFlow CRM - Quick Start Guide

Get LeadsFlow CRM up and running in 5 minutes!

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **MongoDB** - Choose one:
  - [Local MongoDB](https://www.mongodb.com/try/download/community) OR
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud database)

## Installation Steps

### 1. Install Dependencies

```bash
# Install both frontend and backend dependencies
npm run install:all
```

### 2. Configure Backend

Create `server/.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=leadsflow
JWT_SECRET=your-super-secret-jwt-key-change-this
```

**For MongoDB Atlas:**
Replace `MONGODB_URI` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
```

### 3. Start the Application

```bash
# Start both frontend and backend
npm run dev:all
```

This starts:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

### 4. Complete Setup Wizard

1. Open http://localhost:3000
2. You'll see the Setup Wizard
3. Follow these 4 steps:

**Step 1: Database Configuration**
- Enter your MongoDB URI
- Click "Test Connection"
- Click "Next" when successful

**Step 2: License Validation**
- Click "Generate Test License" for development
- Click "Next"

**Step 3: Company Details**
- Enter your company name and email
- Click "Next"

**Step 4: Admin Account**
- Create your admin account
- Click "Complete Setup"

### 5. Login & Start Using

- Login with your admin credentials
- Start managing leads!

## Alternative: Docker Setup

If you have Docker installed:

```bash
# Start everything with one command
docker-compose up -d
```

Then open http://localhost and complete the setup wizard.

## Troubleshooting

### MongoDB Connection Failed
- **Local MongoDB:** Make sure MongoDB is running
  ```bash
  # macOS
  brew services start mongodb-community
  
  # Ubuntu
  sudo systemctl start mongodb
  
  # Windows
  # Start MongoDB service from Services
  ```
- **MongoDB Atlas:** Check your connection string and IP whitelist

### Port Already in Use
- Change ports in `server/.env` (PORT) and `vite.config.ts` (server.port)

### Dependencies Installation Failed
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall
- Try using `npm install` instead of `npm run install:all`

## What's Next?

- 📖 Read the [full README](README.md) for detailed documentation
- 🚀 Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- 📚 Review [server/README.md](server/README.md) for API documentation

## Quick Commands Reference

```bash
# Development
npm run dev:all              # Start frontend + backend
npm run dev                  # Frontend only
npm run server:dev           # Backend only

# Production
npm run build                # Build frontend
npm run server:build         # Build backend
npm run server:start         # Start backend in production

# Docker
docker-compose up -d         # Start all services
docker-compose down          # Stop all services
docker-compose logs -f       # View logs
```

## Default Credentials

After setup, login with the admin account you created in Step 4 of the setup wizard.

## Need Help?

- Check the [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details
- Review the [DEPLOYMENT.md](DEPLOYMENT.md) for deployment options
- Check MongoDB connection and logs if issues persist

---

**Ready to go!** 🚀 Your CRM is now running with a full MongoDB backend.

