# LeadsFlow CRM - Full Stack Lead Management System

A comprehensive, production-ready CRM system with MongoDB backend integration, built with React, TypeScript, and Node.js.

## 🚀 Features

### Frontend (React + TypeScript + Vite)
- **Modern UI**: Built with React 18, Tailwind CSS, and Radix UI components
- **Dashboard**: Real-time statistics and analytics
- **Lead Management**: Complete CRUD operations for leads with advanced filtering
- **Pipeline View**: Kanban-style sales pipeline with drag-and-drop
- **Activity Tracking**: Automatic logging of all lead interactions
- **Follow-up Management**: Schedule and track follow-up tasks
- **User Management**: Multi-user support with role-based access
- **Settings**: Customizable pipeline stages, lead sources, and statuses
- **Responsive Design**: Works seamlessly on desktop and mobile

### Backend (Node.js + Express + MongoDB)
- **RESTful API**: Complete API for all CRM operations
- **MongoDB Integration**: Scalable database with proper indexing
- **JWT Authentication**: Secure token-based authentication
- **License Management**: Built-in license validation system
- **Setup Wizard**: First-time configuration wizard
- **Activity Logging**: Automatic activity tracking
- **Data Validation**: Comprehensive input validation
- **Error Handling**: Robust error handling and logging

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** 4.4+ (local installation or MongoDB Atlas account)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd leadsflow-crm
```

### 2. Install dependencies for both frontend and backend

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install separately:
npm install              # Frontend dependencies
cd server && npm install # Backend dependencies
```

### 3. Configure the backend

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=leadsflow

# JWT Secret (change this to a random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# License Configuration (optional - can be set via setup wizard)
LICENSE_KEY=

# Company Information (set during setup wizard)
COMPANY_NAME=
COMPANY_EMAIL=
COMPANY_PHONE=
```

### 4. Set up MongoDB

#### Option A: Local MongoDB
```bash
# Install MongoDB locally and start the service
# On macOS with Homebrew:
brew install mongodb-community
brew services start mongodb-community

# On Ubuntu:
sudo apt-get install mongodb
sudo systemctl start mongodb

# On Windows:
# Download and install from https://www.mongodb.com/try/download/community
```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
   ```

## 🚀 Running the Application

### Development Mode (Recommended)

Run both frontend and backend concurrently:

```bash
npm run dev:all
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

### Run Separately

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server:dev
```

### Production Mode

```bash
# Build frontend
npm run build

# Build and start backend
npm run server:build
npm run server:start
```

## 🎯 First-Time Setup

1. Start both frontend and backend servers
2. Open http://localhost:3000 in your browser
3. You'll be automatically redirected to the Setup Wizard
4. Complete the 4-step setup process:
   - **Step 1**: Configure MongoDB connection and test it
   - **Step 2**: Validate license key or generate a test license
   - **Step 3**: Enter your company details
   - **Step 4**: Create the admin account

5. After setup, you'll be redirected to the login page
6. Log in with your admin credentials

## 📁 Project Structure

```
leadsflow-crm/
├── src/                          # Frontend source code
│   ├── app/
│   │   ├── components/          # React components
│   │   │   ├── SetupWizard.tsx # Setup wizard component
│   │   │   └── ...
│   │   ├── services/            # API services
│   │   │   ├── apiClient.ts    # API client with auth
│   │   │   └── apiService.ts   # Service layer
│   │   ├── pages/              # Page components
│   │   └── types/              # TypeScript types
│   ├── index.html
│   └── main.tsx
├── server/                       # Backend source code
│   ├── src/
│   │   ├── routes/             # API routes
│   │   ├── models/             # MongoDB models
│   │   ├── middleware/         # Express middleware
│   │   ├── utils/              # Utility functions
│   │   └── index.ts            # Server entry point
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── README.md               # Backend documentation
├── package.json                 # Frontend package.json
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── README.md                   # This file
```

## 🔌 API Documentation

The backend provides a comprehensive RESTful API. See [server/README.md](server/README.md) for detailed API documentation.

### Key Endpoints

- **Setup**: `/api/setup/*` - Initial configuration
- **Auth**: `/api/auth/*` - Authentication
- **Leads**: `/api/leads/*` - Lead management
- **Users**: `/api/users/*` - User management
- **Notes**: `/api/notes/*` - Note management
- **Activities**: `/api/activities/*` - Activity tracking
- **Follow-ups**: `/api/followups/*` - Follow-up management
- **Config**: `/api/config/*` - System configuration
- **Dashboard**: `/api/dashboard/*` - Dashboard statistics

## 🔐 Security

- JWT-based authentication with 7-day token expiry
- Bcrypt password hashing
- Protected API routes (except setup and auth)
- CORS configuration for frontend-backend communication
- Environment-based configuration
- License validation system

## 🧪 Testing

```bash
# Frontend tests (if configured)
npm test

# Backend tests (if configured)
cd server && npm test
```

## 📦 Building for Production

```bash
# Build frontend
npm run build

# Build backend
npm run server:build

# The frontend build will be in the 'dist' directory
# The backend build will be in the 'server/dist' directory
```

## 🚢 Deployment

### Frontend Deployment
The frontend can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

### Backend Deployment
The backend can be deployed to:
- Heroku
- AWS EC2/ECS
- DigitalOcean
- Railway
- Render

### Environment Variables for Production
Make sure to set these in your production environment:
- `MONGODB_URI` - Your production MongoDB connection string
- `JWT_SECRET` - A strong, random secret key
- `NODE_ENV=production`
- `PORT` - Server port (usually provided by hosting platform)

## 🛠️ Technologies Used

### Frontend
- React 18.3
- TypeScript
- Vite 6
- Tailwind CSS 4
- Radix UI Components
- React Hook Form
- Recharts (for analytics)
- Lucide React (icons)

### Backend
- Node.js 18+
- Express.js
- MongoDB (native driver)
- JWT (jsonwebtoken)
- Bcrypt
- TypeScript
- Dotenv

## 📝 License

This project includes a built-in license management system. For testing purposes, you can generate a test license through the setup wizard.

## 🤝 Support

For issues, questions, or contributions:
1. Check the [server/README.md](server/README.md) for backend-specific documentation
2. Review the API documentation
3. Check MongoDB connection and configuration

## 🎨 Original Design

This project is based on the Lead Management System Design available at:
https://www.figma.com/design/HjtJ08Wg0aoPFW7vJ27aP6/Lead-Management-System-Design

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
