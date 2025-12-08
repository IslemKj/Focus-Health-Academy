# Focus Health Academy - Production Deployment Guide

## Overview
This guide walks you through deploying the Focus Health Academy Django backend to PythonAnywhere and building the React Native mobile app for production.

---

## Part 1: Backend Deployment (PythonAnywhere)

### Prerequisites
- PythonAnywhere Hacker plan ($12/month) ✅
- Domain: focushealth-academy.com ✅
- PostgreSQL database (create on PythonAnywhere)
- Stripe live API keys

---

### Step 1: Domain & DNS Setup (Namecheap)

1. **Log in to Namecheap** → Domain List → Manage `focushealth-academy.com`

2. **Add API subdomain:**
   - Go to "Advanced DNS"
   - Add new record:
     ```
     Type: CNAME Record
     Host: api
     Value: yourusername.pythonanywhere.com
     TTL: Automatic
     ```

3. **Wait for DNS propagation** (5-30 minutes)

---

### Step 2: PythonAnywhere Setup

#### 2.1 Create PostgreSQL Database
1. Go to **Databases** tab
2. Create new PostgreSQL database:
   - Database name: `focushealthacademy`
   - Note the password provided

#### 2.2 Upload Code
1. Open **Bash console**
2. Clone your repository:
   ```bash
   cd ~
   git clone https://github.com/IslemKj/Focus-Health-Academy.git
   cd Focus-Health-Academy/backend
   ```

   **OR** upload via **Files** tab if not using Git

#### 2.3 Create Virtual Environment
```bash
cd ~/Focus-Health-Academy/backend
mkvirtualenv --python=/usr/bin/python3.10 focushealth
pip install -r requirements.txt
```

#### 2.4 Create Production Environment File
Create `~/Focus-Health-Academy/backend/.env`:
```bash
nano ~/Focus-Health-Academy/backend/.env
```

Paste this content (replace with your actual values):
```env
# Database Configuration
DB_NAME=yourusername$focushealthacademy
DB_USER=yourusername
DB_PASSWORD=your_postgresql_password_here
DB_HOST=yourusername-0000.postgres.pythonanywhere-services.com
DB_PORT=10000

# Django Settings
SECRET_KEY=#jn_7o172r*@=1)#sr&31pamz%ci14nke7x1x6n_**6)wo8v9^
DEBUG=False
ALLOWED_HOSTS=api.focushealth-academy.com,yourusername.pythonanywhere.com

# CORS Settings
CORS_ALLOWED_ORIGINS=https://focushealth-academy.com,https://www.focushealth-academy.com

# Email Settings (Namecheap)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=mail.privateemail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@focushealth-academy.com
EMAIL_HOST_PASSWORD=your_email_password_here
DEFAULT_FROM_EMAIL=Focus Health Academy <your_email@focushealth-academy.com>

# Stripe Keys (get from Stripe Dashboard)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
```

**Generate SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### 2.5 Run Migrations
```bash
workon focushealth
cd ~/Focus-Health-Academy/backend
python manage.py migrate
python manage.py collectstatic --noinput
```

#### 2.6 Create Superuser
```bash
python manage.py createsuperuser
```

---

### Step 3: Configure Web App

1. Go to **Web** tab → **Add a new web app**
2. Choose **Manual configuration** → Python 3.10
3. Set virtualenv path: `/home/yourusername/.virtualenvs/focushealth`

#### 3.1 WSGI Configuration
Click on **WSGI configuration file** link, replace all content with:

```python
# WSGI configuration for Focus Health Academy
import os
import sys

# Add your project directory to the sys.path
path = '/home/yourusername/Focus-Health-Academy/backend'
if path not in sys.path:
    sys.path.insert(0, path)

# Set environment variables
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'

# Load environment variables from .env
from pathlib import Path
from decouple import config

# Load .env file
env_path = Path(path) / '.env'

# Import Django application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

#### 3.2 Static Files Mapping
In **Web** tab → **Static files** section:

| URL | Directory |
|-----|-----------|
| /static/ | /home/yourusername/Focus-Health-Academy/backend/staticfiles |
| /media/ | /home/yourusername/Focus-Health-Academy/backend/media |

#### 3.3 Add Custom Domain
- Go to **Web** tab → **Add custom domain**
- Enter: `api.focushealth-academy.com`
- Enable HTTPS (force HTTPS redirect)

#### 3.4 Reload Web App
Click big green **Reload** button

---

### Step 4: Test Backend

Visit: `https://api.focushealth-academy.com/admin/`
- Should see Django admin login
- Log in with superuser credentials
- ✅ Backend is live!

---

## Part 2: Frontend Mobile App

### Step 1: Update API Configuration

The API configuration is already set up to automatically use production URL when building.

In `frontend/src/api/config.js`:
```javascript
// Automatically uses production or development API
export const API_BASE_URL = __DEV__
  ? 'http://192.168.100.11:8000/api/v1'  // Development
  : 'https://api.focushealth-academy.com/api/v1';  // Production
```

### Step 2: Update app.json

Edit `frontend/app.json` and add/update:

```json
{
  "expo": {
    "name": "Focus Health Academy",
    "slug": "focus-health-academy",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.focushealth.academy",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.focushealth.academy",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

### Step 3: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 4: Login to Expo

```bash
cd frontend
eas login
```

### Step 5: Configure EAS Build

```bash
eas build:configure
```

This will use the existing `eas.json` configuration.

### Step 6: Build APK (Android)

```bash
# Preview build (for testing)
eas build --platform android --profile preview

# Production build (for Play Store)
eas build --platform android --profile production
```

Build takes 10-20 minutes. You'll get a download link for the APK.

### Step 7: Build iOS (if needed)

```bash
eas build --platform ios --profile production
```

**Note:** iOS requires Apple Developer account ($99/year)

---

## Part 3: Stripe Webhook Configuration

### Update Stripe Webhook URL

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Update endpoint URL to: `https://api.focushealth-academy.com/api/v1/payments/webhook/`
3. Copy the new **webhook signing secret**
4. Update `STRIPE_WEBHOOK_SECRET` in `.env` on PythonAnywhere
5. Reload web app

---

## Part 4: Final Checks

### Backend Checklist
- [ ] Database migrations completed
- [ ] Superuser created
- [ ] Admin panel accessible at `https://api.focushealth-academy.com/admin/`
- [ ] Static files serving correctly
- [ ] Media files uploading
- [ ] Stripe webhooks receiving events
- [ ] Email sending working (test password reset)
- [ ] CORS configured for mobile app
- [ ] HTTPS enabled and forced

### Frontend Checklist
- [ ] API_BASE_URL points to production
- [ ] App builds successfully
- [ ] Can register new account
- [ ] Can login
- [ ] Can browse courses/events
- [ ] Can make purchases
- [ ] QR codes generate correctly
- [ ] Notifications working
- [ ] Timeline posts working

---

## Part 5: Publishing Mobile App

### Android (Google Play Store)

1. **Create Play Console Account** ($25 one-time fee)
2. **Create App Listing**
3. **Upload APK/AAB:**
   ```bash
   eas submit --platform android
   ```
4. **Fill out store listing:**
   - Screenshots (multiple devices)
   - App description
   - Privacy policy URL: `https://focushealth-academy.com/privacy` (if you have it)
   - Contact info
5. **Submit for review** (takes 1-3 days)

### iOS (Apple App Store)

1. **Apple Developer Account** ($99/year)
2. **Create App in App Store Connect**
3. **Upload build:**
   ```bash
   eas submit --platform ios
   ```
4. **Fill out metadata** (similar to Android)
5. **Submit for review** (takes 1-7 days)

---

## Maintenance

### Update Backend Code
```bash
cd ~/Focus-Health-Academy/backend
git pull origin master
workon focushealth
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
# Go to Web tab → Reload
```

### Update Mobile App
```bash
cd frontend
# Update version in app.json
eas build --platform android --profile production
eas submit --platform android
```

---

## Troubleshooting

### Backend Issues

**500 Error:**
- Check error logs: PythonAnywhere → Web → Error log
- Check environment variables in `.env`
- Verify database connection

**Static files not loading:**
- Run `python manage.py collectstatic`
- Check static files mapping in Web tab

**Stripe webhooks failing:**
- Verify webhook URL in Stripe Dashboard
- Check webhook secret matches `.env`
- Test with Stripe CLI

### Frontend Issues

**Cannot connect to API:**
- Check `API_BASE_URL` in `config.js`
- Verify CORS settings in backend
- Check if API is accessible in browser

**Build fails:**
- Clear cache: `npx expo start -c`
- Delete `node_modules` and reinstall
- Check for missing dependencies

---

## Security Notes

- ✅ Never commit `.env` files to Git
- ✅ Use strong SECRET_KEY (min 50 characters)
- ✅ Keep DEBUG=False in production
- ✅ Use Stripe LIVE keys (not test keys)
- ✅ Enable HTTPS on PythonAnywhere
- ✅ Regularly update dependencies
- ✅ Monitor error logs

---

## Support Resources

- **PythonAnywhere Forums:** https://www.pythonanywhere.com/forums/
- **Expo Docs:** https://docs.expo.dev/
- **Django Docs:** https://docs.djangoproject.com/
- **Stripe Docs:** https://stripe.com/docs

---

**You're ready to deploy! 🚀**

Good luck with your production launch!