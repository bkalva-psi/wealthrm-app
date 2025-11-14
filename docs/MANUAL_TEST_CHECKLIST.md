# Manual Testing Checklist

## Pre-Testing Setup

- [ ] Application is running locally (`npm run dev`)
- [ ] Database is connected and accessible
- [ ] Test credentials are available: `rm1@primesoft.net` / `password@123`
- [ ] Browser console is open to check for errors

---

## 1. Authentication & Login

### Login Flow
- [ ] Navigate to login page (`#/login`)
- [ ] Verify login form displays correctly
- [ ] Enter credentials: `rm1@primesoft.net` / `password@123`
- [ ] Click "Sign In"
- [ ] Verify successful login redirects to dashboard
- [ ] Verify user session persists on page refresh
- [ ] Test "Remember me" functionality

### Logout Flow
- [ ] Click user profile/logout button
- [ ] Verify logout redirects to login page
- [ ] Verify session is cleared

### Error Handling
- [ ] Test login with invalid credentials
- [ ] Verify error message displays
- [ ] Test login with empty fields
- [ ] Verify validation messages

---

## 2. Navigation & Routing

### Desktop Sidebar Navigation
- [ ] Verify all sidebar links are visible:
  - [ ] Dashboard
  - [ ] Clients
  - [ ] Prospects
  - [ ] Calendar
  - [ ] Tasks
  - [ ] Notes (Communications)
  - [ ] Insights (Talking Points)
  - [ ] Updates (Announcements)
  - [ ] Products
  - [ ] Order Management
- [ ] Click each link and verify correct page loads
- [ ] Verify active link is highlighted
- [ ] Test navigation between pages

### Mobile Navigation
- [ ] Resize browser to mobile view (< 768px)
- [ ] Verify bottom navigation appears
- [ ] Test all bottom nav buttons:
  - [ ] Home
  - [ ] Calendar
  - [ ] Tasks
  - [ ] Clients
  - [ ] More (Menu)
- [ ] Click "More" and verify sidebar opens
- [ ] Test navigation from mobile menu

### Hash Routing
- [ ] Test direct URL navigation: `#/clients`
- [ ] Test deep links: `#/clients/1/portfolio`
- [ ] Verify browser back/forward buttons work
- [ ] Test page refresh on different routes

---

## 3. Dashboard

- [ ] Verify dashboard loads without errors
- [ ] Check all dashboard widgets display:
  - [ ] Business metrics
  - [ ] AUM trends
  - [ ] Client statistics
  - [ ] Recent activities
- [ ] Verify data is populated (not empty)
- [ ] Test responsive layout (mobile/tablet/desktop)
- [ ] Check for console errors

---

## 4. Clients Module

### Client List Page
- [ ] Navigate to `#/clients`
- [ ] Verify client list displays
- [ ] Test search functionality
- [ ] Test filtering options
- [ ] Click on a client row
- [ ] Verify navigation to client detail page

### Client Detail Pages
For each client detail tab, verify:
- [ ] **Personal Tab** (`#/clients/{id}/personal`)
  - [ ] Personal information displays
  - [ ] Family information
  - [ ] Contact details
  - [ ] All sections are accessible
  
- [ ] **Portfolio Tab** (`#/clients/{id}/portfolio`)
  - [ ] Portfolio holdings display
  - [ ] Asset allocation chart
  - [ ] Performance metrics
  - [ ] Portfolio report download works
  
- [ ] **Interactions Tab** (`#/clients/{id}/interactions`)
  - [ ] Interaction history displays
  - [ ] Can add new interaction
  - [ ] Can filter interactions
  
- [ ] **Transactions Tab** (`#/clients/{id}/transactions`)
  - [ ] Transaction list displays
  - [ ] Transaction details are correct
  - [ ] Filters work correctly
  
- [ ] **Communications Tab** (`#/clients/{id}/communications`)
  - [ ] Communication history displays
  - [ ] Can send new communication
  - [ ] Attachments work
  
- [ ] **Appointments Tab** (`#/clients/{id}/appointments`)
  - [ ] Appointment list displays
  - [ ] Can create new appointment
  - [ ] Calendar integration works
  
- [ ] **Tasks Tab** (`#/clients/{id}/tasks`)
  - [ ] Task list displays
  - [ ] Can create/update tasks
  - [ ] Task status updates work
  
- [ ] **Insights Tab** (`#/clients/{id}/insights`)
  - [ ] Insights display correctly
  - [ ] Charts render properly
  - [ ] Data is accurate

### Add Client Flow
- [ ] Navigate to `#/clients/add`
- [ ] Fill out client form
- [ ] Submit form
- [ ] Verify client is created
- [ ] Verify redirect to client detail page

---

## 5. Prospects Module

- [ ] Navigate to `#/prospects`
- [ ] Verify prospect list displays
- [ ] Test search and filters
- [ ] Click on prospect to view details
- [ ] Test "Add Prospect" flow (`#/prospects/new`)
- [ ] Verify prospect can be converted to client

---

## 6. Calendar Module

- [ ] Navigate to `#/calendar`
- [ ] Verify calendar view displays
- [ ] Test month/week/day views (if available)
- [ ] Create new appointment
- [ ] Edit existing appointment
- [ ] Delete appointment
- [ ] Verify appointments sync with client records

---

## 7. Tasks Module

- [ ] Navigate to `#/tasks`
- [ ] Verify task list displays
- [ ] Test task filters (status, priority, due date)
- [ ] Create new task
- [ ] Update task status
- [ ] Mark task as complete
- [ ] Delete task
- [ ] Verify task notifications

---

## 8. Communications Module

- [ ] Navigate to `#/communications`
- [ ] Verify communication list displays
- [ ] Test filters and search
- [ ] Send new communication
- [ ] Test attachments
- [ ] Verify communication templates work
- [ ] Test communication preferences

---

## 9. Products Module

- [ ] Navigate to `#/products`
- [ ] Verify product list displays
- [ ] Test product search
- [ ] View product details
- [ ] Test product filters (category, RTA, etc.)
- [ ] Verify product information is accurate

---

## 10. Order Management Module ⭐ (Priority)

### Products Tab
- [ ] Navigate to `#/order-management`
- [ ] Verify Products tab is active by default
- [ ] Verify product list loads without errors
- [ ] Test product search
- [ ] Test category filter
- [ ] Test RTA filter
- [ ] Click "Add to Cart" on a product
- [ ] Verify product is added to cart
- [ ] Click "Scheme Info" icon
- [ ] Verify scheme info overlay opens
- [ ] Click "Documents" icon
- [ ] Verify documents overlay opens
- [ ] Verify documents list displays (or empty state)

### Cart Tab
- [ ] Switch to Cart tab
- [ ] Verify cart items display
- [ ] Test "Remove" button
- [ ] Test "Edit" button (opens Order Info overlay)
- [ ] Update cart item amount/units
- [ ] Verify cart summary updates
- [ ] Test cart with multiple items
- [ ] Test empty cart state

### Review & Submit Tab
- [ ] Switch to Review & Submit tab
- [ ] Verify Transaction Mode section displays
- [ ] Select transaction mode (e.g., "Online")
- [ ] Fill transaction mode details
- [ ] Verify Nominee Information section
- [ ] Add nominee(s)
- [ ] Test nominee percentage validation (must sum to 100%)
- [ ] Test "Opt out of nomination" checkbox
- [ ] Verify validation errors display correctly
- [ ] Click "Submit Order"
- [ ] Verify order submission
- [ ] Verify success message
- [ ] Verify redirect to Order Book tab

### Order Book Tab
- [ ] Switch to Order Book tab
- [ ] Verify order list loads
- [ ] Test order search
- [ ] Test status filter
- [ ] Test date range filter
- [ ] Click "View Details" on an order
- [ ] Verify order details dialog opens
- [ ] Verify all order information displays
- [ ] Test "Authorize" button (for pending orders)
- [ ] Test "Download" button
- [ ] Test "Export" filtered orders

### Full Switch/Redemption Flow
- [ ] Create order with Full Switch transaction
- [ ] Verify Full Switch panel displays (read-only)
- [ ] Verify "Close AC = Y" flag displays
- [ ] Create order with Full Redemption transaction
- [ ] Verify Full Redemption panel displays (read-only)
- [ ] Verify all fields are read-only

### Validation Testing
- [ ] Test minimum investment validation
- [ ] Test maximum investment validation
- [ ] Test EUIN validation (if required)
- [ ] Test PAN validation for nominees
- [ ] Test nominee percentage validation
- [ ] Test amount-based limits (≤ market value)
- [ ] Test CRISIL min/max rules
- [ ] Verify validation error messages are clear

### Error Handling
- [ ] Test order submission with network error
- [ ] Verify error message displays
- [ ] Test with invalid product data
- [ ] Test with missing required fields
- [ ] Verify error recovery

---

## 11. Knowledge Profiling

- [ ] Navigate to `#/knowledge-profiling`
- [ ] Verify assessment loads
- [ ] Answer all questions
- [ ] Submit assessment
- [ ] Verify score calculation
- [ ] Verify results display
- [ ] Test with different client IDs

---

## 12. Risk Profiling

- [ ] Navigate to `#/risk-profiling`
- [ ] Verify assessment loads
- [ ] Answer all questions
- [ ] Submit assessment
- [ ] Verify risk category calculation
- [ ] Verify ceiling logic works
- [ ] Verify results display correctly
- [ ] Test with different client IDs

---

## 13. Analytics Module

- [ ] Navigate to `#/analytics`
- [ ] Verify analytics dashboard loads
- [ ] Check all charts render
- [ ] Test date range filters
- [ ] Verify data accuracy
- [ ] Test export functionality

---

## 14. Settings & Profile

### Settings Page
- [ ] Navigate to `#/settings`
- [ ] Verify settings page loads
- [ ] Test all settings sections
- [ ] Save settings changes
- [ ] Verify changes persist

### Profile Page
- [ ] Navigate to `#/profile`
- [ ] Verify profile information displays
- [ ] Update profile information
- [ ] Verify changes save correctly

---

## 15. QM Portal

- [ ] Login as Question Manager user
- [ ] Verify redirect to `#/qm-portal`
- [ ] Verify sidebar is hidden
- [ ] Test question management features
- [ ] Verify portal-specific functionality

---

## 16. Cross-Module Integration

### Client to Order Management
- [ ] From client detail page, navigate to order management
- [ ] Verify client context is maintained (if applicable)
- [ ] Create order for that client
- [ ] Verify order appears in client's transaction history

### Order to Client
- [ ] From order book, view order details
- [ ] Verify client link works (if available)
- [ ] Navigate to client from order
- [ ] Verify correct client page loads

---

## 17. Responsive Design Testing

### Desktop (> 1024px)
- [ ] Verify all pages display correctly
- [ ] Verify sidebar is visible
- [ ] Test all interactions

### Tablet (768px - 1024px)
- [ ] Verify layout adapts
- [ ] Test navigation
- [ ] Verify touch interactions

### Mobile (< 768px)
- [ ] Verify bottom navigation appears
- [ ] Test mobile menu
- [ ] Verify all forms are usable
- [ ] Test touch interactions
- [ ] Verify text is readable

---

## 18. Error Handling & Edge Cases

- [ ] Test with slow network (throttle in DevTools)
- [ ] Test with offline mode
- [ ] Test with invalid data
- [ ] Test with empty states
- [ ] Test with very long data
- [ ] Test with special characters
- [ ] Test browser back/forward
- [ ] Test page refresh on different routes

---

## 19. Performance Testing

- [ ] Check page load times (< 3 seconds)
- [ ] Verify no memory leaks (check DevTools)
- [ ] Test with large datasets (100+ clients, 100+ orders)
- [ ] Verify smooth scrolling
- [ ] Check for unnecessary re-renders

---

## 20. Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## 21. Accessibility Testing

- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Verify ARIA labels are present
- [ ] Test focus management
- [ ] Verify color contrast
- [ ] Test with zoom (200%)

---

## Test Results Summary

### Date: _______________
### Tester: _______________
### Environment: Local / Staging / Production

### Summary:
- Total Test Cases: ___
- Passed: ___
- Failed: ___
- Blocked: ___
- Not Tested: ___

### Critical Issues Found:
1. 
2. 
3. 

### Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

