# Fixes Applied to Resolve Embed Code Issues

## Problem Summary
- Embed codes showing "Loading..." or "Unable to load obituary" errors
- "Illegal return statement" syntax error in browser console  
- "Failed to load resource: the server responded with a status of 400" in Network tab
- Affects both homepage widget and full page codes

## Root Causes Identified
1. **Quote Escaping Bug**: The `notifySnippet` was using manual quote replacement which could break when obituary names contained special characters
2. **Missing Error Handling**: Fetch calls weren't checking HTTP status codes before calling `.json()`
3. **Vague Error Messages**: When API calls failed, the error messages didn't indicate which endpoint failed or why
4. **No Response Validation**: The code didn't validate that API responses contained the expected data structure

## Changes Made

### 1. Fixed EmbedCodes.js - NotifySnippet Construction (Line 92-94)
**Before:**
```javascript
const notifySnippet = notifyUrl
  ? "try{fetch('" + notifyUrl + "',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({obituaryName:'" + fullName.replace(/'/g, "\\'") + "',submitterName:name,relationship:rel,memoryText:text})});}catch(_){}"
  : '';
```

**After:**
```javascript
const notifySnippet = notifyUrl
  ? "try{fetch('" + notifyUrl + "',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({obituaryName:" + JSON.stringify(fullName) + ",submitterName:name,relationship:rel,memoryText:text})}catch(e){}"
  : '';
```

**Fix:** Uses `JSON.stringify()` to safely handle names with quotes, apostrophes, and special characters. Avoids syntax errors from improper escaping.

### 2. Enhanced Error Handling in All Fetch Calls

**Homepage Widget (homePageCode):**
- Added `if(!res.ok)throw new Error('HTTP '+res.status)` check
- Added array validation: `!Array.isArray(obituaries)`
- Better error message when list is empty

**Listing Page (listingPageCode):**
- Added `if(!res.ok)throw new Error('HTTP '+res.status)` check
- Added response validation: `if(!o||!o.id)throw new Error('Invalid obituary')`

**Full Page (fullPageCode):**
- Added detailed error messages showing which API failed: `'Obituary fetch failed: HTTP '+r.status+' from '+apiBase+'/api/obituary/${id}'`
- Added fallback for memories endpoint: `.catch(function(){return [];})` - memories are optional
- Added response validation: `if(!o||!o.id)throw new Error('Invalid obituary data')`

### 3. Created New Test API Page
**File:** `pages/test-api.js`

A new diagnostic page accessible at `/test-api` that lets you:
- Test each API endpoint independently
- See the HTTP status code and response for each
- Identify exactly which API is failing
- Verify correct data is being returned

## Next Steps

### 1. Push Changes to GitHub
```bash
git add -A
git commit -m "Fix embed code errors: safer string escaping, better error handling"
git push
```

### 2. Redeploy to Vercel
Vercel should auto-deploy on push, but you can:
- Go to https://vercel.com and redeploy your project manually
- Or wait for auto-deployment (usually within 1-2 minutes)

### 3. Test the API Endpoints
Once deployed:
1. Visit: `https://obituary-management-system.vercel.app/test-api`
2. Click "Run Tests"
3. Check that all endpoints return HTTP 200
4. If any show errors, take a screenshot of the results

### 4. Test with Fresh Obituary
1. Create a NEW obituary in the dashboard
2. Copy the NEW embed codes (from dashboard)
3. Note the obituary ID from the URL or dashboard
4. Paste code into GHL page
5. Check browser console for any errors - they should now be MORE DESCRIPTIVE

### 5. Debug If 400 Error Persists
If you still see "Failed to load resource: the server responded with a status of 400":

The new error messages will tell you exactly which endpoint is failing. For example:
- "Obituary fetch failed: HTTP 400 from https://obituary-management-system.vercel.app/api/obituary/abc123"

This tells us the `/api/obituary/[id]` endpoint is the problem.

**Possible causes:**
- Database query issue (check Firestore)
- Firestore security rules blocking the request
- Missing/invalid obituary in database
- The obituary status is not set to "published"

## Testing Checklist

After deploying:
- [ ] Visit `/test-api` page - do all endpoints return HTTP 200?
- [ ] Create fresh obituary in dashboard
- [ ] Copy and test homepage widget - does it show obituaries?
- [ ] Copy and test listing page code - does it show the single obituary?
- [ ] Copy and test full page code - does it load completely?
- [ ] Try submitting a memory - does it work?
- [ ] Check browser console - are error messages now more descriptive?

## If Issues Persist

1. Check the test API page output - what status codes are being returned?
2. Check your Firestore database:
   - Does the obituary exist?
   - Is `status` field set to `"published"`?
   - Does it have required fields like `fullName`, `birthDate`, `deathDate`?
3. Check Vercel build logs for any deployment errors
4. Share the test API page results so we can see exactly which API is failing
