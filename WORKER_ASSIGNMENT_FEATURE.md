# Worker Assignment & Auto-Update Feature

## Overview
This feature enables **authenticated users with the "worker" role** to be assigned to lessons and work schedules, with automatic synchronization to their worker log/dashboard.

## Important: Worker Users vs Workers Collection

### **Users with Worker Role (Primary)**
The system now uses **authenticated users from the `users` collection** who have `role: "worker"`. These are actual user accounts that can:
- Log in to the system
- View their personalized dashboard
- See their assigned lessons and schedules in real-time
- Access the WorkerHomeScreen

### **Workers Collection (Deprecated for Assignment)**
The old `workers` collection is still present but **NOT used for lesson/schedule assignments**. It's kept for backward compatibility but new assignments use the `users` collection with role filtering.

## Key Features Implemented

### 1. **Automatic Mission Creation**
When a user with worker role is assigned to:
- **Lessons**: A mission is automatically created with:
  - Title: "درس تدريب" (Training Lesson)
  - Description: Lesson time details
  - Priority: High
  - Associated horse and client information
  - Lesson date and time
  - Worker user ID (from users collection)

- **Work Schedules**: A mission is automatically created with:
  - Title: Work description
  - Description: Schedule time details
  - Priority: Medium
  - Schedule date and time
  - Worker user ID (from users collection)

### 2. **Worker Dashboard Updates**
Workers can now see on their home screen:

#### **Today's Schedule** (جدول اليوم)
- All work scheduled for today
- Includes both manual schedule entries and lesson schedules
- Shows time slots and descriptions

#### **My Tasks** (مهامي)
- All pending missions assigned to the worker
- Automatically includes lessons and scheduled work
- Priority indicators (High, Medium, Low)
- Due dates and associated horses

#### **My Lessons** (دروسي)
- **Today's Lessons**: All lessons scheduled for today
- **Upcoming Lessons**: Next 5 upcoming lessons
- Shows client name, horse name, and lesson time
- Each lesson displays:
  - Time (⏰)
  - Client name (👤)
  - Horse name (🐴)

### 3. **Real-time Synchronization**
All updates are synchronized in real-time through Firebase:
- When admin adds a lesson → Worker sees it immediately
- When admin adds work schedule → Worker's missions update automatically
- When admin removes a lesson/schedule → Associated missions are cleaned up

### 4. **Data Structure**

#### Users Collection (Worker Role Filter)
```javascript
{
  id: "user-auth-id",
  email: "worker@example.com",
  name: "Worker Name",
  role: "worker", // Important: Must be "worker"
  createdAt: timestamp
}
```

#### Missions Collection (New)
```javascript
{
  workerId: "user-auth-id", // References users collection
  title: "Mission title",
  description: "Mission details",
  dueDate: "2025-10-14",
  time: "14:00",
  horseId: "horse-id" (optional),
  lessonId: "lesson-id" (optional),
  scheduleId: "schedule-id" (optional),
  type: "lesson" | "schedule",
  priority: "high" | "medium" | "low",
  completed: false,
  createdAt: timestamp
}
```

#### Schedules Collection (Enhanced)
```javascript
{
  date: "2025-10-14",
  timeSlot: "14:00",
  workerId: "user-auth-id", // References users collection
  description: "Work description",
  type: "lesson" | "schedule",
  lessonId: "lesson-id" (optional),
  createdAt: timestamp
}
```

#### Lessons Collection
```javascript
{
  date: "2025-10-14",
  time: "14:00",
  horseId: "horse-id",
  clientId: "client-id",
  instructorId: "user-auth-id", // References users collection (worker role)
  createdAt: timestamp
}
```

## How It Works

### For Admins:

1. **Adding a Lesson**:
   - Navigate to Lessons screen
   - Fill in date, time, horse, client
   - Select instructor from **users with "worker" role** (shows email)
   - Click "جدولة درس" (Schedule Lesson)
   - System automatically:
     - Creates the lesson
     - Adds a schedule entry for the instructor
     - Creates a mission for the instructor

2. **Adding a Work Schedule**:
   - Navigate to Schedule screen
   - Select date and time slot
   - Select worker from **users with "worker" role** (shows email)
   - Enter work description
   - Click "إضافة" (Add)
   - System automatically:
     - Creates the schedule entry
     - Creates a mission for the worker

3. **Removing Assignments**:
   - Delete a lesson → Associated schedules and missions are removed
   - Delete a schedule → Associated mission is removed

### For Workers:

1. **Login**:
   - Use email and password (must have role: "worker" in users collection)
   - Redirected to WorkerHomeScreen automatically

2. **View Today's Work**:
   - See "جدول اليوم" (Today's Schedule)
   - All lessons and work for today are displayed

3. **View All Tasks**:
   - Check "مهامي" (My Tasks) section
   - See all pending missions with priorities
   - View due dates and associated details

4. **View Lessons**:
   - Check "دروسي" (My Lessons) section
   - See today's lessons separately
   - View upcoming lessons (next 5)
   - Each lesson shows client, horse, and time

## Setup Instructions

### 1. Create Worker Users
To add a worker who can be assigned to lessons/schedules:

```javascript
// In Firebase Authentication or through the signup flow:
{
  email: "worker@stable.com",
  password: "securepassword",
  name: "Worker Name",
  role: "worker" // MUST be set to "worker"
}
```

### 2. Verify Worker Can See Assignments
1. Worker logs in with their credentials
2. System checks `role` field in users collection
3. If `role === "worker"`, user is directed to WorkerHomeScreen
4. Worker sees all lessons/schedules assigned to their user ID

## Benefits

✅ **Authenticated Users**: Only real authenticated users can be assigned  
✅ **Automatic Updates**: Workers always see their latest assignments  
✅ **No Manual Entry**: Admins don't need to manually create worker tasks  
✅ **Real-time Sync**: All changes reflected immediately  
✅ **Organized View**: Workers see schedules, tasks, and lessons separately  
✅ **Complete Information**: Each assignment includes all relevant details  
✅ **Clean Deletion**: Removing assignments automatically cleans up related data  
✅ **Email Display**: Workers are shown with their email for easy identification

## Technical Implementation

### Files Modified:
1. **DataContext.js**: 
   - Added `workerUsers` state (filtered from users collection)
   - Added users collection subscription with role filter
   - Updated `addLesson()` to auto-create schedule and mission
   - Updated `addSchedule()` to auto-create mission
   - Updated `removeLesson()` to clean up associated data
   - Updated `removeSchedule()` to clean up associated mission
   - Added mission management functions
   - Exports `workerUsers` for use in other components

2. **LessonsScreen.js**:
   - Now uses `workerUsers` instead of `workers` for instructor selection
   - Displays worker email alongside name
   - Shows clear message when no worker users exist
   - Falls back to workers collection for displaying existing lessons

3. **ScheduleScreen.js**:
   - Now uses `workerUsers` instead of `workers` for worker selection
   - Displays worker email in selection list
   - Shows clear message when no worker users exist
   - Falls back to workers collection for displaying existing schedules

4. **WorkerHomeScreen.js**:
   - Added lessons display section
   - Enhanced to show today's lessons separately
   - Added upcoming lessons view
   - Shows client and horse names for each lesson

### Firebase Collections Used:
- `users`: User authentication and role management (**PRIMARY for workers**)
- `lessons`: Stores lesson information
- `schedules`: Stores work schedules
- `missions`: Stores worker tasks/missions (NEW)
- `workers`: Legacy collection (kept for backward compatibility)
- `clients`: Stores client information
- `horses`: Stores horse information

## Troubleshooting

### "No workers available" message?
**Solution**: Create users with `role: "worker"` in the users collection, not just entries in the workers collection.

### Worker can't see assignments?
**Check**:
1. User has `role: "worker"` in their user document
2. Lessons/schedules are assigned using the user's authentication ID
3. User is logged in with the correct account

### Existing workers not showing?
**Explanation**: The system now uses authenticated users from the `users` collection. Old entries in the `workers` collection won't appear in assignment dropdowns.

## Migration from Workers Collection

If you have existing data in the `workers` collection:
1. Create corresponding user accounts for each worker
2. Set `role: "worker"` for each user
3. Re-assign any existing lessons/schedules to the new user IDs
4. The old workers collection can remain for historical data

## Future Enhancements (Optional)

- [ ] Allow workers to mark missions as completed
- [ ] Add notifications for new assignments
- [ ] Filter lessons by status (completed/upcoming)
- [ ] Add lesson notes/feedback feature
- [ ] Export worker schedule to calendar
- [ ] Add worker performance tracking
- [ ] Migrate old workers collection data automatically

## Support

For questions or issues with this feature, review this documentation and check the implementation in the modified files.
