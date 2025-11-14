# Manual Testing Steps - Quick Guide

## Prerequisites

1. **Start the Application**
   - Open terminal in `wealthrm-app` directory
   - Run: `npm run dev`
   - Wait for server to start (usually on `http://localhost:5173`)

2. **Open Browser**
   - Open Chrome/Firefox/Edge
   - Open Developer Tools (F12) → Console tab (to see errors)
   - Navigate to: `http://localhost:5173`

3. **Test Credentials**
   - Email: `rm1@primesoft.net`
   - Password: `password@123`

---

## Step-by-Step Testing Guide

### STEP 1: Login & Authentication

1. **Login Test**
   - Navigate to: `http://localhost:5173/#/login`
   - Enter email: `rm1@primesoft.net`
   - Enter password: `password@123`
   - Click "Sign In"
   - ✅ **Expected**: Redirects to dashboard (`#/dashboard`)

2. **Session Persistence**
   - Refresh the page (F5)
   - ✅ **Expected**: Still logged in, no redirect to login

3. **Logout Test**
   - Click on user profile/logout button (top right)
   - ✅ **Expected**: Redirects to login page

---

### STEP 2: Navigation Testing

1. **Sidebar Navigation**
   - After login, verify sidebar shows these links:
     - Dashboard
     - Clients
     - Prospects
     - Calendar
     - Tasks
     - Notes (Communications)
     - Insights (Talking Points)
     - Updates (Announcements)
     - Products
     - Order Management

2. **Test Each Navigation Link**
   - Click "Dashboard" → Should show dashboard
   - Click "Clients" → Should show client list (`#/clients`)
   - Click "Prospects" → Should show prospects list (`#/prospects`)
   - Click "Calendar" → Should show calendar (`#/calendar`)
   - Click "Products" → Should show products (`#/products`)
   - Click "Order Management" → Should show order management (`#/order-management`)

3. **Active Link Highlighting**
   - Click on any navigation item
   - ✅ **Expected**: That link should be highlighted/active

---

### STEP 3: Dashboard Testing

1. **Dashboard Load**
   - Navigate to: `#/dashboard` (or click Dashboard in sidebar)
   - ✅ **Expected**: Dashboard loads without errors
   - Check browser console for any red errors

2. **Dashboard Widgets**
   - Verify these sections display:
     - Business metrics (AUM, clients, etc.)
     - Charts/graphs
     - Recent activities
   - ✅ **Expected**: All widgets show data (not empty/loading forever)

---

### STEP 4: Clients Module Testing

1. **Client List**
   - Navigate to: `#/clients`
   - ✅ **Expected**: List of clients displays
   - Check if search bar is visible

2. **Search Functionality**
   - Type a client name in search box
   - ✅ **Expected**: List filters as you type

3. **Client Detail Page**
   - Click on any client row
   - ✅ **Expected**: Navigates to client detail page (`#/clients/{id}/personal`)

4. **Client Detail Tabs**
   - On client detail page, verify tabs are visible:
     - Personal
     - Portfolio
     - Interactions
     - Transactions
     - Communications
     - Appointments
     - Tasks
     - Insights

5. **Test Each Tab**
   - Click "Personal" tab → Should show personal info
   - Click "Portfolio" tab → Should show portfolio (`#/clients/{id}/portfolio`)
   - Click "Transactions" tab → Should show transactions
   - Click "Communications" tab → Should show communications

6. **Add New Client**
   - Navigate to: `#/clients/add`
   - Fill out the form with test data
   - Click Submit
   - ✅ **Expected**: Client created, redirects to client detail page

---

### STEP 5: Prospects Module Testing

1. **Prospect List**
   - Navigate to: `#/prospects`
   - ✅ **Expected**: List of prospects displays

2. **Search & Filter**
   - Test search functionality
   - Test any filter options available

3. **Add Prospect**
   - Click "Add Prospect" or navigate to: `#/prospects/new`
   - Fill out prospect form
   - Submit
   - ✅ **Expected**: Prospect created

4. **Convert to Client**
   - Open a prospect detail
   - Look for "Convert to Client" button
   - Click it
   - ✅ **Expected**: Prospect converted to client

---

### STEP 6: Order Management Testing (Priority)

1. **Navigate to Order Management**
   - Click "Order Management" in sidebar
   - Or navigate to: `#/order-management`
   - ✅ **Expected**: Order Management page loads with tabs

2. **Products Tab (Default)**
   - Verify "Products" tab is active
   - ✅ **Expected**: Product list displays
   - Test product search
   - Test category filter
   - Test RTA filter
   - Click "Add to Cart" on a product
   - ✅ **Expected**: Product added to cart (cart count increases)

3. **Cart Tab**
   - Click "Cart" tab
   - ✅ **Expected**: Cart items display
   - Test "Remove" button
   - Test "Edit" button (should open Order Info overlay)
   - Update quantity/amount
   - ✅ **Expected**: Cart summary updates

4. **Review & Submit Tab**
   - Click "Review & Submit" tab
   - ✅ **Expected**: Review form displays
   - Fill in Transaction Mode (e.g., "Online")
   - Add Nominee Information (if applicable)
   - Verify nominee percentage sums to 100%
   - Click "Submit Order"
   - ✅ **Expected**: Order submitted, success message, redirects to Order Book

5. **Order Book Tab**
   - Click "Order Book" tab
   - ✅ **Expected**: List of orders displays
   - Test search
   - Test status filter
   - Test date range filter
   - Click "View Details" on an order
   - ✅ **Expected**: Order details dialog opens
   - Test "Download" button
   - Test "Export" button

---

### STEP 7: Knowledge Profiling Testing

1. **Navigate to Knowledge Profiling**
   - Navigate to: `#/knowledge-profiling`
   - Or from client detail page, look for Knowledge Profiling link
   - ✅ **Expected**: Assessment page loads

2. **With Client ID (from client page)**
   - Navigate to: `#/knowledge-profiling?clientId=1` (replace 1 with actual client ID)
   - ✅ **Expected**: Assessment loads for that client

3. **Answer Questions**
   - Read first question
   - Select an answer option
   - Click "Next" or navigate to next question
   - Repeat for all questions
   - ✅ **Expected**: Progress indicator updates

4. **Submit Assessment**
   - After answering all questions, click "Submit"
   - ✅ **Expected**: Score calculated and results displayed

5. **Results Display**
   - Verify score is shown
   - Verify results breakdown displays
   - Check if results are saved

6. **Test with Different Client**
   - Navigate to: `#/knowledge-profiling?clientId=2`
   - ✅ **Expected**: Assessment loads for different client

---

### STEP 8: Risk Profiling Testing

1. **Navigate to Risk Profiling**
   - Navigate to: `#/risk-profiling`
   - Or from client detail page, look for Risk Profiling link
   - ✅ **Expected**: Risk assessment page loads

2. **With Client ID**
   - Navigate to: `#/risk-profiling?clientId=1`
   - ✅ **Expected**: Assessment loads for that client

3. **Answer Questions**
   - Answer all risk profiling questions
   - Navigate through questions
   - ✅ **Expected**: Progress updates

4. **Submit Assessment**
   - Click "Submit"
   - ✅ **Expected**: Risk category calculated (Conservative, Moderate, Aggressive, etc.)

5. **Verify Ceiling Logic**
   - Check if ceiling rules are applied correctly
   - Verify risk category matches expected logic

6. **Results Display**
   - Verify risk category displays
   - Verify score displays
   - Check if results are saved

---

### STEP 9: Products Module Testing

1. **Navigate to Products**
   - Click "Products" in sidebar
   - Or navigate to: `#/products`
   - ✅ **Expected**: Product list displays

2. **Product Search**
   - Type product name in search box
   - ✅ **Expected**: Products filter as you type

3. **Product Filters**
   - Test category filter
   - Test RTA filter
   - Test other available filters

4. **Product Details**
   - Click on a product
   - ✅ **Expected**: Product details display (or overlay opens)

---

### STEP 10: Calendar Module Testing

1. **Navigate to Calendar**
   - Click "Calendar" in sidebar
   - Or navigate to: `#/calendar`
   - ✅ **Expected**: Calendar view displays

2. **View Appointments**
   - Verify appointments are visible on calendar
   - Click on an appointment
   - ✅ **Expected**: Appointment details display

3. **Create Appointment**
   - Click "New Appointment" or similar button
   - Fill out appointment form
   - Submit
   - ✅ **Expected**: Appointment created and appears on calendar

4. **Edit Appointment**
   - Click on existing appointment
   - Click "Edit"
   - Modify details
   - Save
   - ✅ **Expected**: Appointment updated

---

### STEP 11: Tasks Module Testing

1. **Navigate to Tasks**
   - Click "Tasks" in sidebar
   - Or navigate to: `#/tasks`
   - ✅ **Expected**: Task list displays

2. **Filter Tasks**
   - Test status filter (Pending, Completed, etc.)
   - Test priority filter
   - Test date filter

3. **Create Task**
   - Click "New Task" or "+" button
   - Fill out task form
   - Submit
   - ✅ **Expected**: Task created and appears in list

4. **Update Task**
   - Click on a task
   - Change status (e.g., mark as complete)
   - Save
   - ✅ **Expected**: Task status updates

---

### STEP 12: Communications Module Testing

1. **Navigate to Communications**
   - Click "Notes" or "Communications" in sidebar
   - Or navigate to: `#/communications`
   - ✅ **Expected**: Communication list displays

2. **View Communications**
   - Verify communication history shows
   - Click on a communication
   - ✅ **Expected**: Details display

3. **Send Communication**
   - Click "New Communication" or "+" button
   - Fill out form
   - Add attachment (if available)
   - Submit
   - ✅ **Expected**: Communication sent and appears in list

---

### STEP 13: Mobile/Responsive Testing

1. **Resize Browser**
   - Open browser DevTools (F12)
   - Click device toggle (or press Ctrl+Shift+M)
   - Select mobile view (e.g., iPhone 12)

2. **Mobile Navigation**
   - ✅ **Expected**: Bottom navigation appears (instead of sidebar)
   - Test bottom nav buttons:
     - Home
     - Calendar
     - Tasks
     - Clients
     - More (Menu)

3. **Mobile Menu**
   - Click "More" button
   - ✅ **Expected**: Sidebar menu opens
   - Test navigation from mobile menu

4. **Mobile Forms**
   - Test forms on mobile view
   - ✅ **Expected**: Forms are usable, buttons are tappable

---

### STEP 14: Error Handling Testing

1. **Invalid Login**
   - Logout (if logged in)
   - Try login with wrong password
   - ✅ **Expected**: Error message displays

2. **Network Error Simulation**
   - Open DevTools → Network tab
   - Select "Offline" from throttling dropdown
   - Try to navigate or submit a form
   - ✅ **Expected**: Error message displays, app doesn't crash

3. **Empty States**
   - Navigate to sections with no data
   - ✅ **Expected**: Empty state message displays (not blank page)

4. **Browser Navigation**
   - Use browser back button
   - Use browser forward button
   - ✅ **Expected**: Navigation works correctly

---

### STEP 15: Cross-Module Integration

1. **Client to Order Management**
   - Go to a client detail page
   - Look for "Create Order" or similar link
   - Click it
   - ✅ **Expected**: Navigates to Order Management with client context

2. **Order to Client**
   - Go to Order Book
   - Click "View Details" on an order
   - Look for client link
   - Click it
   - ✅ **Expected**: Navigates to that client's detail page

---

## Quick Test Checklist

Use this quick checklist for rapid testing:

- [ ] Login works
- [ ] Dashboard loads
- [ ] All sidebar links work
- [ ] Client list displays
- [ ] Client detail pages load
- [ ] Order Management works (Products → Cart → Review → Submit → Order Book)
- [ ] Knowledge Profiling works
- [ ] Risk Profiling works
- [ ] Products page loads
- [ ] Calendar displays
- [ ] Tasks page works
- [ ] Mobile navigation works
- [ ] No console errors

---

## Reporting Issues

When you find an issue, note:
1. **What you were testing** (e.g., "Order Management - Cart Tab")
2. **What you did** (e.g., "Clicked Remove button")
3. **What happened** (e.g., "Item didn't remove from cart")
4. **What you expected** (e.g., "Item should be removed")
5. **Browser/Device** (e.g., "Chrome on Windows")
6. **Console errors** (copy any red errors from browser console)

---

## Notes

- Keep browser console open (F12) to catch errors
- Test on different browsers if possible
- Test with different screen sizes
- Test with slow network (DevTools → Network → Throttling)
- Document any issues you find

