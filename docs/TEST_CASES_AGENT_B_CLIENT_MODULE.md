# Test Cases - Agent B: Client 360 Module

## Overview
Comprehensive test cases for the Client 360 module covering all client-related functionality.

**Test Agent:** Agent B  
**Module:** Client 360 (Clients, Portfolio, Interactions, etc.)  
**Priority:** High  
**Coverage Target:** 80%+

---

## Test Suite 1: Client List & Search

### TC-CL-001: Client List Loading
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/clients`
2. Wait for client list to load
3. Verify clients display

**Expected Result:**
- Client list loads without errors
- Clients display with name, contact info
- Loading state shows while fetching
- No console errors

---

### TC-CL-002: Client Search
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Enter search query in search box
2. Verify filtered results
3. Clear search
4. Verify all clients display

**Expected Result:**
- Search filters clients by name
- Results update in real-time
- Case-insensitive search

---

### TC-CL-003: Client Filters
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Apply filters (status, risk profile, etc.)
2. Verify filtered results
3. Clear filters
4. Verify all clients display

**Expected Result:**
- Filters work correctly
- Multiple filters can be combined
- Clear filters resets view

---

### TC-CL-004: Navigate to Client Detail
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Click on a client row
2. Verify navigation to client detail page
3. Verify default tab (Personal) loads

**Expected Result:**
- Navigation works correctly
- Client detail page loads
- Correct client data displays

---

## Test Suite 2: Client Personal Information

### TC-CL-005: View Personal Information
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/clients/{id}/personal`
2. Verify personal information displays:
   - Name, DOB, Gender
   - Contact details
   - Address
   - PAN, Aadhaar
3. Verify all sections are accessible

**Expected Result:**
- All personal information displays
- Data is accurate
- Sections are well-organized

---

### TC-CL-006: Edit Personal Information
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Click "Edit" on personal information
2. Update fields
3. Save changes
4. Verify changes persist

**Expected Result:**
- Edit form opens
- Changes save successfully
- Updated data displays
- Success message shows

---

### TC-CL-007: Family Information
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Navigate to Family section
2. View family members
3. Add new family member
4. Edit family member
5. Delete family member

**Expected Result:**
- Family information displays
- Can add/edit/delete family members
- Changes save correctly

---

## Test Suite 3: Client Portfolio

### TC-CL-008: Portfolio Holdings Display
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/clients/{id}/portfolio`
2. Verify portfolio holdings display
3. Verify asset allocation chart
4. Verify performance metrics

**Expected Result:**
- Holdings list displays
- Charts render correctly
- Performance metrics accurate
- No errors

---

### TC-CL-009: Portfolio Report Generation
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Click "Generate Portfolio Report"
2. Wait for report generation
3. Verify PDF downloads
4. Verify report contains correct data

**Expected Result:**
- Report generates successfully
- PDF downloads
- Report data is accurate
- Report format is correct

---

### TC-CL-010: Portfolio Filters
**Priority:** Low  
**Type:** Functional

**Test Steps:**
1. Apply portfolio filters (date range, asset type)
2. Verify filtered holdings
3. Clear filters

**Expected Result:**
- Filters work correctly
- Holdings update based on filters

---

## Test Suite 4: Client Interactions

### TC-CL-011: View Interaction History
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/clients/{id}/interactions`
2. Verify interaction history displays
3. Verify interactions are sorted by date
4. Verify interaction details are complete

**Expected Result:**
- Interaction list displays
- Interactions sorted correctly
- Details are complete
- Date formatting is correct

---

### TC-CL-012: Add New Interaction
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Click "Add Interaction"
2. Fill interaction form:
   - Type, Date, Time
   - Description, Outcome
3. Save interaction
4. Verify interaction appears in list

**Expected Result:**
- Form opens correctly
- All fields are required where needed
- Interaction saves successfully
- Appears in list immediately

---

### TC-CL-013: Edit Interaction
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Click "Edit" on an interaction
2. Update interaction details
3. Save changes
4. Verify updates display

**Expected Result:**
- Edit form opens with current data
- Changes save successfully
- Updated interaction displays

---

## Test Suite 5: Client Transactions

### TC-CL-014: View Transaction History
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/clients/{id}/transactions`
2. Verify transaction list displays
3. Verify transaction details:
   - Date, Type, Amount
   - Scheme, Status
4. Verify filters work

**Expected Result:**
- Transaction list displays
- All details are accurate
- Filters work correctly
- Transactions sorted by date

---

### TC-CL-015: Transaction Filters
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Apply transaction filters:
   - Date range
   - Transaction type
   - Status
2. Verify filtered results
3. Clear filters

**Expected Result:**
- Filters work correctly
- Results update correctly
- Multiple filters can be combined

---

## Test Suite 6: Client Communications

### TC-CL-016: View Communication History
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/clients/{id}/communications`
2. Verify communication list displays
3. Verify communication details:
   - Type, Date, Subject
   - Content, Attachments
4. Verify filters work

**Expected Result:**
- Communication list displays
- Details are complete
- Attachments are accessible
- Filters work

---

### TC-CL-017: Send New Communication
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Click "Send Communication"
2. Fill communication form:
   - Type, Subject, Content
   - Attachments (if applicable)
3. Send communication
4. Verify communication appears in history

**Expected Result:**
- Form opens correctly
- All required fields validated
- Communication sends successfully
- Appears in history

---

### TC-CL-018: Communication Templates
**Priority:** Low  
**Type:** Functional

**Test Steps:**
1. Select communication template
2. Verify template content loads
3. Customize template
4. Send communication

**Expected Result:**
- Templates load correctly
- Can customize template
- Sends successfully

---

## Test Suite 7: Client Appointments

### TC-CL-019: View Appointment List
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/clients/{id}/appointments`
2. Verify appointment list displays
3. Verify appointment details:
   - Date, Time, Title
   - Location, Status
4. Verify filters work

**Expected Result:**
- Appointment list displays
- Details are accurate
- Filters work correctly

---

### TC-CL-020: Create Appointment
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Click "Create Appointment"
2. Fill appointment form:
   - Date, Time, Title
   - Location, Description
3. Save appointment
4. Verify appointment appears in list

**Expected Result:**
- Form opens correctly
- Date/time picker works
- Appointment saves successfully
- Appears in list and calendar

---

### TC-CL-021: Edit Appointment
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Click "Edit" on an appointment
2. Update appointment details
3. Save changes
4. Verify updates display

**Expected Result:**
- Edit form opens with current data
- Changes save successfully
- Updates reflect in list and calendar

---

## Test Suite 8: Client Tasks

### TC-CL-022: View Task List
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/clients/{id}/tasks`
2. Verify task list displays
3. Verify task details:
   - Title, Description, Status
   - Due Date, Priority
4. Verify filters work

**Expected Result:**
- Task list displays
- Details are accurate
- Filters work correctly

---

### TC-CL-023: Create Task
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Click "Create Task"
2. Fill task form:
   - Title, Description
   - Due Date, Priority
3. Save task
4. Verify task appears in list

**Expected Result:**
- Form opens correctly
- Task saves successfully
- Appears in list
- Due date validation works

---

### TC-CL-024: Update Task Status
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Change task status (e.g., In Progress → Completed)
2. Verify status updates
3. Verify task moves to appropriate section

**Expected Result:**
- Status updates successfully
- Task moves to correct section
- Changes persist

---

## Test Suite 9: Client Insights

### TC-CL-025: View Client Insights
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/clients/{id}/insights`
2. Verify insights display:
   - Risk profile
   - Investment recommendations
   - Performance analysis
3. Verify charts render

**Expected Result:**
- Insights display correctly
- Charts render properly
- Data is accurate
- Recommendations are relevant

---

## Test Suite 10: Add Client Flow

### TC-CL-026: Add New Client
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/clients/add`
2. Fill client form:
   - Personal information
   - Contact details
   - Financial profile
3. Submit form
4. Verify client is created
5. Verify redirect to client detail page

**Expected Result:**
- Form displays correctly
- All validations work
- Client creates successfully
- Redirects to detail page
- Client appears in list

---

### TC-CL-027: Add Client Validation
**Priority:** High  
**Type:** Validation

**Test Steps:**
1. Try to submit form with missing required fields
2. Verify validation errors
3. Fix errors and resubmit

**Expected Result:**
- Validation errors display
- Error messages are clear
- Cannot submit with errors
- Form submits after fixing errors

---

## Test Suite 11: Prospects Module

### TC-CL-028: View Prospect List
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/prospects`
2. Verify prospect list displays
3. Verify prospect details
4. Test search and filters

**Expected Result:**
- Prospect list displays
- Details are accurate
- Search and filters work

---

### TC-CL-029: Add Prospect
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/prospects/new`
2. Fill prospect form
3. Submit form
4. Verify prospect is created

**Expected Result:**
- Form works correctly
- Prospect creates successfully
- Appears in list

---

### TC-CL-030: Convert Prospect to Client
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. View prospect details
2. Click "Convert to Client"
3. Complete conversion process
4. Verify client is created
5. Verify prospect status updates

**Expected Result:**
- Conversion process works
- Client created from prospect
- Prospect status updates
- Data transfers correctly

---

## Test Execution Summary

**Date:** _______________  
**Tester:** Agent B  
**Environment:** Local / Staging

**Summary:**
- Total Test Cases: 30
- Passed: ___
- Failed: ___
- Blocked: ___
- Not Tested: ___

**Critical Issues:**
1. 
2. 
3. 

