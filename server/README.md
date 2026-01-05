# LeadsFlow CRM - Backend Server

This is the Node.js/Express backend server for LeadsFlow CRM with MongoDB integration.

## Features

- **MongoDB Integration**: Full database support for all CRM entities
- **RESTful API**: Complete API for leads, users, activities, notes, and follow-ups
- **JWT Authentication**: Secure token-based authentication
- **License Management**: Built-in license validation system
- **Setup Wizard API**: First-time setup endpoints for database and admin configuration
- **Activity Logging**: Automatic activity tracking for all lead interactions

## Prerequisites

- Node.js 18+ and npm
- MongoDB 4.4+ (local or MongoDB Atlas)

## Installation

```bash
cd server
npm install
```

## Configuration

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

# License Configuration (optional)
LICENSE_KEY=your-license-key-here

# Company Information (set during setup wizard)
COMPANY_NAME=
COMPANY_EMAIL=
COMPANY_PHONE=
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Setup & Configuration
- `GET /api/setup/status` - Check if setup is required
- `POST /api/setup/test-connection` - Test MongoDB connection
- `POST /api/setup/validate-license` - Validate license key
- `GET /api/setup/generate-test-license` - Generate a test license
- `POST /api/setup/complete` - Complete initial setup

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Leads
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get lead by ID
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `POST /api/leads/bulk-import` - Bulk import leads

### Notes
- `GET /api/notes/lead/:leadId` - Get notes for a lead
- `POST /api/notes` - Create new note
- `DELETE /api/notes/:id` - Delete note

### Activities
- `GET /api/activities/lead/:leadId` - Get activities for a lead
- `POST /api/activities` - Create new activity

### Follow-ups
- `GET /api/followups` - Get all follow-ups
- `GET /api/followups/lead/:leadId` - Get follow-ups for a lead
- `POST /api/followups` - Create new follow-up
- `PUT /api/followups/:id` - Update follow-up
- `DELETE /api/followups/:id` - Delete follow-up

### Configuration
- `GET /api/config/pipeline-stages` - Get pipeline stages
- `POST /api/config/pipeline-stages` - Create pipeline stage
- `PUT /api/config/pipeline-stages/:id` - Update pipeline stage
- `DELETE /api/config/pipeline-stages/:id` - Delete pipeline stage
- `GET /api/config/lead-sources` - Get lead sources
- `POST /api/config/lead-sources` - Create lead source
- `GET /api/config/lead-statuses` - Get lead statuses
- `POST /api/config/lead-statuses` - Create lead status
- `PUT /api/config/lead-statuses/:id` - Update lead status
- `DELETE /api/config/lead-statuses/:id` - Delete lead status
- `GET /api/config/settings` - Get system settings
- `PUT /api/config/settings` - Update system settings

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Database Schema

The application uses the following MongoDB collections:

- `users` - User accounts and authentication
- `leads` - Lead/contact information
- `notes` - Notes attached to leads
- `activities` - Activity history for leads
- `followups` - Scheduled follow-up tasks
- `pipelineStages` - Sales pipeline stages
- `leadSources` - Lead source definitions
- `leadStatuses` - Lead status definitions
- `settings` - System configuration
- `licenses` - License information

## First-Time Setup

1. Start the backend server
2. Open the frontend application
3. You'll be redirected to the Setup Wizard
4. Follow the 4-step setup process:
   - Configure MongoDB connection
   - Validate or generate license key
   - Enter company details
   - Create admin account

## License Management

The system includes a built-in license validation system. For testing purposes, you can generate a test license using:

```bash
GET /api/setup/generate-test-license
```

## Security

- All API endpoints (except setup and auth) require JWT authentication
- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- Setup wizard is only accessible when the system is not configured

## Development

The server uses:
- **Express.js** - Web framework
- **MongoDB** with native driver - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment configuration

## Troubleshooting

### Cannot connect to MongoDB
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- For MongoDB Atlas, ensure IP whitelist is configured

### Setup wizard not appearing
- Check if `.env` file exists and has MONGODB_URI set
- Verify the database is accessible
- Clear browser cache and localStorage

### Authentication errors
- Verify JWT_SECRET is set in .env
- Check if token has expired (7 day expiry)
- Ensure Authorization header is being sent

## Support

For issues and questions, please refer to the main project documentation.

