# Focus Health Academy

Complete mobile application for healthcare education, built with Django REST Framework and React Native.

## 📁 Project Structure

```
FocusHealthAcademy/
├── backend/              # Django REST Framework API
│   ├── accounts/         # User authentication
│   ├── courses/          # Course management
│   ├── events/           # Events & seminars
│   ├── timeline/         # Social feed
│   ├── chat/             # Messaging
│   └── config/           # Django settings
│
└── frontend/             # React Native app
    ├── src/
    │   ├── api/          # API services
    │   ├── components/   # UI components
    │   ├── navigation/   # App navigation
    │   ├── screens/      # Screen components
    │   └── theme/        # Design system
    └── App.js
```

## 🚀 Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Setup environment:
```bash
copy .env.example .env
# Edit .env with your settings
```

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Start server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/api/config.js`

4. Start Expo:
```bash
npm start
```

## 🎯 Features

### Backend (Django)
- ✅ JWT Authentication
- ✅ User Roles (Admin, Staff, Student)
- ✅ Course Management with Lessons
- ✅ Progress Tracking
- ✅ Events & Seminars
- ✅ Social Timeline (Posts, Comments, Likes)
- ✅ Chat System
- ✅ PostgreSQL Database
- ✅ RESTful API with DRF

### Frontend (React Native)
- ✅ Beautiful UI with FHA Brand Colors
- ✅ Authentication Flow
- ✅ Course Browsing & Enrollment
- ✅ Event Registration
- ✅ Social Feed
- ✅ Real-time Chat
- ✅ Profile Management
- ✅ Bottom Tab Navigation
- ✅ Responsive Design

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/login/` - Login
- `POST /api/v1/auth/register/` - Register
- `GET /api/v1/auth/profile/` - Get profile
- `POST /api/v1/auth/logout/` - Logout

### Courses
- `GET /api/v1/courses/` - List courses
- `GET /api/v1/courses/{id}/` - Course details
- `POST /api/v1/courses/{id}/enroll/` - Enroll
- `GET /api/v1/enrollments/` - My courses

### Events
- `GET /api/v1/events/` - List events
- `POST /api/v1/events/{id}/register/` - Register

### Timeline
- `GET /api/v1/posts/` - List posts
- `POST /api/v1/posts/` - Create post
- `POST /api/v1/posts/{id}/like/` - Like post

### Chat
- `GET /api/v1/chat-rooms/` - List chats
- `GET /api/v1/chat-rooms/{id}/messages/` - Get messages
- `POST /api/v1/chat-rooms/{id}/send_message/` - Send message

## 🎨 Design System

### Colors
- Primary: `#0C4DA2`
- Secondary: `#1A73E8`
- Accent: `#4BA3F7`

### Components
- Button (4 variants)
- Input (with icons & validation)
- CourseCard
- EventCard
- PostCard
- ChatBubble

## 📱 Screens

### Auth
- Login
- Register

### Main
- Home (featured content)
- Courses (browse & search)
- Events (upcoming & past)
- Timeline (social feed)
- Profile (user settings)

### Additional
- Course Details
- Event Details
- My Courses
- Chat
- Create Post

## 🔒 Security

- JWT with access & refresh tokens
- Password hashing (Django)
- CORS configuration
- Token blacklisting on logout
- Secure password validation

## 🗄️ Database Models

### User
- Email authentication
- Roles: admin, staff, student
- Profile fields

### Course
- Title, description, price
- Teacher relationship
- Online/In-person delivery

### Event
- Seminars, workshops, congresses
- Registration system
- Speakers

### Post
- Timeline content
- Comments & likes

### ChatRoom & Message
- Direct & group chats
- Read status tracking

## 📦 Technologies

### Backend
- Django 4.2.7
- Django REST Framework
- PostgreSQL
- SimpleJWT
- Pillow (image handling)

### Frontend
- React Native (Expo)
- React Navigation
- Axios
- AsyncStorage
- Vector Icons

## 🚀 Deployment

### Backend
1. Set `DEBUG=False`
2. Configure `ALLOWED_HOSTS`
3. Setup PostgreSQL
4. Collect static files
5. Use Gunicorn + Nginx

### Frontend
1. Build with Expo
2. Submit to App Store / Play Store

## 📝 Development

### Backend
```bash
cd backend
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm start
```

## 🧪 Testing

### Backend
```bash
python manage.py test
```

### Frontend
```bash
npm test
```

## 📄 License

Proprietary - All rights reserved by Focus Health Academy

## 👥 Support

For support, contact Focus Health Academy development team.
