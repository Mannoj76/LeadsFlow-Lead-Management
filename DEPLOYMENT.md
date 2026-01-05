# LeadsFlow CRM - Deployment Guide

This guide covers various deployment options for LeadsFlow CRM.

## Table of Contents

1. [Docker Deployment](#docker-deployment)
2. [Manual Deployment](#manual-deployment)
3. [Cloud Platforms](#cloud-platforms)
4. [Environment Variables](#environment-variables)
5. [Production Checklist](#production-checklist)

## Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start with Docker Compose

1. **Clone the repository**
```bash
git clone <repository-url>
cd leadsflow-crm
```

2. **Set environment variables**
Create a `.env` file in the root directory:
```env
JWT_SECRET=your-super-secret-jwt-key-here
```

3. **Start all services**
```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend API on port 5000
- Frontend on port 80

4. **Access the application**
Open http://localhost in your browser and complete the setup wizard.

### Individual Docker Builds

**Build and run backend:**
```bash
cd server
docker build -t leadsflow-backend .
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://your-mongo-host:27017 \
  -e JWT_SECRET=your-secret \
  leadsflow-backend
```

**Build and run frontend:**
```bash
docker build -t leadsflow-frontend .
docker run -p 80:80 leadsflow-frontend
```

### Docker Compose Production Configuration

For production, update `docker-compose.yml`:

```yaml
services:
  mongodb:
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - /var/lib/mongodb:/data/db  # Use host volume for persistence
  
  backend:
    environment:
      JWT_SECRET: ${JWT_SECRET}
      MONGODB_URI: mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017
```

## Manual Deployment

### Backend Deployment

1. **Install dependencies**
```bash
cd server
npm install --production
```

2. **Build TypeScript**
```bash
npm run build
```

3. **Set environment variables**
Create `.env` file with production values.

4. **Start the server**
```bash
npm start
```

Or use PM2 for process management:
```bash
npm install -g pm2
pm2 start dist/index.js --name leadsflow-backend
pm2 save
pm2 startup
```

### Frontend Deployment

1. **Build the frontend**
```bash
npm install
npm run build
```

2. **Serve with nginx**
```bash
sudo cp -r dist/* /var/www/html/
sudo cp nginx.conf /etc/nginx/sites-available/leadsflow
sudo ln -s /etc/nginx/sites-available/leadsflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Cloud Platforms

### Heroku

**Backend:**
```bash
cd server
heroku create leadsflow-api
heroku addons:create mongolab
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

**Frontend:**
```bash
heroku create leadsflow-app
heroku buildpacks:set heroku/nodejs
git push heroku main
```

### AWS

**Backend (EC2):**
1. Launch EC2 instance (Ubuntu 22.04)
2. Install Node.js and MongoDB
3. Clone repository and follow manual deployment steps
4. Configure security groups (ports 5000, 27017)

**Frontend (S3 + CloudFront):**
1. Build frontend: `npm run build`
2. Create S3 bucket
3. Upload `dist/` contents to S3
4. Create CloudFront distribution
5. Configure custom domain (optional)

### DigitalOcean

**Using App Platform:**
1. Connect GitHub repository
2. Configure build settings:
   - Backend: `cd server && npm install && npm run build`
   - Frontend: `npm install && npm run build`
3. Set environment variables
4. Deploy

**Using Droplet:**
1. Create Ubuntu droplet
2. Follow manual deployment steps
3. Configure firewall
4. Set up SSL with Let's Encrypt

### Vercel (Frontend Only)

```bash
npm install -g vercel
vercel --prod
```

Configure `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Railway

1. Connect GitHub repository
2. Add MongoDB service
3. Configure environment variables
4. Deploy automatically on push

## Environment Variables

### Backend (.env)
```env
# Required
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://user:pass@host:27017
DATABASE_NAME=leadsflow
JWT_SECRET=your-super-secret-key

# Optional
LICENSE_KEY=your-license-key
ENCRYPTION_KEY=your-encryption-key
```

### Frontend
Update `vite.config.ts` for production API URL:
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://your-backend-url.com',
        changeOrigin: true,
      },
    },
  },
});
```

## Production Checklist

### Security
- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set secure MongoDB credentials
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for secrets
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates

### Performance
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set up database indexes
- [ ] Enable MongoDB connection pooling
- [ ] Configure caching headers
- [ ] Optimize images and assets
- [ ] Enable HTTP/2

### Monitoring
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Configure uptime monitoring
- [ ] Set up database backups
- [ ] Monitor server resources
- [ ] Set up alerts for errors
- [ ] Configure log rotation

### Backup
- [ ] Automated MongoDB backups
- [ ] Backup encryption keys
- [ ] Backup configuration files
- [ ] Test restore procedures
- [ ] Off-site backup storage

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
sudo certbot renew --dry-run
```

### Using Cloudflare

1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS (Full mode)
4. Configure page rules

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Run multiple backend instances
- Use MongoDB replica set
- Implement session storage (Redis)

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Enable caching
- Use CDN for static assets

## Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify environment variables
- Check port availability
- Review logs: `pm2 logs` or `docker logs`

### Frontend can't connect to backend
- Verify API proxy configuration
- Check CORS settings
- Ensure backend is running
- Check network/firewall rules

### Database connection issues
- Verify MongoDB is running
- Check connection string
- Verify credentials
- Check network connectivity

## Support

For deployment issues:
1. Check logs for error messages
2. Verify all environment variables
3. Test database connectivity
4. Review firewall/security group settings
5. Consult platform-specific documentation

