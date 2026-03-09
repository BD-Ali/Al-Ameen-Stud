# 🐴 Al-Ameen Stud Management App

A comprehensive React Native mobile application for managing horse stable operations, built with Expo and Firebase. The app provides role-based access for administrators, clients, workers, and visitors, with full multilingual support (Arabic, Hebrew, English) including RTL layout.

## 📱 Overview

Al-Ameen Stud is a professional stud management system that streamlines day-to-day operations including:
- Horse management and care scheduling
- Lesson scheduling, confirmation, and cancellation with full data cascade
- Client and worker management with subscription tracking
- Announcements and push notifications
- Weekly work schedules with multi-worker assignment per time slot
- Payment tracking with quick payment and payment history
- Task and mission management
- Real-time communication via phone, email, and Instagram
- Image management with Cloudinary

## ✨ Key Features

### 🔐 Authentication & User Roles

- **Multi-role authentication system** with Firebase Authentication
- **Four user roles:**
  - **Admin** — Full system access and management
  - **Client** — View lessons, payments, and announcements
  - **Worker** — View assigned tasks, lessons, and schedules
  - **Visitor** — Public view of horses and announcements
- **Automatic account creation** for new users by admin
- **Secure authentication** with Firebase
- **Role-based navigation** — Different home screens based on user role

### 🐴 Horse Management

**Admin Features:**
- **Complete horse profiles** with name, breed, owner, feed schedules, and care notes
- **Photo upload** with Cloudinary integration and optimized delivery
- **Camera & gallery support** for horse photos
- **Care reminders** with scheduled notifications
- **Expandable horse cards** with detailed information
- **Add, edit, and delete** horses

**Client & Worker Features:**
- **Horizontal scrollable gallery** of all horses
- **Compact card design** for easy browsing

**Visitor Features:**
- **Full-width horse cards** with images for beautiful presentation

### 📚 Lesson Management

- **Schedule lessons** with date, time, horse, client, and instructor selection
- **Lesson status tracking:** Scheduled → Confirmed/Completed or Cancelled
- **Full cancellation cascade** — when a worker cancels a lesson:
  - Lesson status updated to cancelled
  - Related missions deleted from Firestore
  - Related schedules and weekly schedules removed
  - Client subscription credit restored if lesson was confirmed
  - Client notified of cancellation
- **Lesson removal** also cascades to all 4 linked collections via Firestore queries
- **Automatic lesson reminders** (daily at 10 AM + 1 hour before)
- **Lesson cleanup service** — archives old lessons automatically
- **Real-time tracking** for clients and workers
- **Cancelled lessons visible** to clients with status badge
- **Workers see only active lessons** (cancelled filtered out)

### 👥 User Management (Admin)

- **Unified interface** for managing clients and workers
- **Client management:** accounts, payment tracking, lesson history, subscription management
- **Worker management:** accounts, role assignment, task/schedule viewing
- **Quick payment** — fast payment entry for clients
- **Payment history** — full audit trail of client payments
- **Search and filter** functionality
- **Expandable user cards** with detailed information

### 📅 Weekly Schedule Management (Admin)

- **Weekly work schedule** for workers (Saturday to Friday)
- **Time slot based** (8 AM to 11 PM)
- **Multi-worker per slot** — assign multiple workers to the same time slot
- **Tap to select** multiple time slots, then assign a worker to all at once
- **Long press** on assigned slots to edit or delete individual worker assignments
- **Duplicate prevention** — same worker can't be assigned twice to the same slot
- **Worker count badge** showing number of workers per slot
- **Automatic week rotation** starting on Saturday

### 📢 Announcements System (Admin)

- **Create and manage announcements** with title, content, images, category tags, and target audience
- **Category tags:** Update, Promo, Alert, Event, Info
- **Audience targeting:** All, Clients, Visitors, Workers
- **Status management:** Draft, Scheduled, Published, Expired
- **Pin important posts** and schedule future announcements
- **Push notifications** and in-app notification banner
- **Deep linking** from notifications to announcements
- **Auto-expiry** of time-limited announcements

### ✅ Missions/Tasks Management (Admin/Workers)

- **Daily task tracking** from horse care reminders
- **Three categories:** Today's, Completed, and Upcoming missions
- **Mark tasks as done/undone**
- **Automatic categorization** by date and time

### 👤 Client Portal

- **Personal dashboard** with payment status, subscription info, lesson count
- **Lessons list** with confirmed, scheduled, and cancelled lessons
- **Horses gallery** (horizontal scroll)
- **Announcements feed** filtered for clients
- **Contact us button** with phone, email, and Instagram options

### 🔧 Worker Portal

- **Daily work overview** with current, upcoming, and past tasks
- **Horses gallery** (horizontal scroll)
- **Lesson schedule** with today's and upcoming lessons (cancelled filtered out)
- **Lesson confirmation actions**
- **Weekly schedule integration**
- **Contact us button** with phone, email, and Instagram options

### 👁️ Visitor Portal

- **Public-facing interface** with welcome message and branding
- **Full-width horse cards** with images
- **Announcements feed** for visitors
- **Contact us button** with phone, email, and Instagram options

### 🌍 Internationalization (i18n)

- **Three languages:** English, Arabic (العربية), Hebrew (עברית)
- **Full RTL support** for Arabic and Hebrew
- **Language switcher** accessible from all screens
- **All UI labels, alerts, and messages** translated
- **RTL-aware layouts** — label:value ordering, icons, and alignment

### 🔔 Notification System

- **Announcement notifications** targeted by user role
- **Lesson reminders** (daily and 1-hour before)
- **Horse care reminders**
- **In-app notification banner** with FontAwesome5 icons
- **Deep linking** from notifications to relevant screens
- **iOS and Android** platform support

### 📞 Contact Us

- **Floating action button** on all user home screens
- **Three contact options:**
  - Direct phone call
  - Email
  - Instagram profile (@alamein_stud)
- **Available for** clients, workers, and visitors

### 🎨 User Interface

- **Modern dark theme** with consistent design system
- **FontAwesome5 vector icons** throughout (no emoji icons)
- **Smooth animations** using React Native Reanimated
- **RTL-aware layouts** for Arabic and Hebrew
- **Responsive design** for all screen sizes
- **Compact header** with text-based logout matching across all roles
- **Floating action buttons** for quick access
- **Horizontal scrollable galleries** for browsing

## 🛠 Technology Stack

### Frontend
- **React Native (0.81.4)** — Cross-platform mobile framework
- **React (19.1.0)** — UI library
- **Expo (~54.0.0)** — Development platform
- **React Navigation (^6.x)** — Navigation (Native Stack + Bottom Tabs)
- **Expo Notifications (^0.32.12)** — Push and local notifications
- **Expo Image Picker (^17.0.8)** — Camera and gallery access
- **@expo/vector-icons** — FontAwesome5 icon library
- **AsyncStorage (2.2.0)** — Local data persistence
- **React Native Gesture Handler (~2.28.0)** — Touch interactions
- **React Native Reanimated (~4.1.1)** — Smooth animations
- **DateTimePicker (^8.4.5)** — Date and time selection
- **react-native-safe-area-context** — Safe area handling

### Backend & Services
- **Firebase (^12.4.0)**
  - Firebase Authentication — User authentication
  - Cloud Firestore — Real-time database with `onSnapshot` listeners
- **Cloudinary** — Image hosting and optimization

### Development Tools
- **EAS (Expo Application Services)** — Build and deployment
- **babel-plugin-transform-remove-console** — Strip console logs in production
- **Metro Bundler** — JavaScript bundler

## 📁 Project Structure

```
Al-Ameen-Stable/
├── App.js                          # Main app entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies (v1.2.0)
├── babel.config.js                 # Babel config (console removal in prod)
├── metro.config.js                 # Metro bundler config
├── eas.json                        # EAS build config (auto-increment)
├── assets/                         # App assets (icon, splash)
├── functions/                      # Firebase Cloud Functions
└── src/
    ├── components/
    │   ├── AdminTabs.js           # Bottom tab navigation for admin
    │   ├── AnimatedButton.js      # Animated button component
    │   ├── AnimatedCard.js        # Animated card component
    │   ├── AnnouncementsFeed.js   # Announcements feed component
    │   ├── CompactHeader.js       # Header with text-based logout
    │   ├── InAppNotificationBanner.js  # Notification banner (FontAwesome5)
    │   └── LanguageSwitcher.js    # Language selection component
    ├── config/
    │   ├── cloudinaryConfig.js    # Cloudinary setup
    │   └── firebaseConfig.js      # Firebase setup
    ├── context/
    │   ├── AuthContext.js         # Authentication state
    │   └── DataContext.js         # App data state (~2300 lines)
    ├── i18n/
    │   ├── en.json                # English translations
    │   ├── ar.json                # Arabic translations
    │   ├── he.json                # Hebrew translations
    │   └── LanguageContext.js     # Language context provider
    ├── screens/
    │   ├── LoginScreen.js         # Login interface
    │   ├── AnnouncementsScreen.js # Announcements management
    │   ├── ClientHomeScreen.js    # Client dashboard
    │   ├── FeedScreen.js          # Announcements feed (admin)
    │   ├── HorsesScreen.js        # Horse management
    │   ├── LessonsScreen.js       # Lesson scheduling
    │   ├── MissionsScreen.js      # Task management
    │   ├── ProfileScreen.js       # User profile
    │   ├── UserHistoryScreen.js   # Client payment/lesson history
    │   ├── UsersScreen.js         # User management
    │   ├── VisitorHomeScreen.js   # Public interface
    │   ├── WeeklyScheduleScreen.js # Weekly schedule (multi-worker)
    │   └── WorkerHomeScreen.js    # Worker dashboard
    ├── services/
    │   ├── lessonCleanupService.js     # Auto-cleanup old lessons
    │   ├── lessonReminderService.js    # Lesson notifications
    │   └── notificationService.js      # General notifications
    ├── styles/
    │   └── theme.js               # Design system theme
    └── utils/
        └── animations.js          # Animation utilities
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Expo CLI** — `npm install -g expo-cli`
- **EAS CLI** — `npm install -g eas-cli`
- **Firebase account** with project setup
- **Cloudinary account** for image hosting

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd AlAmeenStable
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure Firebase** in `src/config/firebaseConfig.js`:
```javascript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

4. **Configure Cloudinary** in `src/config/cloudinaryConfig.js`:
```javascript
export const CLOUDINARY_CLOUD_NAME = 'your-cloud-name';
export const CLOUDINARY_UPLOAD_PRESET = 'your-upload-preset';
```

5. **Start the development server:**
```bash
npm start
```

6. **Run on device/simulator:**
```bash
npm run ios      # iOS (Mac only)
npm run android  # Android
```

### First Time Setup

1. Use Firebase Console to create the first admin user and set role to "admin" in Firestore
2. Collections are created automatically on first use
3. Login with admin credentials and create test data

## 📱 Building for Production

```bash
# Build for iOS (App Store)
eas build --platform ios --profile production

# Build for Android (Google Play)
eas build --platform android --profile production

# Submit to App Store
eas submit --platform ios --profile production --latest

# Submit to Google Play
eas submit --platform android --profile production --latest
```

Build numbers auto-increment via `eas.json` remote version source.

## 📊 Database Structure (Firestore)

### Collections

| Collection | Key Fields |
|---|---|
| **users** | email, name, role (admin/client/worker/visitor), phoneNumber |
| **clients** | name, email, amountPaid, amountDue, lessonCount, subscription fields |
| **workers** | name, role, contact |
| **horses** | name, breed, owner, feedSchedule, notes, imageUrl |
| **lessons** | date, time, horseId, clientId, instructorId, status, confirmed |
| **reminders** | horseName, horseId, note, date, time, completed |
| **announcements** | title, content, imageUri, tag, targetAudience, status, isPinned |
| **weeklySchedules** | weekId, day, timeSlot, workerId, description |
| **schedules** | date, timeSlot, workerId, description, lessonId |
| **missions** | horseName, horseId, note, date, time, completed, lessonId |

All documents use `createdAt: serverTimestamp()` and auto-generated IDs.

## 🐛 Troubleshooting

| Issue | Solution |
|---|---|
| App won't start | `expo start --clear` or reinstall node_modules |
| Firebase connection | Verify `firebaseConfig.js` credentials |
| Images not uploading | Check Cloudinary credentials and upload preset |
| Notifications not working | Check device permissions; test with dev build |
| Build errors | Check EAS build logs; update Expo SDK |

## 📞 Support & Contact

For technical support, issues, or questions:
- **Email:** badarne3li@gmail.com
- **Phone:** 0503653429

For bug reports, please include: device type/OS, app version, steps to reproduce, and screenshots.

## 📊 Project Statistics

- **Total Screens:** 13
- **User Roles:** 4 (Admin, Client, Worker, Visitor)
- **Database Collections:** 10
- **Supported Platforms:** iOS, Android
- **Languages:** English, Arabic (RTL), Hebrew (RTL)
- **Dependencies:** 20+ npm packages

## 📝 Version History

### Version 1.2.0 (March 2026)
- Full internationalization (English, Arabic, Hebrew) with RTL support
- Lesson cancellation cascade — cleans up all linked data across 4 collections
- Subscription credit restoration on confirmed lesson cancellation
- Multi-worker assignment per time slot in weekly schedule
- Tap to multi-select, long press to edit/delete schedule assignments
- Quick payment and payment history for clients
- Instagram contact integration (@alamein_stud)
- All emoji icons replaced with FontAwesome5 vector icons
- Consistent logout button styling across all roles
- Deprecated API fixes (ImagePicker, SafeAreaView)
- Unused imports/styles/dependencies cleanup
- Console log stripping in production builds
- Route params safety guards

### Version 1.0.0 (November 2025)
- Initial release
- Core stud management features
- Role-based authentication
- Horse management with images
- Lesson scheduling and tracking
- Announcement system
- Notification service
- Weekly schedule management
- Contact us feature

---

**Version:** 1.2.0
**Last Updated:** March 2026
**Expo SDK:** ~54.0.0
**React Native:** 0.81.4
**Platforms:** iOS, Android

---

*© 2025–2026 Al-Ameen Stud. All rights reserved.*
