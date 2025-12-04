# Focus Health Academy - Backend

Django REST Framework backend for the Focus Health Academy mobile application.

## 🚀 Features

- **User Authentication**: JWT-based authentication with role management (admin, staff, student)
- **Courses Management**: Complete course system with lessons, enrollments, and progress tracking
- **Events System**: Seminars, congresses, and workshops (online & in-person)
- **Timeline/Social Feed**: Posts, comments, and likes functionality
- **Chat System**: Real-time messaging between users and staff

## 📋 Prerequisites

- Python 3.10+
- PostgreSQL 14+
- pip

## 🔧 Installation

1. **Create virtual environment**:
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Setup environment variables**:
```bash
copy .env.example .env
# Edit .env with your database credentials
```

4. **Create PostgreSQL database**:
```sql
CREATE DATABASE focus_health_academy;
```

5. **Run migrations**:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Create superuser**:
```bash
python manage.py createsuperuser
```

7. **Run development server**:
```bash
python manage.py runserver
```

## 📁 Project Structure

```
backend/
├── config/              # Project settings
├── accounts/            # User authentication & profiles
├── courses/             # Course management
├── events/              # Events & seminars
├── timeline/            # Social feed
├── chat/                # Messaging system
├── media/               # User uploaded files
└── manage.py
```

## 🔗 API Endpoints

### Authentication (`/api/v1/auth/`)
- `POST /register/` - Register new user
- `POST /login/` - Login user
- `POST /logout/` - Logout user
- `POST /refresh/` - Refresh JWT token
- `GET/PUT/PATCH /profile/` - User profile
- `POST /change-password/` - Change password
- `POST /password-reset/` - Request password reset
- `POST /password-reset-confirm/` - Confirm password reset

### Courses (`/api/v1/courses/`)
- `GET /` - List all courses
- `GET /{id}/` - Course details
- `POST /{id}/enroll/` - Enroll in course
- `POST /{id}/unenroll/` - Unenroll from course

### Lessons (`/api/v1/lessons/`)
- `GET /` - List lessons
- `GET /{id}/` - Lesson details
- `POST /{id}/complete/` - Mark lesson as completed

### Events (`/api/v1/events/`)
- `GET /` - List all events
- `GET /{id}/` - Event details
- `POST /{id}/register/` - Register for event
- `POST /{id}/cancel_registration/` - Cancel registration

### Timeline (`/api/v1/posts/`)
- `GET /` - List all posts
- `GET /{id}/` - Post details
- `POST /` - Create post
- `POST /{id}/like/` - Like post
- `POST /{id}/unlike/` - Unlike post
- `POST /{id}/add_comment/` - Add comment

### Chat (`/api/v1/chat-rooms/`)
- `GET /` - List chat rooms
- `GET /{id}/messages/` - Get messages
- `POST /{id}/send_message/` - Send message
- `POST /get_or_create_direct_chat/` - Start direct chat

## 🗄️ Database Models

### User Model
- Custom user with email authentication
- Roles: admin, staff, student
- Profile fields: avatar, bio, phone, address

### Course Model
- Title, description, price, image
- Category, level, duration
- Online/in-person delivery
- Teacher relationship

### Event Model
- Seminars, congresses, workshops
- Start/end dates
- Venue information for in-person
- Registration system

### Post Model
- Timeline/social feed posts
- Comments and likes
- Author relationship

### ChatRoom & Message Models
- Direct and group chats
- Message read status
- File attachments

## 🔐 Security

- JWT authentication with access/refresh tokens
- Password validation and hashing
- CORS configuration for mobile app
- PostgreSQL for data integrity

## 🧪 Testing

```bash
python manage.py test
```

## 📝 Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/`

All models are registered with comprehensive admin interfaces.

## 🚀 Deployment

1. Set `DEBUG=False` in production
2. Configure `ALLOWED_HOSTS`
3. Set up static file serving
4. Use gunicorn as WSGI server
5. Configure PostgreSQL connection pooling

## 📚 Technologies

- Django 4.2.7
- Django REST Framework 3.14.0
- PostgreSQL (psycopg2)
- SimpleJWT for authentication
- Django CORS Headers
- Django Channels (for future WebSocket support)

## 👥 Contributing

This is a private project for Focus Health Academy.

## 📄 License

Proprietary - All rights reserved by Focus Health Academy
