# Project Structure

```
reboost-territory-manager/
├── public/                    # Static assets
├── src/
│   ├── components/           # Reusable React components
│   │   ├── AdminZones.jsx    # Zone management (add, edit, CSV upload)
│   │   ├── AdminZones.css
│   │   ├── AdminNiches.jsx   # Niche management (add, delete)
│   │   ├── AdminNiches.css
│   │   ├── AdminSettings.jsx # GHL URL and brand settings
│   │   └── AdminSettings.css
│   ├── pages/                # Full page components
│   │   ├── Login.jsx         # Admin login (email/password)
│   │   ├── Login.css
│   │   ├── Admin.jsx         # Admin dashboard with sidebar nav
│   │   ├── Admin.css         # Dark sidebar, tabbed layout
│   │   ├── Sales.jsx         # Sales rep view (territories table)
│   │   ├── Sales.css
│   │   ├── Check.jsx         # Public availability search
│   │   ├── Check.css
│   │   ├── LandingPage.jsx   # SEO landing pages (/[state]/[niche]/[zone])
│   │   ├── LandingPage.css
│   │   ├── NotFound.jsx      # 404 page
│   ├── App.jsx               # Main routing and auth state
│   ├── App.css               # Global styles, utilities, buttons
│   ├── firebase.js           # Firebase config and initialization
│   ├── index.css             # Base HTML styles
│   └── main.jsx              # React entry point
├── .env                      # Firebase credentials (NOT in git)
├── .env.example              # Template for .env
├── .gitignore                # Ignores node_modules, dist, .env
├── index.html                # HTML entry point
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite configuration
├── README.md                 # Setup and deployment instructions
├── FIREBASE_SETUP.md         # Step-by-step Firebase guide
└── PROJECT_STRUCTURE.md      # This file
```

## Key Files Explained

### Core Files

**firebase.js**
- Initializes Firebase app, Auth, and Firestore
- Exports `auth` and `db` for use in components
- Sets up persistence (browser localStorage)

**App.jsx**
- React Router setup with 6 routes
- Auth state management with `onAuthStateChanged`
- PrivateRoute wrapper for `/admin` protection
- Loading state while checking auth

### Pages

**Login.jsx** → `/login`
- Email/password Firebase Auth
- Redirects to `/admin` on success
- Shows error messages

**Admin.jsx** → `/admin`
- Sidebar navigation with 3 tabs: Zones, Niches, Settings
- Dark sidebar, white content area
- Each tab renders a different component
- Logout button

**AdminZones.jsx** → `/admin` (Zones tab)
- Table of all zones with state filter
- Add Zone form (manual entry)
- Upload CSV form (bulk import)
- Click niche badges to edit status/client name
- Modal for editing niche slots
- **Seed Utah Data** button (15 pre-loaded zones)

**AdminNiches.jsx** → `/admin` (Niches tab)
- List of all service niches
- Add Niche form (auto-generates slug)
- Delete niche button
- Auto-adds new niche to all existing zones

**AdminSettings.jsx** → `/admin` (Settings tab)
- GHL Calendar URL input (used for booking buttons)
- Agency name input
- Tagline input
- Save button with success confirmation

**Sales.jsx** → `/sales`
- Same zone table as admin (read-only)
- Filter by state dropdown
- Share icon button copies direct link to landing page
- Shows "Last updated" timestamp
- No login required (obscure URL for sales team only)

**Check.jsx** → `/check`
- Public-facing availability search
- Search by city name or zip code
- Shows matching zones as you type
- Displays all niches for selected zone
- Green badges = Available (with "Book" button)
- Red badges = Taken (shows "Claimed")
- Hidden niches not shown
- "Don't see your city?" section with booking button

**LandingPage.jsx** → `/:state/:niche/:zone`
- SEO landing page for specific territory+niche
- Example: `/ut/plumber/tooele-county`
- Shows availability status
- If available: "Only 1 spot available" + Book button
- If taken: "Area claimed" + Waitlist form
- If hidden: Redirect to /check
- Auto-generates meta title and description for SEO
- Saves waitlist signups to Firestore

### Styles

**App.css** (Global)
- CSS variables (colors, spacing)
- Button classes (.btn, .btn-primary, .btn-secondary, etc)
- Badge classes (.badge, .badge-green, .badge-red, .badge-gray)
- Form utilities (.form-group, .form-row, .form-row-3)
- Table, card, and layout styles

**index.css** (Base)
- Reset styles (margin, padding, box-sizing)
- Font stack, line-height
- Basic body and root element styles

Component-specific `.css` files handle:
- Layout and spacing
- Hover/active states
- Responsive breakpoints
- Animations

## Data Flow

### Authentication
```
User visits /login
↓
Enters email + password
↓
Firebase authenticates
↓
onAuthStateChanged fires
↓
Sets user state in App.jsx
↓
PrivateRoute allows access to /admin
```

### Territory Management
```
Admin clicks "Add Zone"
↓
Fills form with name, state, cities, zips, lat, lng
↓
Submits → addDoc to zones collection
↓
Automatically creates nicheSlots for all existing niches
↓
Fetches updated zones list
↓
Table re-renders
```

### CSV Import
```
Admin selects CSV file
↓
PapaParse reads CSV
↓
For each row: addDoc zone with parsed data
↓
Fetches updated zones
↓
Table re-renders
```

### Public Search
```
User types city/zip in /check
↓
Filter zones where cities include search term OR zips include search term
↓
Show matching zones as autocomplete list
↓
User clicks zone
↓
Display all niches with availability
↓
User clicks "Book" → Opens GHL calendar URL
```

### Niche Status Update
```
Admin clicks niche badge in Admin > Zones
↓
Modal opens with status selector
↓
Admin picks: available / taken / hidden
↓
Admin enters optional client name
↓
Clicks "Save"
↓
updateDoc zone.nicheSlots[niche] with new status
↓
Fetches zones again
↓
Table re-renders
```

## Firestore Collections

**zones** - One doc per territory
```javascript
{
  id: "auto-generated",
  name: "Salt Lake County - Central",
  state: "UT",
  cities: ["Salt Lake City", "Murray", ...],
  zips: ["84101", "84102", ...],
  lat: 40.7608,
  lng: -111.8910,
  nicheSlots: {
    "plumber": { status: "available", clientName: "" },
    "pest-control": { status: "taken", clientName: "Bugout Utah" },
    "house-cleaner": { status: "hidden", clientName: "" }
  }
}
```

**niches** - One doc per service type
```javascript
{
  id: "plumber",  // Used as the key in nicheSlots
  name: "Plumber",
  slug: "plumber"  // URL-safe slug
}
```

**settings** - Configuration documents
```javascript
// Document: booking
{ calendarUrl: "https://calendar.gohighlight.com/..." }

// Document: brand
{
  agencyName: "ReBoost",
  tagline: "Territory Marketing Agency"
}
```

**waitlist** - Prospect interest for claimed territories
```javascript
{
  zoneId: "zone-doc-id",
  niche: "plumber",
  name: "John Doe",
  email: "john@example.com",
  createdAt: Timestamp
}
```

## Environment Variables

All must start with `VITE_` to be accessible in browser:

```
VITE_FIREBASE_API_KEY           # Public API key
VITE_FIREBASE_AUTH_DOMAIN       # Auth domain (project.firebaseapp.com)
VITE_FIREBASE_PROJECT_ID        # Firestore project ID
VITE_FIREBASE_STORAGE_BUCKET    # Storage bucket
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## Deployment Checklist

- [ ] Firebase project created with Firestore + Auth
- [ ] Admin user created in Firebase Auth
- [ ] Security rules set in Firestore
- [ ] `.env` filled with Firebase credentials
- [ ] GHL calendar URL added in Admin > Settings
- [ ] GitHub repo created and pushed
- [ ] Vercel connected to GitHub repo
- [ ] Environment variables added to Vercel project
- [ ] Vercel deployment successful
- [ ] Test login with admin credentials
- [ ] Test public /check page
- [ ] Test /sales view
- [ ] Verify SEO landing pages load
