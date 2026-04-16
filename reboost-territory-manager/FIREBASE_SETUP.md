# Firebase Configuration Guide

This guide walks you through setting up Firebase for ReBoost Territory Manager.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name it `reboost-territory-manager` (or your preferred name)
4. Uncheck "Enable Google Analytics" (optional)
5. Click "Create project" and wait for setup to complete

## Step 2: Get Your Firebase Credentials

1. In the Firebase Console, go to **Project Settings** (gear icon)
2. Under "Your apps", click **Web** icon (looks like `</>`  if no app exists yet)
3. Register your app with name `reboost-web`
4. Copy the Firebase config object that appears:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxx",
};
```

5. Paste these values into your `.env` file:

```
VITE_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxxxxx
```

## Step 3: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **Create database**
3. Choose location (closest to your users, e.g., `us-central1`)
4. Choose **Start in test mode** (we'll secure it later)
5. Click **Create**

## Step 4: Enable Authentication

1. Go to **Authentication** (left sidebar)
2. Click **Get started** or **Sign-in method**
3. Click **Email/Password**
4. Enable it and click **Save**
5. Do NOT enable "Passwordless sign-in" — keep it simple

## Step 5: Create Admin User

1. In Authentication, go to **Users** tab
2. Click **Add user**
3. Enter admin email and password
4. Click **Add user**

**Save these credentials somewhere safe** — you'll use them to log in to `/login`

## Step 6: Set Firestore Security Rules

1. In Firestore, go to **Rules** tab
2. Replace all text with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access - anyone can read zones, niches, etc
    match /{document=**} {
      allow read: if true;
    }
    
    // Authenticated write access - only admin can write
    match /{document=**} {
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

## Step 7: Verify Everything Works

1. In your terminal, run:
```bash
npm run dev
```

2. Navigate to `http://localhost:5173/login`

3. Enter the admin email and password you created in Step 5

4. If login succeeds, you're ready to go! 🎉

## Troubleshooting

### "Auth/invalid-api-key"
- Check your `VITE_FIREBASE_API_KEY` in `.env`
- Make sure `.env` is in the root directory
- Restart dev server after updating `.env`

### "Permission denied" on any page
- Check Firestore Rules (Step 6)
- Make sure rule is set to `allow read: if true;` for public pages
- Make sure rule is set to `allow write: if request.auth != null;` for admin writes

### "Database doesn't exist"
- Go to Firestore and create a database (Step 3)
- Make sure location is selected

### Cannot log in
- Go to Firebase Console → Authentication → Users
- Verify your admin user was created
- Check the password is correct
- Check email format is valid

## Next Steps

After verifying login works:

1. Go to `/admin`
2. Click **Seed Utah Data** to load example territories
3. Go to `/sales` to see the sales rep view
4. Go to `/check` to test the public availability page
5. In Admin > Settings, enter a GHL calendar URL for booking buttons

## Vercel Deployment

When deploying to Vercel:

1. Go to your Vercel project settings
2. Add these environment variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. Copy the exact values from your `.env` file
4. Vercel will automatically redeploy with these vars
