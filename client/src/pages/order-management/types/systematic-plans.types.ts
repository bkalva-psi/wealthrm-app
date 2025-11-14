/**
 * Types for Systematic Plans (SIP/STP/SWP)
 */

export type PlanType = 'SIP' | 'STP' | 'SWP';
export type PlanStatus = 'Active' | 'Closed' | 'Cancelled' | 'Failed';
export type Frequency = 'Monthly' | 'Quarterly';

export interface SystematicPlan {
  id: string;
  planType: PlanType;
  clientId: number;
  schemeId: number;
  sourceSchemeId?: number; // For STP
  targetSchemeId?: number; // For STP
  amount: number;
  startDate: string;
  frequency: Frequency;
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

export interface SIPFormData {
  schemeId: number;
  amount: number;
  startDate: string;
  frequency: Frequency;
  installments: number;
}

export interface STPFormData {
  sourceSchemeId: number;
  targetSchemeId: number;
  amount: number;
  startDate: string;
  frequency: Frequency;
  installments: number;
}

export interface SWPFormData {
  schemeId: number;
  amount: number;
  startDate: string;
  frequency: Frequency;
  installments: number;
}

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

