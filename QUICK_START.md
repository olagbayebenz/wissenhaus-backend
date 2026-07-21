# 🚀 Wissen-Haus Backend - Quick Start

Your website now has a complete backend system ready to handle real user data!

---

## What Changed?

### Before
- User data stored only in browser localStorage
- Passwords stored in plain text
- No central database
- Data lost when browser clears cache
- Not scalable for production

### After ✅
- Real backend API with PostgreSQL/SQLite database
- Passwords securely hashed with bcrypt
- JWT authentication tokens
- Centralized user database
- Scalable and production-ready

---

## Getting Started (Choose One)

### Option 1: Local Node.js Backend (Recommended)

**Requirements:** Node.js v14+ ([Download](https://nodejs.org))

**Steps:**

1. Install dependencies:
   ```bash
   cd wissenhaus-backend
   npm install
   ```

2. Create database:
   ```bash
   npm run migrate
   ```

3. Start backend:
   ```bash
   npm run dev
   ```

4. You should see:
   ```
   🚀 Wissen-Haus API running on port 3000
   ```

5. Test it:
   - Open http://localhost:8001 in your browser
   - Click "Sign Up" on the login page
   - Create an account - your data is now saved to the database!

---

### Option 2: Deploy to Cloud (No Local Setup)

#### Deploy to Heroku (Free tier available)

1. **Create Heroku account** at https://www.heroku.com

2. **Install Heroku CLI** from https://devcenter.heroku.com/articles/heroku-cli

3. **Deploy:**
   ```bash
   cd wissenhaus-backend
   heroku login
   heroku create wissenhaus-api
   git push heroku main
   ```

4. **Update Frontend** in `login.html`, change:
   ```javascript
   'http://localhost:3000/api/auth/login'
   ```
   to:
   ```javascript
   'https://wissenhaus-api.herokuapp.com/api/auth/login'
   ```

5. **Done!** Your backend is live 🎉

---

### Option 3: Use Firebase (Easiest - No Backend Code)

If you prefer not to manage a backend, I can set up Firebase which handles everything.

---

## Database Structure

The backend creates 6 tables automatically:

```
✓ users           - Stores user accounts (email, password hash, name)
✓ course_progress - Tracks what each user has learned
✓ certificates    - Stores certificates for LinkedIn
✓ threads         - Community discussions
✓ posts           - Replies in community threads
✓ submissions     - Form submissions (jobs, internships, etc)
```

---

## API Endpoints

### Register (Signup)
```bash
POST http://localhost:3000/api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Login
```bash
POST http://localhost:3000/api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Current User
```bash
GET http://localhost:3000/api/auth/me
Headers: Authorization: Bearer <token>
```

---

## Key Features

✅ **Secure Passwords** - Hashed with bcrypt, never stored in plain text  
✅ **JWT Tokens** - Secure session management  
✅ **Refresh Tokens** - Keep users logged in  
✅ **CORS Enabled** - Frontend can communicate with backend  
✅ **Error Handling** - Proper validation and error messages  
✅ **Database Migrations** - Schema created automatically  

---

## Testing User Data

Once the backend is running:

1. Go to http://localhost:8001
2. Click "Sign Up"
3. Create an account:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123

4. The backend stores this in the database
5. Try logging out and back in - your account persists!
6. Database file: `wissenhaus-backend/wissenhaus.db`

---

## Next Steps

After setting up the backend, you can:

1. **Add More Features**
   - Course progress tracking
   - Certificate generation
   - Community discussions
   - Job/internship applications

2. **Connect Other Pages**
   - Community hub now saves discussions
   - Course progress saves in database
   - All user data centralized

3. **Deploy to Production**
   - Deploy backend to Heroku, AWS, or DigitalOcean
   - Deploy frontend to Vercel, Netlify, or GitHub Pages
   - Use custom domain

---

## Troubleshooting

### "Cannot connect to backend"
Make sure:
- Backend is running (`npm run dev`)
- Port 3000 is available
- Frontend is at http://localhost:8001
- No firewall blocking port 3000

### "Port 3000 already in use"
Change in `.env`:
```
PORT=3001
```
Then update frontend API URLs.

### "Database errors"
Delete `wissenhaus.db` and run:
```bash
npm run migrate
```

---

## Support Files

- `BACKEND_SETUP.md` - Detailed technical setup
- `src/routes/auth.js` - Authentication endpoints
- `src/db/schema.sql` - Database tables
- `.env` - Configuration file

---

## Questions?

Check the BACKEND_SETUP.md file for detailed documentation.

Happy coding! 🚀

