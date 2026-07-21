# Wissen-Haus Backend Setup Guide

This backend handles user authentication and data storage for the Wissen-Haus website.

## Quick Start (5 minutes)

### Prerequisites
- **Node.js** v14+ and npm ([Download](https://nodejs.org))
- **Git** (already installed)

### Installation

1. **Install Dependencies**
   ```bash
   cd wissenhaus-backend
   npm install
   ```

2. **Run Database Migrations**
   ```bash
   npm run migrate
   ```
   This creates the SQLite database with all necessary tables.

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   🚀 Wissen-Haus API running on port 3000
   📊 Health check: http://localhost:3000/health
   ```

4. **Test the API**
   ```bash
   curl http://localhost:3000/health
   ```

---

## API Endpoints

### Authentication

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here"
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}

Response:
{
  "token": "new_jwt_token"
}
```

---

## Database Structure

### Users Table
```sql
- id (primary key)
- email (unique)
- password_hash (bcrypt hashed)
- name
- created_at
- updated_at
```

### Course Progress Table
Tracks which modules each user has completed.

### Certificates Table
Stores certificate data with unique IDs for LinkedIn integration.

### Community Tables (Threads & Posts)
For community discussions and support.

### Submissions Table
For form submissions (applications, etc).

---

## Environment Variables

The `.env` file contains:
- `PORT` - API server port (default: 3000)
- `JWT_SECRET` - Secret key for signing tokens
- `JWT_EXPIRY` - Token expiration time (default: 24h)
- `CORS_ORIGIN` - Frontend URL for CORS (http://localhost:8001)

---

## Connecting the Frontend

The frontend (at http://localhost:8001) is ready to connect to this backend API.

### Frontend API Calls
The frontend will send requests to:
- `POST /api/auth/register` - User signup
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get logged-in user info
- And other endpoints as needed

---

## Troubleshooting

### "Cannot find module 'sqlite3'"
```bash
npm install sqlite3
```

### "Port 3000 already in use"
Either kill the process on port 3000, or change the PORT in .env file.

### "Database locked" error
Restart the server:
```bash
npm run dev
```

### CORS errors
Make sure `CORS_ORIGIN` in .env includes your frontend URL:
```
CORS_ORIGIN=http://localhost:8001
```

---

## Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create wissenhaus-api`
4. Deploy: `git push heroku main`
5. View logs: `heroku logs --tail`

### Deploy to AWS/DigitalOcean

Similar process - see deployment documentation for each platform.

---

## Support

For issues or questions, check:
- Server logs: Look for error messages
- Database: Check if wissenhaus.db exists
- Environment: Verify .env variables are correct

