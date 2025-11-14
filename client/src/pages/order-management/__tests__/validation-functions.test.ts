/**
 * Phase 2: Validation Functions Unit Tests
 * Tests validation logic without complex component setup
 */

import * as validations from '../utils/order-validations';

// Mock products for testing
const mockProducts = [
  {
    id: 1,
    schemeName: 'HDFC Equity Fund',
    minInvestment: 5000,
    maxInvestment: 1000000,
    nav: 25.50,
  },
  {
    id: 2,
    schemeName: 'SBI Bluechip Fund',
    minInvestment: 10000,
    maxInvestment: 500000,
    nav: 45.75,
  },
];

describe('Phase 2: Validation Functions', () => {
  describe('CRISIL Min/Max Purchase Validation', () => {
    it('TC-P2-001: Purchase Amount Below Minimum Investment', () => {
      const result = validations.validateMinInvestment(mockProducts[0], 4000);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Amount must be at least ₹5,000'))).toBe(true);
    });

    it('TC-P2-002: Purchase Amount Above Maximum Investment', () => {
      const result = validations.validateMaxInvestment(mockProducts[0], 1200000);
      
      expect(result.isValid).toBe(false);
      // Check for error message about exceeding maximum
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('Amount cannot exceed') || e.includes('exceed'))).toBe(true);
    });

    it('TC-P2-003: Purchase Amount Within Valid Range', () => {
      const minResult = validations.validateMinInvestment(mockProducts[0], 50000);
      const maxResult = validations.validateMaxInvestment(mockProducts[0], 50000);
      
      expect(minResult.isValid).toBe(true);
      expect(maxResult.isValid).toBe(true);
    });

    it('TC-P2-004: Purchase Amount Exactly at Minimum', () => {
      const result = validations.validateMinInvestment(mockProducts[0], 5000);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('TC-P2-005: Purchase Amount Exactly at Maximum', () => {
      const result = validations.validateMaxInvestment(mockProducts[0], 1000000);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Amount-Based Limits (Market Value)', () => {
    it('TC-P2-010: Redemption Amount Exceeds Market Value', () => {
      const marketValue = 100000;
      const amount = 150000;

      const result = validations.validateAmountBasedEntry(amount, marketValue);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Amount cannot exceed market value'))).toBe(true);
    });

    it('TC-P2-011: Redemption Amount Within Market Value', () => {
      const marketValue = 100000;
      const amount = 75000;

      const result = validations.validateAmountBasedEntry(amount, marketValue);

      expect(result.isValid).toBe(true);
    });

    it('TC-P2-012: Redemption Amount Exactly at Market Value', () => {
      const marketValue = 100000;
      const amount = 100000;

      const result = validations.validateAmountBasedEntry(amount, marketValue);

      expect(result.isValid).toBe(true);
    });
  });

  describe('EUIN Validation', () => {
    it('TC-P2-015: Valid EUIN Format', () => {
      const validEUINs = ['E123456', 'EABCDEF', 'E12AB34'];

      validEUINs.forEach(euin => {
        const result = validations.validateEUIN(euin);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('TC-P2-016: Invalid EUIN Format - Missing E Prefix', () => {
      const result = validations.validateEUIN('123456');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('EUIN must be in format'))).toBe(true);
    });

    it('TC-P2-017: Invalid EUIN Format - Wrong Length', () => {
      const result = validations.validateEUIN('E12345');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('EUIN must be in format'))).toBe(true);
    });

    it('TC-P2-018: Invalid EUIN Format - Special Characters', () => {
      const result = validations.validateEUIN('E12345@');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('EUIN must be in format'))).toBe(true);
    });

    it('TC-P2-019: Empty EUIN (Optional Field)', () => {
      const result = validations.validateEUIN('');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('PAN Validation', () => {
    it('TC-P2-020: Valid PAN Format', () => {
      const validPANs = ['ABCDE1234F', 'XYZAB9876C', 'MNOPQ5678R'];

      validPANs.forEach(pan => {
        const result = validations.validatePAN(pan);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('TC-P2-021: Invalid PAN Format - Wrong Pattern', () => {
      const result = validations.validatePAN('ABCD1234F');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('PAN must be in format'))).toBe(true);
    });

    it('TC-P2-022: Invalid PAN Format - Lowercase Letters', () => {
      const result = validations.validatePAN('abcde1234f');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('PAN must be in format'))).toBe(true);
    });

    it('TC-P2-023: Missing PAN (Required Field)', () => {
      const result = validations.validatePAN('');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('PAN is required');
    });
  });

  describe('Nominee Percentage Validation', () => {
    it('TC-P2-026: Nominee Percentages Total Exactly 100%', () => {
      const nominees = [
        { id: '1', name: 'Nominee 1', pan: 'ABCDE1234F', percentage: 60, relationship: 'Spouse', dateOfBirth: '1990-01-01' },
        { id: '2', name: 'Nominee 2', pan: 'FGHIJ5678K', percentage: 40, relationship: 'Child', dateOfBirth: '1995-01-01' },
      ];

      const result = validations.validateNomineePercentages(nominees);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('TC-P2-027: Nominee Percentages Total Less Than 100%', () => {
      const nominees = [
        { id: '1', name: 'Nominee 1', pan: 'ABCDE1234F', percentage: 60, relationship: 'Spouse', dateOfBirth: '1990-01-01' },
        { id: '2', name: 'Nominee 2', pan: 'FGHIJ5678K', percentage: 30, relationship: 'Child', dateOfBirth: '1995-01-01' },
      ];

      const result = validations.validateNomineePercentages(nominees);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Nominee percentages must total exactly 100%'))).toBe(true);
    });

    it('TC-P2-028: Nominee Percentages Total More Than 100%', () => {
      const nominees = [
        { id: '1', name: 'Nominee 1', pan: 'ABCDE1234F', percentage: 60, relationship: 'Spouse', dateOfBirth: '1990-01-01' },
        { id: '2', name: 'Nominee 2', pan: 'FGHIJ5678K', percentage: 50, relationship: 'Child', dateOfBirth: '1995-01-01' },
      ];

      const result = validations.validateNomineePercentages(nominees);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Nominee percentages must total exactly 100%'))).toBe(true);
    });

    it('TC-P2-029: Single Nominee with 100%', () => {
      const nominees = [
        { id: '1', name: 'Nominee 1', pan: 'ABCDE1234F', percentage: 100, relationship: 'Spouse', dateOfBirth: '1990-01-01' },
      ];

      const result = validations.validateNomineePercentages(nominees);

      expect(result.isValid).toBe(true);
    });

    it('TC-P2-030: Negative Nominee Percentage', () => {
      const nominees = [
        { id: '1', name: 'Nominee 1', pan: 'ABCDE1234F', percentage: -10, relationship: 'Spouse', dateOfBirth: '1990-01-01' },
      ];

      const result = validations.validateNomineePercentages(nominees);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('percentage cannot be negative'))).toBe(true);
    });

    it('TC-P2-031: Nominee Percentage Exceeds 100%', () => {
      const nominees = [
        { id: '1', name: 'Nominee 1', pan: 'ABCDE1234F', percentage: 150, relationship: 'Spouse', dateOfBirth: '1990-01-01' },
      ];

      const result = validations.validateNomineePercentages(nominees);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('percentage cannot exceed 100%'))).toBe(true);
    });

    it('TC-P2-032: Nominee Percentages with Floating Point (Tolerance Check)', () => {
      // Test that tolerance check works for floating point numbers
      const nominees = [
        { id: '1', name: 'Nominee 1', pan: 'ABCDE1234F', percentage: 50.005, relationship: 'Spouse', dateOfBirth: '1990-01-01' },
        { id: '2', name: 'Nominee 2', pan: 'FGHIJ5678K', percentage: 49.995, relationship: 'Child', dateOfBirth: '1995-01-01' },
      ];

      const result = validations.validateNomineePercentages(nominees);

      // Should pass with tolerance check (within 0.01)
      expect(result.isValid).toBe(true);
    });
  });

  describe('Full Redemption/Full Switch Rules', () => {
    it('TC-P2-033: Full Redemption Bypasses Min/Max Validation', () => {
      const cartItem = {
        id: '1',
        productId: 1,
        schemeName: 'HDFC Equity Fund',
        transactionType: 'Full Redemption' as const,
        amount: 1000, // Below minimum, but should bypass
        closeAc: true,
      };

      const result = validations.validateCartItemWithProduct(
        cartItem,
        mockProducts[0],
        1
      );

      // Should not have min/max errors for Full Redemption
      expect(result.errors.filter(e => e.includes('minimum investment'))).toHaveLength(0);
      expect(result.errors.filter(e => e.includes('maximum investment'))).toHaveLength(0);
      expect(result.isValid).toBe(true);
    });

    it('TC-P2-034: Full Switch Bypasses Min/Max Validation', () => {
      const cartItem = {
        id: '1',
        productId: 1,
        schemeName: 'HDFC Equity Fund',
        transactionType: 'Full Switch' as const,
        amount: 1000, // Below minimum, but should bypass
        closeAc: true,
      };

      const result = validations.validateCartItemWithProduct(
        cartItem,
        mockProducts[0],
        1
      );

      // Should not have min/max errors for Full Switch
      expect(result.errors.filter(e => e.includes('minimum investment'))).toHaveLength(0);
      expect(result.errors.filter(e => e.includes('maximum investment'))).toHaveLength(0);
      expect(result.isValid).toBe(true);
    });

    it('TC-P2-035: Full Redemption/Switch Close Account Warning', () => {
      const cartItem = {
        id: '1',
        productId: 1,
        schemeName: 'HDFC Equity Fund',
        transactionType: 'Full Redemption' as const,
        amount: 1000,
        closeAc: false, // Not set
      };

      const result = validations.validateCartItemWithProduct(
        cartItem,
        mockProducts[0],
        1
      );

      // Should have warning but not error
      expect(result.warnings.some(w => w.includes('Close Account flag'))).toBe(true);
      expect(result.isValid).toBe(true); // Warning doesn't block
    });

    it('TC-P2-036: Full Redemption/Switch Detection', () => {
      expect(validations.isFullRedemptionOrSwitch('Full Redemption')).toBe(true);
      expect(validations.isFullRedemptionOrSwitch('Full Switch')).toBe(true);
      expect(validations.isFullRedemptionOrSwitch('Purchase')).toBe(false);
      expect(validations.isFullRedemptionOrSwitch('Redemption')).toBe(false);
    });

    it('TC-P2-033-BUGFIX: Full Redemption with Amount 0 Should Pass', () => {
      const cartItem = {
        id: '1',
        productId: 1,
        schemeName: 'HDFC Equity Fund',
        transactionType: 'Full Redemption' as const,
        amount: 0, // Should be allowed for Full Redemption
        closeAc: true,
      };

      const result = validations.validateCartItemWithProduct(
        cartItem,
        mockProducts[0],
        1
      );

      // Should not have "amount must be greater than 0" error
      expect(result.errors.filter(e => e.includes('Amount must be greater than 0'))).toHaveLength(0);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Comprehensive Order Validation', () => {
    it('TC-P2-051: Combined Validation - Multiple Errors', () => {
      const cartItems = [
        {
          id: '1',
          productId: 1,
          schemeName: 'HDFC Equity Fund',
          transactionType: 'Purchase' as const,
          amount: 4000, // Below minimum
        },
      ];

      const nominees = [
        {
          id: '1',
          name: 'Nominee 1',
          pan: 'ABCD1234F', // Invalid PAN
          percentage: 90, // Not 100%
          relationship: 'Spouse',
          dateOfBirth: '1990-01-01',
        },
      ];

      const result = validations.validateOrderWithProducts(
        cartItems,
        mockProducts,
        nominees,
        false,
        '123456', // Invalid EUIN
        undefined
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('TC-P2-053: Empty Cart Validation', () => {
      const result = validations.validateOrderWithProducts(
        [],
        mockProducts,
        [],
        true,
        undefined,
        undefined
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cart cannot be empty');
    });

    it('TC-P2-056: Product Data Not Available', () => {
      const cartItem = {
        id: '1',
        productId: 999, // Non-existent product
        schemeName: 'Unknown Fund',
        transactionType: 'Purchase' as const,
        amount: 10000,
      };

      const result = validations.validateCartItemWithProduct(
        cartItem,
        null, // Product not found
        1
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Product information not available'))).toBe(true);
    });

    it('TC-P2-014: Purchase Amount Not Validated Against Market Value', () => {
      const cartItem = {
        id: '1',
        productId: 1,
        schemeName: 'HDFC Equity Fund',
        transactionType: 'Purchase' as const,
        amount: 200000,
      };

      const marketValues = new Map<number, number>();
      marketValues.set(1, 100000); // Market value less than amount

      const result = validations.validateOrderWithProducts(
        [cartItem],
        mockProducts,
        [],
        true,
        undefined,
        marketValues
      );

      // Purchase should not check market value, only CRISIL min/max
      // Amount is within CRISIL limits, so should pass
      expect(result.isValid).toBe(true);
    });

    it('TC-P2-010-FIX: Full Redemption Should Not Check Market Value', () => {
      const cartItem = {
        id: '1',
        productId: 1,
        schemeName: 'HDFC Equity Fund',
        transactionType: 'Full Redemption' as const,
        amount: 200000,
        closeAc: true,
      };

      const marketValues = new Map<number, number>();
      marketValues.set(1, 100000); // Market value less than amount

      const result = validations.validateOrderWithProducts(
        [cartItem],
        mockProducts,
        [],
        true,
        undefined,
        marketValues
      );

      // Full Redemption should not check market value
      expect(result.errors.filter(e => e.includes('market value'))).toHaveLength(0);
      expect(result.isValid).toBe(true);
    });
  });
});

