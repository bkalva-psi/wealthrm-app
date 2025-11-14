# Phase 3: Systematic Plans & Operations Console - Test Cases

## Overview
This document contains comprehensive test cases for Phase 3 implementation covering:
- Systematic Plans Service (SIP/STP/SWP setup/modify/cancel)
- Scheduler with reattempt logic
- Operations Console (systematic dashboard, downloads)

**Reference Documents:**
- BRD: `BRD_ORDER_MANAGEMENT.md`
- BRD v1.0: `BRD_MF_Order_Lifecycle_v1.0.md`

---

## Test Case Categories

### Category 1: Systematic Plans Service - SIP Setup
### Category 2: Systematic Plans Service - STP Setup
### Category 3: Systematic Plans Service - SWP Setup
### Category 4: Systematic Plans Service - Modify Plans
### Category 5: Systematic Plans Service - Cancel Plans
### Category 6: Scheduler - Execution & Reattempts
### Category 7: Operations Console - Dashboard Views
### Category 8: Operations Console - Filters & Search
### Category 9: Operations Console - Downloads
### Category 10: Integration & Edge Cases

---

## Category 1: Systematic Plans Service - SIP Setup

### TC-P3-001: Create SIP Plan with Valid Data
**Priority:** Critical  
**Type:** Functional

**Preconditions:**
- User is authenticated
- Product exists in system
- Client has valid folio

**Test Steps:**
1. Navigate to Systematic Plans page
2. Click "Create SIP"
3. Fill in required fields:
   - Scheme: Select valid scheme
   - Amount: ₹5,000 (within min/max limits)
   - Start Date: Future date
   - Frequency: Monthly
   - Installments: 12
4. Click "Submit"

**Expected Result:**
- SIP plan created successfully
- Plan ID generated
- Status: "Active"
- Success message displayed
- Plan appears in Active plans list

**API Endpoint:** `POST /api/systematic-plans/sip`

---

### TC-P3-002: SIP Setup - Validate Minimum Amount
**Priority:** High  
**Type:** Validation

**Preconditions:**
- User is on SIP setup form
- Scheme has min SIP amount: ₹1,000

**Test Steps:**
1. Enter amount: ₹500 (below minimum)
2. Click "Submit"

**Expected Result:**
- Validation error: "SIP amount must be at least ₹1,000"
- Submission blocked
- Error message displayed

---

### TC-P3-003: SIP Setup - Validate Maximum Amount
**Priority:** High  
**Type:** Validation

**Preconditions:**
- User is on SIP setup form
- Scheme has max SIP amount: ₹1,00,000

**Test Steps:**
1. Enter amount: ₹2,00,000 (above maximum)
2. Click "Submit"

**Expected Result:**
- Validation error: "SIP amount cannot exceed ₹1,00,000"
- Submission blocked
- Error message displayed

---

### TC-P3-004: SIP Setup - Validate Start Date (Future Date)
**Priority:** High  
**Type:** Validation

**Test Steps:**
1. Select start date: Yesterday (past date)
2. Click "Submit"

**Expected Result:**
- Validation error: "Start date must be a future date"
- Submission blocked

---

### TC-P3-005: SIP Setup - Validate Frequency Options
**Priority:** Medium  
**Type:** Validation

**Test Steps:**
1. Select frequency: "Daily" (if not allowed)
2. Click "Submit"

**Expected Result:**
- Validation error if frequency not allowed
- OR frequency dropdown only shows allowed options

**Allowed Frequencies:** Monthly, Quarterly (per BRD)

---

### TC-P3-006: SIP Setup - Validate Installment Count
**Priority:** Medium  
**Type:** Validation

**Test Steps:**
1. Enter installments: 0
2. Click "Submit"

**Expected Result:**
- Validation error: "Installments must be greater than 0"
- Submission blocked

---

## Category 2: Systematic Plans Service - STP Setup

### TC-P3-007: Create STP Plan with Valid Data
**Priority:** Critical  
**Type:** Functional

**Test Steps:**
1. Navigate to Systematic Plans page
2. Click "Create STP"
3. Fill in required fields:
   - Source Scheme: Select scheme with holdings
   - Target Scheme: Select different scheme
   - Amount: ₹10,000
   - Start Date: Future date
   - Frequency: Monthly
   - Installments: 6
4. Click "Submit"

**Expected Result:**
- STP plan created successfully
- Plan ID generated
- Status: "Active"
- Success message displayed

**API Endpoint:** `POST /api/systematic-plans/stp`

---

### TC-P3-008: STP Setup - Validate Source Scheme Has Holdings
**Priority:** High  
**Type:** Validation

**Test Steps:**
1. Select source scheme with no holdings
2. Click "Submit"

**Expected Result:**
- Validation error: "Source scheme must have sufficient holdings"
- Submission blocked

---

### TC-P3-009: STP Setup - Validate Amount ≤ Market Value
**Priority:** High  
**Type:** Validation

**Preconditions:**
- Source scheme market value: ₹50,000

**Test Steps:**
1. Enter amount: ₹60,000 (exceeds market value)
2. Click "Submit"

**Expected Result:**
- Validation error: "Amount cannot exceed market value of ₹50,000"
- Submission blocked

---

## Category 3: Systematic Plans Service - SWP Setup

### TC-P3-010: Create SWP Plan with Valid Data
**Priority:** Critical  
**Type:** Functional

**Test Steps:**
1. Navigate to Systematic Plans page
2. Click "Create SWP"
3. Fill in required fields:
   - Scheme: Select scheme with holdings
   - Amount: ₹5,000
   - Start Date: Future date
   - Frequency: Monthly
   - Installments: 12
4. Click "Submit"

**Expected Result:**
- SWP plan created successfully
- Plan ID generated
- Status: "Active"
- Success message displayed

**API Endpoint:** `POST /api/systematic-plans/swp`

---

### TC-P3-011: SWP Setup - Validate Minimum Withdrawal Amount
**Priority:** High  
**Type:** Validation

**Preconditions:**
- Scheme has min SWP amount: ₹1,000

**Test Steps:**
1. Enter amount: ₹500 (below minimum)
2. Click "Submit"

**Expected Result:**
- Validation error: "SWP amount must be at least ₹1,000"
- Submission blocked

---

### TC-P3-012: SWP Setup - Validate Amount ≤ Market Value
**Priority:** High  
**Type:** Validation

**Preconditions:**
- Scheme market value: ₹1,00,000

**Test Steps:**
1. Enter amount: ₹1,50,000 (exceeds market value)
2. Click "Submit"

**Expected Result:**
- Validation error: "Amount cannot exceed market value"
- Submission blocked

---

## Category 4: Systematic Plans Service - Modify Plans

### TC-P3-013: Modify Active SIP Plan
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Active SIP plan exists

**Test Steps:**
1. Navigate to Active plans list
2. Click "Modify" on an active SIP
3. Change amount from ₹5,000 to ₹7,500
4. Click "Save"

**Expected Result:**
- Plan modified successfully
- New amount reflected in plan
- Success message displayed
- Plan remains Active

**API Endpoint:** `PUT /api/systematic-plans/:id`

---

### TC-P3-014: Modify Plan - Validate Changes
**Priority:** Medium  
**Type:** Validation

**Test Steps:**
1. Open modify form for active plan
2. Change amount to below minimum
3. Click "Save"

**Expected Result:**
- Validation error displayed
- Changes not saved
- Original values preserved

---

### TC-P3-015: Modify Plan - Cannot Modify Completed Plan
**Priority:** Medium  
**Type:** Functional

**Preconditions:**
- Completed SIP plan exists (all installments executed)

**Test Steps:**
1. Navigate to Completed plans list
2. Attempt to modify completed plan

**Expected Result:**
- Modify button disabled or not visible
- OR error message: "Cannot modify completed plan"

---

## Category 5: Systematic Plans Service - Cancel Plans

### TC-P3-016: Cancel Active SIP Plan
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Active SIP plan exists

**Test Steps:**
1. Navigate to Active plans list
2. Click "Cancel" on an active SIP
3. Confirm cancellation

**Expected Result:**
- Plan cancelled successfully
- Status changed to "Cancelled"
- Success message displayed
- Plan moved to Cancelled list

**API Endpoint:** `POST /api/systematic-plans/:id/cancel`

---

### TC-P3-017: Cancel Plan - Confirmation Required
**Priority:** Medium  
**Type:** UX

**Test Steps:**
1. Click "Cancel" on active plan
2. Cancel confirmation dialog appears

**Expected Result:**
- Confirmation dialog displayed
- Shows plan details
- "Confirm" and "Cancel" buttons
- Cannot cancel without confirmation

---

### TC-P3-018: Cancel Plan - Cannot Cancel Completed Plan
**Priority:** Low  
**Type:** Functional

**Preconditions:**
- Completed plan exists

**Test Steps:**
1. Navigate to Completed plans
2. Attempt to cancel

**Expected Result:**
- Cancel button disabled or not visible
- OR error message: "Cannot cancel completed plan"

---

## Category 6: Scheduler - Execution & Reattempts

### TC-P3-019: Scheduler Executes SIP on Scheduled Date
**Priority:** Critical  
**Type:** Functional

**Preconditions:**
- Active SIP plan exists
- Scheduled execution date is today
- Scheduler job runs

**Test Steps:**
1. Wait for scheduler to run
2. Check plan execution status

**Expected Result:**
- SIP order created
- Execution status: "Executed" or "Pending"
- Order appears in Order Book
- Next installment date updated

---

### TC-P3-020: Scheduler Reattempt on Failure - First Retry
**Priority:** High  
**Type:** Functional

**Preconditions:**
- SIP execution failed (e.g., insufficient funds)
- Reattempt window: 2 hours before cut-off

**Test Steps:**
1. Initial execution fails
2. Wait for first retry window
3. Check execution status

**Expected Result:**
- First retry attempted
- Retry count: 1
- Status: "Retrying" or "Pending Retry"

---

### TC-P3-021: Scheduler Reattempt on Failure - Second Retry
**Priority:** High  
**Type:** Functional

**Preconditions:**
- First retry failed
- Second retry window available

**Test Steps:**
1. First retry fails
2. Wait for second retry window
3. Check execution status

**Expected Result:**
- Second retry attempted
- Retry count: 2
- Status: "Retrying"

---

### TC-P3-022: Scheduler Marks Failed After Max Retries
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Plan failed after 3 attempts (initial + 2 retries)
- Cut-off time passed

**Test Steps:**
1. All retries exhausted
2. Cut-off time passed
3. Check plan status

**Expected Result:**
- Status: "Failed"
- Failure reason logged
- Plan moved to Failed list
- No further retries attempted

---

### TC-P3-023: Scheduler - Reattempt Window Configuration
**Priority:** Medium  
**Type:** Configuration

**Test Steps:**
1. Check scheduler configuration
2. Verify retry windows

**Expected Result:**
- Initial execution: On scheduled date
- First retry: 2 hours before cut-off
- Second retry: 1 hour before cut-off
- Max retries: 3 (configurable)

---

## Category 7: Operations Console - Dashboard Views

### TC-P3-024: Operations Console - View Active Plans
**Priority:** Critical  
**Type:** Functional

**Test Steps:**
1. Navigate to Operations Console
2. Click "Active Plans" tab

**Expected Result:**
- List of active SIP/STP/SWP plans displayed
- Shows: Plan ID, Scheme, Amount, Frequency, Next Execution Date, Status
- Plans sorted by next execution date

**API Endpoint:** `GET /api/operations/systematic-plans?status=active`

---

### TC-P3-025: Operations Console - View Closed Plans
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to Operations Console
2. Click "Closed Plans" tab

**Expected Result:**
- List of closed/completed plans displayed
- Shows: Plan ID, Scheme, Total Executed, Completion Date
- Plans sorted by completion date (newest first)

**API Endpoint:** `GET /api/operations/systematic-plans?status=closed`

---

### TC-P3-026: Operations Console - View Cancelled Plans
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to Operations Console
2. Click "Cancelled Plans" tab

**Expected Result:**
- List of cancelled plans displayed
- Shows: Plan ID, Scheme, Cancellation Date, Reason
- Plans sorted by cancellation date

**API Endpoint:** `GET /api/operations/systematic-plans?status=cancelled`

---

### TC-P3-027: Operations Console - View Failed Plans
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to Operations Console
2. Click "Failed Plans" tab

**Expected Result:**
- List of failed plans displayed
- Shows: Plan ID, Scheme, Failure Date, Failure Reason, Retry Count
- Plans sorted by failure date

**API Endpoint:** `GET /api/operations/systematic-plans?status=failed`

---

### TC-P3-028: Operations Console - Scheduler View
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Navigate to Operations Console
2. Click "Scheduler" tab

**Expected Result:**
- Upcoming executions displayed
- Shows: Plan ID, Execution Date, Time, Status
- Sorted by execution date/time
- Shows next scheduled run

---

## Category 8: Operations Console - Filters & Search

### TC-P3-029: Filter Plans by Plan Type (SIP/STP/SWP)
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to Operations Console
2. Select filter: "SIP"
3. View results

**Expected Result:**
- Only SIP plans displayed
- Filter persists across tab switches
- Clear filter option available

---

### TC-P3-030: Filter Plans by Scheme
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Navigate to Operations Console
2. Select scheme from dropdown
3. View results

**Expected Result:**
- Only plans for selected scheme displayed
- Multiple schemes can be selected (if multi-select)

---

### TC-P3-031: Filter Plans by Date Range
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Navigate to Operations Console
2. Select date range: Last 30 days
3. View results

**Expected Result:**
- Only plans within date range displayed
- Date range picker functional

---

### TC-P3-032: Search Plans by Plan ID
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Navigate to Operations Console
2. Enter Plan ID in search box
3. View results

**Expected Result:**
- Matching plan(s) displayed
- Search is case-insensitive
- Partial matches supported

---

### TC-P3-033: Combine Multiple Filters
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Apply filter: Plan Type = "SIP"
2. Apply filter: Status = "Active"
3. Apply filter: Date Range = "Last 7 days"
4. View results

**Expected Result:**
- Results match all applied filters
- All filters visible and can be cleared individually

---

## Category 9: Operations Console - Downloads

### TC-P3-034: Download Systematic Plan Status Report (PDF)
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to Operations Console
2. Apply filters (if needed)
3. Click "Download PDF"

**Expected Result:**
- PDF report generated
- Contains all visible plans
- Includes: Plan ID, Scheme, Amount, Status, Dates
- File downloads with name: "Systematic_Plans_Status_YYYYMMDD.pdf"

---

### TC-P3-035: Download Systematic Plan Status Report (XLS)
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to Operations Console
2. Apply filters (if needed)
3. Click "Download XLS"

**Expected Result:**
- Excel file generated
- Contains all visible plans
- Includes all columns
- File downloads with name: "Systematic_Plans_Status_YYYYMMDD.xls"

---

### TC-P3-036: Download Failed Plans Report
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Navigate to Failed Plans tab
2. Click "Download Report"

**Expected Result:**
- Report includes: Plan ID, Scheme, Failure Date, Failure Reason, Retry Count
- Available in PDF and XLS formats

---

### TC-P3-037: Download Scheduler Execution Log
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Navigate to Scheduler tab
2. Click "Download Execution Log"

**Expected Result:**
- Log file downloaded
- Contains execution history
- Includes: Date, Time, Plan ID, Status, Retry Count

---

## Category 10: Integration & Edge Cases

### TC-P3-038: SIP Execution Creates Order in Order Book
**Priority:** Critical  
**Type:** Integration

**Preconditions:**
- Active SIP plan
- Execution date reached

**Test Steps:**
1. Scheduler executes SIP
2. Check Order Book

**Expected Result:**
- Order created in Order Book
- Order linked to SIP plan
- Order status: "Pending Approval" or "Executed"
- Order shows SIP plan reference

---

### TC-P3-039: Multiple Plans Execute on Same Date
**Priority:** Medium  
**Type:** Edge Case

**Preconditions:**
- Multiple SIP plans scheduled for same date

**Test Steps:**
1. Scheduler runs on execution date
2. Check execution results

**Expected Result:**
- All plans executed
- Orders created for each plan
- No conflicts or errors

---

### TC-P3-040: Plan Execution Before Cut-off Time
**Priority:** High  
**Type:** Functional

**Preconditions:**
- SIP scheduled for today
- Current time: Before cut-off

**Test Steps:**
1. Scheduler executes plan
2. Check order status

**Expected Result:**
- Order created
- Order eligible for same-day NAV
- Status reflects pre-cutoff execution

---

### TC-P3-041: Plan Execution After Cut-off Time
**Priority:** High  
**Type:** Functional

**Preconditions:**
- SIP scheduled for today
- Current time: After cut-off

**Test Steps:**
1. Scheduler executes plan
2. Check order status

**Expected Result:**
- Order created
- Order marked for next-day NAV
- Disclaimer shown if applicable

---

### TC-P3-042: Plan Modification During Execution Window
**Priority:** Medium  
**Type:** Edge Case

**Preconditions:**
- Active SIP plan
- Execution scheduled for today

**Test Steps:**
1. Attempt to modify plan on execution date
2. Check if modification allowed

**Expected Result:**
- Modification blocked OR
- Warning shown: "Plan is scheduled for execution today"
- OR modification allowed but takes effect from next installment

---

### TC-P3-043: Cancel Plan on Execution Date
**Priority:** Medium  
**Type:** Edge Case

**Preconditions:**
- Active SIP plan
- Execution scheduled for today

**Test Steps:**
1. Attempt to cancel plan on execution date
2. Check cancellation result

**Expected Result:**
- Cancellation allowed OR
- Warning: "Plan will be cancelled after today's execution"
- OR cancellation blocked with message

---

### TC-P3-044: Insufficient Funds - Plan Execution Failure
**Priority:** High  
**Type:** Error Handling

**Preconditions:**
- Active SIP plan
- Insufficient funds in account

**Test Steps:**
1. Scheduler attempts execution
2. Check failure handling

**Expected Result:**
- Execution fails
- Failure reason logged: "Insufficient funds"
- Retry scheduled (if within window)
- Plan marked as Failed after max retries

---

### TC-P3-045: Scheduler Logging and Audit Trail
**Priority:** Medium  
**Type:** Audit

**Test Steps:**
1. Execute a plan
2. Check scheduler logs

**Expected Result:**
- Execution logged with:
  - Timestamp
  - Plan ID
  - Execution result
  - Retry count (if applicable)
  - Error details (if failed)

---

### TC-P3-046: Operations Console - Role-Based Access
**Priority:** High  
**Type:** Security

**Preconditions:**
- User with "Operations" role
- User with "RM" role (should not access)

**Test Steps:**
1. RM user attempts to access Operations Console
2. Operations user accesses console

**Expected Result:**
- RM user: Access denied or console not visible
- Operations user: Full access granted

---

### TC-P3-047: Operations Console - Pagination
**Priority:** Low  
**Type:** UX

**Preconditions:**
- More than 50 plans in list

**Test Steps:**
1. Navigate to Active Plans
2. Scroll to bottom
3. Check pagination

**Expected Result:**
- Pagination controls visible
- Page size: 50 (configurable)
- Next/Previous buttons functional
- Page numbers displayed

---

### TC-P3-048: Operations Console - Real-time Updates
**Priority:** Low  
**Type:** UX

**Test Steps:**
1. View Active Plans
2. Another user cancels a plan
3. Check if list updates

**Expected Result:**
- List auto-refreshes OR
- Manual refresh button available
- OR real-time updates via WebSocket (if implemented)

---

## Test Execution Summary

### Test Coverage Matrix

| Category | Test Cases | Priority | Status |
|----------|-----------|----------|--------|
| SIP Setup | TC-P3-001 to TC-P3-006 | Critical/High | ⏳ Pending |
| STP Setup | TC-P3-007 to TC-P3-009 | Critical/High | ⏳ Pending |
| SWP Setup | TC-P3-010 to TC-P3-012 | Critical/High | ⏳ Pending |
| Modify Plans | TC-P3-013 to TC-P3-015 | High/Medium | ⏳ Pending |
| Cancel Plans | TC-P3-016 to TC-P3-018 | High/Medium | ⏳ Pending |
| Scheduler | TC-P3-019 to TC-P3-023 | Critical/High | ⏳ Pending |
| Dashboard Views | TC-P3-024 to TC-P3-028 | Critical/High | ⏳ Pending |
| Filters & Search | TC-P3-029 to TC-P3-033 | High/Medium | ⏳ Pending |
| Downloads | TC-P3-034 to TC-P3-037 | High/Medium | ⏳ Pending |
| Integration & Edge Cases | TC-P3-038 to TC-P3-048 | Critical/High | ⏳ Pending |

**Total Test Cases:** 48

---

## Acceptance Criteria

### Phase 3 Completion Criteria

1. **Systematic Plans Service:**
   - ✅ SIP/STP/SWP setup functional
   - ✅ Modify plans functional
   - ✅ Cancel plans functional
   - ✅ All validations implemented

2. **Scheduler:**
   - ✅ Execution on scheduled dates
   - ✅ Reattempt logic (initial + 2 retries)
   - ✅ Failure marking after max retries
   - ✅ Logging and audit trail

3. **Operations Console:**
   - ✅ Active/Closed/Cancelled/Failed views
   - ✅ Filters and search functional
   - ✅ Downloads (PDF/XLS) functional
   - ✅ Scheduler view available

4. **Integration:**
   - ✅ Plans create orders in Order Book
   - ✅ Proper error handling
   - ✅ Role-based access control

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-13  
**Status:** Ready for Implementation
