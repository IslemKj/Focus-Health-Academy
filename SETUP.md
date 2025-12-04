# 🚀 Focus Health Academy - Setup Guide

Complete step-by-step guide to set up the Focus Health Academy application.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Backend Requirements
- Python 3.10 or higher
- PostgreSQL 14 or higher
- pip (Python package manager)

### Frontend Requirements
- Node.js 16 or higher
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Xcode (Mac only)
- For Android: Android Studio

---

## 🔧 Backend Setup (Django)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup PostgreSQL Database

Open PostgreSQL and create a database:
```sql
CREATE DATABASE focus_health_academy;
CREATE USER fha_user WITH PASSWORD 'your_password';
ALTER ROLE fha_user SET client_encoding TO 'utf8';
ALTER ROLE fha_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE fha_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE focus_health_academy TO fha_user;
```

### 5. Configure Environment Variables

Create `.env` file from example:
```bash
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux
```

Edit `.env` file:
```env
# Database Configuration
DB_NAME=focus_health_academy
DB_USER=fha_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Django Settings
SECRET_KEY=your-secret-key-here-generate-a-new-one
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

### 6. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser
```bash
python manage.py createsuperuser
```
Enter email, username, password when prompted.

### 8. Create Media Directories
```bash
mkdir media
mkdir media/avatars
mkdir media/courses
mkdir media/events
mkdir media/posts
mkdir media/chat
```

### 9. Start Development Server
```bash
python manage.py runserver
```

Backend should now be running at: `http://localhost:8000`
Admin panel: `http://localhost:8000/admin`

---

## 📱 Frontend Setup (React Native)

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API URL

Edit `src/api/config.js`:
```javascript
// For local development
export const API_BASE_URL = 'http://localhost:8000/api/v1';

// For Android emulator
// export const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';

// For iOS simulator
// export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// For physical device (use your computer's IP)
// export const API_BASE_URL = 'http://192.168.1.100:8000/api/v1';
```

### 4. Start Expo Development Server
```bash
npm start
```

### 5. Run on Device/Emulator

**Option 1: Physical Device**
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal
3. App will load on your device

**Option 2: iOS Simulator (Mac only)**
```bash
Press 'i' in the terminal
```

**Option 3: Android Emulator**
```bash
Press 'a' in the terminal
```

---

## ✅ Verify Installation

### Backend Verification

1. **Check API Health**
   ```bash
   curl http://localhost:8000/api/v1/courses/
   ```

2. **Access Admin Panel**
   - Go to: `http://localhost:8000/admin`
   - Login with superuser credentials

3. **Test API Endpoints**
   Use Postman or Thunder Client to test:
   - `GET /api/v1/courses/`
   - `GET /api/v1/events/`
   - `POST /api/v1/auth/login/`

### Frontend Verification

1. **Login Screen Should Load**
   - Clean UI with FHA colors
   - Email and password fields
   - Sign in and register buttons

2. **Test Registration**
   - Create a test account
   - Should redirect to home after success

3. **Test Login**
   - Login with created account
   - Should see home screen with tabs

---

## 📊 Sample Data (Optional)

Create sample data for development:

### Using Django Shell
```bash
python manage.py shell
```

```python
from accounts.models import User
from courses.models import Course

# Create a teacher
teacher = User.objects.create_user(
    email='teacher@example.com',
    username='teacher',
    password='password123',
    first_name='John',
    last_name='Doe',
    role='staff'
)

# Create a course
course = Course.objects.create(
    title='Introduction to Healthcare',
    description='Learn the basics of healthcare',
    short_description='Healthcare fundamentals',
    price=99.99,
    teacher=teacher,
    category='medical',
    level='beginner',
    is_online=True,
    is_published=True
)

print('Sample data created!')
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: Database connection error**
```
Solution: Check PostgreSQL is running and credentials in .env are correct
```

**Problem: Import errors**
```
Solution: Ensure virtual environment is activated and dependencies are installed
pip install -r requirements.txt
```

**Problem: Migration errors**
```
Solution: Delete migrations and recreate
python manage.py migrate --run-syncdb
```

### Frontend Issues

**Problem: Can't connect to backend**
```
Solution: Check API_BASE_URL in src/api/config.js
Use correct IP for your development environment
```

**Problem: Expo build errors**
```
Solution: Clear cache and reinstall
expo start -c
rm -rf node_modules
npm install
```

**Problem: Module not found**
```
Solution: Install missing dependencies
npm install
```

---

## 🚀 Next Steps

After setup:

1. **Explore Admin Panel**
   - Create users
   - Add courses
   - Create events

2. **Test API**
   - Use Postman/Thunder Client
   - Test all endpoints

3. **Test Mobile App**
   - Register an account
   - Browse courses
   - Create posts
   - Test chat

4. **Customize**
   - Add your content
   - Update branding
   - Configure settings

---

## 📝 Important Notes

- Keep your `.env` file secure and never commit it
- Use strong passwords for production
- Change SECRET_KEY in production
- Set DEBUG=False in production
- Configure proper CORS origins for production
- Use HTTPS in production
- Set up proper backup for database

---

## 📚 Documentation

- Backend API: See `backend/README.md`
- Frontend: See `frontend/README.md`
- Main docs: See root `README.md`

---

## 💡 Tips

- Use VS Code with Python and React Native extensions
- Install PostgreSQL GUI tools (pgAdmin, DBeaver)
- Use Postman for API testing
- Enable hot reload in both backend and frontend
- Check logs for debugging

---

## 🆘 Getting Help

If you encounter issues:

1. Check error messages carefully
2. Review documentation
3. Check logs in terminal
4. Verify all dependencies are installed
5. Ensure all services are running

---

## ✨ Success!

If everything is set up correctly, you should see:
- ✅ Backend running on port 8000
- ✅ Admin panel accessible
- ✅ Frontend running via Expo
- ✅ Mobile app connecting to API
- ✅ Login and registration working

Happy coding! 🎉
