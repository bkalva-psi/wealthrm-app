/**
 * Scheduler Service
 * Handles execution of systematic plans with reattempt logic
 */

import {
  getPlansScheduledForDate,
  markPlanExecution,
  type SystematicPlan,
} from './systematic-plans-service';

export interface ExecutionLog {
  id: string;
  planId: string;
  executionDate: string;
  executionTime: string;
  status: 'Success' | 'Failed' | 'Retrying';
  retryCount: number;
  failureReason?: string;
  orderId?: string;
  createdAt: string;
}

// In-memory execution logs (replace with database in production)
const executionLogs: Map<string, ExecutionLog> = new Map();

/**
 * Get cut-off time for the day (default: 3:00 PM)
 */
function getCutOffTime(): Date {
  const today = new Date();
  today.setHours(15, 0, 0, 0); // 3:00 PM
  return today;
}

/**
 * Check if current time is before cut-off
 */
function isBeforeCutOff(): boolean {
  const now = new Date();
  const cutOff = getCutOffTime();
  return now < cutOff;
}

/**
 * Calculate retry windows
 * - First retry: 2 hours before cut-off
 * - Second retry: 1 hour before cut-off
 */
function getRetryWindows(): { firstRetry: Date; secondRetry: Date } {
  const cutOff = getCutOffTime();
  const firstRetry = new Date(cutOff);
  firstRetry.setHours(cutOff.getHours() - 2);
  const secondRetry = new Date(cutOff);
  secondRetry.setHours(cutOff.getHours() - 1);
  return { firstRetry, secondRetry };
}

/**
 * Check if plan should be retried
 */
function shouldRetry(plan: SystematicPlan, retryCount: number): boolean {
  if (retryCount >= plan.maxRetries) {
    return false;
  }

  if (!isBeforeCutOff()) {
    return false; // Cut-off passed, no more retries
  }

  const { firstRetry, secondRetry } = getRetryWindows();
  const now = new Date();

  if (retryCount === 0) {
    // First retry: 2 hours before cut-off
    return now >= firstRetry;
  } else if (retryCount === 1) {
    // Second retry: 1 hour before cut-off
    return now >= secondRetry;
  }

  return false;
}

/**
 * Execute a systematic plan
 * This creates an order in the Order Book
 */
async function executePlan(plan: SystematicPlan): Promise<{ success: boolean; orderId?: string; failureReason?: string }> {
  try {
    // Mock order creation - in production, this would call Order Service
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Simulate execution (in production, check funds, create order, etc.)
    // For now, randomly succeed/fail for testing
    const shouldSucceed = Math.random() > 0.2; // 80% success rate

    if (shouldSucceed) {
      return { success: true, orderId };
    } else {
      return { success: false, failureReason: 'Insufficient funds' };
    }
  } catch (error: any) {
    return { success: false, failureReason: error.message || 'Execution failed' };
  }
}

/**
 * Process plan execution with retry logic
 */
export async function processPlanExecution(plan: SystematicPlan): Promise<ExecutionLog> {
  const executionDate = new Date().toISOString().slice(0, 10);
  const executionTime = new Date().toISOString();

  // Try to execute the plan
  const result = await executePlan(plan);

  if (result.success) {
    // Execution successful
    await markPlanExecution(plan.id, true);

    const log: ExecutionLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      planId: plan.id,
      executionDate,
      executionTime,
      status: 'Success',
      retryCount: plan.retryCount,
      orderId: result.orderId,
      createdAt: new Date().toISOString(),
    };

    executionLogs.set(log.id, log);
    return log;
  } else {
    // Execution failed - increment retry count first
    await markPlanExecution(plan.id, false, result.failureReason);
    
    // Get updated plan to check current retry count
    const { getPlanById } = await import('./systematic-plans-service');
    const updatedPlan = await getPlanById(plan.id);
    
    if (!updatedPlan) {
      throw new Error('Plan not found after execution');
    }

    // Check if should retry (after incrementing retry count)
    const shouldRetryNow = shouldRetry(updatedPlan, updatedPlan.retryCount);

    if (shouldRetryNow && updatedPlan.status === 'Active') {
      // Plan is still active and can be retried
      const log: ExecutionLog = {
        id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        planId: plan.id,
        executionDate,
        executionTime,
        status: 'Retrying',
        retryCount: updatedPlan.retryCount,
        failureReason: result.failureReason,
        createdAt: new Date().toISOString(),
      };

      executionLogs.set(log.id, log);
      return log;
    } else {
      // Max retries reached or cut-off passed - plan already marked as failed
      const log: ExecutionLog = {
        id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        planId: plan.id,
        executionDate,
        executionTime,
        status: 'Failed',
        retryCount: updatedPlan.retryCount,
        failureReason: result.failureReason,
        createdAt: new Date().toISOString(),
      };

      executionLogs.set(log.id, log);
      return log;
    }
  }
}

/**
 * Process all plans scheduled for today
 */
export async function processScheduledPlans(date?: string): Promise<ExecutionLog[]> {
  const targetDate = date || new Date().toISOString().slice(0, 10);
  const plans = await getPlansScheduledForDate(targetDate);

  const logs: ExecutionLog[] = [];

  for (const plan of plans) {
    // Only process active plans
    if (plan.status === 'Active') {
      const log = await processPlanExecution(plan);
      logs.push(log);
    }
  }

  return logs;
}

/**
 * Retry failed executions (for plans that are retrying)
 */
export async function retryFailedExecutions(): Promise<ExecutionLog[]> {
  const today = new Date().toISOString().slice(0, 10);
  const plans = await getPlansScheduledForDate(today);

  // Filter plans that are active and have retry count > 0
  const plansToRetry = plans.filter(p => p.status === 'Active' && p.retryCount > 0 && p.retryCount < p.maxRetries);

  const logs: ExecutionLog[] = [];

  for (const plan of plansToRetry) {
    if (shouldRetry(plan, plan.retryCount)) {
      const log = await processPlanExecution(plan);
      logs.push(log);
    }
  }

  return logs;
}

/**
 * Get execution logs for a plan
 */
export function getExecutionLogs(planId: string): ExecutionLog[] {
  return Array.from(executionLogs.values()).filter(log => log.planId === planId);
}

/**
 * Get all execution logs
 */
export function getAllExecutionLogs(): ExecutionLog[] {
  return Array.from(executionLogs.values());
}

/**
 * Export for testing
 */
export function clearExecutionLogs(): void {
  executionLogs.clear();
}

