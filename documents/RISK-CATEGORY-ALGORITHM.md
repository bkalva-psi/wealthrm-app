# Combined Risk Category Algorithm

## Overview

The final risk category for a client is determined by combining both **Knowledge Profiling (KP)** and **Risk Profiling (RP)** scores, with additional override/ceiling logic to ensure regulatory compliance and appropriate risk assessment. This ensures that clients with higher financial knowledge can be assigned to appropriate risk categories that match their understanding and capability, while also protecting clients with limited knowledge or capacity.

## Score Ranges (Configurable)

**Note**: Score ranges are configurable by administrators through the `risk_scoring_matrix` table. The default ranges below can be modified without code changes.

### Knowledge Profiling (KP)
- **0-15**: 🟢 Basic
- **16-30**: 🟡 Intermediate  
- **31-45**: 🔴 Advanced

### Risk Profiling (RP) - Default Ranges
- **0-20**: Conservative
- **21-40**: Moderate
- **41-60**: Moderately Aggressive
- **61-75**: Aggressive

### Risk Category Descriptions

Each risk category is defined with a name and description:

- **Conservative**: Prefers minimal risk, willing to accept lower returns. Suitable for clients seeking capital preservation with stable, low-risk investments.

- **Moderate**: Seeks balance between growth and stability. Suitable for clients comfortable with moderate risk and preferring diversified portfolios with a mix of equity and debt.

- **Moderately Aggressive**: Aims for higher returns with moderate to high risk tolerance. Suitable for clients with longer investment horizons who can tolerate moderate market volatility.

- **Aggressive**: Seeks maximum growth potential, can tolerate high risk. Suitable for clients with high risk tolerance and long investment horizons who can withstand market volatility.

## Algorithm Logic

The algorithm works in three steps:

### Step 1: Determine Base Risk Category
The base risk category is determined from the RP score using configurable score ranges (loaded from `risk_scoring_matrix` table or using defaults):
- RP Score 0-20 → Conservative
- RP Score 21-40 → Moderate
- RP Score 41-60 → Moderately Aggressive
- RP Score 61-75 → Aggressive

### Step 2: Adjust Based on Knowledge Level
The base risk category is then adjusted based on the KP knowledge level:

1. **Basic Knowledge (0-15)**: 
   - **Action**: Reduce risk category by 1 level
   - **Rationale**: Clients with basic knowledge may not fully understand the risks, so we take a more conservative approach
   - **Example**: Moderate → Conservative, Moderately Aggressive → Moderate

2. **Intermediate Knowledge (16-30)**:
   - **Action**: No adjustment (neutral)
   - **Rationale**: Clients have sufficient knowledge to understand their risk profile

3. **Advanced Knowledge (31-45)**:
   - **Action**: Increase risk category by 1 level
   - **Rationale**: Clients with advanced knowledge can better understand and handle higher risk investments
   - **Example**: Moderate → Moderately Aggressive, Moderately Aggressive → Aggressive

### Step 3: Apply Ceiling/Override Logic
After knowledge-based adjustment, ceiling logic is applied based on specific question answers:

**Ceiling Questions**: Questions marked with `ceiling_flag = true` in the `risk_questions` table can cap the maximum risk category regardless of the calculated score.

**Default Ceiling Rules**:
1. **Very Limited Investment Knowledge**: 
   - **Pattern**: Answers indicating "very limited", "no knowledge", or "beginner" level
   - **Maximum Category**: Conservative
   - **Rationale**: Clients with very limited investment knowledge should not exceed Conservative risk level, even if their score suggests otherwise

2. **Limited Investment Experience**:
   - **Pattern**: Answers indicating "no experience" or "less than 1 year"
   - **Maximum Category**: Moderate
   - **Rationale**: Clients with limited experience may not be ready for higher risk investments

**Ceiling Logic Process**:
- System checks all ceiling questions answered by the client
- If any ceiling rule matches, the risk category is capped at the specified maximum
- The ceiling override is logged in `risk_assessment.override_reason` and `ceiling_applied` flag is set to `true`
- Ceiling logic takes precedence over score-based calculations

### Boundary Conditions
- Risk category cannot go below "Conservative"
- Risk category cannot go above "Aggressive"
- Ceiling logic can further restrict the maximum category based on regulatory or safety requirements

## Examples

### Example 1: Basic Knowledge + Moderate Risk
- **KP Score**: 12 (Basic)
- **RP Score**: 35 (Moderate)
- **Base Category**: Moderate
- **KP Adjustment**: Reduced by 1 level (Basic knowledge) → Conservative
- **Ceiling Check**: No ceiling applied
- **Final Category**: Conservative

### Example 2: Advanced Knowledge + Moderate Risk
- **KP Score**: 38 (Advanced)
- **RP Score**: 35 (Moderate)
- **Base Category**: Moderate
- **KP Adjustment**: Increased by 1 level (Advanced knowledge) → Moderately Aggressive
- **Ceiling Check**: No ceiling applied
- **Final Category**: Moderately Aggressive

### Example 3: Intermediate Knowledge + Moderate Risk
- **KP Score**: 22 (Intermediate)
- **RP Score**: 35 (Moderate)
- **Base Category**: Moderate
- **KP Adjustment**: No change (Intermediate knowledge) → Moderate
- **Ceiling Check**: No ceiling applied
- **Final Category**: Moderate

### Example 4: Basic Knowledge + Conservative Risk
- **KP Score**: 10 (Basic)
- **RP Score**: 15 (Conservative)
- **Base Category**: Conservative
- **KP Adjustment**: Cannot reduce below Conservative → Conservative
- **Ceiling Check**: No ceiling applied
- **Final Category**: Conservative

### Example 5: Advanced Knowledge + Aggressive Risk
- **KP Score**: 40 (Advanced)
- **RP Score**: 70 (Aggressive)
- **Base Category**: Aggressive
- **KP Adjustment**: Cannot increase above Aggressive → Aggressive
- **Ceiling Check**: No ceiling applied
- **Final Category**: Aggressive

### Example 6: Ceiling Logic - Limited Knowledge
- **KP Score**: 25 (Intermediate)
- **RP Score**: 65 (Aggressive)
- **Base Category**: Aggressive
- **KP Adjustment**: No change (Intermediate knowledge) → Aggressive
- **Ceiling Check**: Client answered "very limited knowledge" on ceiling question
- **Ceiling Applied**: Maximum category capped at Conservative
- **Final Category**: Conservative
- **Override Reason**: "Very limited investment knowledge detected - risk category capped at Conservative"

### Example 7: Ceiling Logic - Limited Experience
- **KP Score**: 35 (Advanced)
- **RP Score**: 55 (Moderately Aggressive)
- **Base Category**: Moderately Aggressive
- **KP Adjustment**: Increased by 1 level (Advanced knowledge) → Aggressive
- **Ceiling Check**: Client answered "less than 1 year experience" on ceiling question
- **Ceiling Applied**: Maximum category capped at Moderate
- **Final Category**: Moderate
- **Override Reason**: "Limited investment experience - risk category capped at Moderate"

## Validity and Renewal

### Profile Expiry
- **Validity Period**: 12 months from the assessment date
- **Expiry Date**: Stored in `risk_assessment.expiry_date`
- **Assessment Date**: Stored in `risk_assessment.completed_at`

### Renewal Requirements
- Business logic prompts for re-profiling if the profile is expired or about to expire (30 days before expiry)
- Re-profiling is mandatory when initiating a new plan or product sale if the profile is expired
- Validity check endpoint: `GET /api/rp/validity/:clientId` - Returns validity status and days remaining

### Validity Status
- **Valid**: Profile is within the 12-month validity period
- **Expiring Soon**: Profile expires within 30 days
- **Expired**: Profile has passed the expiry date

## Implementation

### Backend
- **Utility Function**: `server/utils/risk-category-calculator.ts`
  - `getBaseRiskCategory()` - Determines base category from RP score using configurable ranges
  - `adjustRiskCategory()` - Adjusts category based on KP knowledge level
  - `applyCeilingLogic()` - Applies ceiling rules based on question answers
  - `calculateFinalRiskCategory()` - Combines all steps to get final category
  - `calculateExpiryDate()` - Calculates expiry date (12 months from assessment)
  - `checkProfileValidity()` - Checks if profile is valid, expired, or expiring soon
- **API Endpoints**:
  - `POST /api/rp/submit` - Saves RP results, applies ceiling logic, calculates final category, and sets expiry date
  - `GET /api/rp/results/:clientId` - Returns risk profile with validity status
  - `GET /api/rp/validity/:clientId` - Checks profile validity for plan creation
  - `POST /api/risk-categories/recalculate` - Recalculates risk categories for all clients (Admin only)

### Database Tables
- **`risk_scoring_matrix`**: Stores configurable score ranges (score_min, score_max, risk_category, guidance)
- **`risk_questions`**: Contains `ceiling_flag` to mark questions that can cap maximum risk
- **`risk_assessment`**: Stores final risk category, expiry_date, ceiling_applied, and override_reason

### Frontend
- Risk profiling form automatically calls the API when submitted
- Knowledge profiling completion also triggers risk category recalculation if RP score exists
- Validity check is performed before plan creation to ensure profile is current

## Usage

### For New Clients
1. Complete Knowledge Profiling → KP score is saved
2. Complete Risk Profiling → RP score is saved, ceiling logic is applied, final risk category is calculated and saved
3. Expiry date is automatically set to 12 months from assessment date

### For Existing Clients
1. Admin can call `POST /api/risk-categories/recalculate` to recalculate all clients
2. Or complete/update either KP or RP assessment to trigger automatic recalculation
3. System checks profile validity before allowing plan creation or product sale

### Administrator Configuration
1. **Configure Score Ranges**: Update `risk_scoring_matrix` table with custom score ranges
2. **Configure Ceiling Rules**: Mark questions with `ceiling_flag = true` in `risk_questions` table
3. **Update Ceiling Patterns**: Modify default ceiling rules in `server/utils/risk-category-calculator.ts` if needed

## Testing

To test the algorithm, you can use the following scenarios:

```typescript
// Test cases - Basic algorithm
const testCases = [
  { kp: 10, rp: 35, expected: "Conservative" }, // Basic + Moderate = Conservative
  { kp: 25, rp: 35, expected: "Moderate" },    // Intermediate + Moderate = Moderate
  { kp: 38, rp: 35, expected: "Moderately Aggressive" }, // Advanced + Moderate = Moderately Aggressive
  { kp: 10, rp: 15, expected: "Conservative" }, // Basic + Conservative = Conservative (boundary)
  { kp: 40, rp: 70, expected: "Aggressive" },  // Advanced + Aggressive = Aggressive (boundary)
];

// Test cases - Ceiling logic
const ceilingTestCases = [
  { 
    kp: 25, 
    rp: 65, 
    ceilingAnswer: "very limited knowledge",
    expected: "Conservative",
    reason: "Ceiling: Very limited knowledge caps at Conservative"
  },
  { 
    kp: 35, 
    rp: 55, 
    ceilingAnswer: "less than 1 year",
    expected: "Moderate",
    reason: "Ceiling: Limited experience caps at Moderate"
  },
  { 
    kp: 25, 
    rp: 35, 
    ceilingAnswer: null,
    expected: "Moderate",
    reason: "No ceiling applied - normal calculation"
  },
];

// Test cases - Validity
const validityTestCases = [
  { 
    assessmentDate: new Date('2024-01-01'),
    expiryDate: new Date('2025-01-01'),
    currentDate: new Date('2024-06-01'),
    expected: { isValid: true, isExpired: false, isExpiringSoon: false }
  },
  { 
    assessmentDate: new Date('2023-01-01'),
    expiryDate: new Date('2024-01-01'),
    currentDate: new Date('2024-02-01'),
    expected: { isValid: false, isExpired: true, isExpiringSoon: false }
  },
  { 
    assessmentDate: new Date('2023-12-01'),
    expiryDate: new Date('2024-12-01'),
    currentDate: new Date('2024-11-15'),
    expected: { isValid: true, isExpired: false, isExpiringSoon: true }
  },
];
```

## Notes

- If a client has no KP score, the base RP category is used (no adjustment)
- If a client has no RP score, no risk category can be determined
- The algorithm ensures that risk categories are always appropriate for the client's knowledge level
- Ceiling logic takes precedence over score-based calculations to ensure regulatory compliance and client safety
- Score ranges are configurable by administrators without requiring code changes
- Risk profiles must be renewed every 12 months to remain valid
- Expired or expiring profiles trigger re-profiling prompts before plan creation or product sale
- All ceiling overrides are logged with reasons for audit and compliance purposes

