# Test Cases - Agent A: Order Management Module

## Overview
Comprehensive test cases for the Order Management module covering all phases (1-6) of development.

**Test Agent:** Agent A  
**Module:** Order Management  
**Priority:** High  
**Coverage Target:** 85%+

---

## Test Suite 1: Product List & Selection

### TC-OM-001: Product List Loading
**Priority:** High  
**Type:** Functional

**Preconditions:**
- User is logged in
- Navigate to Order Management page

**Test Steps:**
1. Navigate to `#/order-management`
2. Verify Products tab is active by default
3. Wait for products to load

**Expected Result:**
- Product list displays without errors
- Loading skeleton shows while fetching
- Products render with scheme name, category, NAV, min/max investment
- No console errors

**Test Data:**
- Mock products from API

---

### TC-OM-002: Product Search Functionality
**Priority:** Medium  
**Type:** Functional

**Preconditions:**
- Product list is loaded
- Multiple products are available

**Test Steps:**
1. Enter search query in search box
2. Verify filtered results
3. Clear search query
4. Verify all products display again

**Expected Result:**
- Search filters products by scheme name
- Results update in real-time
- Case-insensitive search works
- Empty search shows all products

---

### TC-OM-003: Product Filtering by Category
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Select category from dropdown (e.g., "Equity")
2. Verify only products of that category display
3. Select "All Categories"
4. Verify all products display

**Expected Result:**
- Filter works correctly
- Only matching products display
- "All Categories" shows all products

---

### TC-OM-004: Product Filtering by RTA
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Select RTA from dropdown (e.g., "CAMS")
2. Verify only products with that RTA display
3. Select "All RTAs"
4. Verify all products display

**Expected Result:**
- RTA filter works correctly
- Only matching products display

---

### TC-OM-005: Add Product to Cart
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Click "Add to Cart" button on a product
2. Verify product is added to cart
3. Check cart summary updates
4. Verify cart count badge updates

**Expected Result:**
- Product added to cart successfully
- Cart tab shows updated count
- Product appears in cart with default values
- No errors in console

---

### TC-OM-006: Scheme Info Overlay
**Priority:** Low  
**Type:** Functional

**Test Steps:**
1. Click "Info" icon on a product
2. Verify overlay opens
3. Verify all scheme details display:
   - AMC, Category, RTA, Risk Level
   - NAV, Min/Max Investment
   - Fund Manager, AUM, Expense Ratio
   - Launch Date, Cut-off Time
4. Close overlay

**Expected Result:**
- Overlay opens correctly
- All information displays accurately
- Overlay closes on click outside or X button

---

### TC-OM-007: Documents Overlay
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Click "Documents" icon on a product
2. Verify overlay opens
3. Verify documents list loads
4. Test document download (if available)
5. Test empty state (if no documents)

**Expected Result:**
- Overlay opens without errors
- Documents list displays or empty state shows
- Download functionality works
- No console errors

---

## Test Suite 2: Cart Management

### TC-OM-008: View Cart Items
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Add multiple products to cart
2. Navigate to Cart tab
3. Verify all cart items display

**Expected Result:**
- All cart items are visible
- Each item shows: scheme name, transaction type, amount
- Cart summary shows correct totals

---

### TC-OM-009: Remove Item from Cart
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Add items to cart
2. Click "Remove" on an item
3. Verify item is removed
4. Verify cart summary updates

**Expected Result:**
- Item removed successfully
- Cart count decreases
- Total amount updates correctly

---

### TC-OM-010: Edit Cart Item
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Click "Edit" on a cart item
2. Verify Order Info overlay opens
3. Update amount or units
4. Save changes
5. Verify cart item updates

**Expected Result:**
- Overlay opens with current values
- Changes save correctly
- Cart item reflects updates
- Total amount recalculates

---

### TC-OM-011: Update Cart Item Quantity
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. In cart, update quantity/units for an item
2. Verify amount recalculates (units × NAV)
3. Verify total updates

**Expected Result:**
- Quantity updates correctly
- Amount recalculates automatically
- Total amount updates

---

### TC-OM-012: Empty Cart State
**Priority:** Low  
**Type:** Functional

**Test Steps:**
1. Remove all items from cart
2. Verify empty state displays
3. Verify appropriate message shows

**Expected Result:**
- Empty state displays correctly
- User-friendly message shown
- "Add Products" action available

---

## Test Suite 3: Transaction Mode

### TC-OM-013: Select Transaction Mode
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to Review & Submit tab
2. Select a transaction mode (e.g., "Online")
3. Verify mode is selected
4. Verify mode-specific fields appear

**Expected Result:**
- Mode selection works
- Required fields for mode display
- Validation applies correctly

---

### TC-OM-014: Online Transaction Mode
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Select "Online" transaction mode
2. Fill in email and phone number
3. Verify EUIN field (if required)
4. Submit form

**Expected Result:**
- Email and phone fields required
- EUIN validation works
- Form submits successfully

---

### TC-OM-015: Physical Transaction Mode
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Select "Physical" transaction mode
2. Fill in physical address
3. Verify address validation
4. Submit form

**Expected Result:**
- Address field required
- Address validation works
- Form submits successfully

---

## Test Suite 4: Nominee Information

### TC-OM-016: Add Nominee
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to Review & Submit tab
2. Click "Add Nominee"
3. Fill nominee form:
   - Name, Relationship, Date of Birth
   - PAN, Percentage
4. Save nominee
5. Verify nominee appears in list

**Expected Result:**
- Nominee form opens correctly
- All fields are required
- Nominee saves successfully
- Percentage validation works

---

### TC-OM-017: Nominee Percentage Validation
**Priority:** High  
**Type:** Validation

**Test Steps:**
1. Add multiple nominees
2. Set percentages that don't sum to 100%
3. Try to submit order
4. Verify validation error

**Expected Result:**
- Validation error displays
- Error message is clear
- Order cannot be submitted
- Error shows: "Nominee percentages must sum to 100%"

---

### TC-OM-018: Nominee PAN Validation
**Priority:** High  
**Type:** Validation

**Test Steps:**
1. Add nominee with invalid PAN
2. Try to submit order
3. Verify PAN validation error

**Expected Result:**
- PAN format validation works
- Error message displays
- Invalid PAN formats rejected

---

### TC-OM-019: Guardian Information for Minor Nominee
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Add nominee with relationship "Son" or "Daughter"
2. Set date of birth to make them a minor
3. Verify guardian fields appear
4. Fill guardian information
5. Verify guardian PAN validation

**Expected Result:**
- Guardian fields appear for minors
- Guardian information is required
- Guardian PAN validation works

---

### TC-OM-020: Opt Out of Nomination
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Check "Opt out of nomination" checkbox
2. Verify nominee form is disabled/hidden
3. Submit order
4. Verify order submits without nominees

**Expected Result:**
- Checkbox works correctly
- Nominee form disabled when opted out
- Order can be submitted without nominees

---

## Test Suite 5: Order Validation

### TC-OM-021: Minimum Investment Validation
**Priority:** High  
**Type:** Validation

**Test Steps:**
1. Add product to cart
2. Set amount below minimum investment
3. Try to submit order
4. Verify validation error

**Expected Result:**
- Validation error displays
- Error message: "Amount must be at least ₹{minInvestment}"
- Order cannot be submitted

---

### TC-OM-022: Maximum Investment Validation
**Priority:** High  
**Type:** Validation

**Test Steps:**
1. Add product to cart
2. Set amount above maximum investment
3. Try to submit order
4. Verify validation error

**Expected Result:**
- Validation error displays
- Error message: "Amount cannot exceed ₹{maxInvestment}"
- Order cannot be submitted

---

### TC-OM-023: CRISIL Min/Max Validation
**Priority:** High  
**Type:** Validation

**Test Steps:**
1. Add product with CRISIL limits
2. Set amount outside CRISIL range
3. Try to submit order
4. Verify CRISIL validation error

**Expected Result:**
- CRISIL validation applies
- Error message references CRISIL limits
- Order cannot be submitted

---

### TC-OM-024: Amount ≤ Market Value Validation
**Priority:** High  
**Type:** Validation

**Test Steps:**
1. Add redemption/switch transaction
2. Set amount greater than market value
3. Try to submit order
4. Verify validation error

**Expected Result:**
- Validation error displays
- Error message: "Redemption amount cannot exceed market value"
- Order cannot be submitted

---

### TC-OM-025: EUIN Validation
**Priority:** Medium  
**Type:** Validation

**Test Steps:**
1. Select transaction mode requiring EUIN
2. Leave EUIN empty
3. Try to submit order
4. Verify EUIN required error

**Expected Result:**
- EUIN validation works
- Error message displays
- Order cannot be submitted without EUIN

---

### TC-OM-026: Empty Cart Validation
**Priority:** High  
**Type:** Validation

**Test Steps:**
1. Navigate to Review & Submit with empty cart
2. Try to submit order
3. Verify validation error

**Expected Result:**
- Error: "Cart cannot be empty"
- Submit button disabled
- Clear error message

---

### TC-OM-027: Missing Transaction Mode Validation
**Priority:** High  
**Type:** Validation

**Test Steps:**
1. Add items to cart
2. Don't select transaction mode
3. Try to submit order
4. Verify validation error

**Expected Result:**
- Error: "Transaction mode is required"
- Order cannot be submitted

---

## Test Suite 6: Order Submission

### TC-OM-028: Successful Order Submission
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Cart has valid items
- Transaction mode selected
- Nominees valid (or opted out)
- All validations pass

**Test Steps:**
1. Fill all required fields
2. Click "Submit Order"
3. Wait for submission
4. Verify success message
5. Verify redirect to Order Book

**Expected Result:**
- Order submits successfully
- Success toast displays
- Order ID shown in message
- Redirects to Order Book tab
- Cart is cleared

---

### TC-OM-029: Order Submission with Network Error
**Priority:** Medium  
**Type:** Error Handling

**Test Steps:**
1. Disconnect network (or simulate error)
2. Try to submit order
3. Verify error handling

**Expected Result:**
- Error message displays
- User-friendly error message
- Form state preserved
- Can retry submission

---

### TC-OM-030: Order Submission Loading State
**Priority:** Low  
**Type:** UX

**Test Steps:**
1. Click "Submit Order"
2. Verify loading state
3. Verify button disabled during submission

**Expected Result:**
- Loading spinner shows
- Button shows "Submitting..."
- Button disabled during submission
- Cannot double-submit

---

## Test Suite 7: Order Book

### TC-OM-031: Order Book Loading
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to Order Book tab
2. Wait for orders to load
3. Verify order list displays

**Expected Result:**
- Orders load without errors
- Loading skeleton shows
- Orders display correctly
- Summary cards show correct counts

---

### TC-OM-032: Order Book Search
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Enter search query (order ID or scheme name)
2. Verify filtered results
3. Clear search
4. Verify all orders display

**Expected Result:**
- Search filters correctly
- Results update in real-time
- Search works for order ID and scheme names

---

### TC-OM-033: Order Book Status Filter
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Select status filter (e.g., "Pending Approval")
2. Verify only orders with that status display
3. Select "All Statuses"
4. Verify all orders display

**Expected Result:**
- Status filter works correctly
- Only matching orders display

---

### TC-OM-034: Order Book Date Filter
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Select date range (Today, Last 7 Days, Last 30 Days)
2. Verify filtered results
3. Select "All Time"
4. Verify all orders display

**Expected Result:**
- Date filter works correctly
- Only orders in date range display

---

### TC-OM-035: View Order Details
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Click "View Details" on an order
2. Verify order details dialog opens
3. Verify all information displays:
   - Order summary
   - Cart items
   - Transaction mode
   - Nominees
   - Payment information
4. Close dialog

**Expected Result:**
- Dialog opens correctly
- All order information displays
- Full Switch/Redemption data shows (if applicable)
- Dialog closes properly

---

### TC-OM-036: Authorize Order
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Order with status "Pending" or "Pending Approval"

**Test Steps:**
1. Click "Authorize" button
2. Verify authorization dialog opens
3. Review order details
4. Click "Approve" or "Reject"
5. If reject, provide reason
6. Submit authorization

**Expected Result:**
- Authorization dialog opens
- Order details display
- Can approve or reject
- Rejection requires reason
- Order status updates
- Success message displays

---

### TC-OM-037: Download Order Details
**Priority:** Low  
**Type:** Functional

**Test Steps:**
1. Click "Download" on an order
2. Verify file downloads
3. Verify file contains order data

**Expected Result:**
- File downloads successfully
- File format is correct (JSON/PDF)
- File contains all order information

---

### TC-OM-038: Export Filtered Orders
**Priority:** Low  
**Type:** Functional

**Test Steps:**
1. Apply filters (status, date range)
2. Click "Export" button
3. Verify export file downloads
4. Verify file contains only filtered orders

**Expected Result:**
- Export works correctly
- File contains filtered orders only
- Export includes filter metadata

---

## Test Suite 8: Full Switch/Redemption

### TC-OM-039: Full Switch Read-Only Display
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Order with Full Switch transaction

**Test Steps:**
1. View order details
2. Verify Full Switch panel displays
3. Verify all fields are read-only
4. Verify "Close AC = Y" flag displays

**Expected Result:**
- Full Switch panel displays
- All fields are read-only
- Close AC flag shows correctly
- Cannot edit fields

---

### TC-OM-040: Full Redemption Read-Only Display
**Priority:** High  
**Type:** Functional

**Preconditions:**
- Order with Full Redemption transaction

**Test Steps:**
1. View order details
2. Verify Full Redemption panel displays
3. Verify all fields are read-only
4. Verify "Close AC = Y" flag displays

**Expected Result:**
- Full Redemption panel displays
- All fields are read-only
- Close AC flag shows correctly
- Cannot edit fields

---

### TC-OM-041: Full Switch Bypass Min Validation
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Create Full Switch order
2. Verify min validation is bypassed
3. Submit order
4. Verify order submits successfully

**Expected Result:**
- Min validation bypassed for Full Switch
- Order can be submitted
- No validation errors for min amount

---

### TC-OM-042: Full Redemption Bypass Min Validation
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Create Full Redemption order
2. Verify min validation is bypassed
3. Submit order
4. Verify order submits successfully

**Expected Result:**
- Min validation bypassed for Full Redemption
- Order can be submitted
- No validation errors for min amount

---

## Test Suite 9: Error Handling & Edge Cases

### TC-OM-043: API Error Handling
**Priority:** Medium  
**Type:** Error Handling

**Test Steps:**
1. Simulate API error (500, 404, network error)
2. Verify error messages display
3. Verify user can retry

**Expected Result:**
- User-friendly error messages
- Error states display correctly
- Retry functionality works

---

### TC-OM-044: Empty Product List
**Priority:** Low  
**Type:** Edge Case

**Test Steps:**
1. Simulate empty product list from API
2. Verify empty state displays
3. Verify appropriate message

**Expected Result:**
- Empty state displays
- User-friendly message
- No errors in console

---

### TC-OM-045: Large Cart (10+ Items)
**Priority:** Low  
**Type:** Performance

**Test Steps:**
1. Add 10+ products to cart
2. Verify cart performance
3. Verify all items display
4. Verify calculations are correct

**Expected Result:**
- Cart handles large number of items
- Performance is acceptable
- All calculations correct

---

### TC-OM-046: Special Characters in Search
**Priority:** Low  
**Type:** Edge Case

**Test Steps:**
1. Enter special characters in search
2. Verify search handles correctly
3. Verify no errors occur

**Expected Result:**
- Search handles special characters
- No errors or crashes
- Results filter correctly

---

## Test Suite 10: Responsive Design

### TC-OM-047: Mobile View
**Priority:** Medium  
**Type:** Responsive

**Test Steps:**
1. Resize browser to mobile (< 768px)
2. Navigate to Order Management
3. Verify layout adapts
4. Test all interactions

**Expected Result:**
- Layout is mobile-friendly
- All buttons are accessible
- Forms are usable
- No horizontal scrolling

---

### TC-OM-048: Tablet View
**Priority:** Low  
**Type:** Responsive

**Test Steps:**
1. Resize browser to tablet (768px - 1024px)
2. Verify layout adapts
3. Test all interactions

**Expected Result:**
- Layout adapts correctly
- All features accessible
- Good user experience

---

## Test Execution Summary

### Test Results Template

**Date:** _______________  
**Tester:** Agent A  
**Environment:** Local / Staging

**Summary:**
- Total Test Cases: 48
- Passed: ___
- Failed: ___
- Blocked: ___
- Not Tested: ___

**Critical Issues:**
1. 
2. 
3. 

**Notes:**
_________________________________________________________________
_________________________________________________________________

