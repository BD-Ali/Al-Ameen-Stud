# Al-Ameen Stable - Quick Start Guide

## 🎯 Quick Setup (5 minutes)

### Step 1: Set up Firebase

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create a new project** called "al-ameen-stable"
3. **Enable Email/Password Authentication**:
   - Go to Build > Authentication
   - Click "Get Started"
   - Enable "Email/Password"
   
4. **Create Firestore Database**:
   - Go to Build > Firestore Database
   - Click "Create database"
   - Start in **production mode**
   - Choose your region

5. **Copy your Firebase config**:
   - Click ⚙️ (Settings) > Project settings
   - Scroll to "Your apps"
   - Click Web icon `</>`
   - Copy the firebaseConfig object
   - **Replace the config in `firebaseConfig.js`**

### Step 2: Update Firebase Config

Open `firebaseConfig.js` and replace with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 3: Set Firestore Rules

In Firebase Console > Firestore > Rules tab, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /clients/{clientId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /horses/{horseId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /lessons/{lessonId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /workers/{workerId} {
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Step 4: Run the App

```bash
npm start
```

Press `w` for web browser testing.

### Step 5: Create Your First Admin Account

1. Click "Sign Up"
2. Enter your email and password
3. Enter your name
4. Select **"Admin"** role
5. Click "Sign Up"

🎉 **Done!** You're ready to use the app!

## 📱 Features Now Available

✅ **User Authentication**
- Sign up with email/password
- Sign in to existing accounts
- Role-based access (Admin/Client/Visitor)

✅ **Cloud Database**
- All data stored in Firebase Firestore
- Real-time synchronization
- Accessible from anywhere

✅ **Admin Features**
- Manage horses
- Track feeding schedules
- Schedule lessons
- Manage clients and payments
- Manage workers

✅ **Client Features**
- View scheduled lessons
- Check payment status
- See instructor assignments

✅ **Visitor Features**
- Browse public stable information
- No login required

## 🌐 Deploy Online

### For Web (Free):
```bash
npm install -g firebase-tools
firebase login
firebase init
npx expo export:web
firebase deploy
```

Your app will be live at: `https://your-project.web.app`

### For Mobile Apps:
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## 🔐 Security

- All passwords are encrypted
- Role-based access control
- Firestore security rules enforced
- User data protected

## 📞 Need Help?

Check `DEPLOYMENT.md` for detailed instructions.

---

**Your stable management system is now production-ready! 🐴**

