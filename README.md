# 🐴 Al-Ameen Stable Management System

<div align="center">

![Al-Ameen Stable](./assets/icon.png)

**A comprehensive mobile application for managing horse stables, lessons, and client relationships**

[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0.0-000020.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-Private-red.svg)]()

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Firebase Setup](#firebase-setup)
  - [Running the App](#running-the-app)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [Core Modules](#-core-modules)
- [Notification System](#-notification-system)
- [RTL Support](#-rtl-support)
- [Building for Production](#-building-for-production)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🎯 Overview

**Al-Ameen Stable** is a professional-grade mobile application designed to streamline the management of horse stables. Built with React Native and Expo, it provides a complete solution for managing horses, scheduling lessons, tracking clients, coordinating workers, and communicating through announcements.

The application supports **multiple user roles** (Admin, Client, Worker, Visitor) with tailored experiences for each, and features a robust **notification system** with lesson reminders and real-time announcements.

### Key Highlights

- 📱 **Cross-Platform**: iOS, Android, and Web support
- 🔐 **Secure Authentication**: Firebase Authentication with role-based access
- 🌐 **Real-Time Data**: Firestore integration for live updates
- 🔔 **Smart Notifications**: Lesson reminders and announcement notifications
- 🌍 **RTL Support**: Full Arabic language support with right-to-left layout
- 📊 **Comprehensive Dashboard**: Role-specific home screens with relevant data
- 📅 **Weekly Schedule**: Visual weekly schedule with clear management

---

## ✨ Features

### 👨‍💼 Admin Features

- **Complete Dashboard**: Overview of horses, clients, lessons, and workers
- **Horse Management**: Add, edit, and remove horses with detailed information
- **Client Management**: Track client profiles and their lesson history
- **Worker Management**: Manage instructors and stable workers
- **Lesson Scheduling**: Create and manage lessons with automatic notifications
- **Announcements**: Broadcast announcements to specific user roles or everyone
- **Weekly Schedule**: Clear and edit weekly lesson schedules
- **User Administration**: Create and manage user accounts with role assignment

### 👥 Client Features

- **Personal Dashboard**: View upcoming lessons and announcements
- **Lesson History**: Track past and future lessons
- **Horse Information**: View assigned horses and their details
- **Announcement Feed**: Stay updated with stable news
- **Lesson Reminders**: Receive notifications before scheduled lessons

### 👷 Worker Features

- **Work Schedule**: View assigned lessons and schedules
- **Horse Care Information**: Access horse details for better care
- **Staff Announcements**: Receive important operational updates
- **Mission Tracking**: View and track assigned tasks

### 🚶 Visitor Features

- **Public Feed**: Browse general announcements and updates
- **Stable Information**: Learn about available services
- **Contact Information**: Easy access to stable details

---

## 🏗️ Architecture

The application follows a **modular architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                         App Entry                            │
│                    (App.js - Navigation)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
    ┌──────▼──────┐         ┌─────▼──────┐
    │   Context   │         │  Services  │
    │  Providers  │         │  Layer     │
    └──────┬──────┘         └─────┬──────┘
           │                      │
    ┌──────▼──────┐         ┌─────▼──────┐
    │ Auth Context│         │Notification│
    │ Data Context│         │ Services   │
    └──────┬──────┘         └─────┬──────┘
           │                      │
           └───────────┬──────────┘
                       │
           ┌───────────▼───────────┐
           │   Screen Components   │
           │  (Role-based views)   │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │  Reusable Components  │
           │   (UI Components)     │
           └───────────────────────┘
```

### Design Patterns

- **Context API**: For global state management (Auth & Data)
- **Provider Pattern**: Wrapping components with context providers
- **Component Composition**: Reusable UI components
- **Service Layer**: Isolated business logic for notifications and reminders
- **Role-Based Rendering**: Dynamic UI based on user roles

---

## 🛠️ Tech Stack

### Frontend Framework
- **React Native** `0.81.4` - Mobile framework
- **React** `19.1.0` - UI library
- **Expo** `~54.0.0` - Development platform

### Navigation
- **React Navigation** `^6.1.18` - Navigation library
- **Native Stack Navigator** - Stack-based navigation
- **Bottom Tabs Navigator** - Tab navigation for admin panel

### Backend & Database
- **Firebase** `^12.4.0` - Backend as a Service
  - **Firebase Authentication** - User authentication
  - **Cloud Firestore** - Real-time NoSQL database
  - **Firebase Storage** - (Ready for future implementation)

### State Management
- **React Context API** - Global state management
- **React Hooks** - Local state and side effects

### Notifications
- **Expo Notifications** `^0.32.12` - Push notifications
- Custom notification service with:
  - Targeted notifications by user role
  - Scheduled lesson reminders
  - Deep linking support
  - Read tracking

### Storage
- **AsyncStorage** `2.2.0` - Persistent local storage

### UI & Styling
- **React Native StyleSheet API** - Component styling
- Custom theme system with:
  - Consistent color palette
  - Typography scales
  - Spacing system
  - Border radius standards
  - Shadow utilities

### Additional Libraries
- **Expo Image Picker** `^17.0.8` - Image selection
- **DateTimePicker** `^8.4.5` - Date and time selection
- **React Native Gesture Handler** `~2.28.0` - Touch gestures
- **React Native Reanimated** `~4.1.1` - Animations
- **React Native Safe Area Context** `~5.6.0` - Safe area handling

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Git** - Version control
- **Expo Go** app on your mobile device (for testing)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Firebase Account** - [Sign up](https://firebase.google.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AlAmeenStable/Al-Ameen-Stable
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Expo CLI globally** (if not already installed)
   ```bash
   npm install -g expo-cli
   ```

### Firebase Setup

The application requires Firebase for authentication and data storage. Follow these steps:

#### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `al-ameen-stable` (or your choice)
4. Follow the setup wizard

#### 2. Enable Authentication

1. In Firebase Console, navigate to **Build > Authentication**
2. Click **"Get Started"**
3. Select **"Email/Password"** as sign-in method
4. Toggle **"Enable"** and save

#### 3. Create Firestore Database

1. Navigate to **Build > Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose your preferred location
5. Click **"Enable"**

#### 4. Set Up Firestore Security Rules

Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
    
    // Admin-only access to horses, clients, lessons, workers
    match /horses/{horseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /clients/{clientId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /lessons/{lessonId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /workers/{workerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Announcements readable by all authenticated users
    match /announcements/{announcementId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

#### 5. Configure Firebase Credentials

The Firebase configuration is already set up in `src/config/firebaseConfig.js`. If you're using your own Firebase project, update the credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

#### 6. Initialize Sample Data (Optional)

The app includes a data initialization script. To populate your database with sample data:

1. Open the app
2. Log in as admin (create admin user first)
3. The initialization will happen automatically on first admin login

### Running the App

#### Development Mode

**Start the Expo development server:**
```bash
npm start
```

**Run on specific platform:**
```bash
# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

#### Using Expo Go App

1. Install **Expo Go** on your mobile device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the development server:
   ```bash
   npm start
   ```

3. Scan the QR code with your device:
   - **iOS**: Use the Camera app
   - **Android**: Use the Expo Go app

#### Development Client Mode

For a more native experience with custom native modules:

```bash
# Build development client
npm run build:dev:ios      # iOS
npm run build:dev:android  # Android

# Run with dev client
npm run start:dev
npm run ios:dev
```

---

## 📁 Project Structure

```
Al-Ameen-Stable/
│
├── App.js                          # Main app entry point with navigation
├── app.json                        # Expo configuration
├── package.json                    # Dependencies and scripts
├── babel.config.js                 # Babel configuration
├── metro.config.js                 # Metro bundler configuration
├── eas.json                        # Expo Application Services config
│
├── assets/                         # Static assets
│   ├── icon.png                    # App icon
│   └── splash.png                  # Splash screen image
│
└── src/                            # Source code
    │
    ├── components/                 # Reusable components
    │   ├── AdminTabs.js           # Admin tab navigation
    │   ├── AnnouncementsFeed.js   # Announcements list component
    │   ├── CompactHeader.js       # Compact header component
    │   ├── InAppNotificationBanner.js  # In-app notification banner
    │   ├── NotificationBanner.js  # Legacy notification banner
    │   └── OptimizedClearSchedule.js   # Schedule clearing component
    │
    ├── config/                     # Configuration files
    │   ├── firebaseConfig.js      # Firebase initialization & setup
    │   └── initializeData.js      # Database initialization script
    │
    ├── context/                    # React Context providers
    │   ├── AuthContext.js         # Authentication state management
    │   └── DataContext.js         # App data state management
    │
    ├── screens/                    # Screen components
    │   ├── AnnouncementsScreen.js # Announcements management (Admin)
    │   ├── ClientHomeScreen.js    # Client dashboard
    │   ├── FeedScreen.js          # Public feed (Visitor)
    │   ├── HorsesScreen.js        # Horse management (Admin)
    │   ├── LessonsScreen.js       # Lesson scheduling (Admin)
    │   ├── LoginScreen.js         # Authentication screen
    │   ├── MissionsScreen.js      # Worker missions screen
    │   ├── UsersScreen.js         # User management (Admin)
    │   ├── VisitorHomeScreen.js   # Visitor home screen
    │   ├── WeeklyScheduleScreen.js # Weekly schedule view
    │   └── WorkerHomeScreen.js    # Worker dashboard
    │
    ├── services/                   # Business logic services
    │   ├── lessonReminderService.js    # Lesson reminder logic
    │   ├── notificationService.js      # Notification handling
    │   └── notificationTests.js        # Notification testing utilities
    │
    └── styles/                     # Styling
        └── theme.js                # Global theme configuration
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `App.js` | Main entry point, sets up navigation and providers |
| `AuthContext.js` | Manages authentication state and user roles |
| `DataContext.js` | Manages application data (horses, lessons, clients, etc.) |
| `firebaseConfig.js` | Firebase initialization and configuration |
| `notificationService.js` | Handles announcement notifications |
| `lessonReminderService.js` | Manages lesson reminder notifications |
| `theme.js` | Global styling constants and theme |
| `AdminTabs.js` | Admin panel with tab navigation |

---

## 👥 User Roles

The application supports four distinct user roles, each with specific permissions and interfaces:

### 🔴 Admin
**Full system access and management capabilities**

- Dashboard with complete overview
- Manage all entities (horses, clients, lessons, workers, users)
- Create and send announcements
- Schedule and manage lessons
- View and edit weekly schedules
- User account management
- Access to all screens and features

**Default Admin Credentials** (for testing):
- Email: `admin@alameen.com`
- Password: `admin123`

### 🟢 Client
**Personal lesson and horse information access**

- Personal dashboard with upcoming lessons
- View assigned horses
- See lesson history
- Receive announcements targeted to clients
- Get lesson reminder notifications
- Read-only access to relevant data

### 🔵 Worker
**Staff-focused interface for daily operations**

- Work schedule and assigned lessons
- Access to horse information for care purposes
- Staff announcements
- Mission/task tracking
- Instructor-specific lesson details

### ⚪ Visitor
**Limited public access**

- Public feed with general announcements
- Basic stable information
- Contact details
- No access to internal data

### Role-Based Routing

The app automatically routes users to the appropriate home screen based on their role:

```javascript
Admin   → AdminTabs (Full management interface)
Client  → ClientHomeScreen (Personal dashboard)
Worker  → WorkerHomeScreen (Staff operations)
Visitor → VisitorHomeScreen (Public information)
```

---

## 🧩 Core Modules

### 1. Authentication Module
**Location**: `src/context/AuthContext.js`

Handles user authentication and authorization:
- User sign-up with role assignment
- Email/password authentication
- Persistent login sessions (AsyncStorage)
- Role-based access control
- Automatic role fetching from Firestore

### 2. Data Management Module
**Location**: `src/context/DataContext.js`

Manages all application data with real-time synchronization:
- **Horses**: CRUD operations for horse management
- **Clients**: Client profile management
- **Lessons**: Lesson scheduling and tracking
- **Workers**: Staff management
- **Announcements**: Announcement creation and distribution
- **Real-time listeners**: Live updates from Firestore

### 3. Notification System
**Location**: `src/services/`

Comprehensive notification handling with two specialized services:

#### Announcement Notifications (`notificationService.js`)
- Targeted notifications by user role
- Scheduled notification delivery
- Deep-linking to specific announcements
- Read tracking and seen status
- Duplicate prevention
- In-app notification banners

#### Lesson Reminders (`lessonReminderService.js`)
- Automatic lesson reminders (24 hours and 1 hour before)
- Grouped notifications for multiple lessons
- Notification categories (iOS) and channels (Android)
- Reminder seen status tracking
- Background notification scheduling
- Deep-linking to lesson details

### 4. Schedule Management
**Location**: `src/screens/WeeklyScheduleScreen.js`

Visual weekly schedule with:
- Week-by-week navigation
- Time slot organization (8 AM - 8 PM)
- Color-coded lessons
- Quick lesson details view
- Clear schedule functionality
- Drag-to-scroll interface

### 5. Horse Management
**Location**: `src/screens/HorsesScreen.js`

Complete horse registry:
- Add/edit/remove horses
- Track horse details (name, age, breed, color)
- View horse lesson history
- Horse availability status

### 6. Lesson Scheduling
**Location**: `src/screens/LessonsScreen.js`

Comprehensive lesson management:
- Schedule new lessons
- Assign horses, clients, and instructors
- Date and time selection
- Automatic reminder scheduling
- Lesson history tracking

---

## 🔔 Notification System

### Overview

The app features a sophisticated dual-notification system:

1. **Announcement Notifications**: Admin-created broadcasts
2. **Lesson Reminders**: Automated lesson notifications

### Announcement Notifications

#### Features
- ✅ **Role-Based Targeting**: Send to specific user roles (Admin, Client, Worker, Visitor, or All)
- ✅ **Scheduled Delivery**: Schedule notifications for future times
- ✅ **Read Tracking**: Track which users have seen announcements
- ✅ **Deep Linking**: Tap notification to view full announcement
- ✅ **In-App Banners**: Show notifications while app is open
- ✅ **Duplicate Prevention**: Avoid sending duplicate notifications

#### Implementation

```javascript
// Send an announcement notification
await notificationService.sendAnnouncementNotification(
  announcementId,
  title,
  message,
  targetRole,        // 'all', 'admin', 'client', 'worker', 'visitor'
  scheduledTime      // Optional: Date object for scheduling
);
```

### Lesson Reminder Notifications

#### Features
- ✅ **Automatic Reminders**: 24 hours and 1 hour before lessons
- ✅ **Grouped Notifications**: Multiple lessons grouped together
- ✅ **Smart Scheduling**: Reschedules if app is closed
- ✅ **Seen Tracking**: Mark reminders as seen
- ✅ **Interactive Actions**: iOS quick actions for reminders
- ✅ **Background Scheduling**: Works even when app is closed

#### Reminder Types

| Type | Timing | Description |
|------|--------|-------------|
| **24-hour** | 1 day before | Early reminder for preparation |
| **1-hour** | 60 minutes before | Final reminder before lesson |

#### Implementation

```javascript
// Schedule reminders for a new lesson
await lessonReminderService.scheduleRemindersForLesson(
  lessonId,
  lessonDateTime,
  clientUserId,
  horseName,
  instructorName
);

// Reschedule all future reminders (app startup)
await lessonReminderService.rescheduleAllReminders(lessons);
```

### Notification Channels (Android)

- **Announcements**: High priority with vibration
- **Lesson Reminders**: High priority with sound and vibration

### Notification Categories (iOS)

- **announcement**: For announcement notifications
- **lesson_reminder**: For lesson reminders with actions

### Deep Linking Flow

```
User taps notification
        ↓
App opens/comes to foreground
        ↓
Deep link ID passed to navigation
        ↓
Relevant screen opens with content
        ↓
Notification marked as seen
```

---

## 🌍 RTL Support

The application fully supports **Right-to-Left (RTL)** layout for Arabic language:

### RTL Features

- **Automatic Layout Flip**: All UI elements automatically flip
- **Text Alignment**: Proper Arabic text alignment
- **Navigation Flow**: RTL navigation animations
- **Icon Positioning**: Icons positioned correctly for RTL
- **Date Formatting**: Supports Arabic date formats

### RTL Configuration

Set in `App.js`:
```javascript
import { I18nManager } from 'react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
```

### Arabic Text

Most UI text in the app is in Arabic, providing a native experience for Arabic-speaking users.

---

## 🏗️ Building for Production

### Using Expo Application Services (EAS)

#### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

#### 2. Login to Expo
```bash
eas login
```

#### 3. Configure EAS Build

The `eas.json` configuration is already set up:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "ios": {
        "bundleIdentifier": "com.alameenstable.app"
      },
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

#### 4. Build for iOS
```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform ios
```

#### 5. Build for Android
```bash
# Development build
eas build --profile development --platform android

# Production build (APK)
eas build --profile production --platform android
```

### App Store Deployment

#### iOS (Apple App Store)

1. **Prepare Assets**:
   - App icon (1024x1024 px)
   - Screenshots for all device sizes
   - App description and keywords

2. **Submit to App Store**:
   ```bash
   eas submit --platform ios
   ```

3. **App Store Connect**:
   - Set up app metadata
   - Add screenshots
   - Configure pricing and availability
   - Submit for review

#### Android (Google Play Store)

1. **Prepare Assets**:
   - App icon (512x512 px)
   - Feature graphic (1024x500 px)
   - Screenshots for phone and tablet

2. **Submit to Play Store**:
   ```bash
   eas submit --platform android
   ```

3. **Google Play Console**:
   - Create app listing
   - Upload screenshots and assets
   - Configure store presence
   - Submit for review

### Environment Variables

For production, use environment variables for sensitive data:

1. Create `.env` file (add to `.gitignore`)
2. Use `expo-constants` or `react-native-dotenv`
3. Never commit Firebase credentials to version control

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Firebase Connection Issues

**Problem**: "Firebase: Error (auth/network-request-failed)"

**Solutions**:
- Check internet connection
- Verify Firebase credentials in `firebaseConfig.js`
- Ensure Firebase project is active in console
- Check Firestore security rules

#### 2. Notification Permissions Denied

**Problem**: Notifications not appearing

**Solutions**:
- **iOS**: Go to Settings > Al-Ameen Stable > Notifications > Enable
- **Android**: Go to Settings > Apps > Al-Ameen Stable > Notifications > Enable
- Restart the app after enabling permissions
- Check notification channel settings (Android)

#### 3. Build Errors

**Problem**: "Unable to resolve module..."

**Solutions**:
```bash
# Clear cache
npm start -- --reset-cache

# Reinstall dependencies
rm -rf node_modules
npm install

# Clear watchman (macOS)
watchman watch-del-all
```

#### 4. AsyncStorage Warnings

**Problem**: AsyncStorage deprecation warnings

**Solutions**:
- Already using `@react-native-async-storage/async-storage`
- If warnings persist, clear app data and reinstall

#### 5. RTL Layout Issues

**Problem**: Layout not flipping properly

**Solutions**:
- Restart the app completely
- On Android, manually enable RTL in developer settings
- Clear app cache

#### 6. Date Picker Not Showing (Android)

**Problem**: Date/time picker dismissed immediately

**Solutions**:
- This is handled in the code with proper event handling
- Ensure `@react-native-community/datetimepicker` is properly installed
- Try rebuilding the app

### Debug Mode

Enable debug mode for more detailed logs:

```bash
# Start with debug logs
npm start -- --dev-client
```

### Checking Logs

**Expo Development**:
- Logs appear in terminal automatically
- Use Expo DevTools for detailed debugging

**Physical Device**:
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

### Firebase Console Debugging

1. **Authentication**: Build > Authentication > Users
2. **Firestore**: Build > Firestore Database > Data
3. **Console Logs**: Check browser console for Firebase errors

---

## 🤝 Contributing

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow existing code style
   - Add comments for complex logic
   - Update this README if needed

3. **Test thoroughly**:
   - Test on iOS and Android
   - Test all user roles
   - Verify notifications work

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

5. **Push and create pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- Use **functional components** with hooks
- Follow **React Native best practices**
- Use **Arabic** for user-facing text
- Use **English** for code comments and documentation
- Keep components **small and focused**
- Use **meaningful variable names**
- Add **JSDoc comments** for complex functions

### Commit Message Format

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

---

## 📄 License

This project is **proprietary and confidential**. All rights reserved.

Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without explicit written permission.

---

## 📞 Support

For questions, issues, or support:

- **Email**: badarne3li@gmail.com
- **Phone**: +972503653429

---

## 🙏 Acknowledgments

- **React Native Community** - For excellent documentation and libraries
- **Expo Team** - For simplifying mobile development
- **Firebase** - For robust backend services
- **All Contributors** - For making this project possible

---

## 📈 Roadmap

### Upcoming Features

- [ ] **Payment Integration**: Online lesson payment system
- [ ] **Photo Gallery**: Horse and event photo galleries
- [ ] **Chat System**: Direct messaging between users
- [ ] **Calendar Sync**: Sync lessons with device calendar
- [ ] **Push Token Management**: Better device token handling
- [ ] **Offline Mode**: Cache data for offline access
- [ ] **Analytics Dashboard**: Usage statistics for admin
- [ ] **Multi-language Support**: Add English interface option
- [ ] **Horse Health Records**: Track veterinary visits and health
- [ ] **Attendance Tracking**: QR code check-in system

### Version History

#### v1.0.0 (Current)
- Initial release
- Complete stable management system
- Role-based access control
- Notification system
- RTL support
- Firebase integration

---

<div align="center">

**Made with ❤️ for Al-Ameen Stable**

⭐ Star this project if you find it useful!

</div>

