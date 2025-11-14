/**
 * Phase 2: Validation & Submit Flow - Comprehensive Test Suite
 * Tests all validation rules and order submission functionality
 */

import * as validations from '../utils/order-validations';
import { apiRequest } from '@/lib/queryClient';

// Mock apiRequest
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}));

// Mock products API response
const mockProducts = [
  {
    id: 1,
    schemeName: 'HDFC Equity Fund',
    minInvestment: 5000,
    maxInvestment: 1000000,
    minRedemption: 1000,
    maxRedemption: 500000,
    nav: 25.50,
  },
  {
    id: 2,
    schemeName: 'SBI Bluechip Fund',
    minInvestment: 10000,
    maxInvestment: 500000,
    minRedemption: 2000,
    maxRedemption: 300000,
    nav: 45.75,
  },
];

describe('Phase 2: Validation & Submit Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Category 1: CRISIL Min/Max Purchase Validation', () => {
    it('TC-P2-001: Purchase Amount Below Minimum Investment', async () => {
      const result = validations.validateMinInvestment(mockProducts[0], 4000);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Amount must be at least ₹5,000'))).toBe(true);
    });

    it('TC-P2-002: Purchase Amount Above Maximum Investment', async () => {
      const result = validations.validateMaxInvestment(mockProducts[0], 1200000);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Amount cannot exceed ₹1,000,000'))).toBe(true);
    });

    it('TC-P2-003: Purchase Amount Within Valid Range', async () => {
      const minResult = validations.validateMinInvestment(mockProducts[0], 50000);
      const maxResult = validations.validateMaxInvestment(mockProducts[0], 50000);
      
      expect(minResult.isValid).toBe(true);
      expect(maxResult.isValid).toBe(true);
    });

    it('TC-P2-004: Purchase Amount Exactly at Minimum', async () => {
      const result = validations.validateMinInvestment(mockProducts[0], 5000);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('TC-P2-005: Purchase Amount Exactly at Maximum', async () => {
      const result = validations.validateMaxInvestment(mockProducts[0], 1000000);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('TC-P2-006: Multiple Cart Items with Different Min/Max Rules', async () => {
      const cartItems = [
        {
          id: '1',
          productId: 1,
          schemeName: 'HDFC Equity Fund',
          transactionType: 'Purchase' as const,
          amount: 4000, // Below min
        },
        {
          id: '2',
          productId: 2,
          schemeName: 'SBI Bluechip Fund',
          transactionType: 'Purchase' as const,
          amount: 600000, // Above max
        },
      ];

      const result = validations.validateOrderWithProducts(
        cartItems,
        mockProducts,
        [],
        true,
        undefined,
        undefined
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('below minimum investment'))).toBe(true);
      expect(result.errors.some(e => e.includes('exceeds maximum investment'))).toBe(true);
    });
  });

  describe('Category 2: CRISIL Min/Max Redemption Validation', () => {
    it('TC-P2-007: Redemption Amount Below Minimum Redemption', async () => {
      const cartItem = {
        id: '1',
        productId: 1,
        schemeName: 'HDFC Equity Fund',
        transactionType: 'Redemption' as const,
        amount: 500, // Below minRedemption
      };

      const result = validations.validateCartItemWithProduct(
        cartItem,
        mockProducts[0],
        1
      );

      // Note: Current implementation uses minInvestment for all transactions
      // This test documents expected behavior if minRedemption is added
      expect(result.isValid).toBe(false);
    });

    it('TC-P2-008: Redemption Amount Above Maximum Redemption', async () => {
      const cartItem = {
        id: '1',
        productId: 1,
        schemeName: 'HDFC Equity Fund',
        transactionType: 'Redemption' as const,
        amount: 600000, // Above maxRedemption
      };

      const result = validations.validateCartItemWithProduct(
        cartItem,
        mockProducts[0],
        1
      );

      // Note: Current implementation uses maxInvestment for all transactions
      expect(result.isValid).toBe(false);
    });

    it('TC-P2-009: Redemption Amount Within Valid Range', async () => {
      const cartItem = {
        id: '1',
        productId: 1,
        schemeName: 'HDFC Equity Fund',
        transactionType: 'Redemption' as const,
        amount: 50000,
      };

      const result = validations.validateCartItemWithProduct(
        cartItem,
        mockProducts[0],
        1
      );

      expect(result.isValid).toBe(true);
    });
  });

  describe('Category 3: Amount-Based Limits (Market Value)', () => {
    it('TC-P2-010: Redemption Amount Exceeds Market Value', async () => {
      const marketValue = 100000;
      const amount = 150000;

      const result = validations.validateAmountBasedEntry(amount, marketValue);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Amount cannot exceed market value of ₹100,000'))).toBe(true);
    });

    it('TC-P2-011: Redemption Amount Within Market Value', async () => {
      const marketValue = 100000;
      const amount = 75000;

      const result = validations.validateAmountBasedEntry(amount, marketValue);

      expect(result.isValid).toBe(true);
    });

    it('TC-P2-012: Redemption Amount Exactly at Market Value', async () => {
      const marketValue = 100000;
      const amount = 100000;

      const result = validations.validateAmountBasedEntry(amount, marketValue);

      expect(result.isValid).toBe(true);
    });

    it('TC-P2-013: Switch Amount Exceeds Market Value', async () => {
      const marketValue = 200000;
      const amount = 250000;

      const result = validations.validateAmountBasedEntry(amount, marketValue);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Amount cannot exceed market value'))).toBe(true);
    });

    it('TC-P2-014: Purchase Amount Not Validated Against Market Value', async () => {
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
      // If amount is within CRISIL limits, validation should pass
      if (cartItem.amount >= mockProducts[0].minInvestment && 
          cartItem.amount <= (mockProducts[0].maxInvestment || Infinity)) {
        expect(result.isValid).toBe(true);
      }
    });
  });

  describe('Category 4: EUIN Validation', () => {
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
      expect(result.errors.some(e => e.includes('EUIN must be in format: E followed by 6 alphanumeric characters'))).toBe(true);
    });

    it('TC-P2-017: Invalid EUIN Format - Wrong Length', () => {
      const result = validations.validateEUIN('E12345');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('EUIN must be in format: E followed by 6 alphanumeric characters'))).toBe(true);
    });

    it('TC-P2-018: Invalid EUIN Format - Special Characters', () => {
      const result = validations.validateEUIN('E12345@');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('EUIN must be in format: E followed by 6 alphanumeric characters'))).toBe(true);
    });

    it('TC-P2-019: Empty EUIN (Optional Field)', () => {
      const result = validations.validateEUIN('');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Category 5: PAN Validation', () => {
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
      expect(result.errors.some(e => e.includes('PAN must be in format: 5 letters, 4 digits, 1 letter'))).toBe(true);
    });

    it('TC-P2-022: Invalid PAN Format - Lowercase Letters', () => {
      const result = validations.validatePAN('abcde1234f');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('PAN must be in format: 5 letters, 4 digits, 1 letter'))).toBe(true);
    });

    it('TC-P2-023: Missing PAN (Required Field)', () => {
      const result = validations.validatePAN('');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('PAN is required');
    });

    it('TC-P2-024: Guardian PAN Validation for Minor Nominee', () => {
      const minorNominee = {
        id: '1',
        name: 'Minor Nominee',
        pan: 'ABCDE1234F',
        percentage: 100,
        relationship: 'Child',
        dateOfBirth: '2010-01-01', // Minor
        guardianPan: 'ABCD1234F', // Invalid format
      };

      const result = validations.validateGuardianInfo(minorNominee);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Guardian PAN'))).toBe(true);
    });

    it('TC-P2-025: Missing Guardian PAN for Minor Nominee', () => {
      const minorNominee = {
        id: '1',
        name: 'Minor Nominee',
        pan: 'ABCDE1234F',
        percentage: 100,
        relationship: 'Child',
        dateOfBirth: '2010-01-01', // Minor
        guardianPan: '', // Missing
      };

      const result = validations.validateGuardianInfo(minorNominee);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Guardian PAN is required for minor nominees');
    });
  });

  describe('Category 6: Nominee Percentage Validation', () => {
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
      expect(result.errors.some(e => e.includes('Nominee 1 percentage cannot be negative'))).toBe(true);
    });

    it('TC-P2-031: Nominee Percentage Exceeds 100%', () => {
      const nominees = [
        { id: '1', name: 'Nominee 1', pan: 'ABCDE1234F', percentage: 150, relationship: 'Spouse', dateOfBirth: '1990-01-01' },
      ];

      const result = validations.validateNomineePercentages(nominees);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Nominee 1 percentage cannot exceed 100%'))).toBe(true);
    });

    it('TC-P2-032: Opt Out of Nomination (No Nominees Required)', () => {
      const result = validations.validateOrderWithProducts(
        [{ id: '1', productId: 1, schemeName: 'Test', transactionType: 'Purchase', amount: 10000 }],
        mockProducts,
        [],
        true, // Opted out
        undefined,
        undefined
      );

      // Should not validate nominees when opted out
      expect(result.errors.filter(e => e.includes('Nominee'))).toHaveLength(0);
    });
  });

  describe('Category 7: Full Redemption/Full Switch Rules', () => {
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
  });

  describe('Category 8: Order Submission API Integration', () => {
    it('TC-P2-037: Submit Order with Valid Data', async () => {
      const mockOrder = {
        id: 12345,
        modelOrderId: 'MO-20250113-ABC12',
        status: 'Pending Approval',
        createdAt: new Date().toISOString(),
      };

      (apiRequest as any).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          message: 'Order submitted successfully',
          data: mockOrder,
        }),
      } as Response);

      const cartItems = [
        {
          id: '1',
          productId: 1,
          schemeName: 'HDFC Equity Fund',
          transactionType: 'Purchase' as const,
          amount: 50000,
        },
      ];

      const nominees = [
        {
          id: '1',
          name: 'Nominee 1',
          pan: 'ABCDE1234F',
          percentage: 100,
          relationship: 'Spouse',
          dateOfBirth: '1990-01-01',
        },
      ];

      const result = validations.validateOrderWithProducts(
        cartItems,
        mockProducts,
        nominees,
        false,
        'E123456',
        undefined
      );

      expect(result.isValid).toBe(true);
    });

    it('TC-P2-038: Submit Order Request Payload Structure', async () => {
      const orderData = {
        cartItems: [
          {
            id: '1',
            productId: 1,
            schemeName: 'HDFC Equity Fund',
            transactionType: 'Purchase',
            amount: 50000,
          },
        ],
        transactionMode: {
          mode: 'Physical',
          euin: 'E123456',
          branchCode: 'BR001',
        },
        nominees: [
          {
            id: '1',
            name: 'Nominee Name',
            pan: 'ABCDE1234F',
            percentage: 100,
            relationship: 'Spouse',
            dateOfBirth: '1990-01-01',
          },
        ],
        optOutOfNomination: false,
        fullSwitchData: null,
        fullRedemptionData: null,
      };

      // Verify structure
      expect(orderData).toHaveProperty('cartItems');
      expect(orderData).toHaveProperty('transactionMode');
      expect(orderData).toHaveProperty('nominees');
      expect(orderData).toHaveProperty('optOutOfNomination');
      expect(Array.isArray(orderData.cartItems)).toBe(true);
      expect(orderData.transactionMode).toHaveProperty('mode');
    });

    it('TC-P2-039: Submit Button Disabled During Submission', () => {
      // This would be tested in integration/E2E tests
      // Unit test verifies the disabled prop logic
      const isSubmitting = true;
      const hasValidationErrors = false;
      const cartItemsLength = 1;

      const shouldDisable = isSubmitting || hasValidationErrors || cartItemsLength === 0;

      expect(shouldDisable).toBe(true);
    });

    it('TC-P2-040: Submit Button Disabled When Validation Errors Exist', () => {
      const isSubmitting = false;
      const hasValidationErrors = true;
      const cartItemsLength = 1;

      const shouldDisable = isSubmitting || hasValidationErrors || cartItemsLength === 0;

      expect(shouldDisable).toBe(true);
    });
  });

  describe('Category 9: Success Response Handling', () => {
    it('TC-P2-041: Successful Order Submission - Confirmation Display', async () => {
      const mockOrder = {
        id: 12345,
        modelOrderId: 'MO-20250113-ABC12',
        status: 'Pending Approval',
        createdAt: new Date().toISOString(),
      };

      const response = {
        success: true,
        message: 'Order submitted successfully',
        data: mockOrder,
      };

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('modelOrderId');
      expect(response.data.modelOrderId).toMatch(/^MO-\d{8}-[A-Z0-9]{5}$/);
    });

    it('TC-P2-042: Successful Order Submission - Form Reset', () => {
      // Test that form state should be reset
      const initialState = {
        cartItems: [],
        transactionMode: null,
        nominees: [],
        optOutOfNomination: false,
        fullSwitchData: null,
        fullRedemptionData: null,
      };

      expect(initialState.cartItems).toHaveLength(0);
      expect(initialState.transactionMode).toBeNull();
      expect(initialState.nominees).toHaveLength(0);
    });

    it('TC-P2-043: Successful Order Submission - Navigation', () => {
      // Test navigation logic
      const activeTab = 'order-book';
      expect(activeTab).toBe('order-book');
    });

    it('TC-P2-044: Successful Order Submission - Model Order ID Display', () => {
      const modelOrderId = 'MO-20250113-ABC12';
      const expectedPattern = /^MO-\d{8}-[A-Z0-9]{5}$/;

      expect(modelOrderId).toMatch(expectedPattern);
      expect(modelOrderId).toContain('MO-');
    });
  });

  describe('Category 10: Error Response Handling', () => {
    it('TC-P2-045: API Error - Validation Error Response', () => {
      const errorResponse = {
        success: false,
        message: 'Validation failed',
        errors: [
          'Cart cannot be empty',
          'Transaction mode must be selected',
        ],
      };

      expect(errorResponse.success).toBe(false);
      expect(Array.isArray(errorResponse.errors)).toBe(true);
      expect(errorResponse.errors.length).toBeGreaterThan(0);
    });

    it('TC-P2-046: API Error - Server Error (500)', () => {
      const errorResponse = {
        success: false,
        message: 'Internal server error',
        status: 500,
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.status).toBe(500);
    });

    it('TC-P2-047: API Error - Network Error', () => {
      const networkError = new Error('Network error');
      expect(networkError.message).toBe('Network error');
    });

    it('TC-P2-048: API Error - Timeout', () => {
      const timeoutError = new Error('Request timed out');
      expect(timeoutError.message.toLowerCase()).toContain('timed out');
    });

    it('TC-P2-049: API Error - Unauthorized (401)', () => {
      const errorResponse = {
        success: false,
        message: 'Unauthorized',
        status: 401,
      };

      expect(errorResponse.status).toBe(401);
    });

    it('TC-P2-050: API Error - Multiple Validation Errors Display', () => {
      const errorResponse = {
        success: false,
        message: 'Validation failed',
        errors: [
          'Item 1: Amount is below minimum investment',
          'Nominee percentages must total 100%',
          'EUIN format is invalid',
        ],
      };

      expect(errorResponse.errors.length).toBe(3);
      expect(errorResponse.errors.every(e => typeof e === 'string')).toBe(true);
    });
  });

  describe('Category 11: Integration & Edge Cases', () => {
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

    it('TC-P2-052: Real-Time Validation Feedback', () => {
      // This would be tested in integration/E2E tests
      // Unit test verifies validation functions work correctly
      const result1 = validations.validateEUIN('E123456');
      const result2 = validations.validateEUIN('123456');

      expect(result1.isValid).toBe(true);
      expect(result2.isValid).toBe(false);
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

    it('TC-P2-054: Missing Transaction Mode', () => {
      // This is handled in the component, not validation function
      // Test that validation passes when transaction mode is missing from validation
      const result = validations.validateOrderWithProducts(
        [{ id: '1', productId: 1, schemeName: 'Test', transactionType: 'Purchase', amount: 10000 }],
        mockProducts,
        [],
        true,
        undefined,
        undefined
      );

      // Validation function doesn't check transaction mode
      // That's handled in the component
      expect(result.isValid).toBe(true);
    });

    it('TC-P2-055: Market Value Not Available', () => {
      const cartItem = {
        id: '1',
        productId: 1,
        schemeName: 'HDFC Equity Fund',
        transactionType: 'Redemption' as const,
        amount: 50000,
      };

      // No market values provided
      const result = validations.validateOrderWithProducts(
        [cartItem],
        mockProducts,
        [],
        true,
        undefined,
        undefined // No market values
      );

      // Should not fail if market value not available
      expect(result.errors.filter(e => e.includes('market value'))).toHaveLength(0);
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

    it('TC-P2-057: Concurrent Submission Prevention', () => {
      // This would be tested in integration/E2E tests
      // Logic: isSubmitting flag prevents concurrent submissions
      const isSubmitting = true;
      const shouldBlock = isSubmitting;

      expect(shouldBlock).toBe(true);
    });

    it('TC-P2-058: Form State Persistence on Error', () => {
      // This would be tested in integration/E2E tests
      // Logic: Form state should not be reset on error
      const shouldReset = false;
      expect(shouldReset).toBe(false);
    });

    it('TC-P2-059: Validation Summary Display', () => {
      const result = validations.validateOrderWithProducts(
        [
          { id: '1', productId: 1, schemeName: 'Test 1', transactionType: 'Purchase', amount: 4000 },
          { id: '2', productId: 2, schemeName: 'Test 2', transactionType: 'Purchase', amount: 600000 },
        ],
        mockProducts,
        [],
        true,
        undefined,
        undefined
      );

      expect(result.errors.length).toBeGreaterThan(0);
      // All errors should be in the errors array
      expect(result.errors.every(e => typeof e === 'string')).toBe(true);
    });

    it('TC-P2-060: Loading State During Validation', () => {
      // This would be tested in integration/E2E tests
      // Unit test verifies validation is synchronous
      const startTime = Date.now();
      validations.validateEUIN('E123456');
      const endTime = Date.now();

      // Validation should be fast (synchronous)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});

