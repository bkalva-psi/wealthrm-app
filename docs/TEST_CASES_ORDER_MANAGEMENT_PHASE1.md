# Test Cases - Order Management System Phase 1

## Overview
Comprehensive test cases for Phase 1: Core Order Placement - RM Office UI

**Phase 1 Scope:**
- Product Selection & Cart
- Overlay Modals (Scheme Info, Order Info, Docs, Deviations)
- Transaction Mode & Nominee Form
- Read-only Full Switch/Redemption Panel
- Mock API Integration
- Product Cart Interactions
- Transaction Mode & Nominee Info Binding
- Overlay Triggers

---

## 1. Product List & Cart Layout Tests

### 1.1 Product List Display
**Test ID:** TC-OM-001  
**Priority:** High  
**Type:** UI/Functional

**Preconditions:**
- User is logged in as RM
- User has access to Order Management module

**Test Steps:**
1. Navigate to Order Management → New Order
2. View product list section

**Expected Results:**
- Product list displays with columns: Scheme Name, Category, NAV, Min Investment, Max Investment
- Products are filterable by category, RTA, risk level
- Search functionality works
- Products show whitelist status (only whitelisted schemes visible)
- Loading skeleton displays while fetching products
- Empty state shows when no products match filters

**Test Data:**
- Valid product list with 10+ schemes
- Filter combinations (category, RTA, risk level)
- Empty search result scenario

---

### 1.2 Product Selection
**Test ID:** TC-OM-002  
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Product list is loaded
- User is on New Order page

**Test Steps:**
1. Click "Add to Cart" on a product
2. Verify product appears in cart
3. Click "Add to Cart" on same product again
4. Click "Add to Cart" on different product

**Expected Results:**
- Product is added to cart with default quantity 1
- Cart summary updates immediately
- Duplicate products are handled (either increment quantity or show error)
- Multiple different products can be added
- Cart badge shows correct count

**Test Data:**
- Single product
- Multiple products (5+)
- Duplicate product scenario

---

### 1.3 Cart Layout & Summary
**Test ID:** TC-OM-003  
**Priority:** High  
**Type:** UI/Functional

**Preconditions:**
- Cart has at least one product

**Test Steps:**
1. View cart section
2. Verify cart displays: Product Name, Amount, Units (if applicable), Transaction Type
3. Check cart summary shows: Total Amount, Total Items
4. Verify remove/update quantity controls

**Expected Results:**
- Cart displays all added products
- Summary calculations are accurate
- Remove button removes product from cart
- Quantity updates reflect in summary
- Cart persists during session
- Empty cart shows appropriate message

**Test Data:**
- Cart with 1 product
- Cart with 5+ products
- Cart with mixed transaction types (Purchase, Redemption, Switch)

---

### 1.4 Cart Interactions - Add/Remove
**Test ID:** TC-OM-004  
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Product list loaded
- Cart is empty

**Test Steps:**
1. Add Product A to cart
2. Add Product B to cart
3. Remove Product A
4. Update Product B quantity to 3
5. Clear entire cart

**Expected Results:**
- Products add correctly
- Remove works immediately
- Quantity updates reflect in total
- Clear cart removes all items
- Cart summary updates in real-time
- No data loss during interactions

---

## 2. Overlay Modals Tests

### 2.1 Scheme Info Overlay
**Test ID:** TC-OM-005  
**Priority:** Medium  
**Type:** UI/Functional

**Preconditions:**
- Product list is displayed

**Test Steps:**
1. Click "Scheme Info" icon/button on a product
2. Verify overlay opens
3. Check displayed information
4. Close overlay

**Expected Results:**
- Overlay opens with smooth animation
- Displays: Scheme Name, AMC, Category, RTA, Launch Date, AUM, Expense Ratio, Fund Manager
- Close button (X) works
- Click outside overlay closes it (if configured)
- Overlay is responsive
- Scrollable if content exceeds viewport

**Test Data:**
- Product with complete scheme info
- Product with missing optional fields

---

### 2.2 Order Info Overlay
**Test ID:** TC-OM-006  
**Priority:** Medium  
**Type:** UI/Functional

**Preconditions:**
- Product is in cart

**Test Steps:**
1. Click "Order Info" on cart item
2. Verify overlay displays order details
3. Check editable fields (if any)
4. Close overlay

**Expected Results:**
- Overlay shows: Product Name, Transaction Type, Amount, Units, Settlement Account, Branch Code
- Fields are editable where applicable
- Changes reflect in cart
- Validation errors display appropriately
- Close preserves changes (or prompts if unsaved)

---

### 2.3 Documents Overlay
**Test ID:** TC-OM-007  
**Priority:** Medium  
**Type:** UI/Functional

**Preconditions:**
- Product is selected or in cart

**Test Steps:**
1. Click "Documents" icon/button
2. Verify document list displays
3. Click download on a document
4. Verify download initiates

**Expected Results:**
- Overlay shows: Factsheet, KIM, SID, SAI, Addendum (if applicable)
- Documents are downloadable
- Download progress indicator (if applicable)
- Documents open in new tab or download
- Empty state if no documents available

**Test Data:**
- Product with all documents
- Product with partial documents
- Product with no documents

---

### 2.4 Deviations Overlay
**Test ID:** TC-OM-008  
**Priority:** Medium  
**Type:** UI/Functional

**Preconditions:**
- Order has deviation conditions (e.g., amount exceeds max, min not met)

**Test Steps:**
1. Trigger deviation condition (e.g., enter amount below minimum)
2. Verify deviation overlay/alert appears
3. Check deviation details
4. Acknowledge or resolve deviation

**Expected Results:**
- Deviation overlay shows: Deviation Type, Description, Impact, Resolution Options
- User can acknowledge deviation
- Deviation is logged
- Order submission blocked until resolved/acknowledged
- Clear indication of deviation status

**Test Data:**
- Amount below minimum
- Amount above maximum
- Full redemption deviation
- Close account deviation

---

## 3. Transaction Mode & Nominee Form Tests

### 3.1 Transaction Mode Selection
**Test ID:** TC-OM-009  
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Cart has at least one product
- User is on order review page

**Test Steps:**
1. View Transaction Mode section
2. Select "Physical" mode
3. Select "Email" mode
4. Select "Telephone" mode
5. Verify mode-specific fields appear

**Expected Results:**
- Three modes available: Physical, Email, Telephone
- Selection updates UI
- Mode-specific fields show/hide appropriately
- Selected mode persists
- Mode is required (validation)

**Test Data:**
- All three modes
- Mode switching scenarios

---

### 3.2 Investment/Settlement Account Selection
**Test ID:** TC-OM-010  
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Transaction mode selected
- User has linked accounts

**Test Steps:**
1. View Investment/Settlement Account dropdown
2. Select an account
3. Verify account details display
4. Change account selection

**Expected Results:**
- Dropdown shows linked accounts
- Account details (Account Number, Bank, IFSC) display
- Selection is required
- Account persists in order
- Validation for account eligibility

**Test Data:**
- Single account
- Multiple accounts
- Account with missing details

---

### 3.3 Branch Code Selection
**Test ID:** TC-OM-011  
**Priority:** High  
**Type:** Functional

**Preconditions:**
- User is on order form
- Branch codes are available

**Test Steps:**
1. View Branch Code field
2. Select branch code from dropdown
3. Verify branch details display
4. Search/filter branch codes

**Expected Results:**
- Branch code dropdown is searchable
- Branch name and address display on selection
- Selection is required
- Branch visibility based on user's branch access
- Validation for branch eligibility

**Test Data:**
- Multiple branch codes
- Search scenarios
- Branch filtering

---

### 3.4 Nominee Information Form
**Test ID:** TC-OM-012  
**Priority:** High  
**Type:** Functional/Validation

**Preconditions:**
- Order form is open
- Nominee section is visible

**Test Steps:**
1. Add first nominee
2. Enter nominee details: Name, Relationship, Date of Birth, PAN, Percentage
3. Add second nominee
4. Verify percentage totals 100%
5. Test guardian fields for minor nominee
6. Test opt-out scenario

**Expected Results:**
- Nominee form has: Name, Relationship, DOB, PAN, Percentage, Guardian (if minor)
- Multiple nominees can be added
- Percentage validation: Total must equal 100%
- PAN format validation
- Guardian fields appear for minor nominees
- Opt-out option available (SEBI Phase-1)
- Form validation prevents submission if invalid

**Test Data:**
- Single nominee (100%)
- Multiple nominees (totaling 100%)
- Minor nominee with guardian
- Invalid percentage totals
- Invalid PAN formats
- Opt-out scenario

---

### 3.5 Nominee Validation Rules
**Test ID:** TC-OM-013  
**Priority:** High  
**Type:** Validation

**Preconditions:**
- Nominee form is displayed

**Test Steps:**
1. Enter nominee with percentage 50%
2. Add second nominee with percentage 60%
3. Attempt to submit
4. Correct percentages to total 100%
5. Enter invalid PAN format
6. Enter minor nominee without guardian

**Expected Results:**
- Percentage validation: Total must be exactly 100%
- PAN validation: 10 alphanumeric characters
- Guardian required for minor nominees
- Validation errors display clearly
- Form blocks submission until valid

---

## 4. Full Switch/Redemption Panel Tests

### 4.1 Full Switch Read-only Display
**Test ID:** TC-OM-014  
**Priority:** Medium  
**Type:** UI/Functional

**Preconditions:**
- Order type is "Full Switch"
- Source and target schemes selected

**Test Steps:**
1. View Full Switch panel
2. Verify all fields are read-only
3. Check displayed information
4. Verify close AC = Y flag is visible

**Expected Results:**
- Panel displays: Source Scheme, Target Scheme, Units (read-only), Close AC = Y (read-only)
- All fields are non-editable
- Close AC flag is clearly visible
- Panel is clearly marked as read-only
- Information is accurate

**Test Data:**
- Full switch order
- Source and target scheme details

---

### 4.2 Full Redemption Read-only Display
**Test ID:** TC-OM-015  
**Priority:** Medium  
**Type:** UI/Functional

**Preconditions:**
- Order type is "Full Redemption"
- Scheme selected

**Test Steps:**
1. View Full Redemption panel
2. Verify all fields are read-only
3. Check close AC = Y flag
4. Verify units match holding

**Expected Results:**
- Panel displays: Scheme Name, Units (read-only), Amount (read-only), Close AC = Y (read-only)
- All fields are non-editable
- Units match current holding exactly (no rounding)
- Close AC flag visible
- Panel clearly marked as read-only

**Test Data:**
- Full redemption order
- Scheme with holdings

---

### 4.3 Full Switch/Redemption Validation Bypass
**Test ID:** TC-OM-016  
**Priority:** High  
**Type:** Validation

**Preconditions:**
- Full Switch or Full Redemption order created

**Test Steps:**
1. Verify minimum investment validation is bypassed
2. Verify maximum investment validation is bypassed
3. Verify amount-based validations are bypassed
4. Submit order

**Expected Results:**
- Minimum amount validation does not apply
- Maximum amount validation does not apply
- Order can be submitted without min/max errors
- Close AC = Y is set automatically
- Units are not auto-rounded

---

## 5. Mock API Integration Tests

### 5.1 Fetch Product List API
**Test ID:** TC-OM-017  
**Priority:** High  
**Type:** Integration

**Preconditions:**
- Mock API server is running
- Products endpoint is configured

**Test Steps:**
1. Load product list page
2. Verify API call is made to `/api/products` or `/api/schemes`
3. Check request parameters (filters, pagination)
4. Verify response handling
5. Test error scenarios

**Expected Results:**
- API call includes: filters, pagination, search params
- Response is parsed correctly
- Products display from API response
- Loading state shows during API call
- Error handling displays appropriate message
- Retry mechanism works (if implemented)

**Test Data:**
- Valid API response
- Empty response
- Error response (500, 404, timeout)

---

### 5.2 Fetch Branch Codes API
**Test ID:** TC-OM-018  
**Priority:** High  
**Type:** Integration

**Preconditions:**
- Mock API server running
- Branch codes endpoint available

**Test Steps:**
1. Open order form
2. Verify branch codes API call
3. Check branch codes populate dropdown
4. Test search/filter functionality
5. Test error scenarios

**Expected Results:**
- API call to `/api/branches` or similar
- Branch codes load in dropdown
- Search/filter works with API
- Branch visibility respects user's branch access
- Error handling works

**Test Data:**
- Valid branch list
- Empty branch list
- Error response

---

### 5.3 Fetch Overlay Details API
**Test ID:** TC-OM-019  
**Priority:** Medium  
**Type:** Integration

**Preconditions:**
- Product selected
- Overlay trigger clicked

**Test Steps:**
1. Click Scheme Info overlay
2. Verify API call for scheme details
3. Check Order Info API call
4. Check Documents API call
5. Test error scenarios

**Expected Results:**
- API calls made to appropriate endpoints
- Overlay data loads from API
- Loading state in overlay
- Error handling in overlay
- Caching works (if implemented)

**Test Data:**
- Valid overlay data
- Missing data scenarios
- Error responses

---

## 6. Product Cart Interactions Tests

### 6.1 Add Product to Cart
**Test ID:** TC-OM-020  
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Product list loaded
- Cart is empty or has items

**Test Steps:**
1. Click "Add to Cart" on a product
2. Verify product appears in cart
3. Check cart summary updates
4. Verify cart count badge updates

**Expected Results:**
- Product added immediately
- Cart displays new product
- Summary totals update
- Badge count increments
- No page refresh required

---

### 6.2 Remove Product from Cart
**Test ID:** TC-OM-021  
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Cart has at least one product

**Test Steps:**
1. Click remove/delete on cart item
2. Verify product removed
3. Check cart summary updates
4. Verify empty cart state if last item

**Expected Results:**
- Product removed immediately
- Summary updates correctly
- Badge count decrements
- Empty state shows if cart empty
- No data loss

---

### 6.3 Update Product Quantity in Cart
**Test ID:** TC-OM-022  
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Product in cart with quantity 1

**Test Steps:**
1. Increase quantity to 3
2. Decrease quantity to 1
3. Set quantity to 0 (should remove)
4. Verify summary calculations

**Expected Results:**
- Quantity updates immediately
- Summary recalculates correctly
- Quantity cannot go below 1 (or removes if 0)
- Validation prevents invalid quantities
- Calculations are accurate

---

### 6.4 Cart Persistence
**Test ID:** TC-OM-023  
**Priority:** Medium  
**Type:** Functional

**Preconditions:**
- Cart has products
- User navigates away and returns

**Test Steps:**
1. Add products to cart
2. Navigate to different page
3. Return to order page
4. Verify cart persists

**Expected Results:**
- Cart data persists in session/localStorage
- Cart restores on page return
- No data loss during navigation
- Cart clears on logout (if configured)

---

## 7. Transaction Mode & Nominee Binding Tests

### 7.1 Transaction Mode State Management
**Test ID:** TC-OM-024  
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Order form open
- Transaction mode section visible

**Test Steps:**
1. Select "Physical" mode
2. Verify mode stored in state
3. Change to "Email" mode
4. Verify state updates
5. Submit form and verify mode included

**Expected Results:**
- Mode selection updates state immediately
- State persists during form editing
- Mode included in order submission
- Mode validation works

---

### 7.2 Nominee Info Binding
**Test ID:** TC-OM-025  
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Nominee form displayed

**Test Steps:**
1. Enter nominee details
2. Verify data bound to form state
3. Add multiple nominees
4. Update nominee details
5. Verify all nominees in state
6. Submit and verify nominees included

**Expected Results:**
- Nominee data bound to state
- Multiple nominees stored correctly
- Updates reflect in state
- Nominees included in order payload
- State validation works

---

### 7.3 Form State Persistence
**Test ID:** TC-OM-026  
**Priority:** Medium  
**Type:** Functional

**Preconditions:**
- Form partially filled
- User navigates or refreshes

**Test Steps:**
1. Fill transaction mode and nominee info
2. Navigate away
3. Return to form
4. Verify form data restored

**Expected Results:**
- Form data persists (session/localStorage)
- Data restores on return
- No data loss
- Clear option available

---

## 8. Overlay Triggers Tests

### 8.1 Scheme Info Overlay Trigger
**Test ID:** TC-OM-027  
**Priority:** Medium  
**Type:** Functional

**Preconditions:**
- Product list displayed

**Test Steps:**
1. Click Scheme Info icon/button on product
2. Verify overlay opens
3. Click overlay close
4. Click outside overlay (if configured)
5. Test keyboard ESC key

**Expected Results:**
- Overlay opens on click
- Close button works
- Click outside closes (if enabled)
- ESC key closes overlay
- Smooth animations

---

### 8.2 Order Info Overlay Trigger
**Test ID:** TC-OM-028  
**Priority:** Medium  
**Type:** Functional

**Preconditions:**
- Product in cart

**Test Steps:**
1. Click Order Info on cart item
2. Verify overlay opens with order details
3. Edit fields in overlay
4. Close overlay
5. Verify changes reflected in cart

**Expected Results:**
- Overlay opens from cart item
- Displays current order details
- Edits update cart
- Close preserves changes
- Changes visible in cart

---

### 8.3 Documents Overlay Trigger
**Test ID:** TC-OM-029  
**Priority:** Low  
**Type:** Functional

**Preconditions:**
- Product selected

**Test Steps:**
1. Click Documents icon/button
2. Verify overlay opens
3. Click document to download
4. Close overlay

**Expected Results:**
- Overlay opens correctly
- Documents list displays
- Downloads initiate
- Overlay closes properly

---

### 8.4 Deviations Overlay Trigger
**Test ID:** TC-OM-030  
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Order has deviation condition

**Test Steps:**
1. Trigger deviation (e.g., amount below min)
2. Verify deviation overlay/alert appears
3. Acknowledge deviation
4. Verify overlay closes
5. Attempt submission

**Expected Results:**
- Overlay appears automatically on deviation
- Deviation details clear
- Acknowledgment works
- Submission blocked until acknowledged
- Overlay closes after acknowledgment

---

## 9. UI/UX & Accessibility Tests

### 9.1 Responsive Design
**Test ID:** TC-OM-031  
**Priority:** Medium  
**Type:** UI

**Preconditions:**
- Application loaded

**Test Steps:**
1. Test on desktop (1920x1080)
2. Test on tablet (768x1024)
3. Test on mobile (375x667)
4. Verify layouts adapt

**Expected Results:**
- Layout responsive on all screen sizes
- Cart and product list stack appropriately
- Overlays work on mobile
- Touch interactions work
- No horizontal scrolling

---

### 9.2 Loading States
**Test ID:** TC-OM-032  
**Priority:** Medium  
**Type:** UI

**Preconditions:**
- Application loaded

**Test Steps:**
1. Trigger product list load
2. Trigger API calls
3. Verify loading indicators

**Expected Results:**
- Skeleton loaders display
- Loading spinners show
- No blank screens
- Smooth transitions

---

### 9.3 Error States
**Test ID:** TC-OM-033  
**Priority:** High  
**Type:** UI/Functional

**Preconditions:**
- Application loaded

**Test Steps:**
1. Simulate API errors
2. Test network failures
3. Test validation errors
4. Verify error messages

**Expected Results:**
- Error messages clear and actionable
- Retry options available
- No application crashes
- User-friendly error UI

---

### 9.4 Accessibility
**Test ID:** TC-OM-034  
**Priority:** Medium  
**Type:** A11y

**Preconditions:**
- Application loaded

**Test Steps:**
1. Test keyboard navigation
2. Test screen reader compatibility
3. Check ARIA labels
4. Verify focus indicators
5. Test color contrast

**Expected Results:**
- All interactive elements keyboard accessible
- Screen reader announces correctly
- ARIA labels present
- Focus indicators visible
- WCAG AA contrast compliance

---

## 10. Integration & End-to-End Tests

### 10.1 Complete Order Flow - Happy Path
**Test ID:** TC-OM-035  
**Priority:** High  
**Type:** E2E

**Preconditions:**
- User logged in as RM
- Products available
- Mock APIs configured

**Test Steps:**
1. Navigate to New Order
2. Search and add product to cart
3. View scheme info overlay
4. Fill transaction mode (Email)
5. Select investment account
6. Select branch code
7. Add nominee information
8. Review order summary
9. Submit order
10. Verify order created

**Expected Results:**
- All steps complete successfully
- Order created with correct data
- Order ID generated
- Success message displayed
- Order appears in Order Book

---

### 10.2 Order Flow with Full Redemption
**Test ID:** TC-OM-036  
**Priority:** High  
**Type:** E2E

**Preconditions:**
- User logged in
- Client has holdings
- Full redemption option available

**Test Steps:**
1. Select Full Redemption transaction type
2. Select scheme with holdings
3. Verify read-only panel displays
4. Verify close AC = Y flag
5. Fill other required fields
6. Submit order

**Expected Results:**
- Full redemption panel shows read-only
- Units match holdings exactly
- Close AC = Y visible
- Min/max validations bypassed
- Order submits successfully

---

### 10.3 Order Flow with Validation Errors
**Test ID:** TC-OM-037  
**Priority:** High  
**Type:** E2E

**Preconditions:**
- Order form open

**Test Steps:**
1. Attempt to submit empty cart
2. Add product with amount below minimum
3. Add nominee with percentage totaling 90%
4. Submit without transaction mode
5. Verify all validation errors

**Expected Results:**
- All validation errors display
- Submission blocked
- Errors clear on correction
- User guidance provided

---

## Test Execution Summary

### Test Coverage
- **Total Test Cases:** 37
- **High Priority:** 25
- **Medium Priority:** 10
- **Low Priority:** 2

### Test Types Distribution
- **Functional:** 20
- **UI/UX:** 8
- **Validation:** 4
- **Integration:** 3
- **E2E:** 2

### Test Execution Strategy
1. **Unit Tests:** Component-level tests for each UI component
2. **Integration Tests:** API integration and state management
3. **E2E Tests:** Complete user flows
4. **Visual Regression:** UI consistency checks

### Success Criteria
- All High Priority tests pass
- 95%+ test coverage
- No critical bugs
- Performance benchmarks met
- Accessibility compliance verified

---

## Notes
- Tests should be automated where possible
- Manual testing required for complex UI interactions
- Mock APIs should mirror production API structure
- Test data should cover edge cases
- Continuous validation during development

