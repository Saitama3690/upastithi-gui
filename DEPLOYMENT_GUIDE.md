# 🚀 Complete Deployment Guide - Education Management System

## Overview
This guide covers deploying your MERN stack education management system with AI face recognition to production.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup
Create production environment variables:

**Frontend (.env.production)**
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (.env.production)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/education_system
JWT_SECRET=your_super_secure_jwt_secret_here
CORS_ORIGIN=https://your-frontend-domain.com
```

### 2. Code Preparation

**Update API Base URL in frontend:**
```javascript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```

**Update CORS settings in backend:**
```javascript
// server/index.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
```

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create new cluster (M0 Sandbox - Free)

### 2. Configure Database
1. **Network Access**: Add IP address `0.0.0.0/0` (allow from anywhere)
2. **Database Access**: Create database user with read/write permissions
3. **Get Connection String**: 
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

### 3. Database Migration
```bash
# If you have existing data, export from local MongoDB
mongodump --db education_system --out ./backup

# Import to Atlas (replace connection string)
mongorestore --uri "mongodb+srv://username:password@cluster.mongodb.net/education_system" ./backup/education_system
```

## 🌐 Frontend Deployment (Netlify)

### Option 1: Git-based Deployment (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **Deploy on Netlify**
- Go to [Netlify](https://netlify.com)
- Click "New site from Git"
- Connect GitHub account
- Select your repository
- Configure build settings:
  - **Build command**: `npm run build`
  - **Publish directory**: `dist`
  - **Environment variables**: Add your production env vars

3. **Configure Redirects**
Create `public/_redirects` file:
```
/*    /index.html   200
```

### Option 2: Manual Deployment

1. **Build the project**
```bash
npm run build
```

2. **Deploy to Netlify**
- Drag and drop the `dist` folder to Netlify
- Configure environment variables in site settings

## 🖥️ Backend Deployment Options

### Option A: Railway (Recommended for beginners)

1. **Prepare for Railway**
```bash
# Create railway.json
echo '{"build": {"builder": "NIXPACKS"}, "deploy": {"startCommand": "npm start"}}' > railway.json
```

2. **Deploy to Railway**
- Go to [Railway](https://railway.app)
- Sign up with GitHub
- Click "New Project" → "Deploy from GitHub repo"
- Select your repository
- Add environment variables in Railway dashboard

### Option B: Render

1. **Create render.yaml**
```yaml
services:
  - type: web
    name: education-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: mongodb
          property: connectionString
```

2. **Deploy to Render**
- Go to [Render](https://render.com)
- Connect GitHub account
- Create new Web Service
- Select repository and configure

### Option C: Heroku

1. **Install Heroku CLI**
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login
```

2. **Prepare for Heroku**
```bash
# Create Procfile
echo "web: node server/index.js" > Procfile

# Update package.json
{
  "scripts": {
    "start": "node server/index.js",
    "heroku-postbuild": "npm install --prefix client && npm run build --prefix client"
  }
}
```

3. **Deploy to Heroku**
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_connection_string
heroku config:set JWT_SECRET=your_jwt_secret
git push heroku main
```

## 🤖 AI Service Deployment

### Option 1: Separate Python Service (Recommended)

1. **Create requirements.txt**
```txt
flask==2.3.3
opencv-python==4.8.1.78
face-recognition==1.3.0
numpy==1.24.3
pillow==10.0.1
flask-cors==4.0.0
```

2. **Deploy Python service to Railway/Render**
- Create separate repository for AI service
- Deploy using same process as backend
- Update frontend to call AI service URL

### Option 2: Docker Container

1. **Create Dockerfile for AI service**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5174

CMD ["python", "app.py"]
```

2. **Deploy to Railway/Render with Docker**

## 🔧 Production Optimizations

### 1. Frontend Optimizations

**Update vite.config.ts**
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

### 2. Backend Optimizations

**Add compression and security**
```bash
npm install compression helmet
```

```javascript
// server/index.js
import compression from 'compression';
import helmet from 'helmet';

app.use(helmet());
app.use(compression());
```

### 3. Database Optimizations

**Add indexes for better performance**
```javascript
// Add to your models
// User.js
userSchema.index({ email: 1 });
userSchema.index({ role: 1, department: 1 });

// Attendance.js
attendanceSchema.index({ student: 1, date: 1 });
attendanceSchema.index({ faculty: 1, date: 1 });
```

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use strong JWT secrets (32+ characters)
- Rotate secrets regularly

### 2. CORS Configuration
```javascript
app.use(cors({
  origin: [
    'https://your-frontend-domain.com',
    'https://your-admin-domain.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### 3. Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 📊 Monitoring & Logging

### 1. Add Logging
```bash
npm install winston
```

```javascript
// utils/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export default logger;
```

### 2. Health Check Endpoint
```javascript
// Add to server/index.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 🚀 Deployment Steps Summary

### 1. Prepare Code
```bash
# Update environment variables
# Add production optimizations
# Test locally with production build
npm run build
```

### 2. Setup Database
- Create MongoDB Atlas cluster
- Configure network access and users
- Get connection string

### 3. Deploy Backend
```bash
# Choose platform (Railway/Render/Heroku)
# Configure environment variables
# Deploy from GitHub
```

### 4. Deploy Frontend
```bash
# Build project
npm run build

# Deploy to Netlify
# Configure environment variables
# Set up custom domain (optional)
```

### 5. Deploy AI Service
```bash
# Create separate repository for Python AI service
# Deploy to same platform as backend
# Update frontend API calls
```

### 6. Configure Domains
- Set up custom domains for frontend and backend
- Configure SSL certificates (automatic on most platforms)
- Update CORS settings with production domains

### 7. Test Production
- Test all user flows (admin, faculty, student)
- Test AI face recognition functionality
- Verify database connections
- Check API endpoints

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check CORS_ORIGIN environment variable
   - Verify frontend domain in backend CORS config

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network access settings in Atlas
   - Ensure database user has correct permissions

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check for TypeScript errors

4. **AI Service Issues**
   - Ensure Python dependencies are correctly installed
   - Check camera permissions in browser
   - Verify AI service URL in frontend

## 📱 Post-Deployment

### 1. Domain Setup (Optional)
- Purchase domain from Namecheap/GoDaddy
- Configure DNS settings
- Set up SSL certificates

### 2. Monitoring
- Set up uptime monitoring (UptimeRobot)
- Configure error tracking (Sentry)
- Monitor database performance

### 3. Backup Strategy
- Set up automated database backups
- Store backups in cloud storage
- Test restore procedures

## 🎯 Production URLs Structure

After deployment, your URLs will look like:
- **Frontend**: `https://your-app-name.netlify.app`
- **Backend**: `https://your-backend-name.railway.app`
- **AI Service**: `https://your-ai-service.railway.app`

Remember to update all API calls in your frontend to use the production backend URL!