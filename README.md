# Al-Ameen Stable Management System

A professional React Native application for managing horse stable operations, built with Expo and Firebase.

## 🏗️ Project Structure

```
Al-Ameen-Stable/
├── App.js                    # Main app entry point with navigation setup
├── app.json                  # Expo configuration
├── package.json              # Dependencies and scripts
├── babel.config.js           # Babel configuration
├── metro.config.js           # Metro bundler configuration
├── eas.json                  # EAS Build configuration
│
├── assets/                   # Static assets
│   ├── icon.png             # App icon
│   └── splash.png           # Splash screen
│
└── src/                     # Source code (organized)
    │
    ├── components/          # Reusable UI components
    │   └── AdminTabs.js    # Admin navigation tabs
    │
    ├── config/             # Configuration files
    │   ├── firebaseConfig.js      # Firebase initialization
    │   └── initializeData.js      # Data initialization helpers
    │
    ├── context/            # React Context providers
    │   ├── AuthContext.js # Authentication state management
    │   └── DataContext.js # Application data management
    │
    └── screens/            # Application screens
        ├── LoginScreen.js         # User authentication
        ├── VisitorHomeScreen.js   # Public visitor view
        ├── ClientHomeScreen.js    # Client dashboard
        ├── HorsesScreen.js        # Horse management (Admin)
        ├── FeedScreen.js          # Feeding schedules (Admin)
        ├── LessonsScreen.js       # Lesson scheduling (Admin)
        ├── ClientsScreen.js       # Client management (Admin)
        └── WorkersScreen.js       # Staff management (Admin)
```

## 🎯 Features

### For Administrators
- **Horse Management**: Add, edit, and track horses with detailed information
- **Reminder System**: Schedule notifications for horse care tasks
- **Lesson Scheduling**: Coordinate lessons between clients, horses, and instructors
- **Client Management**: Track client payments and lesson history
- **Staff Management**: Manage workers and their roles
- **Feeding Schedule**: Maintain feeding plans for all horses

### For Clients
- View upcoming and past lessons
- Check payment status
- See assigned horses and instructors

### For Visitors
- Browse available horses
- View horse breeds (public information only)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Update `src/config/firebaseConfig.js` with your Firebase credentials

3. Start the development server:
```bash
npm start
```

4. Run on platform:
```bash
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser
```

## 📱 Build Commands

### Development Builds
```bash
npm run build:dev:ios       # iOS development build
npm run build:dev:android   # Android development build
```

### Start with Dev Client
```bash
npm run start:dev           # Start with development client
npm run ios:dev            # iOS with dev client
```

## 🔐 User Roles

- **Admin**: Full access to all management features
- **Client**: View personal lessons and payment status
- **Visitor**: Public access to basic horse information

## 🛠️ Tech Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation
- **Backend**: Firebase (Firestore + Authentication)
- **UI**: Custom styled components with RTL support for Arabic
- **Notifications**: Expo Notifications
- **State Management**: React Context API

## 📂 Code Organization

The project follows a clean architecture pattern:

- **`src/components/`**: Shared UI components and navigation
- **`src/config/`**: App configuration and initialization
- **`src/context/`**: Global state management with Context API
- **`src/screens/`**: Individual screen components organized by feature

## 🌐 RTL Support

The app fully supports Right-to-Left (RTL) layout for Arabic language.

## 📝 Notes

- All dates are displayed in YYYY-MM-DD format for consistency
- Firebase real-time synchronization ensures data is always up-to-date
- Notifications require proper permissions on both iOS and Android

## 👨‍💻 Development

To add a new screen:
1. Create the screen file in `src/screens/`
2. Import required contexts from `src/context/`
3. Update navigation in `App.js` or `src/components/AdminTabs.js`

To add a new data collection:
1. Update `src/context/DataContext.js` with CRUD operations
2. Ensure proper Firebase Firestore structure

---

**Version**: 1.0.0  
**Last Updated**: October 2025

