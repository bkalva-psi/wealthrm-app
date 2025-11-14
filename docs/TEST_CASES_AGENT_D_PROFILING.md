# Test Cases - Agent D: Knowledge & Risk Profiling

## Overview
Comprehensive test cases for Knowledge Profiling and Risk Profiling modules.

**Test Agent:** Agent D  
**Module:** Knowledge & Risk Profiling  
**Priority:** High  
**Coverage Target:** 85%+

---

## Test Suite 1: Knowledge Profiling

### TC-KP-001: Knowledge Profiling Page Load
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/knowledge-profiling`
2. Verify assessment loads
3. Verify questions display

**Expected Result:**
- Assessment page loads
- Questions display correctly
- No errors in console

---

### TC-KP-002: Answer Questions
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Answer all questions in assessment
2. Verify answers are saved
3. Navigate between questions
4. Verify answers persist

**Expected Result:**
- Can answer all questions
- Answers save correctly
- Answers persist on navigation
- Progress indicator works

---

### TC-KP-003: Question Navigation
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Navigate to next question
2. Navigate to previous question
3. Use question navigation menu
4. Verify correct question displays

**Expected Result:**
- Navigation works correctly
- Correct question displays
- Can navigate in any order
- Progress updates

---

### TC-KP-004: Submit Assessment
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Complete all questions
2. Click "Submit Assessment"
3. Verify submission
4. Verify results display

**Expected Result:**
- Assessment submits successfully
- Results page displays
- Score is calculated correctly
- Results are accurate

---

### TC-KP-005: Score Calculation
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Complete assessment with known answers
2. Submit assessment
3. Verify score matches expected value
4. Verify score breakdown displays

**Expected Result:**
- Score calculates correctly
- Score breakdown shows
- Calculations are accurate
- Results match expected

---

### TC-KP-006: Incomplete Assessment Validation
**Priority:** Medium  
**Type:** Validation

**Test Steps:**
1. Leave some questions unanswered
2. Try to submit assessment
3. Verify validation error

**Expected Result:**
- Validation prevents submission
- Error message displays
- Highlights unanswered questions
- Cannot submit incomplete

---

### TC-KP-007: Client-Specific Assessment
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate from client detail page
2. Start assessment for that client
3. Complete and submit
4. Verify results linked to client

**Expected Result:**
- Assessment linked to client
- Results save to client record
- Can view results from client page

---

## Test Suite 2: Risk Profiling

### TC-RP-001: Risk Profiling Page Load
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate to `#/risk-profiling`
2. Verify assessment loads
3. Verify questions display

**Expected Result:**
- Assessment page loads
- Questions display correctly
- No errors

---

### TC-RP-002: Answer Risk Questions
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Answer all risk profiling questions
2. Verify answers save
3. Test different answer combinations
4. Verify answers persist

**Expected Result:**
- Can answer all questions
- Answers save correctly
- Answers persist
- Progress works

---

### TC-RP-003: Risk Score Calculation
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Complete assessment
2. Submit assessment
3. Verify risk score calculates
4. Verify score is accurate

**Expected Result:**
- Score calculates correctly
- Score is accurate
- Score breakdown displays
- Results match expected

---

### TC-RP-004: Risk Category Determination
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Complete assessment
2. Submit assessment
3. Verify risk category determined:
   - Conservative
   - Moderate
   - Aggressive
   - etc.
4. Verify category is correct

**Expected Result:**
- Category determined correctly
- Category matches score
- Category description displays
- Category saves to client

---

### TC-RP-005: Ceiling Logic
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Complete assessment with ceiling-triggering answers
2. Submit assessment
3. Verify ceiling logic applies
4. Verify risk category is capped

**Expected Result:**
- Ceiling logic works correctly
- Category is capped appropriately
- Ceiling reason displays
- Logic is accurate

---

### TC-RP-006: KP Score Integration
**Priority:** High  
**Type:** Integration

**Test Steps:**
1. Complete Knowledge Profiling first
2. Complete Risk Profiling
3. Verify KP score is considered
4. Verify final risk category uses both scores

**Expected Result:**
- KP score is integrated
- Final category considers both
- Calculation is accurate
- Results are correct

---

### TC-RP-007: Risk Category Breakdown
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. Submit risk assessment
2. View risk category breakdown
3. Verify breakdown shows:
   - Base category
   - Ceiling applied (if any)
   - Reasoning
   - Guidance

**Expected Result:**
- Breakdown displays correctly
- All information shown
- Reasoning is clear
- Guidance is helpful

---

### TC-RP-008: Assessment Expiry
**Priority:** Medium  
**Type:** Functional

**Test Steps:**
1. View existing assessment
2. Check expiry date
3. Verify expiry is 12 months from assessment date
4. Test expired assessment handling

**Expected Result:**
- Expiry date displays
- Expiry is 12 months
- Expired assessments flagged
- Can retake expired assessment

---

### TC-RP-009: Multiple Assessments
**Priority:** Low  
**Type:** Functional

**Test Steps:**
1. Complete first assessment
2. Complete second assessment
3. Verify both assessments saved
4. Verify latest is active

**Expected Result:**
- Multiple assessments saved
- Latest is active
- History is maintained
- Can view previous assessments

---

### TC-RP-010: Client-Specific Risk Profiling
**Priority:** High  
**Type:** Functional

**Test Steps:**
1. Navigate from client detail page
2. Start risk profiling for client
3. Complete assessment
4. Verify results save to client

**Expected Result:**
- Assessment linked to client
- Results save to client record
- Can view from client page
- Risk category updates client

---

## Test Suite 3: Integration Tests

### TC-INT-001: Profiling to Client Integration
**Priority:** High  
**Type:** Integration

**Test Steps:**
1. Complete KP and RP for client
2. Navigate to client detail
3. Verify risk profile displays
4. Verify knowledge score displays

**Expected Result:**
- Profiles integrated with client
- Data displays correctly
- Updates reflect immediately
- Data is accurate

---

### TC-INT-002: Profiling to Portfolio Recommendations
**Priority:** Medium  
**Type:** Integration

**Test Steps:**
1. Complete risk profiling
2. View portfolio recommendations
3. Verify recommendations match risk category
4. Verify recommendations are relevant

**Expected Result:**
- Recommendations match risk category
- Recommendations are relevant
- Can apply recommendations
- Integration works correctly

---

## Test Execution Summary

**Date:** _______________  
**Tester:** Agent D  
**Environment:** Local / Staging

**Summary:**
- Total Test Cases: 19
- Passed: ___
- Failed: ___
- Blocked: ___
- Not Tested: ___

**Critical Issues:**
1. 
2. 
3. 

