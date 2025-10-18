npm run web

# Start with dev client
npm run start:dev
```

### Development Workflow

1. **Hot Reload**: Changes appear instantly in the app
2. **Debug Menu**: Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
3. **Console Logs**: Use React Native Debugger or browser console
4. **Inspect Elements**: Enable "Show Inspector" from debug menu

### Code Style

- **Components**: PascalCase (e.g., `HorsesScreen.js`)
- **Functions**: camelCase (e.g., `getUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_KEY`)
- **Spacing**: 2 spaces indentation
- **RTL Support**: Arabic text with right-to-left layout

## 📦 Building

### Development Builds (EAS)

Requires EAS CLI: `npm install -g eas-cli`

```bash
# iOS development build
npm run build:dev:ios

# Android development build
npm run build:dev:android
```

### Production Builds

```bash
# iOS production build
eas build --profile production --platform ios

# Android production build (APK)
eas build --profile production --platform android

# Both platforms
eas build --profile production --platform all
```

### Build Profiles

Configured in `eas.json`:
- **development**: Dev client builds for testing
- **preview**: Testing builds without dev client
- **production**: Optimized production builds

## 📜 Scripts Reference

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run start:dev` | Start with dev client |
| `npm run ios` | Run on iOS simulator |
| `npm run ios:dev` | Run on iOS with dev client |
| `npm run android` | Run on Android emulator |
| `npm run web` | Run in web browser |
| `npm run build:dev:ios` | Build iOS development version |
| `npm run build:dev:android` | Build Android development version |

## 🔧 Troubleshooting

### Common Issues

#### 1. "Metro bundler error"
```bash
# Clear cache and restart
expo start -c
```

#### 2. "Firebase not initialized"
- Verify `firebaseConfig.js` has correct credentials
- Check Firebase project is active in console
- Ensure Firestore and Authentication are enabled

#### 3. "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

#### 4. "iOS build fails"
```bash
# Clear CocoaPods cache
cd ios && pod deintegrate && pod install
```

#### 5. "Android build fails"
```bash
# Clean Android build
cd android && ./gradlew clean
```

#### 6. "Authentication errors"
- Verify Firebase Authentication is enabled
- Check email/password provider is activated
- Ensure user credentials are correct

#### 7. "Data not loading"
- Check Firestore security rules
- Verify network connection
- Check browser console for Firebase errors

### Debug Mode

Enable debug mode by opening the debug menu:
- **iOS**: `Cmd + D` or shake device
- **Android**: `Cmd + M` or shake device
- Select "Debug Remote JS" or "Start Remote Debugging"

### Logs Location

- **Expo logs**: In terminal running `npm start`
- **Device logs**: Use React Native Debugger
- **Firebase logs**: Firebase Console → Firestore → Usage tab

## 📱 Default Users

After running data initialization:

- **Admin**: 
  - Email: `admin@alameen.com`
  - Password: `admin123`

- **Client**: Created via admin panel
- **Worker**: Created via admin panel

## 🎨 Customization

### Theme Colors

Edit `src/styles/theme.js`:
```javascript
export const colors = {
  primary: { main: '#1e3a8a', light: '#3b82f6', dark: '#1e40af' },
  // ... customize colors
};
```

### App Icon & Splash

Replace files in `assets/`:
- `icon.png` - 1024x1024 px
- `splash.png` - 1284x2778 px (iPhone 14 Pro Max)

Update `app.json` if needed.

## 🔐 Security Best Practices

1. **Never commit** `firebaseConfig.js` with real credentials to public repos
2. **Use Firebase Security Rules** to restrict data access
3. **Enable Firebase App Check** for production
4. **Use HTTPS** for all API calls
5. **Validate user input** on client and server
6. **Implement rate limiting** for sensitive operations

## 🐛 Known Issues

None currently. Report issues at [repository-issues-url]

## 🚦 Performance Optimization

- **Lazy Loading**: Screens load on demand
- **Memoization**: `useMemo` for expensive calculations
- **FlatList**: Virtualized lists for large datasets
- **Image Optimization**: Compressed assets
- **Firebase Indexes**: Optimized Firestore queries

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 👥 Credits

Developed for Al-Ameen Stable Management

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Expo SDK**: 54.0.0  
**React Native**: 0.81.4
# 🐴 Al-Ameen Stable Management System

A professional React Native application for managing horse stable operations, built with Expo and Firebase. This comprehensive system handles horse care, client management, lesson scheduling, staff coordination, and feeding schedules.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Development](#development)
- [Building](#building)
- [Scripts Reference](#scripts-reference)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## ✨ Features

### 👨‍💼 Administrator Dashboard
- **Horse Management**: Add, edit, and track horses with detailed profiles (breed, age, health status)
- **Task Reminders**: Schedule notifications for horse care, grooming, vet visits, and maintenance
- **Lesson Scheduling**: Coordinate lessons between clients, horses, and instructors with calendar view
- **Users Management**: Unified interface for managing both clients and workers
  - Client payment tracking (paid/due amounts)
  - Client lesson history
  - Worker role management
  - Search and filter functionality
- **Feeding Schedule**: Maintain feeding plans and times for all horses
- **Weekly Schedule**: Visual weekly work schedule for staff assignments
- **Missions/Tasks**: Track daily operational tasks and completion status

### 👤 Client Portal
- View upcoming and past lessons with dates and assigned horses
- Check payment status (amount paid vs. amount due)
- See lesson history with timestamps
- Access assigned instructors and horses

### 👥 Visitor View
- Browse available horses with breed information
- View public stable information
- No authentication required for public content

## 🗂️ Project Structure

```
Al-Ameen-Stable/
├── App.js                      # Main app entry point with navigation
├── app.json                    # Expo configuration
├── package.json                # Dependencies and scripts
├── babel.config.js             # Babel configuration
├── metro.config.js             # Metro bundler configuration
├── eas.json                    # EAS Build configuration
├── .gitignore                  # Git ignore rules
│
├── assets/                     # Static assets
│   ├── icon.png               # App icon (1024x1024)
│   └── splash.png             # Splash screen
│
└── src/                       # Source code
    │
    ├── components/            # Reusable UI components
    │   ├── AdminTabs.js      # Admin navigation tabs with logout
    │   └── OptimizedClearSchedule.js  # Schedule clearing component
    │
    ├── config/               # Configuration files
    │   ├── firebaseConfig.js        # Firebase initialization & credentials
    │   └── initializeData.js        # Database initialization helpers
    │
    ├── context/              # React Context providers
    │   ├── AuthContext.js   # Authentication & user session management
    │   └── DataContext.js   # Application data & Firebase operations
    │
    ├── screens/             # Application screens
    │   ├── LoginScreen.js           # Authentication (Admin/Client/Worker)
    │   ├── VisitorHomeScreen.js     # Public visitor dashboard
    │   ├── ClientHomeScreen.js      # Client dashboard with lessons
    │   ├── WorkerHomeScreen.js      # Worker dashboard with tasks
    │   ├── HorsesScreen.js          # Horse management (Admin)
    │   ├── FeedScreen.js            # Feeding schedules (Admin)
    │   ├── LessonsScreen.js         # Lesson scheduling (Admin)
    │   ├── UsersScreen.js           # Unified users management (Admin)
    │   ├── MissionsScreen.js        # Task management (Admin)
    │   └── WeeklyScheduleScreen.js  # Weekly staff schedule (Admin)
    │
    └── styles/              # Design system
        └── theme.js        # Colors, typography, spacing constants
```

## 🛠️ Tech Stack

- **Framework**: React Native 0.81.4 / React 19.1.0
- **Platform**: Expo ~54.0.0
- **Navigation**: React Navigation v6 (Stack & Bottom Tabs)
- **Backend**: Firebase (Firestore, Authentication, Notifications)
- **State Management**: React Context API
- **Storage**: AsyncStorage for local persistence
- **UI Components**: Custom components with consistent theme
- **Date/Time**: React Native DateTimePicker
- **Notifications**: Expo Notifications

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v14 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn**: Package manager
- **Expo CLI**: `npm install -g expo-cli`
- **Firebase Account**: For backend services ([Get started](https://firebase.google.com/))
- **iOS**: Xcode (for iOS development)
- **Android**: Android Studio (for Android development)

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd Al-Ameen-Stable
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure Firebase** (see [Configuration](#configuration) section below)

4. **Start the development server**:
```bash
npm start
```

5. **Run on your preferred platform**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on physical device

## ⚙️ Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)

2. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password authentication

3. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)

4. Get Firebase credentials:
   - Go to Project Settings → General
   - Scroll to "Your apps" and add a web app
   - Copy the configuration object

5. Update `src/config/firebaseConfig.js`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Firestore Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin-only collections
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Environment Variables

No `.env` file is required. All configuration is in `src/config/firebaseConfig.js`.

## 💻 Development

### Running the App

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on iOS with dev client
npm run ios:dev

# Run on Android emulator
npm run android

# Run in web browser

