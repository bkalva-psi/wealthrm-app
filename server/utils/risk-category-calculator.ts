/**
 * Risk Category Calculator
 * 
 * This module calculates the final risk category by combining:
 * 1. Knowledge Profiling (KP) Score: 0-45
 *    - 0-15: Basic (🟢)
 *    - 16-30: Intermediate (🟡)
 *    - 31-45: Advanced (🔴)
 * 
 * 2. Risk Profiling (RP) Score: 0-75
 *    - Configurable score ranges (default: 0-20 = Conservative, 21-40 = Moderate, etc.)
 * 
 * The algorithm adjusts the RP category based on KP level:
 * - Basic KP knowledge → Reduces risk category by 1 level (safety-first approach)
 * - Intermediate KP knowledge → No adjustment (neutral)
 * - Advanced KP knowledge → Increases risk category by 1 level (knowledge enables higher risk)
 * 
 * Ceiling Logic: If ceiling questions indicate very low risk capacity, the category is capped.
 * 
 * Validity: Risk profiles are valid for 12 months from assessment date.
 */

export type KnowledgeLevel = "Basic" | "Intermediate" | "Advanced";
export type RiskCategory = "Conservative" | "Moderate" | "Moderately Aggressive" | "Aggressive";

/**
 * Configurable Risk Category Score Ranges
 * These can be configured by administrators
 */
export interface RiskCategoryRange {
  min: number;
  max: number;
  category: RiskCategory;
  description: string;
}

/**
 * Default score ranges (configurable by administrators)
 * Format: { min, max, category, description }
 */
export const DEFAULT_RISK_CATEGORY_RANGES: RiskCategoryRange[] = [
  { min: 0, max: 20, category: "Conservative", description: "Prefers minimal risk, willing to accept lower returns" },
  { min: 21, max: 40, category: "Moderate", description: "Seeks balance between growth and stability" },
  { min: 41, max: 60, category: "Moderately Aggressive", description: "Aims for higher returns with moderate to high risk tolerance" },
  { min: 61, max: 75, category: "Aggressive", description: "Seeks maximum growth potential, can tolerate high risk" },
];

/**
 * Ceiling Configuration
 * Defines maximum risk category based on ceiling question answers
 */
export interface CeilingRule {
  questionCategory?: string; // e.g., 'knowledge', 'experience'
  answerPattern?: string; // Pattern to match in answer
  maxCategory: RiskCategory; // Maximum category allowed
  reason: string; // Reason for ceiling
}

/**
 * Default ceiling rules (can be configured)
 */
export const DEFAULT_CEILING_RULES: CeilingRule[] = [
  {
    questionCategory: "knowledge",
    answerPattern: "very limited|no knowledge|beginner",
    maxCategory: "Conservative",
    reason: "Very limited investment knowledge detected - risk category capped at Conservative"
  },
  {
    questionCategory: "experience",
    answerPattern: "no experience|less than 1 year",
    maxCategory: "Moderate",
    reason: "Limited investment experience - risk category capped at Moderate"
  }
];

/**
 * Get Knowledge Level from KP Score
 */
export function getKnowledgeLevel(kpScore: number | null | undefined): KnowledgeLevel | null {
  if (kpScore === null || kpScore === undefined) return null;
  
  if (kpScore <= 15) return "Basic";
  if (kpScore <= 30) return "Intermediate";
  return "Advanced";
}

/**
 * Get Risk Category from RP Score using configurable ranges
 * @param rpScore Risk Profiling score
 * @param ranges Optional custom ranges (defaults to DEFAULT_RISK_CATEGORY_RANGES)
 */
export function getBaseRiskCategory(
  rpScore: number | null | undefined,
  ranges: RiskCategoryRange[] = DEFAULT_RISK_CATEGORY_RANGES
): RiskCategory | null {
  if (rpScore === null || rpScore === undefined) return null;
  
  // Find the range that contains the score
  for (const range of ranges) {
    if (rpScore >= range.min && rpScore <= range.max) {
      return range.category;
    }
  }
  
  // If score is above all ranges, return highest category
  // If score is below all ranges, return lowest category
  if (ranges.length > 0) {
    if (rpScore < ranges[0].min) {
      return ranges[0].category;
    }
    return ranges[ranges.length - 1].category;
  }
  
  return null;
}

/**
 * Apply ceiling logic to risk category based on question answers
 * @param category Current risk category
 * @param ceilingRules Ceiling rules to apply
 * @param questionAnswers Map of question categories to answers
 * @returns Capped category and reason if ceiling applied
 */
export function applyCeilingLogic(
  category: RiskCategory,
  questionAnswers?: Map<string, string | string[]>,
  ceilingRules: CeilingRule[] = DEFAULT_CEILING_RULES
): { category: RiskCategory; ceilingApplied: boolean; ceilingReason: string | null } {
  if (!questionAnswers || questionAnswers.size === 0) {
    return { category, ceilingApplied: false, ceilingReason: null };
  }

  const categoryOrder: RiskCategory[] = [
    "Conservative",
    "Moderate",
    "Moderately Aggressive",
    "Aggressive"
  ];

  let cappedCategory = category;
  let ceilingReason: string | null = null;

  // Check each ceiling rule
  for (const rule of ceilingRules) {
    if (!rule.questionCategory) continue;

    const answers = questionAnswers.get(rule.questionCategory);
    if (!answers) continue;

    // Convert to array if single value
    const answerArray = Array.isArray(answers) ? answers : [answers];
    const answerText = answerArray.map(a => String(a).toLowerCase()).join(" ");

    // Check if answer matches pattern
    if (rule.answerPattern && new RegExp(rule.answerPattern, "i").test(answerText)) {
      const currentIndex = categoryOrder.indexOf(category);
      const maxIndex = categoryOrder.indexOf(rule.maxCategory);

      // If current category exceeds max allowed, cap it
      if (currentIndex > maxIndex) {
        cappedCategory = rule.maxCategory;
        ceilingReason = rule.reason;
        break; // Apply first matching ceiling rule
      }
    }
  }

  return {
    category: cappedCategory,
    ceilingApplied: cappedCategory !== category,
    ceilingReason
  };
}

/**
 * Adjust Risk Category based on Knowledge Level
 * 
 * Algorithm:
 * - Basic KP (0-15): Reduce risk by 1 level (more conservative)
 * - Intermediate KP (16-30): No change (neutral)
 * - Advanced KP (31-45): Increase risk by 1 level (can handle more risk)
 */
function adjustRiskCategory(
  baseCategory: RiskCategory,
  knowledgeLevel: KnowledgeLevel | null
): RiskCategory {
  if (!knowledgeLevel) {
    // If no KP data, return base category
    return baseCategory;
  }

  const categoryOrder: RiskCategory[] = [
    "Conservative",
    "Moderate",
    "Moderately Aggressive",
    "Aggressive"
  ];

  const currentIndex = categoryOrder.indexOf(baseCategory);

  if (knowledgeLevel === "Basic") {
    // Reduce risk by 1 level (more conservative)
    // But don't go below Conservative
    return categoryOrder[Math.max(0, currentIndex - 1)];
  } else if (knowledgeLevel === "Advanced") {
    // Increase risk by 1 level (can handle more risk)
    // But don't go above Aggressive
    return categoryOrder[Math.min(categoryOrder.length - 1, currentIndex + 1)];
  } else {
    // Intermediate: No change
    return baseCategory;
  }
}

/**
 * Calculate Final Risk Category by combining KP and RP scores with ceiling logic
 * 
 * @param kpScore Knowledge Profiling score (0-45)
 * @param rpScore Risk Profiling score (0-75)
 * @param questionAnswers Optional map of question categories to answers for ceiling logic
 * @param ranges Optional custom score ranges
 * @param ceilingRules Optional custom ceiling rules
 * @returns Final risk category
 */
export function calculateFinalRiskCategory(
  kpScore: number | null | undefined,
  rpScore: number | null | undefined,
  questionAnswers?: Map<string, string | string[]>,
  ranges: RiskCategoryRange[] = DEFAULT_RISK_CATEGORY_RANGES,
  ceilingRules: CeilingRule[] = DEFAULT_CEILING_RULES
): RiskCategory | null {
  // If no RP score, cannot determine risk category
  if (rpScore === null || rpScore === undefined) {
    return null;
  }

  // Get base risk category from RP score using configurable ranges
  const baseCategory = getBaseRiskCategory(rpScore, ranges);
  if (!baseCategory) {
    return null;
  }

  // Get knowledge level from KP score
  const knowledgeLevel = getKnowledgeLevel(kpScore);

  // Adjust based on knowledge level
  let adjustedCategory = adjustRiskCategory(baseCategory, knowledgeLevel);

  // Apply ceiling logic if question answers provided
  const ceilingResult = applyCeilingLogic(adjustedCategory, questionAnswers, ceilingRules);
  const finalCategory = ceilingResult.category;

  return finalCategory;
}

/**
 * Calculate risk profile expiry date (12 months from assessment date)
 * @param assessmentDate Assessment date (defaults to current date)
 * @returns Expiry date
 */
export function calculateExpiryDate(assessmentDate: Date = new Date()): Date {
  const expiry = new Date(assessmentDate);
  expiry.setMonth(expiry.getMonth() + 12);
  return expiry;
}

/**
 * Check if risk profile is expired or about to expire
 * @param expiryDate Expiry date of the risk profile
 * @param daysBeforeExpiry Number of days before expiry to consider "about to expire" (default: 30)
 * @returns Object with expiry status
 */
export function checkProfileValidity(
  expiryDate: Date | string | null | undefined,
  daysBeforeExpiry: number = 30
): { isValid: boolean; isExpired: boolean; isExpiringSoon: boolean; daysRemaining: number | null } {
  if (!expiryDate) {
    return { isValid: false, isExpired: true, isExpiringSoon: false, daysRemaining: null };
  }

  const expiry = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isExpired = diffDays < 0;
  const isExpiringSoon = diffDays >= 0 && diffDays <= daysBeforeExpiry;
  const isValid = !isExpired;

  return {
    isValid,
    isExpired,
    isExpiringSoon,
    daysRemaining: diffDays >= 0 ? diffDays : null
  };
}

/**
 * Get detailed breakdown of risk category calculation
 */
export interface RiskCategoryBreakdown {
  kpScore: number | null;
  rpScore: number | null;
  knowledgeLevel: KnowledgeLevel | null;
  baseRiskCategory: RiskCategory | null;
  adjustedRiskCategory: RiskCategory | null; // After KP adjustment
  finalRiskCategory: RiskCategory | null; // After ceiling logic
  adjustment: "reduced" | "neutral" | "increased" | "none";
  adjustmentReason: string;
  ceilingApplied: boolean;
  ceilingReason: string | null;
}

export function getRiskCategoryBreakdown(
  kpScore: number | null | undefined,
  rpScore: number | null | undefined,
  questionAnswers?: Map<string, string | string[]>,
  ranges: RiskCategoryRange[] = DEFAULT_RISK_CATEGORY_RANGES,
  ceilingRules: CeilingRule[] = DEFAULT_CEILING_RULES
): RiskCategoryBreakdown {
  const kp = kpScore ?? null;
  const rp = rpScore ?? null;
  
  const knowledgeLevel = getKnowledgeLevel(kp);
  const baseRiskCategory = getBaseRiskCategory(rp, ranges);
  
  // Calculate adjusted category (after KP adjustment)
  let adjustedRiskCategory: RiskCategory | null = null;
  if (baseRiskCategory && knowledgeLevel) {
    adjustedRiskCategory = adjustRiskCategory(baseRiskCategory, knowledgeLevel);
  } else {
    adjustedRiskCategory = baseRiskCategory;
  }

  // Apply ceiling logic
  const ceilingResult = adjustedRiskCategory 
    ? applyCeilingLogic(adjustedRiskCategory, questionAnswers, ceilingRules)
    : { category: adjustedRiskCategory, ceilingApplied: false, ceilingReason: null };
  
  const finalRiskCategory = ceilingResult.category;

  let adjustment: "reduced" | "neutral" | "increased" | "none" = "none";
  let adjustmentReason = "";

  if (knowledgeLevel && baseRiskCategory && adjustedRiskCategory) {
    if (knowledgeLevel === "Basic" && adjustedRiskCategory !== baseRiskCategory) {
      adjustment = "reduced";
      adjustmentReason = "Knowledge level is Basic - risk category reduced for safety";
    } else if (knowledgeLevel === "Advanced" && adjustedRiskCategory !== baseRiskCategory) {
      adjustment = "increased";
      adjustmentReason = "Knowledge level is Advanced - risk category increased as client can handle higher risk";
    } else {
      adjustment = "neutral";
      adjustmentReason = "Knowledge level is Intermediate - no adjustment applied";
    }
  } else if (!knowledgeLevel) {
    adjustment = "none";
    adjustmentReason = "No knowledge profiling data available - using base risk category";
  }

  return {
    kpScore: kp,
    rpScore: rp,
    knowledgeLevel,
    baseRiskCategory,
    adjustedRiskCategory,
    finalRiskCategory,
    adjustment,
    adjustmentReason,
    ceilingApplied: ceilingResult.ceilingApplied,
    ceilingReason: ceilingResult.ceilingReason,
  };
}

