# Middleware Integration Testing Guide

This document provides manual testing steps to verify the authentication middleware is working correctly.

## Requirements Validated

- **Requirement 11.4**: The Middleware SHALL protect all routes matching `/admin/*` by verifying the NextAuth session token — unauthenticated requests SHALL be redirected to `/api/auth/signin`.

## Prerequisites

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Ensure the database is running and seeded with an admin user:
   ```bash
   docker compose up -d db
   ```

## Test Cases

### Test 1: Unauthenticated Access to Admin Routes

**Objective**: Verify that unauthenticated users cannot access admin routes and are redirected to sign-in.

**Steps**:
1. Open a new incognito/private browser window
2. Navigate to `http://localhost:3000/admin`
3. **Expected Result**: Browser should redirect to `/api/auth/signin`

**Alternative CLI Test**:
```bash
curl -I http://localhost:3000/admin
```
**Expected**: HTTP 307 redirect to `/api/auth/signin`

---

### Test 2: Unauthenticated Access to Admin Sub-Routes

**Objective**: Verify that all admin sub-routes are protected.

**Steps**:
1. In an incognito window (not signed in)
2. Try to navigate to:
   - `http://localhost:3000/admin/menu`
   - `http://localhost:3000/admin/gallery`
3. **Expected Result**: All should redirect to `/api/auth/signin`

---

### Test 3: Authenticated Access to Admin Routes

**Objective**: Verify that authenticated users can access admin routes.

**Steps**:
1. Navigate to `http://localhost:3000/api/auth/signin`
2. Sign in with valid admin credentials:
   - Email: `admin@coffeeshop.com` (or the email from your seed data)
   - Password: `admin123` (or the password from your seed data)
3. After successful sign-in, you should be redirected to `/admin`
4. **Expected Result**: Admin dashboard should load successfully
5. Try navigating to `/admin/menu` and `/admin/gallery`
6. **Expected Result**: All admin routes should be accessible

---

### Test 4: Session Persistence

**Objective**: Verify that the session persists across page reloads.

**Steps**:
1. Sign in to the admin dashboard (as in Test 3)
2. Navigate to `/admin/menu`
3. Refresh the page (F5 or Ctrl+R)
4. **Expected Result**: Page should reload without redirecting to sign-in
5. Close the browser tab and open a new tab
6. Navigate to `http://localhost:3000/admin`
7. **Expected Result**: Should still be authenticated (session cookie persists)

---

### Test 5: Sign Out Functionality

**Objective**: Verify that signing out invalidates the session.

**Steps**:
1. While signed in to the admin dashboard
2. Click the sign-out button (or navigate to `/api/auth/signout`)
3. Confirm sign-out
4. **Expected Result**: Should be redirected to the landing page (`/`)
5. Try to navigate to `/admin` again
6. **Expected Result**: Should be redirected to `/api/auth/signin`

---

### Test 6: Public Routes Remain Accessible

**Objective**: Verify that public routes are not affected by the middleware.

**Steps**:
1. In an incognito window (not signed in)
2. Navigate to:
   - `http://localhost:3000/` (landing page)
   - `http://localhost:3000/api/menu` (public API)
   - `http://localhost:3000/api/gallery` (public API)
3. **Expected Result**: All public routes should be accessible without authentication

---

### Test 7: Invalid Session Token

**Objective**: Verify that invalid or expired tokens are rejected.

**Steps**:
1. Sign in to the admin dashboard
2. Open browser DevTools → Application → Cookies
3. Find the `next-auth.session-token` cookie
4. Modify the cookie value to an invalid string
5. Try to navigate to `/admin/menu`
6. **Expected Result**: Should be redirected to `/api/auth/signin`

---

## Automated Testing

The unit tests in `src/middleware.test.ts` verify the middleware logic:

```bash
npm test -- src/middleware.test.ts --run
```

**Expected Output**: All tests should pass (6/6)

---

## Troubleshooting

### Issue: Middleware not triggering

**Solution**: 
- Verify `src/middleware.ts` exists in the correct location
- Check that the `config.matcher` is set to `['/admin/:path*']`
- Restart the Next.js dev server

### Issue: Redirect loop

**Solution**:
- Check that `/api/auth/signin` is not included in the middleware matcher
- Verify NextAuth configuration in `src/lib/auth.ts`
- Clear browser cookies and try again

### Issue: Session not persisting

**Solution**:
- Verify `NEXTAUTH_SECRET` is set in `.env`
- Check that cookies are enabled in the browser
- Verify the session strategy is set to 'jwt' in auth config

---

## Success Criteria

✅ Unauthenticated users cannot access `/admin/*` routes  
✅ Unauthenticated users are redirected to `/api/auth/signin`  
✅ Authenticated users can access all `/admin/*` routes  
✅ Session persists across page reloads  
✅ Sign-out invalidates the session  
✅ Public routes remain accessible without authentication  
✅ All unit tests pass  

---

## Related Files

- `src/middleware.ts` - Middleware implementation
- `src/middleware.test.ts` - Unit tests
- `src/lib/auth.ts` - NextAuth configuration
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API handler
