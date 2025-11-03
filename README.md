# 🐴 Al-Ameen Stable Management App

A comprehensive React Native mobile application for managing horse stable operations, built with Expo and Firebase. The app provides role-based access for administrators, clients, workers, and visitors, with full support for Arabic (RTL).

## 📱 Overview

Al-Ameen Stable is a professional stable management system that streamlines day-to-day operations including:
- Horse management and care scheduling
- Lesson scheduling and tracking
- Client and worker management
- Announcements and notifications
- Weekly work schedules
- Payment tracking
- Task and mission management
- Real-time communication
- Image management with Cloudinary

## ✨ Key Features

### 🔐 Authentication & User Roles

- **Multi-role authentication system** with Firebase Authentication
- **Four user roles:**
  - **Admin** - Full system access and management
  - **Client** - View lessons, payments, and announcements
  - **Worker** - View assigned tasks and schedules
  - **Visitor** - Public view of horses and announcements
- **Automatic account creation** for new users by admin
- **Secure authentication** with Firebase
- **Role-based navigation** - Different home screens based on user role

### 🐴 Horse Management

**Admin Features:**
- **Complete horse profiles** with:
  - Name, breed, owner information
  - Feed schedules and care notes
  - Photo upload with Cloudinary integration
  - Optimized image delivery
- **Camera & gallery support** for horse photos
- **Care reminders** with scheduled notifications
- **Expandable horse cards** with detailed information
- **Add, edit, and delete** horses
- **Image optimization** for performance

**Client & Worker Features:**
- **Horizontal scrollable gallery** of all horses
- **View horse images** and basic information
- **Compact card design** for easy browsing
- **Quick reference** before lessons

**Visitor Features:**
- **Full-width horse cards** with images
- **Public display** of horses and breeds
- **Beautiful presentation** for guests

### 📚 Lesson Management (Admin)

- **Schedule lessons** with:
  - Date and time picker
  - Horse selection
  - Client assignment
  - Instructor (worker) assignment
- **Lesson status tracking:**
  - Scheduled
  - Confirmed/Completed
  - Cancelled
- **Automatic lesson reminders:**
  - Daily reminder at 10 AM on lesson day
  - 1-hour before lesson reminder
  - Grouped notifications for multiple lessons
- **Lesson cleanup service** - Automatically archives old lessons
- **Real-time lesson tracking** for clients and workers

### 👥 User Management (Admin)

- **Unified interface** for managing clients and workers
- **Client management:**
  - Create client accounts with email/phone
  - Track payment status (amount paid/due)
  - View lesson history (past and upcoming)
  - Subscription management
  - Lesson count tracking
- **Worker management:**
  - Create worker accounts
  - Role assignment
  - View assigned tasks and schedules
- **Search and filter** functionality
- **Expandable user cards** with detailed information
- **Edit/Delete operations** with confirmation alerts

### 📅 Weekly Schedule Management (Admin)

- **Weekly work schedule** for workers
- **Time slot based** (8 AM to 11 PM)
- **Day-based scheduling** (Saturday to Friday)
- **Assign workers** to specific time slots
- **Work descriptions** for each assignment
- **Automatic week rotation** starting on Saturday
- **Visual schedule grid** for easy overview

### 📢 Announcements System (Admin)

- **Create and manage announcements** with:
  - Title and rich content
  - Image attachments (Cloudinary)
  - Category tags (Update, Promo, Alert, Event, Info)
  - Target audience selection (All, Clients, Visitors, Workers)
  - Status management (Draft, Scheduled, Published, Expired)
  - Pin important posts
  - Schedule future announcements
  - Set expiry dates
- **Push notifications** for new announcements
- **In-app notification banner** for real-time updates
- **Deep linking** from notifications to announcements
- **Auto-expiry** of time-limited announcements

### ✅ Missions/Tasks Management (Admin/Workers)

- **Daily task tracking** from horse care reminders
- **Three categories:**
  - Today's missions (pending)
  - Completed missions
  - Upcoming missions
- **Mark tasks as done/undone**
- **Automatic categorization** by date and time
- **Horse-specific tasks** with descriptions

### 👤 Client Portal

- **Personal dashboard** with:
  - Payment status display
  - Subscription management (if applicable)
  - Lesson count tracking
  - Upcoming lessons
  - Past lesson history
  - Lesson confirmation status
- **Horses gallery:**
  - Horizontal scrollable view
  - See all horses with images
  - Quick browse before booking
- **Announcements feed** filtered for clients
- **Lesson details** including horse and instructor
- **Auto-identified** by logged-in user account
- **Contact us button** with direct call/email options

### 🔧 Worker Portal

- **Daily work overview:**
  - Current hour tasks (highlighted)
  - Upcoming tasks today
  - Past completed tasks
- **Horses gallery:**
  - Horizontal scrollable view
  - See all horses with images
  - Visual reference for daily work
- **Lesson schedule:**
  - Today's lessons
  - Upcoming lessons
  - Lesson confirmation actions
- **Weekly schedule integration**
- **Task time tracking**
- **Announcements feed** filtered for workers
- **Contact us button** with direct call/email options

### 👁️ Visitor Portal

- **Public-facing interface** with:
  - Welcome message and branding
  - List of horses with breed information
  - **Full-width horse images** for beautiful presentation
  - Announcements feed for visitors
- **No sensitive information** displayed
- **Read-only access**
- **Professional presentation** for potential clients
- **Contact us button** with direct call/email options

### 🔔 Notification System

- **Multiple notification types:**
  - Announcement notifications (targeted by role)
  - Lesson reminders (daily and 1-hour before)
  - Horse care reminders
- **In-app notification banner** for real-time alerts
- **Deep linking** from notifications to relevant screens
- **Notification preferences** support
- **Quiet hours** functionality
- **No duplicate notifications**
- **iOS and Android** platform support

### 📸 Image Management

- **Cloudinary integration** for:
  - Horse photos
  - Announcement images
- **Camera and gallery support**
- **Image optimization** for different screen sizes
- **Responsive image delivery**
- **Upload progress indicators**

### 📞 Contact Us Feature

- **Floating action button** on all user home screens
- **Interactive contact options:**
  - Direct phone call via native dialer
  - Email via default mail app
  - Contact information display
- **Available for:**
  - Clients
  - Workers
  - Visitors
- **One-tap communication** with stable management
- **Native platform integration** (iOS & Android)

### 🎨 User Interface

- **Modern, clean design** with:
  - Consistent color scheme
  - Typography system
  - Spacing guidelines
  - Border radius standards
  - Shadow effects
  - Smooth animations
- **RTL (Right-to-Left) support** for Arabic
- **Responsive layouts** for all screen sizes
- **Toast notifications** for user feedback
- **Loading indicators** for async operations
- **Emoji-enhanced** UI for better visual communication
- **Collapsible sections** for better space utilization
- **Floating action buttons** for quick access
- **Horizontal scrollable galleries** for browsing
- **Image placeholders** for graceful degradation
- **Native platform components** for familiar UX

## 🛠 Technology Stack

### Frontend
- **React Native (0.81.4)** - Cross-platform mobile framework
- **React (19.1.0)** - UI library
- **Expo (~54.0.0)** - Development platform
- **React Navigation (^6.x)** - Navigation and routing
  - Native Stack Navigator
  - Bottom Tabs Navigator
- **Expo Notifications (^0.32.12)** - Push and local notifications
- **Expo Image Picker (^17.0.8)** - Camera and gallery access
- **AsyncStorage (2.2.0)** - Local data persistence
- **React Native Gesture Handler (~2.28.0)** - Touch interactions
- **React Native Reanimated (~4.1.1)** - Smooth animations
- **DateTimePicker (^8.4.5)** - Date and time selection

### Backend & Services
- **Firebase (^12.4.0)**
  - Firebase Authentication - User authentication
  - Cloud Firestore - Real-time database
- **Cloudinary** - Image hosting and optimization

### Development Tools
- **EAS (Expo Application Services)** - Build and deployment
- **Expo Dev Client (~6.0.14)** - Custom development builds
- **Babel (^7.25.0)** - JavaScript compiler
- **Metro Bundler** - JavaScript bundler

## 📁 Project Structure

```
Al-Ameen-Stable/
├── App.js                          # Main app entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── babel.config.js                 # Babel configuration
├── metro.config.js                 # Metro bundler config
├── eas.json                        # EAS build configuration
├── assets/                         # App assets
│   ├── icon.png                    # App icon
│   └── splash.png                  # Splash screen
└── src/
    ├── components/                 # Reusable components
    │   ├── AdminTabs.js           # Bottom tab navigation for admin
    │   ├── AnnouncementsFeed.js   # Announcements feed component
    │   ├── CompactHeader.js       # User header component
    │   └── InAppNotificationBanner.js  # Notification banner
    ├── config/                     # Configuration files
    │   ├── cloudinaryConfig.js    # Cloudinary setup
    │   └── firebaseConfig.js      # Firebase setup
    ├── context/                    # React Context providers
    │   ├── AuthContext.js         # Authentication state
    │   └── DataContext.js         # App data state
    ├── screens/                    # App screens
    │   ├── LoginScreen.js         # Login interface
    │   ├── AnnouncementsScreen.js # Announcements management
    │   ├── ClientHomeScreen.js    # Client dashboard
    │   ├── FeedScreen.js          # Announcements feed (admin)
    │   ├── HorsesScreen.js        # Horse management
    │   ├── LessonsScreen.js       # Lesson scheduling
    │   ├── MissionsScreen.js      # Task management
    │   ├── UsersScreen.js         # User management
    │   ├── VisitorHomeScreen.js   # Public interface
    │   ├── WeeklyScheduleScreen.js # Weekly schedule
    │   └── WorkerHomeScreen.js    # Worker dashboard
    ├── services/                   # Service modules
    │   ├── lessonCleanupService.js     # Auto-cleanup old lessons
    │   ├── lessonReminderService.js    # Lesson notifications
    │   └── notificationService.js      # General notifications
    └── styles/
        └── theme.js               # Design system theme
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **iOS Simulator** (Mac) or **Android Emulator**
- **Firebase account** with project setup
- **Cloudinary account** for image hosting

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd AlAmeenStable/Al-Ameen-Stable
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Configure Firebase:**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password provider)
   - Enable Cloud Firestore database
   - Download your Firebase config
   - Add configuration to `src/config/firebaseConfig.js`:
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

4. **Configure Cloudinary:**
   - Create a Cloudinary account at https://cloudinary.com
   - Get your cloud name, API key, and upload preset
   - Add credentials to `src/config/cloudinaryConfig.js`:
   ```javascript
   export const CLOUDINARY_CLOUD_NAME = 'your-cloud-name';
   export const CLOUDINARY_UPLOAD_PRESET = 'your-upload-preset';
   ```

5. **Start the development server:**
```bash
npm start
# or
expo start
```

6. **Run on device/simulator:**
```bash
# iOS (Mac only)
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

### First Time Setup

1. **Create Admin Account:**
   - Use Firebase Console to create the first admin user
   - Set the user's role to "admin" in Firestore

2. **Initialize Firestore Collections:**
   - The app will create collections automatically on first use
   - Or manually create: users, clients, horses, lessons, announcements, etc.

3. **Test the App:**
   - Login with admin credentials
   - Create test horses, clients, and workers
   - Schedule a test lesson
   - Create an announcement

## 📱 Building for Production

### Using EAS (Expo Application Services)

```bash
# Build for iOS development
npm run build:dev:ios

# Build for Android development
npm run build:dev:android

# Build for production
eas build --platform ios
eas build --platform android
```


## 📊 Database Structure (Firestore)

### Collections & Fields

**users**
```
- id: string (auto-generated)
- email: string
- name: string
- role: string (admin|client|worker|visitor)
- phoneNumber: string
- createdAt: timestamp
```

**clients**
```
- id: string (matches user id)
- name: string
- email: string
- phoneNumber: string
- amountPaid: number
- amountDue: number
- lessonsCount: number
- hasSubscription: boolean
- subscriptionActive: boolean
- subscriptionLessons: number
- subscriptionTotalLessons: number
- subscriptionStartDate: timestamp
- createdAt: timestamp
```

**workers**
```
- id: string (matches user id)
- name: string
- role: string
- contact: string
- createdAt: timestamp
```

**horses**
```
- id: string (auto-generated)
- name: string
- breed: string
- owner: string
- feedSchedule: string
- notes: string
- imageUrl: string (Cloudinary URL)
- createdAt: timestamp
```

**lessons**
```
- id: string (auto-generated)
- date: string (YYYY-MM-DD)
- time: string (HH:MM)
- horseId: string (reference)
- clientId: string (reference)
- instructorId: string (reference)
- status: string (scheduled|completed|cancelled)
- confirmed: boolean
- createdAt: timestamp
```

**reminders**
```
- id: string (auto-generated)
- horseName: string
- horseId: string (reference)
- note: string
- date: string (YYYY-MM-DD)
- time: string (HH:MM)
- completed: boolean
- completedAt: timestamp
- notificationId: string
- createdAt: timestamp
```

**announcements**
```
- id: string (auto-generated)
- title: string
- content: string
- imageUri: string (Cloudinary URL)
- tag: string (Update|Promo|Alert|Event|Info)
- targetAudience: string (All|Clients|Visitors|Workers)
- status: string (Draft|Scheduled|Published|Expired)
- isPinned: boolean
- scheduledDate: timestamp
- expiryDate: timestamp
- sendNotification: boolean
- createdAt: timestamp
- createdBy: string (user id)
```

**weeklySchedules**
```
- id: string (auto-generated)
- weekId: string (YYYY-WXX format)
- day: string (saturday|sunday|monday|...)
- timeSlot: string (HH:MM)
- workerId: string (reference)
- workDescription: string
- createdAt: timestamp
```

**schedules** (daily schedules)
```
- id: string (auto-generated)
- date: string (YYYY-MM-DD)
- timeSlot: string (HH:MM)
- workerId: string (reference)
- workDescription: string
- createdAt: timestamp
```

## 🔧 Configuration

### Notification Setup
- Configure notification channels for Android
- Set notification categories for iOS
- Customize notification sounds and vibrations

### RTL Support
The app is configured for Right-to-Left (RTL) layout for Arabic language support.

### Image Optimization
Cloudinary automatically optimizes images for different screen sizes and formats.

## 📱 App Screens Overview

### Admin Screens (Bottom Tab Navigation)
1. **Announcements** 📢
   - Create, edit, delete announcements
   - Schedule and publish posts
   - Upload images
   - Target specific audiences
   - Pin important announcements

2. **Users** 👥
   - Manage clients and workers
   - Create new user accounts
   - View user details
   - Edit payment information
   - Track subscriptions

3. **Horses** 🐴
   - Add/edit horse profiles
   - Upload horse photos
   - Set care reminders
   - View horse details

4. **Lessons** 📚
   - Schedule new lessons
   - View all lessons
   - Confirm/cancel lessons
   - Track lesson status

5. **Feed** 📰
   - View all announcements
   - Filter by status
   - Quick edit/delete

6. **Weekly Schedule** 📅
   - Assign worker shifts
   - View weekly overview
   - Manage time slots

7. **Missions** ✅
   - View all tasks
   - Today's/completed/upcoming
   - Mark tasks as done

### Client Screen
- **ClientHomeScreen** 🏠
  - Payment status dashboard
  - Subscription information
  - Horses gallery (horizontal scroll)
  - Lessons list (upcoming & past)
  - Announcements feed
  - Contact us button

### Worker Screen
- **WorkerHomeScreen** 🔧
  - Daily schedule overview
  - Current/upcoming/past tasks
  - Horses gallery (horizontal scroll)
  - Today's lessons
  - Upcoming lessons
  - Announcements feed
  - Contact us button

### Visitor Screen
- **VisitorHomeScreen** 👁️
  - Welcome message
  - Horses showcase (full images)
  - Announcements feed
  - Contact us button

### Common Screens
- **LoginScreen** 🔐
  - Email/password authentication
  - Role-based redirect
  - Error handling

## 🎯 Key Workflows

### Creating a New Lesson
1. Admin navigates to Lessons screen
2. Selects date, time, horse, client, and instructor
3. System schedules lesson and sets up automatic reminders
4. Client and instructor receive notifications

### Adding a Horse Care Reminder
1. Admin adds a horse (if not exists)
2. Creates a reminder with date, time, and description
3. System schedules notification
4. Reminder appears in Missions screen
5. Workers can mark as completed

### Publishing an Announcement
1. Admin creates announcement with content and image
2. Selects target audience and tags
3. Optionally schedules for future or sets expiry
4. Publishes - system sends push notifications
5. Appears in relevant user feeds

## 🔧 Configuration & Setup

### Notification Setup
- Configure notification channels for Android in `notificationService.js`
- Set notification categories for iOS
- Customize notification sounds and vibrations
- Handle notification permissions

### RTL Support
The app is fully configured for Right-to-Left (RTL) layout:
- Arabic text rendering
- RTL-aware layouts
- Mirror UI elements appropriately

### Image Optimization
Cloudinary automatically:
- Optimizes images for different screen sizes
- Converts to efficient formats (WebP where supported)
- Provides CDN delivery
- Caches images for performance

### Environment Variables
For production, consider using environment variables for:
- Firebase configuration
- Cloudinary credentials
- API endpoints
- Feature flags

## 🐛 Troubleshooting

### Common Issues

**App won't start:**
- Clear Metro bundler cache: `expo start --clear`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Expo CLI version: `expo --version`

**Firebase connection issues:**
- Verify `firebaseConfig.js` has correct credentials
- Check Firebase Console for enabled services
- Ensure Firestore rules allow read/write

**Images not uploading:**
- Verify Cloudinary credentials in `cloudinaryConfig.js`
- Check upload preset in Cloudinary dashboard
- Ensure camera/gallery permissions are granted

**Notifications not working:**
- Check notification permissions on device
- Verify Expo project is configured for notifications
- Test with Expo Go first, then custom dev build

**Build errors:**
- Update to latest Expo SDK: `expo upgrade`
- Check compatibility of dependencies
- Review EAS build logs

## ❓ FAQ

**Q: How do I create the first admin account?**
A: Use Firebase Console to manually create a user and set their role to "admin" in Firestore.

**Q: Can I customize the app colors and theme?**
A: Yes! Edit `src/styles/theme.js` to change colors, typography, spacing, etc.

**Q: How do I add a new user role?**
A: Update AuthContext navigation logic and create a new home screen for the role.

**Q: Is the app available in languages other than Arabic?**
A: Currently optimized for Arabic. You can add i18n library for multi-language support.

**Q: Can I deploy to app stores?**
A: Yes! Use EAS Build to create production builds for iOS App Store and Google Play Store.

**Q: How do I backup the database?**
A: Use Firebase Console to export Firestore data, or implement a custom backup solution.

**Q: Can multiple admins use the app?**
A: Yes! Create multiple users with "admin" role in Firebase.

## 🚢 Deployment

### Production Build

1. **Configure EAS:**
```bash
eas build:configure
```

2. **Build for iOS:**
```bash
eas build --platform ios --profile production
```

3. **Build for Android:**
```bash
eas build --platform android --profile production
```

4. **Submit to App Stores:**
```bash
eas submit --platform ios
eas submit --platform android
```

### Update Strategy

For over-the-air updates:
```bash
eas update --branch production --message "Bug fixes and improvements"
```

## 🌟 Features Highlights

### Security & Authentication
- ✅ **Multi-tenant** role-based access control
- ✅ **Secure authentication** with Firebase
- ✅ **Password protection** for user accounts
- ✅ **Role-based permissions** and navigation
- ✅ **Automatic user provisioning** by admin

### Data Management
- ✅ **Real-time data** synchronization with Firestore
- ✅ **Offline support** with AsyncStorage
- ✅ **Data validation** and error handling
- ✅ **Automatic data cleanup** services
- ✅ **Efficient queries** and indexing

### Communication
- ✅ **Push notifications** with targeting
- ✅ **In-app notifications** banner
- ✅ **Announcement system** with categories
- ✅ **Direct contact** via phone/email
- ✅ **Notification scheduling** and expiry

### Media Management
- ✅ **Image upload** and optimization
- ✅ **Cloudinary integration** for CDN
- ✅ **Camera and gallery** support
- ✅ **Image placeholders** for graceful fallback
- ✅ **Responsive images** for all devices

### User Experience
- ✅ **RTL support** for Arabic
- ✅ **Responsive design** for all screen sizes
- ✅ **Smooth animations** and transitions
- ✅ **Loading states** and feedback
- ✅ **Error handling** with user-friendly messages
- ✅ **Intuitive navigation** with tabs and stacks

### Performance
- ✅ **Optimized rendering** with FlatList
- ✅ **Image caching** and lazy loading
- ✅ **Efficient state management** with Context API
- ✅ **Minimal re-renders** with React best practices
- ✅ **Fast startup** time

### Developer Experience
- ✅ **Type-safe** development practices
- ✅ **Modular architecture** for easy maintenance
- ✅ **Reusable components** library
- ✅ **Consistent styling** with theme system
- ✅ **Clear code organization**
- ✅ **Automated reminders** and cleanup services

## 📄 License

This project is proprietary software developed for Al-Ameen Stable.

## 🤝 Contributing

This is a private project. For feature requests or bug reports, please contact the development team.

## 👨‍💻 Development Team

Built with ❤️ using React Native and Expo

### Technologies Used
- React Native for cross-platform development
- Expo for rapid development and deployment
- Firebase for backend services
- Cloudinary for media management

## 📞 Support & Contact

For technical support, issues, or questions:
- **Email:** badarne3li@gmail.com
- **Phone:** 0503653429

For bug reports, please include:
- Device type and OS version
- App version
- Steps to reproduce
- Screenshots if applicable

## 📊 Project Statistics

- **Total Screens:** 11+
- **User Roles:** 4 (Admin, Client, Worker, Visitor)
- **Database Collections:** 8
- **Supported Platforms:** iOS, Android
- **Languages:** Arabic (RTL), English
- **Dependencies:** 20+ npm packages

## 🎯 Future Enhancements

Potential features for future versions:
- Multi-language support (i18n)
- Video content for lessons
- Payment gateway integration
- Advanced analytics dashboard
- Booking system for visitors
- Calendar integration
- Export reports (PDF/Excel)
- SMS notifications
- Biometric authentication
- Dark mode theme

## 📝 Version History

### Version 1.0.0 (November 2025)
- Initial release
- Core stable management features
- Role-based authentication
- Horse management with images
- Lesson scheduling and tracking
- Announcement system
- Notification service
- Weekly schedule management
- Contact us feature
- Horses gallery for all users

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Expo SDK:** ~54.0.0  
**React Native:** 0.81.4

---

*© 2025 Al-Ameen Stable. All rights reserved.*

