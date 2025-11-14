/**
 * Validation Engine Service
 * Backend validation for orders
 */

import { z } from 'zod';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRequest {
  cartItems: Array<{
    productId: number;
    amount: number;
    transactionType: string;
  }>;
  nominees?: Array<{
    percentage: number;
    pan: string;
    dateOfBirth: string;
    guardianName?: string;
    guardianPan?: string;
    guardianRelationship?: string;
  }>;
  optOutOfNomination: boolean;
  euin?: string;
  productData?: Array<{
    id: number;
    minInvestment: number;
    maxInvestment?: number;
  }>;
  marketValues?: Map<number, number>;
}

/**
 * Validate order on backend
 * This should match frontend validation logic
 */
export async function validateOrderBackend(request: ValidationRequest): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate cart items
  if (!request.cartItems || request.cartItems.length === 0) {
    errors.push('Cart cannot be empty');
    return { isValid: false, errors, warnings };
  }

  // Validate each cart item with product data
  if (request.productData) {
    request.cartItems.forEach((item, index) => {
      const product = request.productData!.find(p => p.id === item.productId);
      
      if (product) {
        // Skip CRISIL validation for Full Redemption/Full Switch
        const isFullTransaction = item.transactionType === 'Full Redemption' || 
                                  item.transactionType === 'Full Switch';
        
        if (!isFullTransaction) {
          // Validate minimum investment
          if (item.amount < product.minInvestment) {
            errors.push(
              `Item ${index + 1}: Amount ₹${item.amount.toLocaleString()} is below minimum investment of ₹${product.minInvestment.toLocaleString()}`
            );
          }

          // Validate maximum investment
          if (product.maxInvestment && item.amount > product.maxInvestment) {
            errors.push(
              `Item ${index + 1}: Amount ₹${item.amount.toLocaleString()} exceeds maximum investment of ₹${product.maxInvestment.toLocaleString()}`
            );
          }
        }
      }

      // Amount-based validation for redemption/switch (but not Full Redemption/Full Switch)
      const isFullTransaction = item.transactionType === 'Full Redemption' || 
                                item.transactionType === 'Full Switch';
      
      if ((item.transactionType === 'Redemption' || item.transactionType === 'Switch') &&
          !isFullTransaction &&
          request.marketValues) {
        const marketValue = request.marketValues.get(item.productId);
        if (marketValue !== undefined && item.amount > marketValue) {
          errors.push(
            `Item ${index + 1}: Amount cannot exceed market value of ₹${marketValue.toLocaleString()}`
          );
        }
      }
    });
  }

  // Validate nominees if not opted out
  if (!request.optOutOfNomination && request.nominees) {
    const totalPercentage = request.nominees.reduce((sum, n) => sum + (n.percentage || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push(
        `Nominee percentages must total exactly 100%. Current total: ${totalPercentage}%`
      );
    }

    // Validate each nominee
    request.nominees.forEach((nominee, index) => {
      // Validate PAN format
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(nominee.pan)) {
        errors.push(`Nominee ${index + 1}: Invalid PAN format`);
      }

      // Validate guardian info for minors
      const isMinor = checkIfMinor(nominee.dateOfBirth);
      if (isMinor) {
        if (!nominee.guardianName) {
          errors.push(`Nominee ${index + 1}: Guardian name is required for minor nominees`);
        }
        if (!nominee.guardianPan) {
          errors.push(`Nominee ${index + 1}: Guardian PAN is required for minor nominees`);
        } else {
          if (!panRegex.test(nominee.guardianPan)) {
            errors.push(`Nominee ${index + 1}: Invalid guardian PAN format`);
          }
        }
        if (!nominee.guardianRelationship) {
          errors.push(`Nominee ${index + 1}: Guardian relationship is required for minor nominees`);
        }
      }
    });
  }

  // Validate EUIN if provided
  if (request.euin) {
    const euinRegex = /^E[0-9A-Z]{6}$/;
    if (!euinRegex.test(request.euin)) {
      errors.push('EUIN must be in format: E followed by 6 alphanumeric characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if date of birth indicates a minor
 */
function checkIfMinor(dateOfBirth: string): boolean {
  if (!dateOfBirth) return false;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  return age < 18 || (age === 18 && monthDiff < 0);
}

