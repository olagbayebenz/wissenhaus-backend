# Wissen-Haus Backend API

Production backend for Wissen-Haus Youth Empowerment Foundation.

## Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Redis (optional, for sessions)

### Installation

1. **Clone repo** (or navigate to wissenhaus-backend directory)
```bash
cd wissenhaus-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment**
```bash
cp .env.example .env
# Edit .env with your database URL, JWT secret, etc.
```

4. **Create database**
```bash
createdb wissenhaus_dev
```

5. **Run migrations**
```bash
npm run migrate
```

6. **Start development server**
```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Health Check
```bash
curl http://localhost:3000/health
# { "status": "ok", "timestamp": "..." }
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
GET    /api/auth/me                Get current user (requires JWT)
POST   /api/auth/refresh           Refresh access token
```

### Courses
```
GET    /api/courses/:courseId/progress          Get module progress
POST   /api/courses/:courseId/module/:id/quiz   Submit quiz answers
GET    /api/courses/:courseId/certificate       Get certificate
```

### Community
```
GET    /api/community/threads                   Get all threads
POST   /api/community/threads                   Create new thread
GET    /api/community/threads/:id               Get single thread
POST   /api/community/threads/:id/posts         Add reply to thread
```

### Submissions
```
POST   /api/submissions/volunteer               Volunteer application
POST   /api/submissions/partnership             Partnership inquiry
POST   /api/submissions/contact                 Contact form
```

---

## Database Schema

**Users**
- id, email, password_hash, name, created_at, updated_at

**Course Progress**
- id, user_id, course_id, module_id, completed_at, quiz_score

**Certificates**
- id, user_id, course_id, certificate_id, issued_at, certificate_data

**Threads**
- id, user_id, title, category, content, views, created_at, updated_at

**Posts**
- id, thread_id, user_id, content, created_at, updated_at

**Submissions**
- id, type, name, email, phone, data, status, created_at, updated_at

---

## Environment Variables

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost/wissenhaus_dev
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:8000
```

---

## Development

**Run tests**
```bash
npm test
```

**Format code**
```bash
npm run lint
```

**Check database**
```bash
psql wissenhaus_dev
```

---

## Deployment

### Railway
1. Push to GitHub
2. Connect repo to Railway
3. Set environment variables
4. Deploy

### Fly.io
```bash
flyctl auth login
flyctl apps create wissenhaus-api
flyctl deploy
```

---

## Architecture

- **Express.js** - HTTP server
- **PostgreSQL** - Relational database
- **JWT** - Stateless authentication
- **Joi** - Input validation
- **Bcrypt** - Password hashing

---

## Testing

API endpoints can be tested with cURL, Postman, or Thunder Client:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get user (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/auth/me
```

---

## Support

For issues or questions, open an issue on GitHub.

---

**Version**: 1.0.0  
**License**: MIT
