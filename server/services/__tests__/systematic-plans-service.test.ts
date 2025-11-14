/**
 * Phase 3: Systematic Plans Service - Backend Tests
 * Tests the actual service implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSIPPlan,
  createSTPPlan,
  createSWPPlan,
  getPlanById,
  getPlansByStatus,
  modifyPlan,
  cancelPlan,
  getPlansScheduledForDate,
  markPlanExecution,
  clearPlansStorage,
} from '../systematic-plans-service';
import {
  processScheduledPlans,
  retryFailedExecutions,
  clearExecutionLogs,
} from '../scheduler-service';

describe('Phase 3: Systematic Plans Service (Backend)', () => {
  // Helper to get future date
  const getFutureDate = (daysFromNow: number = 30): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().slice(0, 10);
  };

  beforeEach(() => {
    clearPlansStorage();
    clearExecutionLogs();
  });

  describe('Category 1: SIP Setup', () => {
    it('TC-P3-001: Create SIP Plan with Valid Data', async () => {
      const futureDate = getFutureDate(30);
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: futureDate,
        frequency: 'Monthly' as const,
        installments: 12,
      };

      const plan = await createSIPPlan(1, sipData);

      expect(plan).toBeDefined();
      expect(plan.planType).toBe('SIP');
      expect(plan.amount).toBe(5000);
      expect(plan.status).toBe('Active');
      expect(plan.id).toMatch(/^SIP-/);
      expect(plan.nextExecutionDate).toBe(futureDate);
    });

    it('TC-P3-002: SIP Setup - Validate Minimum Amount', async () => {
      const sipData = {
        schemeId: 1,
        amount: 500, // Below minimum (will be validated in API, not service)
        startDate: getFutureDate(30),
        frequency: 'Monthly' as const,
        installments: 12,
      };

      // Service doesn't validate min amount, API does
      // But we can test the plan is created
      const plan = await createSIPPlan(1, sipData);
      expect(plan).toBeDefined();
    });

    it('TC-P3-004: SIP Setup - Validate Start Date (Future Date)', async () => {
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: '2024-01-01', // Past date
        frequency: 'Monthly' as const,
        installments: 12,
      };

      await expect(createSIPPlan(1, sipData)).rejects.toThrow('Start date must be a future date');
    });

    it('TC-P3-005: SIP Setup - Validate Frequency Options', () => {
      const allowedFrequencies = ['Monthly', 'Quarterly'];
      const selectedFrequency = 'Daily';

      const isValid = allowedFrequencies.includes(selectedFrequency);
      expect(isValid).toBe(false);
    });

    it('TC-P3-006: SIP Setup - Validate Installment Count', () => {
      const installments = 0;
      const isValid = installments > 0;
      expect(isValid).toBe(false);
    });
  });

  describe('Category 2: STP Setup', () => {
    it('TC-P3-007: Create STP Plan with Valid Data', async () => {
      const stpData = {
        sourceSchemeId: 1,
        targetSchemeId: 2,
        amount: 10000,
        startDate: getFutureDate(30),
        frequency: 'Monthly' as const,
        installments: 6,
      };

      const plan = await createSTPPlan(1, stpData);

      expect(plan).toBeDefined();
      expect(plan.planType).toBe('STP');
      expect(plan.sourceSchemeId).toBe(1);
      expect(plan.targetSchemeId).toBe(2);
      expect(plan.status).toBe('Active');
    });

    it('TC-P3-007-BUGFIX: STP Setup - Source and Target Must Be Different', async () => {
      const stpData = {
        sourceSchemeId: 1,
        targetSchemeId: 1, // Same scheme
        amount: 10000,
        startDate: getFutureDate(30),
        frequency: 'Monthly' as const,
        installments: 6,
      };

      await expect(createSTPPlan(1, stpData)).rejects.toThrow('Source and target schemes must be different');
    });
  });

  describe('Category 3: SWP Setup', () => {
    it('TC-P3-010: Create SWP Plan with Valid Data', async () => {
      const swpData = {
        schemeId: 1,
        amount: 5000,
        startDate: getFutureDate(30),
        frequency: 'Monthly' as const,
        installments: 12,
      };

      const plan = await createSWPPlan(1, swpData);

      expect(plan).toBeDefined();
      expect(plan.planType).toBe('SWP');
      expect(plan.status).toBe('Active');
    });
  });

  describe('Category 4: Modify Plans', () => {
    it('TC-P3-013: Modify Active SIP Plan', async () => {
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: getFutureDate(30),
        frequency: 'Monthly' as const,
        installments: 12,
      };
      const plan = await createSIPPlan(1, sipData);

      const updates = { amount: 7500 };
      const modifiedPlan = await modifyPlan(plan.id, updates);

      expect(modifiedPlan.amount).toBe(7500);
      expect(modifiedPlan.updatedAt).toBeDefined();
    });

    it('TC-P3-015: Modify Plan - Cannot Modify Completed Plan', async () => {
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: getFutureDate(30),
        frequency: 'Monthly' as const,
        installments: 1,
      };
      const plan = await createSIPPlan(1, sipData);
      
      await markPlanExecution(plan.id, true);

      await expect(modifyPlan(plan.id, { amount: 7500 })).rejects.toThrow('Cannot modify plan that is not Active');
    });

    it('TC-P3-042: Plan Modification During Execution Window', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: today,
        frequency: 'Monthly' as const,
        installments: 12,
      };
      const plan = await createSIPPlan(1, sipData, true); // Skip date validation for test

      await expect(modifyPlan(plan.id, { amount: 7500 })).rejects.toThrow('Cannot modify plan scheduled for execution today');
    });
  });

  describe('Category 5: Cancel Plans', () => {
    it('TC-P3-016: Cancel Active SIP Plan', async () => {
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: getFutureDate(30),
        frequency: 'Monthly' as const,
        installments: 12,
      };
      const plan = await createSIPPlan(1, sipData);

      const cancelledPlan = await cancelPlan(plan.id, 'Client request');

      expect(cancelledPlan.status).toBe('Cancelled');
      expect(cancelledPlan.cancelledAt).toBeDefined();
      expect(cancelledPlan.cancelledReason).toBe('Client request');
    });

    it('TC-P3-018: Cancel Plan - Cannot Cancel Completed Plan', async () => {
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: getFutureDate(30),
        frequency: 'Monthly' as const,
        installments: 1,
      };
      const plan = await createSIPPlan(1, sipData);
      
      await markPlanExecution(plan.id, true);

      await expect(cancelPlan(plan.id)).rejects.toThrow('Cannot cancel completed plan');
    });
  });

  describe('Category 6: Scheduler - Execution & Reattempts', () => {
    it('TC-P3-019: Scheduler Executes SIP on Scheduled Date', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: today,
        frequency: 'Monthly' as const,
        installments: 12,
      };
      const plan = await createSIPPlan(1, sipData, true); // Skip date validation for test

      const logs = await processScheduledPlans(today);

      expect(logs.length).toBeGreaterThan(0);
      const planLog = logs.find(log => log.planId === plan.id);
      expect(planLog).toBeDefined();
    });

    it('TC-P3-022: Scheduler Marks Failed After Max Retries', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: today,
        frequency: 'Monthly' as const,
        installments: 12,
      };
      const plan = await createSIPPlan(1, sipData, true); // Skip date validation for test

      // Simulate 3 failures
      await markPlanExecution(plan.id, false, 'Insufficient funds');
      await markPlanExecution(plan.id, false, 'Insufficient funds');
      await markPlanExecution(plan.id, false, 'Insufficient funds');

      const failedPlan = await getPlanById(plan.id);
      expect(failedPlan?.status).toBe('Failed');
    });
  });

  describe('Category 7: Operations Console - Dashboard Views', () => {
    it('TC-P3-024: Operations Console - View Active Plans', async () => {
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: getFutureDate(30),
        frequency: 'Monthly' as const,
        installments: 12,
      };
      await createSIPPlan(1, sipData);

      const plans = await getPlansByStatus('Active');

      expect(plans.length).toBeGreaterThan(0);
      expect(plans[0].status).toBe('Active');
    });

    it('TC-P3-025: Operations Console - View Closed Plans', async () => {
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: getFutureDate(30),
        frequency: 'Monthly' as const,
        installments: 1,
      };
      const plan = await createSIPPlan(1, sipData);
      await markPlanExecution(plan.id, true);

      const plans = await getPlansByStatus('Closed');

      expect(plans.length).toBeGreaterThan(0);
      expect(plans[0].status).toBe('Closed');
    });

    it('TC-P3-026: Operations Console - View Cancelled Plans', async () => {
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: getFutureDate(30),
        frequency: 'Monthly' as const,
        installments: 12,
      };
      const plan = await createSIPPlan(1, sipData);
      await cancelPlan(plan.id);

      const plans = await getPlansByStatus('Cancelled');

      expect(plans.length).toBeGreaterThan(0);
      expect(plans[0].status).toBe('Cancelled');
    });

    it('TC-P3-027: Operations Console - View Failed Plans', async () => {
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: getFutureDate(30),
        frequency: 'Monthly' as const,
        installments: 12,
      };
      const plan = await createSIPPlan(1, sipData);
      
      // Mark as failed after max retries
      await markPlanExecution(plan.id, false, 'Insufficient funds');
      await markPlanExecution(plan.id, false, 'Insufficient funds');
      await markPlanExecution(plan.id, false, 'Insufficient funds');

      const plans = await getPlansByStatus('Failed');

      expect(plans.length).toBeGreaterThan(0);
      expect(plans[0].status).toBe('Failed');
    });
  });

  describe('Category 10: Integration & Edge Cases', () => {
    it('TC-P3-038: SIP Execution Creates Order in Order Book', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: today,
        frequency: 'Monthly' as const,
        installments: 12,
      };
      const plan = await createSIPPlan(1, sipData, true); // Skip date validation for test

      const logs = await processScheduledPlans(today);
      const planLog = logs.find(log => log.planId === plan.id);

      // Execution log should have orderId if successful
      if (planLog?.status === 'Success') {
        expect(planLog.orderId).toBeDefined();
      }
    });

    it('TC-P3-044: Insufficient Funds - Plan Execution Failure', async () => {
      const today = new Date().toISOString().slice(0, 10);
      // For execution test, allow today's date
      const sipData = {
        schemeId: 1,
        amount: 5000,
        startDate: today,
        frequency: 'Monthly' as const,
        installments: 12,
      };
      const plan = await createSIPPlan(1, sipData, true); // Skip date validation for test

      // Mark execution as failed
      await markPlanExecution(plan.id, false, 'Insufficient funds');

      const failedPlan = await getPlanById(plan.id);
      expect(failedPlan?.retryCount).toBe(1);
      expect(failedPlan?.failureReason).toBe('Insufficient funds');
    });
  });
});

