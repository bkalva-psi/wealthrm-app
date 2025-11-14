/**
 * Systematic Plans Service
 * Handles SIP/STP/SWP plan operations
 */

import { z } from 'zod';

export type PlanType = 'SIP' | 'STP' | 'SWP';
export type PlanStatus = 'Active' | 'Closed' | 'Cancelled' | 'Failed';

export interface SystematicPlan {
  id: string;
  planType: PlanType;
  clientId: number;
  schemeId: number;
  sourceSchemeId?: number; // For STP
  targetSchemeId?: number; // For STP
  amount: number;
  startDate: string;
  frequency: 'Monthly' | 'Quarterly';
  installments: number;
  executedInstallments: number;
  status: PlanStatus;
  nextExecutionDate?: string;
  lastExecutionDate?: string;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
}

// Validation schemas
const sipPlanSchema = z.object({
  schemeId: z.number().positive(),
  amount: z.number().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  frequency: z.enum(['Monthly', 'Quarterly']),
  installments: z.number().int().positive(),
});

const stpPlanSchema = z.object({
  sourceSchemeId: z.number().positive(),
  targetSchemeId: z.number().positive(),
  amount: z.number().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  frequency: z.enum(['Monthly', 'Quarterly']),
  installments: z.number().int().positive(),
});

const swpPlanSchema = z.object({
  schemeId: z.number().positive(),
  amount: z.number().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  frequency: z.enum(['Monthly', 'Quarterly']),
  installments: z.number().int().positive(),
});

// In-memory storage for now (replace with database in production)
const plansStorage: Map<string, SystematicPlan> = new Map();

/**
 * Generate unique plan ID
 */
function generatePlanId(planType: PlanType): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${planType}-${dateStr}-${randomStr}`;
}

/**
 * Calculate next execution date based on frequency
 */
function calculateNextExecutionDate(startDate: string, frequency: 'Monthly' | 'Quarterly', executedInstallments: number): string {
  const start = new Date(startDate);
  const next = new Date(start);
  
  if (frequency === 'Monthly') {
    next.setMonth(start.getMonth() + executedInstallments + 1);
  } else {
    next.setMonth(start.getMonth() + (executedInstallments + 1) * 3);
  }
  
  return next.toISOString().slice(0, 10);
}

/**
 * Create SIP plan
 */
export async function createSIPPlan(
  clientId: number,
  data: z.infer<typeof sipPlanSchema>
): Promise<SystematicPlan> {
  // Validate start date is in future
  const startDate = new Date(data.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (startDate <= today) {
    throw new Error('Start date must be a future date');
  }

  const plan: SystematicPlan = {
    id: generatePlanId('SIP'),
    planType: 'SIP',
    clientId,
    schemeId: data.schemeId,
    amount: data.amount,
    startDate: data.startDate,
    frequency: data.frequency,
    installments: data.installments,
    executedInstallments: 0,
    status: 'Active',
    nextExecutionDate: data.startDate,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: 3,
  };

  plansStorage.set(plan.id, plan);
  return plan;
}

/**
 * Create STP plan
 */
export async function createSTPPlan(
  clientId: number,
  data: z.infer<typeof stpPlanSchema>,
  skipDateValidation: boolean = false
): Promise<SystematicPlan> {
  if (data.sourceSchemeId === data.targetSchemeId) {
    throw new Error('Source and target schemes must be different');
  }

  if (!skipDateValidation) {
    const startDate = new Date(data.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate <= today) {
      throw new Error('Start date must be a future date');
    }
  }

  const plan: SystematicPlan = {
    id: generatePlanId('STP'),
    planType: 'STP',
    clientId,
    schemeId: data.targetSchemeId, // Primary scheme is target
    sourceSchemeId: data.sourceSchemeId,
    targetSchemeId: data.targetSchemeId,
    amount: data.amount,
    startDate: data.startDate,
    frequency: data.frequency,
    installments: data.installments,
    executedInstallments: 0,
    status: 'Active',
    nextExecutionDate: data.startDate,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: 3,
  };

  plansStorage.set(plan.id, plan);
  return plan;
}

/**
 * Create SWP plan
 */
export async function createSWPPlan(
  clientId: number,
  data: z.infer<typeof swpPlanSchema>,
  skipDateValidation: boolean = false
): Promise<SystematicPlan> {
  if (!skipDateValidation) {
    const startDate = new Date(data.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate <= today) {
      throw new Error('Start date must be a future date');
    }
  }

  const plan: SystematicPlan = {
    id: generatePlanId('SWP'),
    planType: 'SWP',
    clientId,
    schemeId: data.schemeId,
    amount: data.amount,
    startDate: data.startDate,
    frequency: data.frequency,
    installments: data.installments,
    executedInstallments: 0,
    status: 'Active',
    nextExecutionDate: data.startDate,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: 3,
  };

  plansStorage.set(plan.id, plan);
  return plan;
}

/**
 * Get plan by ID
 */
export async function getPlanById(planId: string): Promise<SystematicPlan | null> {
  return plansStorage.get(planId) || null;
}

/**
 * Get plans by status
 */
export async function getPlansByStatus(status?: PlanStatus): Promise<SystematicPlan[]> {
  const plans = Array.from(plansStorage.values());
  if (status) {
    return plans.filter(p => p.status === status);
  }
  return plans;
}

/**
 * Get plans by client ID
 */
export async function getPlansByClient(clientId: number): Promise<SystematicPlan[]> {
  return Array.from(plansStorage.values()).filter(p => p.clientId === clientId);
}

/**
 * Modify plan
 */
export async function modifyPlan(
  planId: string,
  updates: Partial<Pick<SystematicPlan, 'amount' | 'frequency' | 'installments'>>
): Promise<SystematicPlan> {
  const plan = plansStorage.get(planId);
  if (!plan) {
    throw new Error('Plan not found');
  }

  if (plan.status !== 'Active') {
    throw new Error('Cannot modify plan that is not Active');
  }

  // Check if plan is scheduled for execution today
  const today = new Date().toISOString().slice(0, 10);
  if (plan.nextExecutionDate === today) {
    throw new Error('Cannot modify plan scheduled for execution today');
  }

  const updatedPlan: SystematicPlan = {
    ...plan,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  plansStorage.set(planId, updatedPlan);
  return updatedPlan;
}

/**
 * Cancel plan
 */
export async function cancelPlan(
  planId: string,
  reason?: string
): Promise<SystematicPlan> {
  const plan = plansStorage.get(planId);
  if (!plan) {
    throw new Error('Plan not found');
  }

  if (plan.status === 'Closed') {
    throw new Error('Cannot cancel completed plan');
  }

  if (plan.status === 'Cancelled') {
    throw new Error('Plan is already cancelled');
  }

  const cancelledPlan: SystematicPlan = {
    ...plan,
    status: 'Cancelled',
    cancelledAt: new Date().toISOString(),
    cancelledReason: reason,
    updatedAt: new Date().toISOString(),
  };

  plansStorage.set(planId, cancelledPlan);
  return cancelledPlan;
}

/**
 * Mark plan execution
 */
export async function markPlanExecution(
  planId: string,
  success: boolean,
  failureReason?: string
): Promise<SystematicPlan> {
  const plan = plansStorage.get(planId);
  if (!plan) {
    throw new Error('Plan not found');
  }

  if (plan.status !== 'Active') {
    throw new Error('Can only execute active plans');
  }

  if (success) {
    const executedInstallments = plan.executedInstallments + 1;
    const isCompleted = executedInstallments >= plan.installments;

    const updatedPlan: SystematicPlan = {
      ...plan,
      executedInstallments,
      lastExecutionDate: new Date().toISOString(),
      status: isCompleted ? 'Closed' : 'Active',
      nextExecutionDate: isCompleted ? undefined : calculateNextExecutionDate(
        plan.startDate,
        plan.frequency,
        executedInstallments
      ),
      retryCount: 0, // Reset retry count on success
      updatedAt: new Date().toISOString(),
    };

    plansStorage.set(planId, updatedPlan);
    return updatedPlan;
  } else {
    // Execution failed - increment retry count
    const retryCount = plan.retryCount + 1;
    const shouldMarkFailed = retryCount >= plan.maxRetries;

    const updatedPlan: SystematicPlan = {
      ...plan,
      retryCount,
      failureReason: failureReason || 'Execution failed',
      status: shouldMarkFailed ? 'Failed' : 'Active',
      updatedAt: new Date().toISOString(),
    };

    plansStorage.set(planId, updatedPlan);
    return updatedPlan;
  }
}

/**
 * Get plans scheduled for execution on a given date
 */
export async function getPlansScheduledForDate(date: string): Promise<SystematicPlan[]> {
  return Array.from(plansStorage.values()).filter(
    p => p.status === 'Active' && p.nextExecutionDate === date
  );
}

/**
 * Export for testing
 */
export function clearPlansStorage(): void {
  plansStorage.clear();
}

