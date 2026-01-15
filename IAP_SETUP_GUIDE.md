# In-App Purchase (IAP) Setup Guide
## iOS RevenueCat + App Store Connect Configuration

---

## ✅ What's Already Done

### Frontend
- ✅ PaymentScreen routes iOS → IAP, Android → Stripe  
- ✅ Payment service with RevenueCat integration  
- ✅ App.js initializes RevenueCat on startup  
- ✅ `react-native-purchases` package installed  

### Backend
- ✅ `courses/views.py` handles both IAP and Stripe  
- ✅ `events/views.py` handles both IAP and Stripe  
- ✅ Payment detection: Stripe IDs start with `pi_`, IAP IDs don't  

---

## 🔧 Configuration Steps

### Step 1: Get RevenueCat iOS API Key

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Select your project: **Focus Health Academy**
3. Navigate to: **Settings → API Keys**
4. Copy the **iOS API Key** (starts with `appl_...`)

### Step 2: Add API Key to App

Open `frontend/src/services/paymentService.js` and replace:

```javascript
const REVENUECAT_API_KEY = {
  ios: 'YOUR_IOS_API_KEY', // ← Paste your key here
  android: 'YOUR_ANDROID_API_KEY',
};
```

With:

```javascript
const REVENUECAT_API_KEY = {
  ios: 'appl_xxxxxxxxxxxxx', // ← Your actual key
  android: 'YOUR_ANDROID_API_KEY',
};
```

---

### Step 3: Create IAP Products in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app: **Focus Health Academy**
3. Navigate to: **Features → In-App Purchases**
4. Click **+** to create new products

#### Product Configuration

For **each course** and **event** in your database, create a product:

**Product Type:** Non-Consumable  
**Reference Name:** Course: [Course Title]  
**Product ID:** `course_{id}` (e.g., `course_1`, `course_2`)  
**Price:** Match your course price in EUR  

Example:
- Product ID: `course_1`
- Reference Name: Course: Introduction to Health Sciences
- Price Tier: €49.99
- Type: Non-Consumable

**For Events:**
- Product ID: `event_1`
- Reference Name: Event: Annual Health Summit 2026
- Price: €99.99
- Type: Non-Consumable

#### Important Notes:
- Product IDs must match the format: `course_{id}` or `event_{id}`
- The `{id}` must match your database course/event ID
- Use **Non-Consumable** type (one-time purchase, lifetime access)

---

### Step 4: Link Products in RevenueCat

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Navigate to: **Products**
3. Click **+ New** to add products
4. **Import from App Store Connect** (recommended)
   - RevenueCat will auto-detect your IAP products
   - Select all course/event products
   - Click Import

OR manually add each product:
- **Product ID:** `course_1`
- **Store:** App Store
- **Type:** Non-Consumable

---

### Step 5: Test with Sandbox Account

#### Create Sandbox Tester
1. App Store Connect → **Users and Access → Sandbox Testers**
2. Click **+** to create tester
3. Email: `test@focushealth.com` (any email)
4. Password: Create a strong password
5. Region: France

#### Test IAP
1. Sign out of App Store on your iPhone
2. Build and run your app: `npx expo run:ios`
3. Attempt to purchase a course
4. Sign in with sandbox tester account when prompted
5. Complete purchase (no real charge)

---

## 📋 Quick Reference: Product ID Format

Your app uses this format to identify products:

| Type   | Database ID | Product ID  |
|--------|-------------|-------------|
| Course | 1           | `course_1`  |
| Course | 23          | `course_23` |
| Event  | 5           | `event_5`   |
| Event  | 142         | `event_142` |

**Backend automatically generates the correct Product ID:**
```javascript
const productId = `${type}_${itemId}`; // e.g., "course_1"
```

---

## 🧪 Testing Checklist

- [ ] RevenueCat iOS API key added to `paymentService.js`
- [ ] Created at least 1 test course IAP product in App Store Connect
- [ ] Created at least 1 test event IAP product in App Store Connect
- [ ] Products imported/added in RevenueCat dashboard
- [ ] Created sandbox tester account
- [ ] Built iOS app: `npx expo run:ios`
- [ ] Tested purchase flow on iOS device/simulator
- [ ] Verified backend receives transaction ID
- [ ] Confirmed enrollment/registration created successfully
- [ ] Tested Android still uses Stripe (unchanged)

---

## 🚨 Common Issues & Solutions

### "Product not found" error
- **Cause:** Product ID mismatch
- **Fix:** Ensure Product ID in App Store Connect matches `course_{id}` or `event_{id}`

### "Invalid API key" error
- **Cause:** Wrong API key or not saved
- **Fix:** Copy the correct iOS API key from RevenueCat → Settings → API Keys

### Sandbox purchase doesn't work
- **Cause:** Signed in with real Apple ID
- **Fix:** Sign out completely, then use sandbox tester account

### Backend shows "Payment not completed"
- **Cause:** Transaction ID not sent properly
- **Fix:** Check frontend logs for transaction ID format

---

## 📞 Support

- **RevenueCat Docs:** https://docs.revenuecat.com
- **App Store Connect:** https://developer.apple.com/app-store-connect
- **IAP Guidelines:** https://developer.apple.com/in-app-purchase

---

## 🎯 Next: Apple Review Response

Once IAP is configured, you need to respond to Apple's review questions.

See `APPLE_REVIEW_RESPONSE.md` for the draft response.
