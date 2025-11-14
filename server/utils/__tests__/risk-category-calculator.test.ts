import { describe, it, expect } from 'vitest';
import {
  getKnowledgeLevel,
  getBaseRiskCategory,
  calculateFinalRiskCategory,
  applyCeilingLogic,
  getRiskCategoryBreakdown,
  calculateExpiryDate,
  checkProfileValidity,
  DEFAULT_RISK_CATEGORY_RANGES,
  DEFAULT_CEILING_RULES,
  type RiskCategory,
  type KnowledgeLevel,
} from '../risk-category-calculator';

describe('Risk Category Calculator', () => {
  describe('getKnowledgeLevel', () => {
    it('should return Basic for scores 0-15', () => {
      expect(getKnowledgeLevel(0)).toBe('Basic');
      expect(getKnowledgeLevel(10)).toBe('Basic');
      expect(getKnowledgeLevel(15)).toBe('Basic');
    });

    it('should return Intermediate for scores 16-30', () => {
      expect(getKnowledgeLevel(16)).toBe('Intermediate');
      expect(getKnowledgeLevel(25)).toBe('Intermediate');
      expect(getKnowledgeLevel(30)).toBe('Intermediate');
    });

    it('should return Advanced for scores 31-45', () => {
      expect(getKnowledgeLevel(31)).toBe('Advanced');
      expect(getKnowledgeLevel(40)).toBe('Advanced');
      expect(getKnowledgeLevel(45)).toBe('Advanced');
    });

    it('should return null for null or undefined scores', () => {
      expect(getKnowledgeLevel(null)).toBeNull();
      expect(getKnowledgeLevel(undefined)).toBeNull();
    });
  });

  describe('getBaseRiskCategory', () => {
    it('should return Conservative for scores 0-20', () => {
      expect(getBaseRiskCategory(0)).toBe('Conservative');
      expect(getBaseRiskCategory(10)).toBe('Conservative');
      expect(getBaseRiskCategory(20)).toBe('Conservative');
    });

    it('should return Moderate for scores 21-40', () => {
      expect(getBaseRiskCategory(21)).toBe('Moderate');
      expect(getBaseRiskCategory(30)).toBe('Moderate');
      expect(getBaseRiskCategory(40)).toBe('Moderate');
    });

    it('should return Moderately Aggressive for scores 41-60', () => {
      expect(getBaseRiskCategory(41)).toBe('Moderately Aggressive');
      expect(getBaseRiskCategory(50)).toBe('Moderately Aggressive');
      expect(getBaseRiskCategory(60)).toBe('Moderately Aggressive');
    });

    it('should return Aggressive for scores 61-75', () => {
      expect(getBaseRiskCategory(61)).toBe('Aggressive');
      expect(getBaseRiskCategory(70)).toBe('Aggressive');
      expect(getBaseRiskCategory(75)).toBe('Aggressive');
    });

    it('should return null for null or undefined scores', () => {
      expect(getBaseRiskCategory(null)).toBeNull();
      expect(getBaseRiskCategory(undefined)).toBeNull();
    });

    it('should handle scores below minimum range', () => {
      expect(getBaseRiskCategory(-10)).toBe('Conservative');
    });

    it('should handle scores above maximum range', () => {
      expect(getBaseRiskCategory(100)).toBe('Aggressive');
    });

    it('should work with custom ranges', () => {
      const customRanges = [
        { min: 0, max: 25, category: 'Conservative' as RiskCategory, description: '' },
        { min: 26, max: 50, category: 'Moderate' as RiskCategory, description: '' },
        { min: 51, max: 75, category: 'Aggressive' as RiskCategory, description: '' },
      ];
      expect(getBaseRiskCategory(30, customRanges)).toBe('Moderate');
      expect(getBaseRiskCategory(60, customRanges)).toBe('Aggressive');
    });
  });

  describe('applyCeilingLogic', () => {
    it('should not apply ceiling when no question answers provided', () => {
      const result = applyCeilingLogic('Aggressive', undefined);
      expect(result.category).toBe('Aggressive');
      expect(result.ceilingApplied).toBe(false);
      expect(result.ceilingReason).toBeNull();
    });

    it('should apply ceiling for very limited knowledge', () => {
      const questionAnswers = new Map<string, string | string[]>();
      questionAnswers.set('knowledge', 'very limited');
      
      const result = applyCeilingLogic('Aggressive', questionAnswers);
      expect(result.category).toBe('Conservative');
      expect(result.ceilingApplied).toBe(true);
      expect(result.ceilingReason).toContain('Very limited investment knowledge');
    });

    it('should apply ceiling for no experience', () => {
      const questionAnswers = new Map<string, string | string[]>();
      questionAnswers.set('experience', 'no experience');
      
      const result = applyCeilingLogic('Aggressive', questionAnswers);
      expect(result.category).toBe('Moderate');
      expect(result.ceilingApplied).toBe(true);
      expect(result.ceilingReason).toContain('Limited investment experience');
    });

    it('should not apply ceiling when category is already below max', () => {
      const questionAnswers = new Map<string, string | string[]>();
      questionAnswers.set('knowledge', 'very limited');
      
      const result = applyCeilingLogic('Conservative', questionAnswers);
      expect(result.category).toBe('Conservative');
      expect(result.ceilingApplied).toBe(false);
    });

    it('should handle array answers', () => {
      const questionAnswers = new Map<string, string | string[]>();
      questionAnswers.set('knowledge', ['very', 'limited', 'knowledge']);
      
      const result = applyCeilingLogic('Moderately Aggressive', questionAnswers);
      expect(result.category).toBe('Conservative');
      expect(result.ceilingApplied).toBe(true);
    });

    it('should work with custom ceiling rules', () => {
      const customRules = [
        {
          questionCategory: 'age',
          answerPattern: 'under 18',
          maxCategory: 'Conservative' as RiskCategory,
          reason: 'Age restriction',
        },
      ];
      
      const questionAnswers = new Map<string, string | string[]>();
      questionAnswers.set('age', 'under 18');
      
      const result = applyCeilingLogic('Aggressive', questionAnswers, customRules);
      expect(result.category).toBe('Conservative');
      expect(result.ceilingApplied).toBe(true);
    });
  });

  describe('calculateFinalRiskCategory', () => {
    it('should return null when RP score is missing', () => {
      expect(calculateFinalRiskCategory(30, null)).toBeNull();
      expect(calculateFinalRiskCategory(30, undefined)).toBeNull();
      expect(calculateFinalRiskCategory(null, null)).toBeNull();
    });

    it('should reduce category for Basic KP knowledge', () => {
      // RP score 30 = Moderate, Basic KP should reduce to Conservative
      expect(calculateFinalRiskCategory(10, 30)).toBe('Conservative');
      
      // RP score 50 = Moderately Aggressive, Basic KP should reduce to Moderate
      expect(calculateFinalRiskCategory(10, 50)).toBe('Moderate');
    });

    it('should not change category for Intermediate KP knowledge', () => {
      // RP score 30 = Moderate, Intermediate KP should stay Moderate
      expect(calculateFinalRiskCategory(20, 30)).toBe('Moderate');
      
      // RP score 50 = Moderately Aggressive, Intermediate KP should stay Moderately Aggressive
      expect(calculateFinalRiskCategory(25, 50)).toBe('Moderately Aggressive');
    });

    it('should increase category for Advanced KP knowledge', () => {
      // RP score 30 = Moderate, Advanced KP should increase to Moderately Aggressive
      expect(calculateFinalRiskCategory(35, 30)).toBe('Moderately Aggressive');
      
      // RP score 50 = Moderately Aggressive, Advanced KP should increase to Aggressive
      expect(calculateFinalRiskCategory(40, 50)).toBe('Aggressive');
    });

    it('should not reduce below Conservative', () => {
      // RP score 10 = Conservative, Basic KP should stay Conservative (can't go lower)
      expect(calculateFinalRiskCategory(5, 10)).toBe('Conservative');
    });

    it('should not increase above Aggressive', () => {
      // RP score 70 = Aggressive, Advanced KP should stay Aggressive (can't go higher)
      expect(calculateFinalRiskCategory(40, 70)).toBe('Aggressive');
    });

    it('should apply ceiling logic when question answers provided', () => {
      const questionAnswers = new Map<string, string | string[]>();
      questionAnswers.set('knowledge', 'very limited');
      
      // Without ceiling: RP 50 + Advanced KP = Aggressive
      // With ceiling: should cap at Conservative
      const result = calculateFinalRiskCategory(40, 50, questionAnswers);
      expect(result).toBe('Conservative');
    });

    it('should work with null KP score', () => {
      // When KP is null, should use base RP category
      expect(calculateFinalRiskCategory(null, 30)).toBe('Moderate');
      expect(calculateFinalRiskCategory(null, 50)).toBe('Moderately Aggressive');
    });
  });

  describe('getRiskCategoryBreakdown', () => {
    it('should provide complete breakdown with all adjustments', () => {
      const breakdown = getRiskCategoryBreakdown(10, 30);
      
      expect(breakdown.kpScore).toBe(10);
      expect(breakdown.rpScore).toBe(30);
      expect(breakdown.knowledgeLevel).toBe('Basic');
      expect(breakdown.baseRiskCategory).toBe('Moderate');
      expect(breakdown.adjustedRiskCategory).toBe('Conservative');
      expect(breakdown.finalRiskCategory).toBe('Conservative');
      expect(breakdown.adjustment).toBe('reduced');
      expect(breakdown.adjustmentReason).toContain('Basic');
    });

    it('should show neutral adjustment for Intermediate KP', () => {
      const breakdown = getRiskCategoryBreakdown(20, 30);
      
      expect(breakdown.knowledgeLevel).toBe('Intermediate');
      expect(breakdown.baseRiskCategory).toBe('Moderate');
      expect(breakdown.adjustedRiskCategory).toBe('Moderate');
      expect(breakdown.adjustment).toBe('neutral');
    });

    it('should show increased adjustment for Advanced KP', () => {
      const breakdown = getRiskCategoryBreakdown(35, 30);
      
      expect(breakdown.knowledgeLevel).toBe('Advanced');
      expect(breakdown.baseRiskCategory).toBe('Moderate');
      expect(breakdown.adjustedRiskCategory).toBe('Moderately Aggressive');
      expect(breakdown.adjustment).toBe('increased');
    });

    it('should include ceiling information when applied', () => {
      const questionAnswers = new Map<string, string | string[]>();
      questionAnswers.set('knowledge', 'very limited');
      
      const breakdown = getRiskCategoryBreakdown(40, 50, questionAnswers);
      
      expect(breakdown.ceilingApplied).toBe(true);
      expect(breakdown.ceilingReason).toContain('Very limited');
      expect(breakdown.finalRiskCategory).toBe('Conservative');
    });

    it('should handle null scores', () => {
      const breakdown = getRiskCategoryBreakdown(null, null);
      
      expect(breakdown.kpScore).toBeNull();
      expect(breakdown.rpScore).toBeNull();
      expect(breakdown.knowledgeLevel).toBeNull();
      expect(breakdown.baseRiskCategory).toBeNull();
      expect(breakdown.adjustment).toBe('none');
    });
  });

  describe('calculateExpiryDate', () => {
    it('should add 12 months to assessment date', () => {
      const assessmentDate = new Date('2024-01-15');
      const expiryDate = calculateExpiryDate(assessmentDate);
      
      expect(expiryDate.getFullYear()).toBe(2025);
      expect(expiryDate.getMonth()).toBe(0); // January (0-indexed)
      expect(expiryDate.getDate()).toBe(15);
    });

    it('should use current date if no date provided', () => {
      const now = new Date();
      const expiryDate = calculateExpiryDate();
      
      const expectedYear = now.getFullYear() + 1;
      expect(expiryDate.getFullYear()).toBe(expectedYear);
    });

    it('should handle year boundary correctly', () => {
      const assessmentDate = new Date('2024-12-15');
      const expiryDate = calculateExpiryDate(assessmentDate);
      
      expect(expiryDate.getFullYear()).toBe(2025);
      expect(expiryDate.getMonth()).toBe(11); // December (0-indexed)
    });
  });

  describe('checkProfileValidity', () => {
    it('should return valid for future expiry dates', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      
      const result = checkProfileValidity(futureDate);
      
      expect(result.isValid).toBe(true);
      expect(result.isExpired).toBe(false);
      expect(result.isExpiringSoon).toBe(false);
      expect(result.daysRemaining).toBeGreaterThan(0);
    });

    it('should return expired for past dates', () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);
      
      const result = checkProfileValidity(pastDate);
      
      expect(result.isValid).toBe(false);
      expect(result.isExpired).toBe(true);
      expect(result.isExpiringSoon).toBe(false);
      expect(result.daysRemaining).toBeNull();
    });

    it('should detect expiring soon (within 30 days)', () => {
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 15);
      
      const result = checkProfileValidity(soonDate);
      
      expect(result.isValid).toBe(true);
      expect(result.isExpired).toBe(false);
      expect(result.isExpiringSoon).toBe(true);
      expect(result.daysRemaining).toBeLessThanOrEqual(30);
    });

    it('should handle string dates', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      
      const result = checkProfileValidity(futureDate.toISOString());
      
      expect(result.isValid).toBe(true);
      expect(result.isExpired).toBe(false);
    });

    it('should return invalid for null/undefined dates', () => {
      expect(checkProfileValidity(null).isValid).toBe(false);
      expect(checkProfileValidity(undefined).isValid).toBe(false);
    });

    it('should use custom daysBeforeExpiry parameter', () => {
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 45);
      
      const result = checkProfileValidity(soonDate, 60);
      
      expect(result.isExpiringSoon).toBe(true);
    });
  });
});

