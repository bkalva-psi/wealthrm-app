/**
 * Validation Rules Tests
 * Tests all validation rules: Min/max, EUIN, PAN, nominee %
 */

import {
  validateMinInvestment,
  validateMaxInvestment,
  validateEUIN,
  validatePAN,
  validateNomineePercentages,
  validateOrderWithProducts,
  validateAmountBasedEntry,
} from '../utils/order-validations';
import { Product, CartItem, Nominee } from '../types/order.types';

describe('Validation Rules', () => {
  const mockProduct: Product = {
    id: 1,
    schemeName: 'Test Scheme',
    category: 'Equity',
    nav: 25.50,
    minInvestment: 1000,
    maxInvestment: 1000000,
    rta: 'CAMS',
    riskLevel: 'Moderate',
    isWhitelisted: true,
  };

  describe('Min/Max Investment Validation', () => {
    it('TC-VAL-001: Should validate minimum investment', () => {
      const result = validateMinInvestment(mockProduct, 500);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Amount must be at least ₹1,000'))).toBe(true);
    });

    it('TC-VAL-002: Should pass when amount meets minimum', () => {
      const result = validateMinInvestment(mockProduct, 1000);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('TC-VAL-003: Should validate maximum investment', () => {
      const result = validateMaxInvestment(mockProduct, 2000000);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      // Check that error message contains key parts (format may vary by locale)
      const errorMessage = result.errors[0];
      expect(errorMessage).toContain('Amount cannot exceed');
      expect(errorMessage).toContain('₹');
      // The number might be formatted differently by toLocaleString()
      expect(errorMessage.length).toBeGreaterThan(20); // Basic sanity check
    });

    it('TC-VAL-004: Should pass when amount is within maximum', () => {
      const result = validateMaxInvestment(mockProduct, 500000);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('TC-VAL-005: Should handle product without max investment', () => {
      const productWithoutMax = { ...mockProduct, maxInvestment: undefined };
      const result = validateMaxInvestment(productWithoutMax, 5000000);
      expect(result.isValid).toBe(true);
    });
  });

  describe('EUIN Validation', () => {
    it('TC-VAL-006: Should validate EUIN format (E + 6 alphanumeric)', () => {
      const result = validateEUIN('E123456');
      expect(result.isValid).toBe(true);
    });

    it('TC-VAL-007: Should reject invalid EUIN format', () => {
      const result = validateEUIN('1234567');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('E followed by 6 alphanumeric characters'))).toBe(true);
    });

    it('TC-VAL-008: Should reject EUIN with wrong length', () => {
      const result = validateEUIN('E12345');
      expect(result.isValid).toBe(false);
    });

    it('TC-VAL-009: Should accept empty EUIN (optional)', () => {
      const result = validateEUIN('');
      expect(result.isValid).toBe(true);
    });

    it('TC-VAL-010: Should reject EUIN with only 5 characters after E', () => {
      const result = validateEUIN('EABC12');
      expect(result.isValid).toBe(false); // EABC12 has only 5 chars after E, needs 6
    });
  });

  describe('PAN Validation', () => {
    it('TC-VAL-011: Should validate PAN format (5 letters, 4 digits, 1 letter)', () => {
      const result = validatePAN('ABCDE1234F');
      expect(result.isValid).toBe(true);
    });

    it('TC-VAL-012: Should reject invalid PAN format', () => {
      const result = validatePAN('ABCD1234F');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('5 letters, 4 digits, 1 letter'))).toBe(true);
    });

    it('TC-VAL-013: Should reject empty PAN', () => {
      const result = validatePAN('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('PAN is required');
    });

    it('TC-VAL-014: Should reject PAN with lowercase letters', () => {
      const result = validatePAN('abcde1234f');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Nominee Percentage Validation', () => {
    it('TC-VAL-015: Should validate nominee percentages total 100%', () => {
      const nominees: Nominee[] = [
        {
          id: '1',
          name: 'Nominee 1',
          relationship: 'Spouse',
          dateOfBirth: '1990-01-01',
          pan: 'ABCDE1234F',
          percentage: 50,
        },
        {
          id: '2',
          name: 'Nominee 2',
          relationship: 'Child',
          dateOfBirth: '2010-01-01',
          pan: 'FGHIJ5678K',
          percentage: 50,
        },
      ];
      const result = validateNomineePercentages(nominees);
      expect(result.isValid).toBe(true);
    });

    it('TC-VAL-016: Should reject when percentages do not total 100%', () => {
      const nominees: Nominee[] = [
        {
          id: '1',
          name: 'Nominee 1',
          relationship: 'Spouse',
          dateOfBirth: '1990-01-01',
          pan: 'ABCDE1234F',
          percentage: 50,
        },
        {
          id: '2',
          name: 'Nominee 2',
          relationship: 'Child',
          dateOfBirth: '2010-01-01',
          pan: 'FGHIJ5678K',
          percentage: 40,
        },
      ];
      const result = validateNomineePercentages(nominees);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('must total exactly 100%'))).toBe(true);
    });

    it('TC-VAL-017: Should reject negative percentages', () => {
      const nominees: Nominee[] = [
        {
          id: '1',
          name: 'Nominee 1',
          relationship: 'Spouse',
          dateOfBirth: '1990-01-01',
          pan: 'ABCDE1234F',
          percentage: -10,
        },
      ];
      const result = validateNomineePercentages(nominees);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('cannot be negative'))).toBe(true);
    });

    it('TC-VAL-018: Should reject percentages over 100%', () => {
      const nominees: Nominee[] = [
        {
          id: '1',
          name: 'Nominee 1',
          relationship: 'Spouse',
          dateOfBirth: '1990-01-01',
          pan: 'ABCDE1234F',
          percentage: 150,
        },
      ];
      const result = validateNomineePercentages(nominees);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('cannot exceed 100%'))).toBe(true);
    });

    it('TC-VAL-019: Should accept empty nominees array (opt-out)', () => {
      const result = validateNomineePercentages([]);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Amount-Based Entry Validation', () => {
    it('TC-VAL-020: Should validate amount does not exceed market value', () => {
      const result = validateAmountBasedEntry(50000, 100000);
      expect(result.isValid).toBe(true);
    });

    it('TC-VAL-021: Should reject amount exceeding market value', () => {
      const result = validateAmountBasedEntry(150000, 100000);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('cannot exceed market value'))).toBe(true);
    });
  });

  describe('Comprehensive Order Validation', () => {
    it('TC-VAL-022: Should validate complete order with all rules', () => {
      const cartItems: CartItem[] = [
        {
          id: '1',
          productId: 1,
          schemeName: 'Test Scheme',
          transactionType: 'Purchase',
          amount: 1000,
          nav: 25.50,
        },
      ];

      const nominees: Nominee[] = [
        {
          id: '1',
          name: 'Nominee 1',
          relationship: 'Spouse',
          dateOfBirth: '1990-01-01',
          pan: 'ABCDE1234F',
          percentage: 100,
        },
      ];

      const result = validateOrderWithProducts(
        cartItems,
        [mockProduct],
        nominees,
        false,
        'E123456'
      );

      expect(result.isValid).toBe(true);
    });

    it('TC-VAL-023: Should fail validation when amount below minimum', () => {
      const cartItems: CartItem[] = [
        {
          id: '1',
          productId: 1,
          schemeName: 'Test Scheme',
          transactionType: 'Purchase',
          amount: 500, // Below minimum
          nav: 25.50,
        },
      ];

      const result = validateOrderWithProducts(
        cartItems,
        [mockProduct],
        [],
        true,
        undefined
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('below minimum'))).toBe(true);
    });

    it('TC-VAL-024: Should fail validation when nominee percentages invalid', () => {
      const cartItems: CartItem[] = [
        {
          id: '1',
          productId: 1,
          schemeName: 'Test Scheme',
          transactionType: 'Purchase',
          amount: 1000,
          nav: 25.50,
        },
      ];

      const nominees: Nominee[] = [
        {
          id: '1',
          name: 'Nominee 1',
          relationship: 'Spouse',
          dateOfBirth: '1990-01-01',
          pan: 'ABCDE1234F',
          percentage: 50, // Should be 100%
        },
      ];

      const result = validateOrderWithProducts(
        cartItems,
        [mockProduct],
        nominees,
        false,
        undefined
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('must total exactly 100%'))).toBe(true);
    });

    it('TC-VAL-025: Should fail validation when EUIN format invalid', () => {
      const cartItems: CartItem[] = [
        {
          id: '1',
          productId: 1,
          schemeName: 'Test Scheme',
          transactionType: 'Purchase',
          amount: 1000,
          nav: 25.50,
        },
      ];

      const result = validateOrderWithProducts(
        cartItems,
        [mockProduct],
        [],
        true,
        'INVALID' // Invalid EUIN
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('EUIN'))).toBe(true);
    });
  });
});

