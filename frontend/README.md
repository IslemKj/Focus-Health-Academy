# Focus Health Academy - Frontend

React Native mobile application for Focus Health Academy.

## 🚀 Features

- **User Authentication**: Login, registration, and profile management
- **Courses**: Browse and enroll in courses with progress tracking
- **Events**: Discover and register for seminars and workshops
- **Timeline**: Social feed with posts, comments, and likes
- **Chat**: Real-time messaging with staff and other users
- **Responsive UI**: Clean design with FHA brand colors

## 📋 Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (Mac) or Android Studio (for development)
- Expo Go app (for testing on physical devices)

## 🔧 Installation

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Update API configuration**:
Edit `src/api/config.js` and set your backend URL:
```javascript
export const API_BASE_URL = 'http://your-backend-url/api/v1';
```

3. **Start development server**:
```bash
npm start
```

4. **Run on device/simulator**:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/              # API services and client
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation setup
│   ├── screens/          # Screen components
│   │   ├── Auth/         # Login, Register
│   │   ├── Public/       # Home, Courses, Events
│   │   ├── Dashboard/    # My Courses, Progress
│   │   ├── Timeline/     # Social feed
│   │   ├── Chat/         # Messaging
│   │   └── Profile/      # User profile
│   └── theme/            # Colors, typography, spacing
├── App.js               # Main app component
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## 🎨 Theme

The app uses the FHA brand colors:
- **Primary**: `#0C4DA2`
- **Secondary**: `#1A73E8`
- **Accent**: `#4BA3F7`

All colors and styling are defined in `src/theme/`.

## 🔧 Components

### Reusable Components
- **Button**: Customizable button with variants (primary, secondary, outline, ghost)
- **Input**: Text input with label, icons, and validation
- **CourseCard**: Display course information
- **EventCard**: Display event information
- **PostCard**: Display timeline posts
- **ChatBubble**: Display chat messages

## 📱 Screens

### Authentication
- Login Screen
- Register Screen

### Public
- Home Screen (featured content)
- Courses Screen (browse all courses)
- Course Details Screen
- Events Screen (upcoming events)
- Event Details Screen

### Dashboard
- My Courses Screen
- Course Player Screen

### Social
- Timeline Screen (posts feed)
- Create Post Screen

### Chat
- Chat List Screen
- Chat Room Screen

### Profile
- Profile Screen
- Edit Profile Screen

## 🔐 Authentication

The app uses JWT authentication with automatic token refresh:
- Access tokens stored in AsyncStorage
- Axios interceptors handle token injection
- Automatic refresh on 401 errors
- Secure logout with token blacklisting

## 📡 API Services

All API calls are organized in `src/api/`:
- `auth.js` - Authentication endpoints
- `courses.js` - Course management
- `events.js` - Event management
- `timeline.js` - Social feed
- `chat.js` - Messaging

## 🚀 Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## 🧪 Testing

```bash
npm test
```

## 📚 Technologies

- React Native 0.76.5
- Expo SDK 54
- React Navigation 7
- Axios
- AsyncStorage
- React Native Vector Icons
- Expo Image Picker
- React Native Video

## 👥 Contributing

This is a private project for Focus Health Academy.

## 📄 License

Proprietary - All rights reserved by Focus Health Academy
