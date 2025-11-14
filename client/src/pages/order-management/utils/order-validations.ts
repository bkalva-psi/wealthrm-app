/**
 * Order Validation Utilities
 * Based on BRD v1.0 validation rules
 */

import { Product, CartItem, Nominee, TransactionType } from '../types/order.types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate CRISIL minimum investment
 */
export function validateMinInvestment(
  product: Product,
  amount: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (amount < product.minInvestment) {
    errors.push(
      `Amount must be at least ₹${product.minInvestment.toLocaleString('en-US')}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate CRISIL maximum investment
 */
export function validateMaxInvestment(
  product: Product,
  amount: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (product.maxInvestment && amount > product.maxInvestment) {
    errors.push(
      `Amount cannot exceed ₹${product.maxInvestment.toLocaleString('en-US')}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate amount-based entry (max ≤ market value)
 * Note: Market value calculation would come from holdings data
 */
export function validateAmountBasedEntry(
  amount: number,
  marketValue: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (amount > marketValue) {
    errors.push(
      `Amount cannot exceed market value of ₹${marketValue.toLocaleString('en-US')}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Full Redemption/Switch - bypasses min/max validations
 */
export function isFullRedemptionOrSwitch(
  transactionType: TransactionType
): boolean {
  return transactionType === 'Full Redemption' || transactionType === 'Full Switch';
}

/**
 * Validate EUIN format (E + 6 characters)
 */
export function validateEUIN(euin: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!euin) {
    return { isValid: true, errors, warnings }; // EUIN is optional
  }

  const euinRegex = /^E[0-9A-Z]{6}$/;
  if (!euinRegex.test(euin)) {
    errors.push('EUIN must be in format: E followed by 6 alphanumeric characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate PAN format (10 alphanumeric characters)
 */
export function validatePAN(pan: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!pan) {
    errors.push('PAN is required');
    return { isValid: false, errors, warnings };
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan)) {
    errors.push('PAN must be in format: 5 letters, 4 digits, 1 letter');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate nominee percentage totals (must equal 100%)
 */
export function validateNomineePercentages(nominees: Nominee[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (nominees.length === 0) {
    return { isValid: true, errors, warnings }; // Opt-out is allowed
  }

  const totalPercentage = nominees.reduce((sum, nominee) => sum + (nominee.percentage || 0), 0);

  // Use tolerance check for floating point comparison (same as API)
  if (Math.abs(totalPercentage - 100) > 0.01) {
    errors.push(
      `Nominee percentages must total exactly 100%`
    );
  }

  // Check for negative percentages
  nominees.forEach((nominee, index) => {
    if (nominee.percentage < 0) {
      errors.push(`Nominee ${index + 1} percentage cannot be negative`);
    }
    if (nominee.percentage > 100) {
      errors.push(`Nominee ${index + 1} percentage cannot exceed 100%`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate guardian information for minor nominees
 */
export function validateGuardianInfo(nominee: Nominee): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const isMinor = (dob: string): boolean => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    return age < 18 || (age === 18 && monthDiff < 0);
  };

  if (isMinor(nominee.dateOfBirth)) {
    if (!nominee.guardianName) {
      errors.push('Guardian name is required for minor nominees');
    }
    if (!nominee.guardianPan) {
      errors.push('Guardian PAN is required for minor nominees');
    } else {
      const panValidation = validatePAN(nominee.guardianPan);
      if (!panValidation.isValid) {
        errors.push(...panValidation.errors.map(e => `Guardian PAN: ${e}`));
      }
    }
    if (!nominee.guardianRelationship) {
      errors.push('Guardian relationship is required for minor nominees');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate RTA name rules
 */
export function validateRTAName(rtaName: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!rtaName || rtaName.trim().length === 0) {
    errors.push('RTA name is required');
  }

  // Add specific RTA naming constraints as per BRD
  const validRTAs = ['CAMS', 'KFintech', 'Karvy', 'Franklin'];
  if (rtaName && !validRTAs.includes(rtaName)) {
    warnings.push(`RTA name "${rtaName}" may not be recognized`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate cart item with product data (CRISIL min/max)
 */
export function validateCartItemWithProduct(
  item: CartItem,
  product: Product | null,
  index: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!product) {
    errors.push(`Item ${index + 1}: Product information not available`);
    return { isValid: false, errors, warnings };
  }

  // Skip amount > 0 validation for Full Redemption/Full Switch (per BRD: can be 0 or blank)
  if (!isFullRedemptionOrSwitch(item.transactionType)) {
    if (item.amount <= 0) {
      errors.push(`Item ${index + 1}: Amount must be greater than 0`);
    }
  }

  // Skip CRISIL validation for Full Redemption/Full Switch
  if (!isFullRedemptionOrSwitch(item.transactionType)) {
    // Validate minimum investment
    if (item.amount < product.minInvestment) {
      errors.push(
        `Item ${index + 1} (${item.schemeName}): Amount ₹${item.amount.toLocaleString('en-US')} is below minimum investment of ₹${product.minInvestment.toLocaleString('en-US')}`
      );
    }

    // Validate maximum investment
    if (product.maxInvestment && item.amount > product.maxInvestment) {
      errors.push(
        `Item ${index + 1} (${item.schemeName}): Amount ₹${item.amount.toLocaleString('en-US')} exceeds maximum investment of ₹${product.maxInvestment.toLocaleString('en-US')}`
      );
    }
  } else {
    // For Full Redemption/Switch, validate that closeAc is set
    if (!item.closeAc) {
      warnings.push(`Item ${index + 1}: Full ${item.transactionType} should have Close Account flag set`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Comprehensive order validation with product data
 */
export function validateOrderWithProducts(
  cartItems: CartItem[],
  products: Product[],
  nominees: Nominee[],
  optOutOfNomination: boolean,
  euin?: string,
  marketValues?: Map<number, number> // productId -> marketValue
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate cart is not empty
  if (cartItems.length === 0) {
    errors.push('Cart cannot be empty');
    return { isValid: false, errors, warnings };
  }

  // Validate each cart item with product data
  cartItems.forEach((item, index) => {
    const product = products.find(p => p.id === item.productId);
    const itemValidation = validateCartItemWithProduct(item, product || null, index + 1);
    errors.push(...itemValidation.errors);
    warnings.push(...itemValidation.warnings);

    // Amount-based validation (max ≤ market value) for redemption/switch
    // Note: Full Redemption/Full Switch bypass market value validation per BRD
    if ((item.transactionType === 'Redemption' || item.transactionType === 'Switch') && marketValues && !isFullRedemptionOrSwitch(item.transactionType)) {
      const marketValue = marketValues.get(item.productId);
      if (marketValue !== undefined) {
        const amountValidation = validateAmountBasedEntry(item.amount, marketValue);
        if (!amountValidation.isValid) {
          errors.push(`Item ${index + 1} (${item.schemeName}): ${amountValidation.errors[0]}`);
        }
      }
    }
  });

  // Validate nominees (if not opted out)
  if (!optOutOfNomination) {
    const nomineeValidation = validateNomineePercentages(nominees);
    errors.push(...nomineeValidation.errors);
    warnings.push(...nomineeValidation.warnings);

    // Validate each nominee
    nominees.forEach((nominee, index) => {
      if (!nominee.name) {
        errors.push(`Nominee ${index + 1}: Name is required`);
      }
      if (!nominee.relationship) {
        errors.push(`Nominee ${index + 1}: Relationship is required`);
      }
      if (!nominee.dateOfBirth) {
        errors.push(`Nominee ${index + 1}: Date of birth is required`);
      }

      const panValidation = validatePAN(nominee.pan);
      if (!panValidation.isValid) {
        errors.push(`Nominee ${index + 1}: ${panValidation.errors.join(', ')}`);
      }

      const guardianValidation = validateGuardianInfo(nominee);
      if (!guardianValidation.isValid) {
        errors.push(`Nominee ${index + 1}: ${guardianValidation.errors.join(', ')}`);
      }
    });
  }

  // Validate EUIN if provided
  if (euin) {
    const euinValidation = validateEUIN(euin);
    if (!euinValidation.isValid) {
      errors.push(...euinValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Comprehensive order validation (legacy - for backward compatibility)
 */
export function validateOrder(
  cartItems: CartItem[],
  nominees: Nominee[],
  optOutOfNomination: boolean,
  euin?: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate cart is not empty
  if (cartItems.length === 0) {
    errors.push('Cart cannot be empty');
  }

  // Validate each cart item
  cartItems.forEach((item, index) => {
    if (item.amount <= 0) {
      errors.push(`Item ${index + 1}: Amount must be greater than 0`);
    }
  });

  // Validate nominees (if not opted out)
  if (!optOutOfNomination) {
    const nomineeValidation = validateNomineePercentages(nominees);
    errors.push(...nomineeValidation.errors);
    warnings.push(...nomineeValidation.warnings);

    // Validate each nominee
    nominees.forEach((nominee, index) => {
      if (!nominee.name) {
        errors.push(`Nominee ${index + 1}: Name is required`);
      }
      if (!nominee.relationship) {
        errors.push(`Nominee ${index + 1}: Relationship is required`);
      }
      if (!nominee.dateOfBirth) {
        errors.push(`Nominee ${index + 1}: Date of birth is required`);
      }

      const panValidation = validatePAN(nominee.pan);
      if (!panValidation.isValid) {
        errors.push(`Nominee ${index + 1}: ${panValidation.errors.join(', ')}`);
      }

      const guardianValidation = validateGuardianInfo(nominee);
      if (!guardianValidation.isValid) {
        errors.push(`Nominee ${index + 1}: ${guardianValidation.errors.join(', ')}`);
      }
    });
  }

  // Validate EUIN if provided
  if (euin) {
    const euinValidation = validateEUIN(euin);
    if (!euinValidation.isValid) {
      errors.push(...euinValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

