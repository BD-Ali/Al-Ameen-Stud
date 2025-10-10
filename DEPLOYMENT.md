# Al-Ameen Stable - Deployment Guide

## 🚀 Complete Setup Instructions

### 1. Firebase Setup

#### Create a Firebase Project:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or "Create a project"
3. Enter project name: "al-ameen-stable" (or your preferred name)
4. Follow the setup wizard (disable Google Analytics if not needed)

#### Enable Authentication:
1. In Firebase Console, go to **Build** > **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** authentication
4. Click "Save"

#### Create Firestore Database:
1. Go to **Build** > **Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll add rules next)
4. Select a location closest to your users
5. Click "Enable"

#### Set Firestore Security Rules:
In Firestore Database, go to the **Rules** tab and replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Clients collection - admins can write, clients can read their own
    match /clients/{clientId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == clientId || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Horses - admins can read/write, others can read
    match /horses/{horseId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Lessons - admins can write, authenticated users can read
    match /lessons/{lessonId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Workers - only admins
    match /workers/{workerId} {
      allow read, write: if request.auth != null && 
                           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

#### Get Firebase Configuration:
1. In Firebase Console, click the gear icon ⚙️ > **Project settings**
2. Scroll down to "Your apps"
3. Click the **Web** icon `</>`
4. Register app (nickname: "Al-Ameen Stable Web")
5. Copy the `firebaseConfig` object
6. Open `firebaseConfig.js` in your project
7. Replace the placeholder values with your actual config

### 2. Install Dependencies

```bash
cd Al-Ameen-Stable
npm install
```

### 3. Update Firebase Config

Edit `firebaseConfig.js` with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 4. Create First Admin Account

Since the first user needs to be an admin, you have two options:

**Option A: Manual in Firebase Console**
1. Run the app and sign up as a client first
2. Go to Firebase Console > Firestore Database
3. Find the `users` collection
4. Find your user document
5. Edit the `role` field to `"admin"`

**Option B: Via Code (Temporary)**
- Sign up through the app with admin role selected

### 5. Test Locally

```bash
npm start
```

**For Web Testing:**
- Press `w` for web (works perfectly!)

**For iOS/Android Testing:**
- **Important**: Expo Go has limitations with Firebase
- You need to create a development build (see below)

### 6. iOS Development Build (Required for Firebase on iOS)

Since Expo Go doesn't support all Firebase features on iOS, you need to create a development build:

#### Step 1: Build for iOS
```bash
# Create a development build for iOS
eas build --profile development --platform ios
```

This will:
- Upload your code to Expo servers
- Build a custom iOS app with full Firebase support
- Takes about 10-15 minutes

#### Step 2: Install on Your iPhone
1. After the build completes, you'll get a download link
2. Open the link on your iPhone
3. Follow the instructions to install the app
4. Trust the developer certificate in Settings > General > VPN & Device Management

#### Step 3: Run the Development Server
```bash
npm start
```
Then scan the QR code with your custom-built app!

### 7. Deploy to Production

#### For Web Hosting (Firebase Hosting):

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Hosting
# - Use existing project (select your Firebase project)
# - Public directory: web-build
# - Single-page app: Yes
# - GitHub deploys: No

# Build web version
npx expo export:web

# Deploy
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

#### For Mobile App Stores:

**Android (Google Play Store):**
```bash
# Build Android app bundle
eas build --platform android

# After download, upload to Google Play Console
```

**iOS (Apple App Store):**
```bash
# Build iOS app (requires Mac)
eas build --platform ios

# After download, upload to App Store Connect
```

For mobile builds, you'll need:
1. Expo account: Sign up at [expo.dev](https://expo.dev)
2. EAS CLI: `npm install -g eas-cli`
3. Configure app: `eas build:configure`

### 7. Environment Variables (Optional)

For better security, you can use environment variables:

Create `.env` file:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
# ... other config
```

Then update `firebaseConfig.js` to use them.

## 🔧 iOS Troubleshooting

### Why doesn't it work in Expo Go on iOS?
Expo Go is a sandbox app with limitations:
- ❌ Cannot use Firebase Authentication native features
- ❌ Limited Firestore support
- ❌ Some native modules disabled

### Solution: Development Build
A development build is a custom version of your app that includes:
- ✅ Full Firebase Authentication support
- ✅ Complete Firestore database access
- ✅ All native modules enabled
- ✅ Custom configurations

### Quick Commands

**Web Testing (Always Works):**
```bash
npm start
# Press 'w'
```

**iOS Development Build:**
```bash
eas build --profile development --platform ios
```

**Android Development Build:**
```bash
eas build --profile development --platform android
```

**Production Build for App Store:**
```bash
eas build --profile production --platform ios
```

## 📱 User Roles

### Admin
- Full access to all features
- Manage horses, clients, workers, lessons, feeding schedules
- View/edit all data

### Client  
- View their own lessons
- See payment status
- Limited to personal information

### Visitor
- Browse public information
- No authentication required

## 🔒 Security Best Practices

1. **Never commit** your actual Firebase config to public repositories
2. Enable **App Check** in Firebase for production
3. Set up **reCAPTCHA** for web authentication
4. Regularly review Firestore security rules
5. Monitor authentication events in Firebase Console

## 🐛 Troubleshooting

### "Firebase config not found"
- Make sure you've updated `firebaseConfig.js` with your actual credentials

### "Permission denied" errors
- Check Firestore security rules
- Ensure user role is set correctly in the `users` collection

### App won't start
```bash
# Clear cache and restart
npx expo start -c
```

### Build errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📞 Support

For issues:
1. Check Firebase Console for errors
2. Review Firestore logs
3. Check Authentication logs

## 🎉 You're Ready!

Your Al-Ameen Stable app is now ready for production use with:
- ✅ User authentication (sign up/sign in)
- ✅ Cloud database (Firestore)
- ✅ Real-time data sync
- ✅ Role-based access control
- ✅ Ready for web and mobile deployment
