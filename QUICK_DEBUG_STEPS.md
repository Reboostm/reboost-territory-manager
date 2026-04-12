# Quick Debug Steps for 400 Errors

## Fast Diagnostic (5 minutes)

### Step 1: Test the APIs Directly
After redeployment to Vercel:
1. Visit: `https://obituary-management-system.vercel.app/test-api`
2. Click "Run Tests"
3. Screenshot the results

**What to look for:**
- ✅ `/api/obituaries` - should show HTTP 200 + list of obituaries
- ❌ `/api/obituary/test-id-12345` - expected to fail (404) since ID doesn't exist
- ❌ `/api/memories/test-id-12345` - expected to fail (404) since ID doesn't exist

### Step 2: Verify an Obituary is Published
In your dashboard:
1. Make sure you have at least ONE obituary
2. Click on it to view details
3. The status should show as "published"
4. Copy the ID from the URL (e.g., the part after `/dashboard/obituary/`)

### Step 3: Manually Test That Specific Obituary
In your browser address bar, visit:
```
https://obituary-management-system.vercel.app/api/obituary/{OBITUARY_ID}
```

Replace `{OBITUARY_ID}` with the actual ID from your obituary.

**Expected response:**
```json
{
  "id": "...",
  "fullName": "John Smith",
  "birthDate": "...",
  "deathDate": "...",
  "status": "published",
  ...
}
```

**If you see an error:**
- `404` - The obituary doesn't exist in the database
- `403` - The obituary exists but status is NOT "published"
- `400` - Something is wrong with the request (ID is malformed)
- `500` - Database error

### Step 4: Copy Fresh Embed Code
Once you confirm the API returns data:
1. Go to your dashboard
2. Click on the obituary
3. Scroll down to "Embed Codes"
4. Copy the "Full Page Code" (the most complete version)

### Step 5: Test in GHL
Paste the code into GHL and load the page:

**Open DevTools (F12):**
- Click "Console" tab
- Look for any error messages
- The errors should now be DESCRIPTIVE (e.g., "Obituary fetch failed: HTTP 400 from https://...")

**Check Network tab:**
- Click "Network" tab
- Reload the page
- Look for requests to `obituary-management-system.vercel.app`
- Click on each one to see the response
- HTTP 200 = success, HTTP 400/403/404/500 = failure with reason

## Common Error Codes & Fixes

### HTTP 404 - Not Found
**Cause:** The obituary ID doesn't exist or isn't in the database
**Fix:** 
- Verify the ID in the embed code matches an actual obituary
- Check the obituary URL in your dashboard

### HTTP 403 - Forbidden
**Cause:** The obituary exists but status is NOT "published"
**Fix:**
- Go to dashboard
- Click the obituary
- Look for a "Status" or "Publish" button
- Make sure it's set to "published"
- Save/update the obituary
- Copy the embed code again

### HTTP 400 - Bad Request
**Cause:** The API received a malformed request
**Fix:**
- The ID in the URL might be empty or malformed
- Check that the embed code has the correct ID substituted
- Try testing with a fresh obituary

### HTTP 500 - Server Error
**Cause:** Database error or server crash
**Fix:**
- Check Vercel logs for errors
- Verify Firebase credentials are correct
- Try redeploying

### "Illegal return statement" in console
**Cause:** JavaScript syntax error in the embed code
**Fix:** (Should be fixed by latest changes)
- The notifySnippet escaping has been fixed
- Redeploy to get the latest code
- Clear your browser cache (Ctrl+Shift+Delete)

## Real-World Test Scenario

1. **Create fresh obituary:** "Jane Doe" (1950-2024)
2. **Dashboard preview:** Verify it shows in the dashboard
3. **Get the ID:** Note the obituary ID from the URL
4. **Manual API test:** Visit `/api/obituary/{ID}` - should return JSON
5. **Copy code:** Get fresh embed code from dashboard
6. **GHL test:** Paste into GHL, check console and network tab
7. **Memory test:** Try submitting a memory - should return HTTP 201

## Need More Help?

When reporting issues, include:
1. **Screenshot of test-api page** showing all endpoint responses
2. **Obituary ID** that's failing
3. **Browser console errors** (screenshot)
4. **Network tab** showing failed requests (what HTTP status?)
5. **The embed code** you're trying to use (or at least the URL it's requesting)

This will help identify exactly where the issue is.
