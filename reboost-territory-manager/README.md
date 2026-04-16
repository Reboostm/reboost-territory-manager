# ReBoost Territory Manager

A comprehensive territory management system for marketing agencies. Built with React, Vite, Firebase, and deployed on Vercel.

## Features

- **Admin Dashboard** - Manage territories, service niches, and settings
- **Sales Rep View** - See available territories with quick share links
- **Public Availability Checker** - Customers search by city/zip to check service availability
- **SEO Landing Pages** - Auto-generated pages for each territory+niche combination
- **Bulk CSV Import** - Upload multiple territories at once
- **Firestore Database** - Real-time territory status and booking management
- **Firebase Auth** - Secure admin login
- **GHL Calendar Integration** - Direct booking links to calendar

## Tech Stack

- React 19
- Vite (blazingly fast dev server)
- Firebase (Firestore + Auth)
- React Router v7
- PapaParse (CSV parsing)
- Vercel (deployment)

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Firebase project with Firestore enabled
- GHL (GoHighLevel) calendar link (for booking integration)

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd reboost-territory-manager
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Fill in your Firebase credentials in `.env`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database (start in test mode)
3. Enable Firebase Authentication (Email/Password method)
4. Create a single admin user in Firebase Auth
5. Replace the placeholder env vars with your project credentials

### Firestore Security Rules

Paste these rules in your Firestore console under "Rules" tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access
    match /{document=**} {
      allow read: if true;
    }
    
    // Only authenticated users can write
    match /{document=**} {
      allow write: if request.auth != null;
    }
  }
}
```

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:5173`

- `/check` - Public availability checker (home page)
- `/sales` - Sales rep view (no auth required)
- `/login` - Admin login
- `/admin` - Admin dashboard (protected)

### Building for Production

```bash
npm run build
npm run preview
```

## Deployment on Vercel

1. Push your repo to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel project settings:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID

4. Deploy - Vercel will automatically build and deploy

**Important:** Vercel requires environment variables to start with `VITE_` for them to be accessible in the browser.

## Admin Features

### Zones Tab
- View all territories (zones)
- Add new zones manually with form
- Bulk import zones via CSV upload
- Click any niche badge to edit status (available/taken/hidden) and client name
- Filter by state
- **Seed Utah Data** button - pre-loads 15 Utah territories

### Niches Tab
- Manage service types (e.g., Plumber, Electrician)
- Add new niches (auto-generates URL slugs)
- Delete niches (removed from all zones)
- Auto-adds to all existing zones when created

### Settings Tab
- Update GHL Calendar URL (used for booking buttons)
- Configure agency name and tagline

## CSV Upload Format

Support this exact format for bulk zone import:

```csv
zone_name,state,cities,zips,lat,lng
"Tooele County",UT,"Tooele;Grantsville;Stansbury Park;Rush Valley;Vernon","84074;84029;84083;84078",40.5469,-112.2983
"Salt Lake County - Central",UT,"Salt Lake City;Murray;Millcreek;Holladay","84101;84102;84103;84107",40.7608,-111.8910
```

**Important:** Cities and zip codes are separated by **semicolons** within the quoted field.

## Data Model

### Collections

**zones** - Territory information
```javascript
{
  id: auto,
  name: "Tooele County",
  state: "UT",
  cities: ["Tooele", "Grantsville", ...],
  zips: ["84074", "84029", ...],
  lat: 40.5469,
  lng: -112.2983,
  nicheSlots: {
    "plumber": { status: "available", clientName: "" },
    "pest-control": { status: "taken", clientName: "Bugout Utah" },
    ...
  }
}
```

**niches** - Service types
```javascript
{
  id: "plumber",
  name: "Plumber",
  slug: "plumber"
}
```

**settings** - Configuration
```javascript
// Document: booking
{ calendarUrl: "https://calendar.gohighlight.com/..." }

// Document: brand
{ agencyName: "ReBoost", tagline: "Territory Marketing Agency" }
```

**waitlist** - Interested prospects for claimed territories
```javascript
{
  zoneId: "zone_doc_id",
  niche: "plumber",
  name: "John Doe",
  email: "john@example.com",
  createdAt: timestamp
}
```

## Pages

- `/` - Redirects to `/check`
- `/check` - Public availability search page
- `/[state]/[niche]/[zone]` - SEO landing pages (e.g., `/ut/plumber/tooele-county`)
- `/login` - Admin login
- `/admin` - Admin dashboard
- `/sales` - Sales rep view
- `*` - 404 page

## Styling

The app uses a clean, professional design system with:
- Primary color: `#0057ff` (ReBoost blue)
- Responsive grid layouts
- Dark sidebar navigation in admin
- Clean white public pages
- Color-coded badges (green=available, red=taken, gray=hidden)

## Branding

ReBoost brand color: `#0057ff`

Customize brand name and tagline in Admin > Settings

## Troubleshooting

**"Firebase app not initialized"**
- Make sure `.env` file is in the root directory
- Check all Firebase credentials are correct
- Restart dev server after updating `.env`

**"Permission denied" errors**
- Update Firestore security rules (see section above)
- Make sure you're signed in as admin for writes

**"Calendar URL not found"**
- Go to Admin > Settings and enter GHL calendar URL
- This URL is required for booking buttons to work

## License

Proprietary - ReBoost Marketing Agency
