# Quick Start Guide

## 📋 What's Been Built

A complete, production-ready territory management system with:

✅ **Admin Dashboard** (`/admin`)
- Manage territories (zones) and service types (niches)
- Add zones manually or via CSV bulk upload
- Edit niche availability status for each territory
- Pre-loaded Utah zone data (15 territories)
- Settings panel for GHL calendar URL and branding

✅ **Public Pages**
- `/check` - Territory availability search (city/zip)
- `/:state/:niche/:zone` - SEO landing pages (e.g., `/ut/plumber/tooele-county`)
- `/sales` - Sales rep view (no login required)

✅ **Authentication**
- Firebase Auth (email/password)
- Admin-only dashboard access
- Persistent login (stays signed in)

✅ **Database**
- Firestore (real-time database)
- Collections: zones, niches, settings, waitlist
- Public read access, authenticated write access

✅ **Styling**
- Professional, clean design
- Responsive (mobile-friendly)
- ReBoost brand color (#0057ff)
- Dark admin sidebar, white public pages

✅ **Ready for Deployment**
- Vercel-ready (just push to GitHub and connect)
- Environment variables in `.env`
- Production build script included

---

## 🚀 Next Steps (In Order)

### 1. Create Firebase Project (5 minutes)
Follow **FIREBASE_SETUP.md** for step-by-step instructions:
```bash
cd reboost-territory-manager
cat FIREBASE_SETUP.md
```

Key steps:
- Create Firebase project at firebase.google.com
- Create Firestore database (test mode)
- Enable Email/Password authentication
- Create one admin user
- Copy credentials to `.env` file
- Set Firestore security rules

### 2. Test Locally (2 minutes)
```bash
npm run dev
```

Visit:
- `http://localhost:5173/login` - Login with your admin credentials
- `http://localhost:5173/admin` - Admin dashboard
- `http://localhost:5173/check` - Public search page
- `http://localhost:5173/sales` - Sales view

### 3. Load Sample Data (1 minute)
In admin dashboard:
- Click "Seed Utah Data" button → Loads 15 example territories
- Go to Sales view → See territories with availability badges

### 4. Configure Settings (2 minutes)
In Admin → Settings:
- Add GHL Calendar URL (for booking buttons to work)
- Customize agency name and tagline

### 5. Test All Pages (5 minutes)
- Try `/check` - search for "Salt Lake City"
- Visit `/ut/plumber/salt-lake-county-central` - SEO landing page
- Add/edit zones in Admin → Zones
- Add new niches in Admin → Niches
- Edit niche availability by clicking badges in zone table

### 6. Deploy to Vercel (5 minutes)
1. Push to GitHub: `git add . && git commit -m "Initial commit" && git push`
2. Go to vercel.com, connect your GitHub repo
3. Add environment variables from your `.env` file
4. Vercel auto-deploys
5. Your app is live!

---

## 📁 Project Layout

```
reboost-territory-manager/
├── src/
│   ├── pages/           ← Login, Admin, Sales, Check, LandingPage
│   ├── components/      ← AdminZones, AdminNiches, AdminSettings
│   ├── App.jsx          ← Main routing
│   ├── firebase.js      ← Firebase config
│   └── [styles].css     ← All component styles
├── .env                 ← Firebase credentials (you fill this in)
├── FIREBASE_SETUP.md    ← Step-by-step Firebase guide
├── README.md            ← Full documentation
└── package.json         ← Dependencies
```

---

## 🔑 Firebase Credentials to Collect

When you create your Firebase project, you'll copy these 6 values:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Paste them into `.env` file in the root directory.

---

## ⚙️ Configuration Checklist

- [ ] Firebase project created
- [ ] Firestore database running
- [ ] Email/Password auth enabled
- [ ] Admin user created in Firebase
- [ ] `.env` filled with credentials
- [ ] Firestore security rules set
- [ ] `npm run dev` works
- [ ] Can login at `/login`
- [ ] Admin dashboard `/admin` loads
- [ ] "Seed Utah Data" works
- [ ] GHL calendar URL added in settings
- [ ] Public `/check` page works
- [ ] GitHub repo created
- [ ] Vercel project created
- [ ] Env vars added to Vercel
- [ ] App deployed and live

---

## 🔗 Important Urls

**Local Development:**
- Login: `http://localhost:5173/login`
- Admin: `http://localhost:5173/admin`
- Public Search: `http://localhost:5173/check`
- Sales: `http://localhost:5173/sales`
- Example Landing Page: `http://localhost:5173/ut/plumber/salt-lake-county-central`

**Production (after Vercel deploy):**
- Replace `localhost:5173` with your Vercel domain

---

## 🛠️ Common Tasks

**Add a New Territory:**
Admin → Zones → Click "Add Zone" → Fill form → Submit

**Bulk Import Territories:**
Admin → Zones → Click "Upload CSV" → Select file → Territories load

**Add New Service Type:**
Admin → Niches → Enter service name → Click "Add Niche" → Auto-adds to all zones

**Change Territory Status:**
Admin → Zones → Click any niche badge → Select status (available/taken/hidden) → Save

**Update Calendar Booking Link:**
Admin → Settings → Paste GHL URL → Save

---

## 📞 GHL Calendar Integration

The "Book a free call" buttons on public pages link to your GHL calendar.

To get your GHL calendar URL:
1. Log into GoHighLevel
2. Go to Calendar
3. Get your public booking link
4. Paste in Admin → Settings
5. Booking buttons now work!

---

## 🚢 Deployment Checklist

**Before deploying to Vercel:**

1. Make sure everything works locally (`npm run dev`)
2. Test login with admin credentials
3. Test "Seed Utah Data"
4. Test public `/check` page
5. Commit and push to GitHub

**On Vercel:**

1. Connect GitHub repo
2. Add 6 environment variables from `.env`
3. Vercel auto-builds and deploys
4. Visit your live URL
5. Test public pages again
6. Share with your team!

---

## 📖 Full Documentation

- **README.md** - Complete setup and features guide
- **FIREBASE_SETUP.md** - Step-by-step Firebase configuration
- **PROJECT_STRUCTURE.md** - Deep dive into code organization

---

## 💡 Pro Tips

1. **Search engine friendly:** Landing pages auto-generate SEO-friendly meta titles and descriptions
2. **Privacy:** Customer data never shown in public (status badge hides client names)
3. **Team sharing:** `/sales` link can be shared with sales reps (no login needed, just obscure URL)
4. **Scalable:** Add as many territories and niches as needed
5. **Realtime:** Firestore updates in real-time across all users

---

**You're all set! Start with FIREBASE_SETUP.md and you'll be live in 15 minutes. 🎉**
