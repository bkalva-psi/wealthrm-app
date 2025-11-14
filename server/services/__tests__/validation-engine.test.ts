/**
 * Phase 6: Validation Engine Service - Backend Tests
 * Comprehensive tests for backend validation engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { validateOrderBackend, ValidationRequest } from '../validation-engine';

describe('Phase 6: Validation Engine Service (Backend)', () => {
  const mockProductData = [
    {
      id: 1,
      minInvestment: 5000,
      maxInvestment: 1000000,
    },
    {
      id: 2,
      minInvestment: 10000,
      maxInvestment: 500000,
    },
    {
      id: 3,
      minInvestment: 1000,
      // No maxInvestment
    },
  ];

  beforeEach(() => {
    // Reset any state if needed
  });

  describe('Category 1: Basic Validation (Existing Tests)', () => {
    it('TC-BE-001: Should validate order with valid data', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000, // Valid amount within range
            transactionType: 'Purchase',
          },
        ],
        nominees: [],
        optOutOfNomination: true,
        productData: mockProductData,
      };

    const result = await validateOrderBackend(request);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

    it('TC-BE-002: Should reject order with amount below minimum', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 4000, // Below minimum of 5000
            transactionType: 'Purchase',
          },
        ],
        nominees: [],
        optOutOfNomination: true,
        productData: mockProductData,
      };

    const result = await validateOrderBackend(request);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('below minimum'))).toBe(true);
  });

    it('TC-BE-003: Should validate nominee percentages', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        nominees: [
          {
            percentage: 50,
            pan: 'ABCDE1234F',
            dateOfBirth: '1990-01-01',
          },
          {
            percentage: 50,
            pan: 'FGHIJ5678K',
            dateOfBirth: '1992-01-01',
          },
        ],
        optOutOfNomination: false,
        productData: mockProductData,
      };

    const result = await validateOrderBackend(request);
    expect(result.isValid).toBe(true);
  });

    it('TC-BE-004: Should reject invalid nominee percentages', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        nominees: [
          {
            percentage: 50,
            pan: 'ABCDE1234F',
            dateOfBirth: '1990-01-01',
          },
          {
            percentage: 40,
            pan: 'FGHIJ5678K',
            dateOfBirth: '1992-01-01',
          },
        ],
        optOutOfNomination: false,
        productData: mockProductData,
      };

    const result = await validateOrderBackend(request);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('must total exactly 100%'))).toBe(true);
  });

    it('TC-BE-005: Should validate EUIN format', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        nominees: [],
        optOutOfNomination: true,
        euin: 'E123456',
        productData: mockProductData,
      };

    const result = await validateOrderBackend(request);
    expect(result.isValid).toBe(true);
  });

    it('TC-BE-006: Should reject invalid EUIN format', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        nominees: [],
        optOutOfNomination: true,
        euin: 'INVALID',
        productData: mockProductData,
      };

    const result = await validateOrderBackend(request);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('EUIN'))).toBe(true);
  });
  });

  describe('Category 2: CRISIL Min/Max Investment Validation', () => {
    it('TC-P6-010: Purchase Amount Below Minimum Investment', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 4000, // Below minimum of 5000
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: true,
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('below minimum investment'))).toBe(true);
    });

    it('TC-P6-011: Purchase Amount Above Maximum Investment', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 1200000, // Above maximum of 1000000
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: true,
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('exceeds maximum investment'))).toBe(true);
    });

    it('TC-P6-012: Purchase Amount Within Valid Range', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000, // Within range
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: true,
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(true);
    });

    it('TC-P6-013: Purchase Amount Exactly at Minimum', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 5000, // Exactly at minimum
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: true,
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(true);
    });

    it('TC-P6-014: Purchase Amount Exactly at Maximum', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 1000000, // Exactly at maximum
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: true,
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Category 3: Full Redemption/Switch Bypass Rules', () => {
    it('TC-P6-020: Full Redemption Bypasses Min/Max Validation', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 1000, // Below minimum, but should bypass
            transactionType: 'Full Redemption',
          },
        ],
        optOutOfNomination: true,
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(true);
      expect(result.errors.filter(e => e.includes('minimum investment'))).toHaveLength(0);
      expect(result.errors.filter(e => e.includes('maximum investment'))).toHaveLength(0);
    });

    it('TC-P6-021: Full Switch Bypasses Min/Max Validation', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 1000, // Below minimum, but should bypass
            transactionType: 'Full Switch',
          },
        ],
        optOutOfNomination: true,
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(true);
      expect(result.errors.filter(e => e.includes('minimum investment'))).toHaveLength(0);
      expect(result.errors.filter(e => e.includes('maximum investment'))).toHaveLength(0);
    });
  });

  describe('Category 4: Market Value Validation', () => {
    it('TC-P6-030: Redemption Amount Exceeds Market Value', async () => {
      const marketValues = new Map<number, number>();
      marketValues.set(1, 100000);

      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 150000, // Exceeds market value
            transactionType: 'Redemption',
          },
        ],
        optOutOfNomination: true,
        productData: mockProductData,
        marketValues,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('cannot exceed market value'))).toBe(true);
    });

    it('TC-P6-031: Redemption Amount Within Market Value', async () => {
      const marketValues = new Map<number, number>();
      marketValues.set(1, 100000);

      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 75000, // Within market value
            transactionType: 'Redemption',
          },
        ],
        optOutOfNomination: true,
        productData: mockProductData,
        marketValues,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(true);
    });

    it('TC-P6-032: Purchase Should Not Check Market Value', async () => {
      const marketValues = new Map<number, number>();
      marketValues.set(1, 100000);

      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 200000, // Exceeds market value, but Purchase shouldn't check
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: true,
        productData: mockProductData,
        marketValues,
      };

      const result = await validateOrderBackend(request);

      // Should pass if within CRISIL limits (200000 is within max of 1000000)
      expect(result.errors.filter(e => e.includes('market value'))).toHaveLength(0);
    });

    it('TC-P6-033: Full Redemption Should Not Check Market Value', async () => {
      const marketValues = new Map<number, number>();
      marketValues.set(1, 100000);

      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 200000, // Exceeds market value, but Full Redemption shouldn't check
            transactionType: 'Full Redemption',
          },
        ],
        optOutOfNomination: true,
        productData: mockProductData,
        marketValues,
      };

      const result = await validateOrderBackend(request);

      expect(result.errors.filter(e => e.includes('market value'))).toHaveLength(0);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Category 5: Nominee Percentage Validation', () => {
    it('TC-P6-040: Nominee Percentages Total Exactly 100%', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: false,
        nominees: [
          {
            percentage: 60,
            pan: 'ABCDE1234F',
            dateOfBirth: '1990-01-01',
          },
          {
            percentage: 40,
            pan: 'FGHIJ5678K',
            dateOfBirth: '1995-01-01',
          },
        ],
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(true);
      expect(result.errors.filter(e => e.includes('Nominee percentages'))).toHaveLength(0);
    });

    it('TC-P6-041: Nominee Percentages Total Less Than 100%', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: false,
        nominees: [
          {
            percentage: 60,
            pan: 'ABCDE1234F',
            dateOfBirth: '1990-01-01',
          },
          {
            percentage: 30,
            pan: 'FGHIJ5678K',
            dateOfBirth: '1995-01-01',
          },
        ],
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Nominee percentages must total exactly 100%'))).toBe(true);
    });

    it('TC-P6-042: Nominee Percentages Total More Than 100%', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: false,
        nominees: [
          {
            percentage: 60,
            pan: 'ABCDE1234F',
            dateOfBirth: '1990-01-01',
          },
          {
            percentage: 50,
            pan: 'FGHIJ5678K',
            dateOfBirth: '1995-01-01',
          },
        ],
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Nominee percentages must total exactly 100%'))).toBe(true);
    });
  });

  describe('Category 6: PAN Validation', () => {
    it('TC-P6-050: Valid PAN Format', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: false,
        nominees: [
          {
            percentage: 100,
            pan: 'ABCDE1234F',
            dateOfBirth: '1990-01-01',
          },
        ],
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(true);
      expect(result.errors.filter(e => e.includes('Invalid PAN format'))).toHaveLength(0);
    });

    it('TC-P6-051: Invalid PAN Format - Wrong Pattern', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: false,
        nominees: [
          {
            percentage: 100,
            pan: 'ABCD1234F', // Invalid format
            dateOfBirth: '1990-01-01',
          },
        ],
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid PAN format'))).toBe(true);
    });
  });

  describe('Category 7: Minor Nominee Guardian Validation', () => {
    it('TC-P6-060: Minor Nominee Requires Guardian Name', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: false,
        nominees: [
          {
            percentage: 100,
            pan: 'ABCDE1234F',
            dateOfBirth: '2010-01-01', // Minor (under 18)
            // Missing guardianName
          },
        ],
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Guardian name is required for minor nominees'))).toBe(true);
    });

    it('TC-P6-061: Minor Nominee Requires Guardian PAN', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: false,
        nominees: [
          {
            percentage: 100,
            pan: 'ABCDE1234F',
            dateOfBirth: '2010-01-01', // Minor
            guardianName: 'Guardian Name',
            // Missing guardianPan
          },
        ],
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Guardian PAN is required for minor nominees'))).toBe(true);
    });

    it('TC-P6-062: Minor Nominee Requires Guardian Relationship', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: false,
        nominees: [
          {
            percentage: 100,
            pan: 'ABCDE1234F',
            dateOfBirth: '2010-01-01', // Minor
            guardianName: 'Guardian Name',
            guardianPan: 'GUARD1234I',
            // Missing guardianRelationship
          },
        ],
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Guardian relationship is required for minor nominees'))).toBe(true);
    });

    it('TC-P6-063: Valid Minor Nominee with All Guardian Info', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: false,
        nominees: [
          {
            percentage: 100,
            pan: 'ABCDE1234F',
            dateOfBirth: '2010-01-01', // Minor
            guardianName: 'Guardian Name',
            guardianPan: 'GUARD1234I',
            guardianRelationship: 'Father',
          },
        ],
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(true);
    });

    it('TC-P6-064: Adult Nominee Does Not Require Guardian Info', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: false,
        nominees: [
          {
            percentage: 100,
            pan: 'ABCDE1234F',
            dateOfBirth: '1990-01-01', // Adult
            // No guardian info needed
          },
        ],
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Category 8: Comprehensive Validation', () => {
    it('TC-P6-080: Multiple Validation Errors', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 4000, // Below minimum
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: false,
        nominees: [
          {
            percentage: 90, // Not 100%
            pan: 'ABCD1234F', // Invalid PAN
            dateOfBirth: '1990-01-01',
          },
        ],
        euin: '123456', // Invalid EUIN
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('TC-P6-081: All Validations Pass', async () => {
      const request: ValidationRequest = {
        cartItems: [
          {
            productId: 1,
            amount: 50000,
            transactionType: 'Purchase',
          },
        ],
        optOutOfNomination: false,
        nominees: [
          {
            percentage: 100,
            pan: 'ABCDE1234F',
            dateOfBirth: '1990-01-01',
          },
        ],
        euin: 'E123456',
        productData: mockProductData,
      };

      const result = await validateOrderBackend(request);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
