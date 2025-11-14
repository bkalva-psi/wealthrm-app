/**
 * Systematic Plans List Component
 * Displays all systematic plans with filters and actions
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { MoreVertical, Edit, X, Calendar, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SystematicPlan, PlanStatus, PlanType } from '../types/systematic-plans.types';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SystematicPlansListProps {
  onModify?: (plan: SystematicPlan) => void;
}

const statusColors: Record<PlanStatus, string> = {
  Active: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-100 text-gray-800',
  Cancelled: 'bg-yellow-100 text-yellow-800',
  Failed: 'bg-red-100 text-red-800',
};

const planTypeIcons: Record<PlanType, React.ReactNode> = {
  SIP: <TrendingUp className="h-4 w-4" />,
  STP: <ArrowRightLeft className="h-4 w-4" />,
  SWP: <TrendingDown className="h-4 w-4" />,
};

export default function SystematicPlansList({ onModify }: SystematicPlansListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planTypeFilter, setPlanTypeFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery<SystematicPlan[]>({
    queryKey: ['/api/systematic-plans', statusFilter, planTypeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      const response = await apiRequest('GET', `/api/systematic-plans?${params.toString()}`);
      const data = await response.json();
      let filteredPlans = data.data || [];
      
      if (planTypeFilter !== 'all') {
        filteredPlans = filteredPlans.filter((p: SystematicPlan) => p.planType === planTypeFilter);
      }
      
      return filteredPlans;
    },
    retry: 1,
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ planId, reason }: { planId: string; reason?: string }) => {
      const response = await apiRequest('POST', `/api/systematic-plans/${planId}/cancel`, {
        reason,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/systematic-plans'] });
      toast({
        title: 'Plan Cancelled',
        description: 'The systematic plan has been cancelled successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel plan',
        variant: 'destructive',
      });
    },
  });

  const handleCancel = (plan: SystematicPlan) => {
    if (confirm(`Are you sure you want to cancel ${plan.planType} plan ${plan.id}?`)) {
      cancelMutation.mutate({ planId: plan.id });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <EmptyState
        title="No Systematic Plans"
        description="Create your first SIP, STP, or SWP plan to get started."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={planTypeFilter} onValueChange={setPlanTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="SIP">SIP</SelectItem>
            <SelectItem value="STP">STP</SelectItem>
            <SelectItem value="SWP">SWP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {planTypeIcons[plan.planType]}
                    <h3 className="font-semibold">{plan.planType} Plan</h3>
                    <Badge className={statusColors[plan.status]}>{plan.status}</Badge>
                    <span className="text-sm text-muted-foreground">#{plan.id}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium">₹{plan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Frequency</p>
                      <p className="font-medium">{plan.frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="font-medium">
                        {plan.executedInstallments} / {plan.installments}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Execution</p>
                      <p className="font-medium">
                        {plan.nextExecutionDate
                          ? format(new Date(plan.nextExecutionDate), 'MMM dd, yyyy')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {plan.failureReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">
                        <strong>Failure Reason:</strong> {plan.failureReason}
                      </p>
                      {plan.retryCount > 0 && (
                        <p className="text-sm text-red-600 mt-1">
                          Retry attempts: {plan.retryCount} / {plan.maxRetries}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {plan.status === 'Active' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onModify && (
                        <DropdownMenuItem onClick={() => onModify(plan)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modify
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleCancel(plan)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

