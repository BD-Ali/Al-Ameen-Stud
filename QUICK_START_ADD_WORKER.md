# Quick Start: Adding Your First Worker

## Step-by-Step Instructions

### 1️⃣ Create Worker in Firebase Authentication
1. Go to: https://console.firebase.google.com
2. Select your project: **Al-Ameen-Stable**
3. Click **Authentication** (left sidebar)
4. Click **Users** tab
5. Click **Add User** button
6. Fill in:
   - **Email**: `worker@alameen.com` (example)
   - **Password**: `Worker123!` (example - use a strong password)
7. Click **Add User**
8. **IMPORTANT**: Copy the **User UID** (looks like: `Kq8X2jF9mNp...`)

### 2️⃣ Create User Profile in Firestore
1. Click **Firestore Database** (left sidebar)
2. Find the **users** collection (or create it if it doesn't exist)
3. Click **Add document**
4. In **Document ID** field: Paste the **User UID** from step 1
5. Click **Add field** and create these fields:

   | Field Name | Type | Value |
   |------------|------|-------|
   | `email` | string | `worker@alameen.com` |
   | `name` | string | `Ahmad Al-Sayed` |
   | `role` | string | `worker` |
   | `createdAt` | string | `2024-10-14T10:00:00Z` |

6. Click **Save**

### 3️⃣ Create Worker Record in Firestore
1. Still in Firestore Database
2. Find the **workers** collection
3. Click **Add document**
4. In **Document ID** field: Paste the **same User UID** from step 1
5. Click **Add field** and create these fields:

   | Field Name | Type | Value |
   |------------|------|-------|
   | `name` | string | `Ahmad Al-Sayed` |
   | `role` | string | `Head Trainer` |
   | `contact` | string | `+972-50-1234567` |
   | `createdAt` | string | `2024-10-14T10:00:00Z` |

6. Click **Save**

### 4️⃣ Test the Login
1. Open your app
2. Click **Sign In**
3. Enter:
   - Email: `worker@alameen.com`
   - Password: `Worker123!`
4. Worker should see their dashboard with:
   - Today's schedule
   - Their tasks
   - Their info

## Important Notes

✅ **The UID must be the same** in all three places:
   - Firebase Authentication
   - users/{UID}
   - workers/{UID}

✅ **The role must be exactly**: `worker` (lowercase, no spaces)

✅ **Workers cannot sign up themselves** - you must add them manually

## Visual Example

```
Firebase Authentication:
├── worker@alameen.com (UID: abc123xyz)

Firestore Database:
├── users/
│   └── abc123xyz/          ← Same UID
│       ├── email: "worker@alameen.com"
│       ├── name: "Ahmad Al-Sayed"
│       ├── role: "worker"   ← Must be exactly "worker"
│       └── createdAt: "..."
│
└── workers/
    └── abc123xyz/          ← Same UID
        ├── name: "Ahmad Al-Sayed"
        ├── role: "Head Trainer"  ← Job title, can be anything
        ├── contact: "+972-50-1234567"
        └── createdAt: "..."
```

## Troubleshooting

**Problem**: Worker can't log in
- **Solution**: Check email/password in Firebase Authentication

**Problem**: Worker sees blank screen
- **Solution**: Verify the worker document exists with matching UID

**Problem**: App crashes when worker logs in
- **Solution**: Make sure role="worker" in users collection (exactly, lowercase)

**Problem**: Worker doesn't see their name
- **Solution**: Check that name field exists in workers/{UID} document

## Adding More Workers

Just repeat steps 1-3 for each new worker. Each worker needs:
1. ✅ Authentication account
2. ✅ User profile (role="worker")
3. ✅ Worker record (with job details)

Remember: All three must use the **same UID**!

