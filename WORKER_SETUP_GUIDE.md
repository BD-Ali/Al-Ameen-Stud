# Worker Management Guide

## Overview
Workers are now a separate user type with their own login system. Workers **cannot sign up** themselves - they must be added by an administrator through the Firebase Console.

## How to Add a Worker

### Step 1: Create Worker Account in Firebase Authentication
1. Go to Firebase Console (https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** > **Users**
4. Click **Add user**
5. Enter the worker's email and password
6. Click **Add user** and copy the **User UID** (you'll need this)

### Step 2: Create User Profile in Firestore
1. In Firebase Console, navigate to **Firestore Database**
2. Go to the **users** collection
3. Click **Add document**
4. Set the **Document ID** to the **User UID** from Step 1
5. Add these fields:
   - `email` (string): worker's email
   - `name` (string): worker's full name
   - `role` (string): **"worker"** (must be exactly this)
   - `createdAt` (timestamp): current date/time

### Step 3: Create Worker Record in Firestore
1. Still in Firestore Database
2. Go to the **workers** collection
3. Click **Add document**
4. Set the **Document ID** to the **same User UID** from Step 1
5. Add these fields:
   - `name` (string): worker's full name
   - `role` (string): worker's job title (e.g., "Head Trainer", "Groom")
   - `contact` (string): phone number (optional)
   - `createdAt` (timestamp): current date/time

### Example Worker Setup

**Authentication:**
- Email: `ahmad.trainer@alameen.com`
- Password: `SecurePass123!`
- UID: `abc123xyz456` (automatically generated)

**users/abc123xyz456:**
```json
{
  "email": "ahmad.trainer@alameen.com",
  "name": "Ahmad Al-Sayed",
  "role": "worker",
  "createdAt": "2024-10-14T10:30:00Z"
}
```

**workers/abc123xyz456:**
```json
{
  "name": "Ahmad Al-Sayed",
  "role": "Head Trainer",
  "contact": "+972-50-1234567",
  "createdAt": "2024-10-14T10:30:00Z"
}
```

## What Workers Can See

Once logged in, workers will see:
1. **Today's Schedule** - Their assigned work schedule for the current day
2. **My Tasks** - Incomplete missions assigned to them
3. **Worker Info** - Their job title and contact information

Workers can:
- View their daily work schedule with descriptions
- See tasks assigned to them with priority levels
- Check which horses they need to work with
- Log out of their account

Workers **cannot**:
- Sign up on their own
- Access admin features
- Modify any data
- See other workers' information

## Important Notes

⚠️ **Security:**
- Worker UIDs must match across Authentication, users collection, and workers collection
- Always use role "worker" (lowercase) in the users collection
- Workers can only sign in, not sign up through the app

✅ **Best Practices:**
- Use strong passwords for worker accounts
- Keep worker contact information up to date
- Document each worker's responsibilities in their role field

## Troubleshooting

**Worker can't log in:**
- Verify the email/password in Firebase Authentication
- Check that the user document exists with role="worker"
- Ensure the worker document exists with matching UID

**Worker sees blank screen:**
- Check that the worker record exists in the workers collection
- Verify the UID matches across all documents

**Worker shows as different role:**
- Check the users/{uid} document and ensure role="worker"
- Worker must log out and log in again after role change

