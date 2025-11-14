# Test Cases - Agent C: Auth & Navigation Module

## Overview
Comprehensive test cases for Authentication, Navigation, Dashboard, and Global Features.

**Test Agent:** Agent C  
**Module:** Auth & Navigation  
**Priority:** Critical  
**Coverage Target:** 90%+

---

## Test Suite 1: Authentication

### TC-AUTH-001: Successful Login
**Priority:** Critical  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/login`
2. Enter credentials: `rm1@primesoft.net` / `password@123`
3. Click "Sign In"
4. Verify successful login

**Expected Result:**
- Login succeeds
- Redirects to dashboard
- Session is established
- User data loads correctly

---

### TC-AUTH-002: Invalid Credentials
**Priority:** Critical  
**Type:** Security

**Test Steps:**
1. Enter invalid credentials
2. Click "Sign In"
3. Verify error message

**Expected Result:**
- Login fails
- Error message displays: "Invalid username or password"
- No redirect occurs
- Session is not established

---

### TC-AUTH-003: Empty Credentials
**Priority:** High  
**Type:** Validation

**Test Steps:**
1. Leave username/password empty
2. Click "Sign In"
3. Verify validation

**Expected Result:**
- Form validation prevents submission
- Required field errors display
- Cannot submit empty form

---

### TC-AUTH-004: Remember Me Functionality
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Check "Remember me"
2. Login successfully
3. Close browser
4. Reopen browser
5. Navigate to app

**Expected Result:**
- Credentials are saved
- Auto-populated on next visit
- Still need to login (security)

---

### TC-AUTH-005: Session Persistence
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Login successfully
2. Refresh page
3. Verify still logged in
4. Navigate to different pages
5. Verify session persists

**Expected Result:**
- Session persists on refresh
- User remains logged in
- No need to re-login

---

### TC-AUTH-006: Logout Functionality
**Priority:** Critical  
**Type:** Functional

**Test Steps:**
1. Login successfully
2. Click logout button
3. Verify logout

**Expected Result:**
- Logout succeeds
- Redirects to login page
- Session is cleared
- Cannot access protected routes

---

### TC-AUTH-007: Protected Route Access
**Priority:** Critical  
**Type:** Security

**Test Steps:**
1. Without logging in, try to access `#/clients`
2. Verify redirect to login
3. Login
4. Try accessing protected route again

**Expected Result:**
- Unauthenticated users redirected to login
- After login, can access protected routes
- Session check works correctly

---

### TC-AUTH-008: Role-Based Redirect
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Login as Question Manager user
2. Verify redirect to QM Portal
3. Login as regular user
4. Verify redirect to dashboard

**Expected Result:**
- QM users redirect to `/qm-portal`
- Regular users redirect to `/`
- Role detection works correctly

---

## Test Suite 2: Hash-Based Routing

### TC-NAV-001: Basic Route Navigation
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/clients`
2. Navigate to `#/prospects`
3. Navigate to `#/calendar`
4. Verify each route loads correctly

**Expected Result:**
- All routes navigate correctly
- Correct components render
- URL hash updates
- No page refresh

---

### TC-NAV-002: Deep Link Navigation
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate directly to `#/clients/1/portfolio`
2. Verify page loads correctly
3. Verify correct client data displays
4. Verify correct tab is active

**Expected Result:**
- Deep links work correctly
- Correct data loads
- Correct view displays
- No errors

---

### TC-NAV-003: Browser Back/Forward
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Navigate through multiple pages
2. Click browser back button
3. Click browser forward button
4. Verify navigation works

**Expected Result:**
- Back button works correctly
- Forward button works correctly
- Correct pages display
- History is maintained

---

### TC-NAV-004: Page Refresh on Route
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/clients/1/portfolio`
2. Refresh page
3. Verify page loads correctly
4. Verify data persists

**Expected Result:**
- Page refreshes correctly
- Route is maintained
- Data loads correctly
- No errors

---

### TC-NAV-005: Invalid Route Handling
**Priority:** Medium  
**Type:** Error Handling

**Test Steps:**
1. Navigate to `#/invalid-route`
2. Verify 404 page displays
3. Verify navigation options available

**Expected Result:**
- 404 page displays
- User-friendly message
- Can navigate back
- No errors in console

---

## Test Suite 3: Sidebar Navigation

### TC-NAV-006: Sidebar Display
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Login and view dashboard
2. Verify sidebar displays on desktop
3. Verify all navigation items visible:
   - Dashboard, Clients, Prospects
   - Calendar, Tasks, Notes
   - Insights, Updates, Products
   - Order Management

**Expected Result:**
- Sidebar displays correctly
- All items visible
- Icons display correctly
- Active item highlighted

---

### TC-NAV-007: Sidebar Navigation
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Click each sidebar item
2. Verify navigation works
3. Verify active state updates
4. Verify correct page loads

**Expected Result:**
- All links work correctly
- Active state updates
- Correct pages load
- Smooth transitions

---

### TC-NAV-008: Active Route Highlighting
**Priority:** Medium  
**Type:** UX

**Test Steps:**
1. Navigate to different pages
2. Verify active route is highlighted
3. Verify highlight updates on navigation

**Expected Result:**
- Active route highlighted correctly
- Highlight updates immediately
- Visual feedback is clear

---

### TC-NAV-009: Sidebar Hidden on QM Portal
**Priority:** Low  
**Type:** Functional

**Test Steps:**
1. Login as QM user
2. Navigate to QM Portal
3. Verify sidebar is hidden
4. Verify profile picture hidden

**Expected Result:**
- Sidebar hidden on QM Portal
- Profile picture hidden
- Layout adjusts correctly

---

## Test Suite 4: Mobile Navigation

### TC-NAV-010: Bottom Navigation Display
**Priority:** High  
**Type:** Responsive

**Test Steps:**
1. Resize browser to mobile (< 768px)
2. Verify bottom navigation appears
3. Verify all buttons visible:
   - Home, Calendar, Tasks
   - Clients, More

**Expected Result:**
- Bottom nav appears on mobile
- All buttons visible
- Icons display correctly
- Active state works

---

### TC-NAV-011: Mobile Navigation Actions
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Click each bottom nav button
2. Verify navigation works
3. Verify active state updates
4. Test "More" button opens menu

**Expected Result:**
- All buttons work correctly
- Navigation succeeds
- Active state updates
- More menu opens

---

### TC-NAV-012: Mobile Menu
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Click "More" button
2. Verify mobile menu opens
3. Click menu items
4. Verify navigation works
5. Verify menu closes

**Expected Result:**
- Menu opens correctly
- All items accessible
- Navigation works
- Menu closes after selection

---

## Test Suite 5: Dashboard

### TC-DASH-001: Dashboard Loading
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Login and navigate to dashboard
2. Wait for dashboard to load
3. Verify all widgets display

**Expected Result:**
- Dashboard loads without errors
- All widgets display
- Data loads correctly
- No console errors

---

### TC-DASH-002: Business Metrics Display
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. View dashboard
2. Verify business metrics display:
   - AUM, Client Count
   - Revenue, Growth
3. Verify metrics are accurate

**Expected Result:**
- Metrics display correctly
- Data is accurate
- Formatting is correct
- Updates in real-time (if applicable)

---

### TC-DASH-003: AUM Trends Chart
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. View AUM trends chart
2. Verify chart renders
3. Verify data is accurate
4. Test chart interactions (hover, zoom)

**Expected Result:**
- Chart renders correctly
- Data is accurate
- Interactions work
- Responsive design

---

### TC-DASH-004: Recent Activities
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. View recent activities section
2. Verify activities display
3. Verify activities are sorted by date
4. Click on activity (if clickable)

**Expected Result:**
- Activities display correctly
- Sorted by date (newest first)
- Details are complete
- Navigation works (if applicable)

---

### TC-DASH-005: Dashboard Responsive Design
**Priority:** Medium  
**Type:** Responsive

**Test Steps:**
1. View dashboard on desktop
2. Resize to tablet
3. Resize to mobile
4. Verify layout adapts

**Expected Result:**
- Layout adapts correctly
- All widgets accessible
- No horizontal scrolling
- Good user experience

---

## Test Suite 6: Settings & Profile

### TC-SETTINGS-001: Settings Page Access
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/settings`
2. Verify settings page loads
3. Verify all settings sections display

**Expected Result:**
- Settings page loads
- All sections visible
- No errors

---

### TC-SETTINGS-002: Update Settings
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Update settings values
2. Save settings
3. Verify changes persist
4. Refresh page
5. Verify settings still updated

**Expected Result:**
- Settings save successfully
- Changes persist
- Success message displays
- Settings load correctly on refresh

---

### TC-PROFILE-001: Profile Page Access
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/profile`
2. Verify profile page loads
3. Verify user information displays

**Expected Result:**
- Profile page loads
- User info displays correctly
- All fields visible

---

### TC-PROFILE-002: Update Profile
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Update profile information
2. Save changes
3. Verify changes persist
4. Verify updated info displays

**Expected Result:**
- Profile updates successfully
- Changes persist
- Updated info displays
- Success message shows

---

## Test Suite 7: Error Handling

### TC-ERROR-001: Network Error Handling
**Priority:** Medium  
**Type:** Error Handling

**Test Steps:**
1. Disconnect network
2. Try to navigate
3. Try to perform actions
4. Verify error handling

**Expected Result:**
- Error messages display
- User-friendly messages
- Can retry actions
- No crashes

---

### TC-ERROR-002: API Error Handling
**Priority:** Medium  
**Type:** Error Handling

**Test Steps:**
1. Simulate API errors (500, 404)
2. Verify error messages
3. Verify error recovery

**Expected Result:**
- Error messages display
- User can retry
- App doesn't crash
- Graceful degradation

---

## Test Execution Summary

**Date:** _______________  
**Tester:** Agent C  
**Environment:** Local / Staging

**Summary:**
- Total Test Cases: 25
- Passed: ___
- Failed: ___
- Blocked: ___
- Not Tested: ___

**Critical Issues:**
1. 
2. 
3. 

