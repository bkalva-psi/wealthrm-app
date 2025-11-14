# Phase 2: Validation & Submit Flow - Test Cases

## Overview
This document contains comprehensive test cases for Phase 2 implementation covering:
- Frontend validation (CRISIL min/max, amount-based limits, EUIN, PAN, Nominee %, Full Redemption/Full Switch)
- Order submission API integration
- Success and error handling

**Reference Documents:**
- BRD: `BRD_ORDER_MANAGEMENT.md`
- BRD v1.0: `BRD_MF_Order_Lifecycle_v1.0.md`

---

## Test Case Categories

### Category 1: CRISIL Min/Max Purchase Validation
### Category 2: CRISIL Min/Max Redemption Validation
### Category 3: Amount-Based Limits (Market Value)
### Category 4: EUIN Validation
### Category 5: PAN Validation
### Category 6: Nominee Percentage Validation
### Category 7: Full Redemption/Full Switch Rules
### Category 8: Order Submission API Integration
### Category 9: Success Response Handling
### Category 10: Error Response Handling
### Category 11: Integration & Edge Cases

---

## Category 1: CRISIL Min/Max Purchase Validation

### TC-P2-001: Purchase Amount Below Minimum Investment
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- Product with `minInvestment = ₹5,000` exists in cart
- User is on Order Management page
- Cart contains purchase transaction

**Test Steps:**
1. Add product to cart with transaction type "Purchase"
2. Enter amount: ₹4,000 (below minimum)
3. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Item 1 (Scheme Name): Amount ₹4,000 is below minimum investment of ₹5,000"
- Submit button disabled or submission blocked
- Error message visible in validation summary
- Order not submitted to API

**Validation Function:** `validateMinInvestment()`, `validateCartItemWithProduct()`

---

### TC-P2-002: Purchase Amount Above Maximum Investment
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- Product with `maxInvestment = ₹10,00,000` exists in cart
- User is on Order Management page
- Cart contains purchase transaction

**Test Steps:**
1. Add product to cart with transaction type "Purchase"
2. Enter amount: ₹12,00,000 (above maximum)
3. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Item 1 (Scheme Name): Amount ₹12,00,000 exceeds maximum investment of ₹10,00,000"
- Submit button disabled or submission blocked
- Error message visible in validation summary
- Order not submitted to API

**Validation Function:** `validateMaxInvestment()`, `validateCartItemWithProduct()`

---

### TC-P2-003: Purchase Amount Within Valid Range
**Priority:** High  
**Type:** Validation Success

**Preconditions:**
- Product with `minInvestment = ₹5,000`, `maxInvestment = ₹10,00,000` exists in cart
- User is on Order Management page
- Cart contains purchase transaction

**Test Steps:**
1. Add product to cart with transaction type "Purchase"
2. Enter amount: ₹50,000 (within range)
3. Click "Submit Order" button

**Expected Result:**
- No validation errors for CRISIL min/max
- Validation passes
- Order proceeds to submission

**Validation Function:** `validateMinInvestment()`, `validateMaxInvestment()`

---

### TC-P2-004: Purchase Amount Exactly at Minimum
**Priority:** Medium  
**Type:** Validation Success (Boundary)

**Preconditions:**
- Product with `minInvestment = ₹5,000` exists in cart
- User is on Order Management page

**Test Steps:**
1. Add product to cart with transaction type "Purchase"
2. Enter amount: ₹5,000 (exactly minimum)
3. Click "Submit Order" button

**Expected Result:**
- No validation error
- Validation passes
- Order proceeds to submission

**Validation Function:** `validateMinInvestment()`

---

### TC-P2-005: Purchase Amount Exactly at Maximum
**Priority:** Medium  
**Type:** Validation Success (Boundary)

**Preconditions:**
- Product with `maxInvestment = ₹10,00,000` exists in cart
- User is on Order Management page

**Test Steps:**
1. Add product to cart with transaction type "Purchase"
2. Enter amount: ₹10,00,000 (exactly maximum)
3. Click "Submit Order" button

**Expected Result:**
- No validation error
- Validation passes
- Order proceeds to submission

**Validation Function:** `validateMaxInvestment()`

---

### TC-P2-006: Multiple Cart Items with Different Min/Max Rules
**Priority:** High  
**Type:** Validation Error (Multiple Items)

**Preconditions:**
- Product A: `minInvestment = ₹5,000`, `maxInvestment = ₹10,00,000`
- Product B: `minInvestment = ₹10,000`, `maxInvestment = ₹5,00,000`
- User is on Order Management page

**Test Steps:**
1. Add Product A to cart with amount ₹4,000 (below min)
2. Add Product B to cart with amount ₹6,00,000 (above max)
3. Click "Submit Order" button

**Expected Result:**
- Multiple validation errors displayed:
  - "Item 1 (Product A): Amount ₹4,000 is below minimum investment of ₹5,000"
  - "Item 2 (Product B): Amount ₹6,00,000 exceeds maximum investment of ₹5,00,000"
- All errors visible in validation summary
- Order not submitted

**Validation Function:** `validateOrderWithProducts()`

---

## Category 2: CRISIL Min/Max Redemption Validation

### TC-P2-007: Redemption Amount Below Minimum Redemption
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- Product with `minRedemption = ₹1,000` exists in cart
- User is on Order Management page
- Cart contains redemption transaction

**Test Steps:**
1. Add product to cart with transaction type "Redemption"
2. Enter amount: ₹500 (below minimum redemption)
3. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Item 1 (Scheme Name): Amount ₹500 is below minimum redemption of ₹1,000"
- Submit button disabled or submission blocked
- Order not submitted to API

**Note:** This assumes `minRedemption` field exists in Product schema. If not, use `minInvestment` for redemption validation.

---

### TC-P2-008: Redemption Amount Above Maximum Redemption
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- Product with `maxRedemption = ₹5,00,000` exists in cart
- User is on Order Management page
- Cart contains redemption transaction

**Test Steps:**
1. Add product to cart with transaction type "Redemption"
2. Enter amount: ₹6,00,000 (above maximum redemption)
3. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Item 1 (Scheme Name): Amount ₹6,00,000 exceeds maximum redemption of ₹5,00,000"
- Submit button disabled or submission blocked
- Order not submitted to API

---

### TC-P2-009: Redemption Amount Within Valid Range
**Priority:** High  
**Type:** Validation Success

**Preconditions:**
- Product with `minRedemption = ₹1,000`, `maxRedemption = ₹5,00,000` exists in cart
- User is on Order Management page
- Cart contains redemption transaction

**Test Steps:**
1. Add product to cart with transaction type "Redemption"
2. Enter amount: ₹50,000 (within range)
3. Click "Submit Order" button

**Expected Result:**
- No validation errors for CRISIL min/max redemption
- Validation passes
- Order proceeds to submission

---

## Category 3: Amount-Based Limits (Market Value)

### TC-P2-010: Redemption Amount Exceeds Market Value
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- Product exists in cart with transaction type "Redemption"
- Market value for product: ₹1,00,000
- User is on Order Management page

**Test Steps:**
1. Add product to cart with transaction type "Redemption"
2. Enter amount: ₹1,50,000 (exceeds market value)
3. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Item 1 (Scheme Name): Amount cannot exceed market value of ₹1,00,000"
- Submit button disabled or submission blocked
- Hard stop - order cannot proceed
- Order not submitted to API

**Validation Function:** `validateAmountBasedEntry()`

---

### TC-P2-011: Redemption Amount Within Market Value
**Priority:** High  
**Type:** Validation Success

**Preconditions:**
- Product exists in cart with transaction type "Redemption"
- Market value for product: ₹1,00,000
- User is on Order Management page

**Test Steps:**
1. Add product to cart with transaction type "Redemption"
2. Enter amount: ₹75,000 (within market value)
3. Click "Submit Order" button

**Expected Result:**
- No validation error for market value
- Validation passes
- Order proceeds to submission

**Validation Function:** `validateAmountBasedEntry()`

---

### TC-P2-012: Redemption Amount Exactly at Market Value
**Priority:** Medium  
**Type:** Validation Success (Boundary)

**Preconditions:**
- Product exists in cart with transaction type "Redemption"
- Market value for product: ₹1,00,000
- User is on Order Management page

**Test Steps:**
1. Add product to cart with transaction type "Redemption"
2. Enter amount: ₹1,00,000 (exactly market value)
3. Click "Submit Order" button

**Expected Result:**
- No validation error
- Validation passes
- Order proceeds to submission

**Validation Function:** `validateAmountBasedEntry()`

---

### TC-P2-013: Switch Amount Exceeds Market Value
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- Product exists in cart with transaction type "Switch"
- Market value for product: ₹2,00,000
- User is on Order Management page

**Test Steps:**
1. Add product to cart with transaction type "Switch"
2. Enter amount: ₹2,50,000 (exceeds market value)
3. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Item 1 (Scheme Name): Amount cannot exceed market value of ₹2,00,000"
- Submit button disabled or submission blocked
- Order not submitted to API

**Validation Function:** `validateAmountBasedEntry()`

---

### TC-P2-014: Purchase Amount Not Validated Against Market Value
**Priority:** Medium  
**Type:** Validation Behavior

**Preconditions:**
- Product exists in cart with transaction type "Purchase"
- Market value for product: ₹1,00,000
- User is on Order Management page

**Test Steps:**
1. Add product to cart with transaction type "Purchase"
2. Enter amount: ₹2,00,000 (exceeds market value, but purchase should not check market value)
3. Click "Submit Order" button

**Expected Result:**
- No market value validation error (purchase transactions don't check market value)
- Only CRISIL min/max validation applies
- Order proceeds if CRISIL validations pass

**Note:** Amount-based validation only applies to Redemption/Switch transactions per BRD.

---

## Category 4: EUIN Validation

### TC-P2-015: Valid EUIN Format
**Priority:** High  
**Type:** Validation Success

**Preconditions:**
- User is on Order Management page
- Transaction Mode form is visible

**Test Steps:**
1. Enter EUIN: "E123456"
2. Click "Submit Order" button

**Expected Result:**
- No validation error for EUIN
- EUIN accepted
- Order proceeds to submission

**Validation Function:** `validateEUIN()`

**Valid Formats:**
- E + 6 alphanumeric characters
- Examples: E123456, EABCDEF, E12AB34

---

### TC-P2-016: Invalid EUIN Format - Missing 'E' Prefix
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Transaction Mode form is visible

**Test Steps:**
1. Enter EUIN: "123456" (missing E prefix)
2. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "EUIN must be in format: E followed by 6 alphanumeric characters"
- Submit button disabled or submission blocked
- Order not submitted

**Validation Function:** `validateEUIN()`

---

### TC-P2-017: Invalid EUIN Format - Wrong Length
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Transaction Mode form is visible

**Test Steps:**
1. Enter EUIN: "E12345" (only 5 characters after E)
2. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "EUIN must be in format: E followed by 6 alphanumeric characters"
- Submit button disabled or submission blocked
- Order not submitted

**Validation Function:** `validateEUIN()`

---

### TC-P2-018: Invalid EUIN Format - Special Characters
**Priority:** Medium  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Transaction Mode form is visible

**Test Steps:**
1. Enter EUIN: "E12345@" (contains special character)
2. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "EUIN must be in format: E followed by 6 alphanumeric characters"
- Submit button disabled or submission blocked
- Order not submitted

**Validation Function:** `validateEUIN()`

---

### TC-P2-019: Empty EUIN (Optional Field)
**Priority:** Medium  
**Type:** Validation Success

**Preconditions:**
- User is on Order Management page
- Transaction Mode form is visible

**Test Steps:**
1. Leave EUIN field empty
2. Click "Submit Order" button

**Expected Result:**
- No validation error (EUIN is optional)
- Order proceeds to submission

**Validation Function:** `validateEUIN()`

---

## Category 5: PAN Validation

### TC-P2-020: Valid PAN Format
**Priority:** High  
**Type:** Validation Success

**Preconditions:**
- User is on Order Management page
- Nominee form is visible
- Nominee not opted out

**Test Steps:**
1. Add nominee
2. Enter PAN: "ABCDE1234F"
3. Click "Submit Order" button

**Expected Result:**
- No validation error for PAN
- PAN accepted
- Order proceeds to submission

**Validation Function:** `validatePAN()`

**Valid Format:**
- 5 uppercase letters + 4 digits + 1 uppercase letter
- Example: ABCDE1234F

---

### TC-P2-021: Invalid PAN Format - Wrong Pattern
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Nominee form is visible
- Nominee not opted out

**Test Steps:**
1. Add nominee
2. Enter PAN: "ABCD1234F" (only 4 letters instead of 5)
3. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Nominee 1: PAN must be in format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)"
- Submit button disabled or submission blocked
- Order not submitted

**Validation Function:** `validatePAN()`

---

### TC-P2-022: Invalid PAN Format - Lowercase Letters
**Priority:** Medium  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Nominee form is visible
- Nominee not opted out

**Test Steps:**
1. Add nominee
2. Enter PAN: "abcde1234f" (lowercase)
3. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Nominee 1: PAN must be in format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)"
- Submit button disabled or submission blocked
- Order not submitted

**Validation Function:** `validatePAN()`

---

### TC-P2-023: Missing PAN (Required Field)
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Nominee form is visible
- Nominee not opted out

**Test Steps:**
1. Add nominee
2. Leave PAN field empty
3. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Nominee 1: PAN is required"
- Submit button disabled or submission blocked
- Order not submitted

**Validation Function:** `validatePAN()`

---

### TC-P2-024: Guardian PAN Validation for Minor Nominee
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Nominee form is visible
- Nominee not opted out
- Nominee is minor (age < 18)

**Test Steps:**
1. Add nominee with date of birth indicating minor
2. Enter invalid Guardian PAN: "ABCD1234F"
3. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Nominee 1: Guardian PAN must be in format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)"
- Submit button disabled or submission blocked
- Order not submitted

**Validation Function:** `validateGuardianInfo()`, `validatePAN()`

---

### TC-P2-025: Missing Guardian PAN for Minor Nominee
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Nominee form is visible
- Nominee not opted out
- Nominee is minor (age < 18)

**Test Steps:**
1. Add nominee with date of birth indicating minor
2. Leave Guardian PAN field empty
3. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Nominee 1: Guardian PAN is required for minor nominees"
- Submit button disabled or submission blocked
- Order not submitted

**Validation Function:** `validateGuardianInfo()`

---

## Category 6: Nominee Percentage Validation

### TC-P2-026: Nominee Percentages Total Exactly 100%
**Priority:** High  
**Type:** Validation Success

**Preconditions:**
- User is on Order Management page
- Nominee form is visible
- Nominee not opted out

**Test Steps:**
1. Add Nominee 1 with percentage: 60%
2. Add Nominee 2 with percentage: 40%
3. Total: 100%
4. Click "Submit Order" button

**Expected Result:**
- No validation error for nominee percentages
- Validation passes
- Order proceeds to submission

**Validation Function:** `validateNomineePercentages()`

---

### TC-P2-027: Nominee Percentages Total Less Than 100%
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Nominee form is visible
- Nominee not opted out

**Test Steps:**
1. Add Nominee 1 with percentage: 60%
2. Add Nominee 2 with percentage: 30%
3. Total: 90%
4. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Nominee percentages must total exactly 100%. Current total: 90%"
- Submit button disabled or submission blocked
- Order not submitted

**Validation Function:** `validateNomineePercentages()`

---

### TC-P2-028: Nominee Percentages Total More Than 100%
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Nominee form is visible
- Nominee not opted out

**Test Steps:**
1. Add Nominee 1 with percentage: 60%
2. Add Nominee 2 with percentage: 50%
3. Total: 110%
4. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Nominee percentages must total exactly 100%. Current total: 110%"
- Submit button disabled or submission blocked
- Order not submitted

**Validation Function:** `validateNomineePercentages()`

---

### TC-P2-029: Single Nominee with 100%
**Priority:** Medium  
**Type:** Validation Success

**Preconditions:**
- User is on Order Management page
- Nominee form is visible
- Nominee not opted out

**Test Steps:**
1. Add Nominee 1 with percentage: 100%
2. Click "Submit Order" button

**Expected Result:**
- No validation error
- Validation passes
- Order proceeds to submission

**Validation Function:** `validateNomineePercentages()`

---

### TC-P2-030: Negative Nominee Percentage
**Priority:** Medium  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Nominee form is visible
- Nominee not opted out

**Test Steps:**
1. Add Nominee 1 with percentage: -10%
2. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Nominee 1 percentage cannot be negative"
- Submit button disabled or submission blocked
- Order not submitted

**Validation Function:** `validateNomineePercentages()`

---

### TC-P2-031: Nominee Percentage Exceeds 100%
**Priority:** Medium  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Nominee form is visible
- Nominee not opted out

**Test Steps:**
1. Add Nominee 1 with percentage: 150%
2. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Nominee 1 percentage cannot exceed 100%"
- Submit button disabled or submission blocked
- Order not submitted

**Validation Function:** `validateNomineePercentages()`

---

### TC-P2-032: Opt Out of Nomination (No Nominees Required)
**Priority:** High  
**Type:** Validation Success

**Preconditions:**
- User is on Order Management page
- Nominee form is visible

**Test Steps:**
1. Check "Opt out of nomination" checkbox
2. Do not add any nominees
3. Click "Submit Order" button

**Expected Result:**
- No validation error for nominees
- Validation passes (nominee validation skipped)
- Order proceeds to submission

**Validation Function:** `validateOrderWithProducts()`

---

## Category 7: Full Redemption/Full Switch Rules

### TC-P2-033: Full Redemption Bypasses Min/Max Validation
**Priority:** High  
**Type:** Validation Success (Special Rule)

**Preconditions:**
- Product with `minInvestment = ₹5,000`, `maxInvestment = ₹10,00,000` exists in cart
- User is on Order Management page
- Cart contains Full Redemption transaction

**Test Steps:**
1. Add product to cart with transaction type "Full Redemption"
2. Enter amount: ₹1,000 (below minimum, but Full Redemption bypasses)
3. Click "Submit Order" button

**Expected Result:**
- No CRISIL min/max validation error (bypassed for Full Redemption)
- Validation passes for Full Redemption
- Order proceeds to submission
- `closeAc` flag should be set to `true` in order data

**Validation Function:** `isFullRedemptionOrSwitch()`, `validateCartItemWithProduct()`

**Note:** Per BRD, Full Redemption/Switch bypasses min validations and sets `closeAc = Y`.

---

### TC-P2-034: Full Switch Bypasses Min/Max Validation
**Priority:** High  
**Type:** Validation Success (Special Rule)

**Preconditions:**
- Product with `minInvestment = ₹5,000`, `maxInvestment = ₹10,00,000` exists in cart
- User is on Order Management page
- Cart contains Full Switch transaction

**Test Steps:**
1. Add product to cart with transaction type "Full Switch"
2. Enter amount: ₹1,000 (below minimum, but Full Switch bypasses)
3. Click "Submit Order" button

**Expected Result:**
- No CRISIL min/max validation error (bypassed for Full Switch)
- Validation passes for Full Switch
- Order proceeds to submission
- `closeAc` flag should be set to `true` in order data

**Validation Function:** `isFullRedemptionOrSwitch()`, `validateCartItemWithProduct()`

---

### TC-P2-035: Full Redemption/Switch Close Account Warning
**Priority:** Medium  
**Type:** Validation Warning

**Preconditions:**
- Product exists in cart with transaction type "Full Redemption" or "Full Switch"
- User is on Order Management page

**Test Steps:**
1. Add product to cart with transaction type "Full Redemption"
2. Ensure `closeAc` is not set to `true`
3. Click "Submit Order" button

**Expected Result:**
- Warning displayed: "Item 1: Full Redemption should have Close Account flag set"
- Warning does not block submission
- Order proceeds to submission (warning only)

**Validation Function:** `validateCartItemWithProduct()`

---

### TC-P2-036: Full Redemption/Switch Read-Only Display
**Priority:** Medium  
**Type:** UI Behavior

**Preconditions:**
- Product exists in cart with transaction type "Full Redemption" or "Full Switch"
- User is on Order Management page

**Test Steps:**
1. Add product to cart with transaction type "Full Redemption"
2. View Product Cart component
3. Check Full Redemption fields display

**Expected Result:**
- Full Redemption/Switch fields displayed as read-only in UI
- Fields visible but not editable
- Per BRD: "Display Full Switch/Full Redemption fields as read-only in Product Cart and Order Book"

---

## Category 8: Order Submission API Integration

### TC-P2-037: Submit Order with Valid Data
**Priority:** Critical  
**Type:** API Integration

**Preconditions:**
- All validations pass
- Cart contains valid items
- Nominees valid (or opted out)
- User is on Order Management page

**Test Steps:**
1. Fill all required fields with valid data
2. Ensure all validations pass
3. Click "Submit Order" button
4. Monitor network request

**Expected Result:**
- API call made to `POST /api/order-management/orders/submit`
- Request payload includes:
  - `cartItems` array
  - `transactionMode` object
  - `nominees` array (or empty if opted out)
  - `optOutOfNomination` boolean
  - `fullSwitchData` (if applicable)
  - `fullRedemptionData` (if applicable)
- Request headers include `Content-Type: application/json`
- Loading state shown during submission

**API Endpoint:** `/api/order-management/orders/submit`

---

### TC-P2-038: Submit Order Request Payload Structure
**Priority:** High  
**Type:** API Integration

**Preconditions:**
- All validations pass
- User is on Order Management page

**Test Steps:**
1. Fill form with valid data
2. Open browser DevTools Network tab
3. Click "Submit Order" button
4. Inspect request payload

**Expected Result:**
- Request payload structure:
```json
{
  "cartItems": [
    {
      "productId": 1,
      "schemeName": "Scheme Name",
      "amount": 50000,
      "transactionType": "Purchase",
      "closeAc": false
    }
  ],
  "transactionMode": {
    "mode": "Physical",
    "euin": "E123456",
    "branchCode": "BR001"
  },
  "nominees": [
    {
      "name": "Nominee Name",
      "pan": "ABCDE1234F",
      "percentage": 100,
      "relationship": "Spouse",
      "dateOfBirth": "1990-01-01"
    }
  ],
  "optOutOfNomination": false,
  "fullSwitchData": null,
  "fullRedemptionData": null
}
```

---

### TC-P2-039: Submit Button Disabled During Submission
**Priority:** Medium  
**Type:** UI Behavior

**Preconditions:**
- User is on Order Management page
- Form is ready for submission

**Test Steps:**
1. Click "Submit Order" button
2. Observe button state during API call

**Expected Result:**
- Submit button disabled immediately after click
- Button shows loading state (spinner or "Submitting..." text)
- Button remains disabled until response received
- Prevents duplicate submissions

---

### TC-P2-040: Submit Button Disabled When Validation Errors Exist
**Priority:** High  
**Type:** UI Behavior

**Preconditions:**
- User is on Order Management page
- Form has validation errors

**Test Steps:**
1. Enter invalid data (e.g., amount below minimum)
2. Observe submit button state

**Expected Result:**
- Submit button disabled when validation errors exist
- Button tooltip or message indicates why submission is blocked
- Button enabled only when all validations pass

---

## Category 9: Success Response Handling

### TC-P2-041: Successful Order Submission - Confirmation Display
**Priority:** Critical  
**Type:** Success Handling

**Preconditions:**
- All validations pass
- API returns success response
- User is on Order Management page

**Test Steps:**
1. Fill form with valid data
2. Click "Submit Order" button
3. Wait for API response

**Expected Result:**
- Success toast/notification displayed:
  - Title: "Order Submitted Successfully"
  - Description: "Order {modelOrderId} has been submitted and is pending approval."
- Form reset (cart cleared, fields cleared)
- Navigation to Order Book tab (or confirmation page)
- Loading state removed

**API Response Structure:**
```json
{
  "id": 12345,
  "modelOrderId": "MO-20250113-ABC12",
  "status": "Pending Approval",
  "createdAt": "2025-01-13T10:30:00Z"
}
```

---

### TC-P2-042: Successful Order Submission - Form Reset
**Priority:** High  
**Type:** Success Handling

**Preconditions:**
- Order submission successful
- User is on Order Management page

**Test Steps:**
1. Fill form with data
2. Submit order successfully
3. Observe form state after submission

**Expected Result:**
- Cart items cleared: `cartItems = []`
- Transaction mode reset: `transactionMode = null`
- Nominees cleared: `nominees = []`
- Opt-out flag reset: `optOutOfNomination = false`
- Full switch/redemption data cleared
- Form ready for new order

---

### TC-P2-043: Successful Order Submission - Navigation
**Priority:** High  
**Type:** Success Handling

**Preconditions:**
- Order submission successful
- User is on Order Management page

**Test Steps:**
1. Fill form with data
2. Submit order successfully
3. Observe navigation behavior

**Expected Result:**
- Active tab switched to "Order Book" tab
- OR redirect to order confirmation page: `/order-management/orders/{orderId}`
- User can view submitted order in Order Book

---

### TC-P2-044: Successful Order Submission - Model Order ID Display
**Priority:** High  
**Type:** Success Handling

**Preconditions:**
- Order submission successful
- API returns `modelOrderId`

**Test Steps:**
1. Submit order successfully
2. Check success message

**Expected Result:**
- Success message includes `modelOrderId` from API response
- Format: "Order MO-20250113-ABC12 has been submitted..."
- Model Order ID format: `MO-YYYYMMDD-XXXXX`

---

## Category 10: Error Response Handling

### TC-P2-045: API Error - Validation Error Response
**Priority:** Critical  
**Type:** Error Handling

**Preconditions:**
- User is on Order Management page
- API returns validation error

**Test Steps:**
1. Fill form with data that passes frontend validation
2. Click "Submit Order" button
3. API returns 400 with validation errors

**Expected Result:**
- Error toast/notification displayed:
  - Title: "Submission Failed"
  - Description: Error message from API response
  - Variant: "destructive" (red/error styling)
- Validation errors from API displayed in UI
- Form remains populated (not reset)
- Loading state removed
- Submit button re-enabled

**API Error Response Structure:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Cart cannot be empty",
    "Transaction mode must be selected"
  ]
}
```

---

### TC-P2-046: API Error - Server Error (500)
**Priority:** High  
**Type:** Error Handling

**Preconditions:**
- User is on Order Management page
- API returns 500 server error

**Test Steps:**
1. Fill form with valid data
2. Click "Submit Order" button
3. API returns 500 error

**Expected Result:**
- Error toast displayed:
  - Title: "Submission Failed"
  - Description: "Failed to submit order. Please try again." (or API error message)
  - Variant: "destructive"
- Form remains populated
- Loading state removed
- Submit button re-enabled
- User can retry submission

---

### TC-P2-047: API Error - Network Error
**Priority:** High  
**Type:** Error Handling

**Preconditions:**
- User is on Order Management page
- Network connection fails

**Test Steps:**
1. Fill form with valid data
2. Disconnect network
3. Click "Submit Order" button

**Expected Result:**
- Error toast displayed:
  - Title: "Submission Failed"
  - Description: "Network error. Please check your connection and try again."
  - Variant: "destructive"
- Form remains populated
- Loading state removed
- Submit button re-enabled
- User can retry when connection restored

---

### TC-P2-048: API Error - Timeout
**Priority:** Medium  
**Type:** Error Handling

**Preconditions:**
- User is on Order Management page
- API request times out

**Test Steps:**
1. Fill form with valid data
2. Click "Submit Order" button
3. Wait for timeout (e.g., 30 seconds)

**Expected Result:**
- Error toast displayed:
  - Title: "Submission Failed"
  - Description: "Request timed out. Please try again."
  - Variant: "destructive"
- Form remains populated
- Loading state removed
- Submit button re-enabled
- User can retry submission

---

### TC-P2-049: API Error - Unauthorized (401)
**Priority:** High  
**Type:** Error Handling

**Preconditions:**
- User is on Order Management page
- Session expired or unauthorized

**Test Steps:**
1. Fill form with valid data
2. Click "Submit Order" button
3. API returns 401 Unauthorized

**Expected Result:**
- Error toast displayed:
  - Title: "Authentication Required"
  - Description: "Your session has expired. Please log in again."
  - Variant: "destructive"
- Redirect to login page (if applicable)
- Form remains populated (may be lost on redirect)

---

### TC-P2-050: API Error - Multiple Validation Errors Display
**Priority:** Medium  
**Type:** Error Handling

**Preconditions:**
- User is on Order Management page
- API returns multiple validation errors

**Test Steps:**
1. Fill form with invalid data
2. Click "Submit Order" button
3. API returns multiple errors

**Expected Result:**
- All validation errors displayed in error message
- Errors listed clearly (bullet points or numbered list)
- Each error message is specific and actionable
- User can address each error

**API Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Item 1: Amount is below minimum investment",
    "Nominee percentages must total 100%",
    "EUIN format is invalid"
  ]
}
```

---

## Category 11: Integration & Edge Cases

### TC-P2-051: Combined Validation - Multiple Errors
**Priority:** High  
**Type:** Integration

**Preconditions:**
- User is on Order Management page
- Form has multiple validation issues

**Test Steps:**
1. Add product with amount below minimum
2. Enter invalid EUIN
3. Add nominee with invalid PAN
4. Set nominee percentages to 90%
5. Click "Submit Order" button

**Expected Result:**
- All validation errors displayed:
  - CRISIL min/max error
  - EUIN format error
  - PAN format error
  - Nominee percentage error
- All errors visible in validation summary
- Order not submitted
- Submit button disabled

---

### TC-P2-052: Real-Time Validation Feedback
**Priority:** Medium  
**Type:** UX Enhancement

**Preconditions:**
- User is on Order Management page
- Form fields are being filled

**Test Steps:**
1. Enter amount below minimum
2. Observe validation feedback
3. Correct amount to valid value
4. Observe validation feedback

**Expected Result:**
- Validation errors displayed immediately (or on blur)
- Error messages clear when field becomes valid
- Visual indicators (red border, error icon) for invalid fields
- Submit button state updates based on validation status

---

### TC-P2-053: Empty Cart Validation
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Cart is empty

**Test Steps:**
1. Ensure cart is empty
2. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Cart cannot be empty"
- Submit button disabled
- Order not submitted

**Validation Function:** `validateOrderWithProducts()`

---

### TC-P2-054: Missing Transaction Mode
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Cart has items
- Transaction mode not selected

**Test Steps:**
1. Add items to cart
2. Do not select transaction mode
3. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Transaction mode must be selected"
- Submit button disabled
- Order not submitted

**Note:** This may be handled by frontend validation or API validation.

---

### TC-P2-055: Market Value Not Available
**Priority:** Medium  
**Type:** Edge Case

**Preconditions:**
- User is on Order Management page
- Cart contains redemption transaction
- Market value data not available

**Test Steps:**
1. Add product to cart with transaction type "Redemption"
2. Market value API returns null/undefined
3. Enter redemption amount
4. Click "Submit Order" button

**Expected Result:**
- Market value validation skipped (no error if data unavailable)
- Other validations still apply
- Order proceeds if other validations pass
- OR warning displayed: "Market value not available. Proceeding with caution."

**Validation Function:** `validateAmountBasedEntry()`

---

### TC-P2-056: Product Data Not Available
**Priority:** High  
**Type:** Validation Error

**Preconditions:**
- User is on Order Management page
- Cart contains item with missing product data

**Test Steps:**
1. Add product to cart
2. Product data becomes unavailable (e.g., API error)
3. Click "Submit Order" button

**Expected Result:**
- Validation error displayed: "Item 1: Product information not available"
- Submit button disabled
- Order not submitted

**Validation Function:** `validateCartItemWithProduct()`

---

### TC-P2-057: Concurrent Submission Prevention
**Priority:** Medium  
**Type:** Edge Case

**Preconditions:**
- User is on Order Management page
- Form is ready for submission

**Test Steps:**
1. Click "Submit Order" button
2. Immediately click "Submit Order" button again (before first request completes)

**Expected Result:**
- Second click ignored (button disabled)
- Only one API request sent
- No duplicate orders created

---

### TC-P2-058: Form State Persistence on Error
**Priority:** Medium  
**Type:** UX Behavior

**Preconditions:**
- User is on Order Management page
- Order submission fails

**Test Steps:**
1. Fill form with data
2. Submit order
3. Receive error response
4. Check form state

**Expected Result:**
- All form data preserved (cart items, nominees, transaction mode)
- User can correct errors and resubmit
- No data loss on error

---

### TC-P2-059: Validation Summary Display
**Priority:** Medium  
**Type:** UX Enhancement

**Preconditions:**
- User is on Order Management page
- Form has validation errors

**Test Steps:**
1. Fill form with multiple validation errors
2. Click "Submit Order" button
3. Observe validation summary

**Expected Result:**
- Validation summary panel displayed (if implemented)
- All errors listed in one place
- Errors grouped by category (Cart, Nominees, Transaction Mode, etc.)
- Clickable links to navigate to error fields (if implemented)

---

### TC-P2-060: Loading State During Validation
**Priority:** Low  
**Type:** UX Behavior

**Preconditions:**
- User is on Order Management page
- Validation requires async data (e.g., market values)

**Test Steps:**
1. Add redemption item to cart
2. Market value API call in progress
3. Click "Submit Order" button

**Expected Result:**
- Loading indicator shown while fetching market value
- Validation waits for market value data
- Validation completes after data received
- Submit proceeds or shows errors based on validation result

---

## Test Execution Summary

### Test Coverage Matrix

| Category | Test Cases | Priority | Status |
|----------|-----------|----------|--------|
| CRISIL Min/Max Purchase | TC-P2-001 to TC-P2-006 | High | ⏳ Pending |
| CRISIL Min/Max Redemption | TC-P2-007 to TC-P2-009 | High | ⏳ Pending |
| Amount-Based Limits | TC-P2-010 to TC-P2-014 | High | ⏳ Pending |
| EUIN Validation | TC-P2-015 to TC-P2-019 | High | ⏳ Pending |
| PAN Validation | TC-P2-020 to TC-P2-025 | High | ⏳ Pending |
| Nominee Percentage | TC-P2-026 to TC-P2-032 | High | ⏳ Pending |
| Full Redemption/Switch | TC-P2-033 to TC-P2-036 | High | ⏳ Pending |
| API Integration | TC-P2-037 to TC-P2-040 | Critical | ⏳ Pending |
| Success Handling | TC-P2-041 to TC-P2-044 | Critical | ⏳ Pending |
| Error Handling | TC-P2-045 to TC-P2-050 | Critical | ⏳ Pending |
| Integration & Edge Cases | TC-P2-051 to TC-P2-060 | Medium | ⏳ Pending |

**Total Test Cases:** 60

---

## Test Data Requirements

### Product Test Data
- Product A: `minInvestment = ₹5,000`, `maxInvestment = ₹10,00,000`
- Product B: `minInvestment = ₹10,000`, `maxInvestment = ₹5,00,000`
- Product C: `minRedemption = ₹1,000`, `maxRedemption = ₹5,00,000`

### Market Value Test Data
- Product A Market Value: ₹1,00,000
- Product B Market Value: ₹2,00,000

### Valid Test Data
- Valid EUIN: "E123456", "EABCDEF"
- Valid PAN: "ABCDE1234F", "XYZAB9876C"
- Valid Nominee Percentages: 100%, 60% + 40%, 50% + 30% + 20%

### Invalid Test Data
- Invalid EUIN: "123456", "E12345", "E12345@"
- Invalid PAN: "ABCD1234F", "abcde1234f", "ABCDE12345"
- Invalid Nominee Percentages: 90%, 110%, -10%, 150%

---

## Acceptance Criteria

### Phase 2 Completion Criteria

1. **Frontend Validation:**
   - ✅ All CRISIL min/max validations implemented and tested
   - ✅ Amount-based limits (market value) validation implemented
   - ✅ EUIN, PAN, Nominee % validations implemented
   - ✅ Full Redemption/Switch rules implemented (bypass min/max)

2. **API Integration:**
   - ✅ Submit button connected to `/api/order-management/orders/submit`
   - ✅ Request payload structure matches API specification
   - ✅ Loading states implemented during submission

3. **Success Handling:**
   - ✅ Success confirmation displayed with Model Order ID
   - ✅ Form reset after successful submission
   - ✅ Navigation to Order Book or confirmation page

4. **Error Handling:**
   - ✅ Validation errors displayed clearly
   - ✅ API errors handled gracefully
   - ✅ Network errors handled
   - ✅ Form state preserved on error

5. **Test Coverage:**
   - ✅ All critical test cases (TC-P2-001 to TC-P2-050) passing
   - ✅ Integration test cases (TC-P2-051 to TC-P2-060) passing
   - ✅ Edge cases handled

---

## Notes

1. **Validation Functions:** All validation functions are in `client/src/pages/order-management/utils/order-validations.ts`

2. **API Endpoint:** Order submission endpoint is at `POST /api/order-management/orders/submit` in `server/routes.ts`

3. **BRD Compliance:** All validations align with BRD v1.0 requirements:
   - CRISIL min/max rules
   - Amount-based max ≤ market value
   - Full Redemption/Switch bypass rules
   - EUIN format: E + 6 alphanumeric
   - PAN format: 5 letters + 4 digits + 1 letter
   - Nominee % = 100%

4. **Test Execution:** Tests should be executed in order of priority (Critical → High → Medium → Low)

5. **Automation:** Consider automating these test cases using Jest (unit tests) and Playwright (e2e tests)

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-13  
**Author:** AI Assistant  
**Status:** Ready for Review

