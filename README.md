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
  - **Visitor** — Public view of horses and announcements (no login required)
- **Self-registration** — new clients can sign up directly from the login screen
- **Admin-created accounts** — admins can create client and worker accounts from the Users screen
- **Secure authentication** with Firebase (AsyncStorage-persisted sessions)
- **Role-based navigation** — different tab sets rendered per role on login

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
- **Breed conditionally hidden** when not set

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
- **Automatic lesson reminders** — scheduled 24 hours and 2 hours before each lesson
- **Lesson cleanup service** — runs daily at midnight to remove expired lessons and cancel leftover reminder notifications
- **Real-time tracking** for clients and workers via `onSnapshot` listeners
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
- **Automatic week rotation** starting on Saturday- **Bottom sheet modal** with safe-area-aware padding (system nav bar never overlaps)
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

- **Public-facing interface** with welcome message and stable branding
- **Full-width horse cards** with images
- **Announcements feed** filtered for visitors
- **Contact us button** with phone, email, and Instagram options
- **Accessible without login** — via “Visit as Guest” on the Login screen

### 🌍 Internationalization (i18n)

- **Three languages:** English, Arabic (العربية), Hebrew (עברית)
- **Full RTL support** for Arabic and Hebrew
- **Language switcher** (`LanguageSwitcher`) accessible from the Login screen and all major screens
- **All UI labels, alerts, and messages** translated across `en.json`, `ar.json`, `he.json`
- **RTL-aware layouts** via `useRTL` hook, `RTLRow`, and `RTLText` components
- **Standalone `translate()` function** for use in services outside React components
- **Persisted language preference** stored in AsyncStorage
- **Default language:** Arabic

### 🔔 Notification System

- **Announcement push notifications** targeted by user role
- **Lesson reminders** at 24 hours and 2 hours before each lesson
- **Horse care reminders** triggered from reminder entries
- **In-app notification banner** (slide-in, auto-dismiss, RTL-aware) for foreground notifications
- **Deep linking** — tapping a notification opens the relevant announcement or lesson
- **iOS notification categories** with View / Dismiss action buttons
- **Android notification channels:** `default`, `announcements`, `lesson_reminders`
- **Mark-as-seen** tracking per lesson reminder type

### 📞 Contact Us

- **Floating action button** on all user home screens
- **Three contact options:**
  - Direct phone call
  - Email
  - Instagram profile (@alamein_stud)
- **Available for** clients, workers, and visitors

### 🎨 User Interface

- **Modern dark theme** — navy/black backgrounds, white text scale, single vivid-blue brand color (`#2563EB`)
- **Centralized design system** in `theme.js` — colors, typography, spacing, border radius, shadows
- **Phosphor vector icons** via `phosphor-react-native` throughout (no emoji icons)
- **Unified `AppIcon` component** — semantic name → Phosphor component mapping
- **Smooth entrance animations** — fade-in, slide-up, scale-in, staggered cards via `animations.js`
- **`AnimatedButton`** — press-scale feedback with primary / secondary / danger / success variants
- **`AnimatedCard`** — staggered entrance with reflection glow on card top edge
- **`ScreenBackground`** — full-bleed `backgpic.png` with dark overlay on every screen
- **RTL-aware layouts** for Arabic and Hebrew
- **Responsive design** for all screen sizes
- **`CompactHeader`** — avatar initials, greeting, role badge, and logout across all role home screens
- **`ErrorBoundary`** — catches unhandled JS errors and shows a branded recovery screen
- **Horizontal scrollable galleries** for horse browsing
- **Edge-to-edge layout support** (Android 15+) with dynamic tab bar padding via `useTabBottomPadding`

## 🛠 Technology Stack

### Frontend
- **React Native (0.81.5)** — Cross-platform mobile framework
- **React (19.1.0)** — UI library
- **Expo (~54.0.34)** — Development platform
- **React Navigation (^6.x)** — Navigation (Native Stack + Bottom Tabs)
- **Expo Notifications (~0.32.17)** — Push and local notifications
- **Expo Image Picker (~17.0.11)** — Camera and gallery access
- **Expo Font (~14.0.11)** — Font loading
- **@expo/vector-icons (^15.0.3)** — Supplementary icon sets
- **phosphor-react-native (^3.0.6)** — Primary Phosphor icon library
- **AsyncStorage (2.2.0)** — Local data persistence
- **React Native Gesture Handler (~2.28.0)** — Touch interactions
- **React Native Reanimated (~4.1.1)** — Smooth animations
- **react-native-worklets (0.5.1)** — Worklets runtime for Reanimated
- **React Native SVG (15.12.1)** — SVG support
- **DateTimePicker (8.4.4)** — Date and time selection
- **react-native-safe-area-context** — Safe area handling
- **expo-print (~15.0.8)** — Print support
- **expo-sharing (~14.0.8)** — Share sheets

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
├── package.json                    # Dependencies (v1.3.0)
├── .npmrc                          # npm config (legacy-peer-deps)
├── .easignore                      # EAS upload exclusions
├── babel.config.js                 # Babel config (Reanimated plugin + console removal in prod)
├── metro.config.js                 # Metro bundler config (@-prefixed path aliases)
├── eas.json                        # EAS build config (auto-increment, appVersionSource: remote)
├── SECURITY.md                     # Security policy and credential guidelines
├── assets/
│   ├── icon.png                    # App icon
│   ├── adaptive-icon.png           # Android adaptive icon foreground
│   ├── splash.png                  # Splash screen
│   ├── backgpic.png                # Full-bleed screen background image
│   └── iconOrg.png                 # Original icon (unused in production)
├── functions/                      # Firebase Cloud Functions (placeholder)
└── src/
    ├── components/
    │   ├── AdminTabs.js           # Bottom tab navigator — Admin (7 tabs)
    │   ├── AnimatedButton.js      # Press-scale button (primary/secondary/danger/success)
    │   ├── AnimatedCard.js        # Staggered entrance card with reflection glow
    │   ├── AnnouncementsFeed.js   # Role-filtered feed with unread tracking and pagination
    │   ├── AppIcon.js             # Unified Phosphor icon wrapper (semantic name → component)
    │   ├── ClientTabs.js          # Bottom tab navigator — Client (2 tabs)
    │   ├── CompactHeader.js       # Avatar initials, greeting, role badge, logout
    │   ├── ErrorBoundary.js       # Class-based error boundary with branded recovery screen
    │   ├── InAppNotificationBanner.js  # Slide-in foreground notification banner (RTL-aware)
    │   ├── LanguageSwitcher.js    # Language selector (AR / HE / EN)
    │   ├── RTLRow.js              # Row that reverses direction for RTL languages
    │   ├── RTLText.js             # Text with automatic RTL alignment and writing direction
    │   ├── ScreenBackground.js    # Full-bleed backgpic.png + dark overlay wrapper
    │   └── WorkerTabs.js          # Bottom tab navigator — Worker (2 tabs)
    ├── config/
    │   ├── cloudinaryConfig.js    # Cloudinary setup
    │   └── firebaseConfig.js      # Firebase setup
    ├── context/
    │   ├── AuthContext.js         # Auth state: user, userRole, signIn, signUp, logOut, createUserAccount
    │   └── DataContext.js         # All Firestore data (onSnapshot): horses, clients, workers, lessons,
    │                              #   reminders, schedules, missions, weeklySchedules,
    │                              #   announcements, paymentHistory, workerUsers + all CRUD helpers
    ├── i18n/
    │   ├── en.json                # English translations
    │   ├── ar.json                # Arabic translations
    │   ├── he.json                # Hebrew translations
    │   └── LanguageContext.js     # Language context provider
    ├── hooks/
    │   ├── useRTL.js               # Returns isRTL, rowDirection, textAlign, writingDirection
    │   └── useTabBottomPadding.js  # paddingBottom = tabBarHeight + spacing.sm
    ├── screens/
    │   ├── LoginScreen.js         # Login interface
    │   ├── AnnouncementsScreen.js # Announcements management
    │   ├── ClientHistoryScreen.js # Client payment/lesson history
    │   ├── ClientHomeScreen.js    # Client dashboard
    │   ├── FeedScreen.js          # Announcements feed (admin)
    │   ├── HorsesScreen.js        # Horse management
    │   ├── LessonsScreen.js       # Lesson scheduling
    │   ├── MissionsScreen.js      # Task management
    │   ├── ProfileScreen.js       # User profile
    │   ├── UserHistoryScreen.js   # Client payment/lesson history (admin view)
    │   ├── UsersScreen.js         # User management
    │   ├── VisitorHomeScreen.js   # Public interface
    │   ├── WeeklyScheduleScreen.js # Weekly schedule (multi-worker)
    │   ├── WorkerHomeScreen.js    # Worker dashboard
    │   └── WorkerLessonsScreen.js # Worker lessons view
    ├── services/
    │   ├── lessonCleanupService.js     # Runs daily at midnight; removes expired lessons & notifications
    │   ├── lessonReminderService.js    # Schedules 24h and 2h reminders; iOS categories; Android channel
    │   └── notificationService.js      # Permissions, Android channels, listener setup/teardown
    ├── styles/
    │   └── theme.js               # Design system: colors, typography, spacing, borderRadius, shadows
    └── utils/
        └── animations.js          # useFadeIn, useSlideInFromBottom, useScaleIn, useStaggeredAnimation,
                                   #   createPressAnimation
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (with `legacy-peer-deps` — set automatically via `.npmrc`)
- **Expo Go** app on your device — or install a custom dev client via EAS
- **EAS CLI** — `npm install -g eas-cli` (>= 16.20.4)
- **Firebase account** with a Firestore project configured
- **Cloudinary account** for image hosting

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd "Al-Ameen Stud"
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
npm run android  # Android
npm run ios      # iOS (Mac only)
npm run web      # Web browser
```

### First Time Setup

1. Use Firebase Console to create the first admin user manually and set `role: "admin"` in the `users` collection
2. All other Firestore collections are created automatically on first write
3. Log in with admin credentials and use the Users screen to create client/worker accounts

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

Build numbers auto-increment via `eas.json` remote version source. iOS uses M-medium build resource class. Android produces an `.aab` bundle.

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
| **announcements** | title, content, imageUri, tag, targetAudience, status, isPinned, scheduledAt |
| **weeklySchedules** | weekId, day, timeSlot, workerId, description |
| **schedules** | date, timeSlot, workerId, description, lessonId |
| **missions** | horseName, horseId, note, date, time, completed, lessonId |
| **paymentHistory** | clientId, clientName, amount, date, note, createdAt |

All documents use `createdAt: serverTimestamp()` and auto-generated IDs.

## 🐛 Troubleshooting

| Issue | Solution |
|---|---|
| App won't start | `expo start --clear` or delete `node_modules` and run `npm install` |
| Firebase connection errors | Verify `firebaseConfig.js` credentials match your Firebase project |
| Images not uploading | Check Cloudinary cloud name, upload preset, and network connectivity |
| Notifications not working | Check device permissions; push notifications require a dev or production build (not Expo Go) |
| Build errors on EAS | Check EAS build logs; ensure `eas-cli >= 16.20.4` is installed |
| Peer dependency conflicts | The `.npmrc` file sets `legacy-peer-deps=true` — run `npm install` without flags |
| Text invisible on dark cards | Use `colors.text.secondary` or `colors.text.tertiary` (not `colors.text.muted`) |
| Tab bar overlapping content | Use `useTabBottomPadding()` hook as `paddingBottom` on FlatList/ScrollView |

## 📞 Support & Contact

For technical support, issues, or questions:
- **Email:** badarne3li@gmail.com
- **Phone:** 0503653429

For bug reports, please include: device type/OS, app version, steps to reproduce, and screenshots.

## 📊 Project Statistics

- **Total Screens:** 15
- **User Roles:** 4 (Admin, Client, Worker, Visitor)
- **Database Collections:** 11
- **Supported Platforms:** iOS, Android, Web
- **Languages:** Arabic (default, RTL), Hebrew (RTL), English
- **Components:** 14
- **Custom Hooks:** 2
- **Services:** 3
- **npm Dependencies:** 30+

## 📝 Version History

### Version 1.3.0 (May 2026)
- Android edge-to-edge layout support (Android 15+)
- Dynamic bottom padding via `useTabBottomPadding()` hook across all 11 tab screens — prevents content hiding behind the floating tab bar on any device
- Bottom sheet modal safe area fix in WeeklyScheduleScreen (system nav bar no longer overlaps modal)
- Fixed invisible text on dark cards (`text.muted` → `text.tertiary/secondary`) across HorsesScreen, LessonsScreen, UsersScreen, UserHistoryScreen, ClientHomeScreen
- Removed duplicate checkmark from active subscription badge in ClientHomeScreen
- Conditional breed display in VisitorHomeScreen (hidden when empty)
- LoginScreen dead area fix — removed excessive vertical padding inside SafeAreaView
- Dependency updates: all SDK 54 packages updated to latest patch versions
- Added `expo-font`, `react-native-svg`, `react-native-worklets` peer dependencies
- Removed invalid `app.json` fields (`ios.deploymentTarget`, `android.useNextNotificationsApi`)
- Added `.npmrc` (legacy-peer-deps) and `.easignore` for reliable EAS builds
- Added `ScreenBackground` component with `backgpic.png` full-bleed background
- Added `ErrorBoundary` class component for unhandled JS error recovery
- `useRTL` hook extracted for consistent direction-aware layouts

### Version 1.2.0 (March 2026)
- Full internationalization (English, Arabic, Hebrew) with RTL support
- Lesson cancellation cascade — cleans up all linked data across 4 collections
- Subscription credit restoration on confirmed lesson cancellation
- Multi-worker assignment per time slot in weekly schedule
- Tap to multi-select, long press to edit/delete schedule assignments
- Quick payment and payment history for clients
- Instagram contact integration (@alamein_stud)
- All emoji icons replaced with Phosphor vector icons (`phosphor-react-native`)
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

**Version:** 1.3.0
**Last Updated:** May 2026
**Expo SDK:** ~54.0.34
**React Native:** 0.81.5
**Platforms:** iOS, Android, Web

---

*© 2025–2026 Al-Ameen Stud. All rights reserved.*
