/**
 * Operations Console Dashboard
 * For viewing and managing systematic plans from operations perspective
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { Calendar, TrendingUp, TrendingDown, ArrowRightLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { SystematicPlan, PlanStatus, PlanType, ExecutionLog } from './types/systematic-plans.types';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';

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

export default function OperationsConsole() {
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'all'>('all');
  const [planTypeFilter, setPlanTypeFilter] = useState<PlanType | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Fetch plans for operations console
  const { data: plans = [], isLoading: isLoadingPlans } = useQuery<SystematicPlan[]>({
    queryKey: ['/api/operations/systematic-plans', statusFilter, planTypeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (planTypeFilter !== 'all') {
        params.append('planType', planTypeFilter);
      }
      const response = await apiRequest('GET', `/api/operations/systematic-plans?${params.toString()}`);
      const data = await response.json();
      return data.data || [];
    },
  });

  // Fetch scheduled plans for today
  const { data: scheduledPlans = [], isLoading: isLoadingScheduled } = useQuery<SystematicPlan[]>({
    queryKey: ['/api/operations/scheduler/plans', selectedDate],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/operations/scheduler/plans?date=${selectedDate}`);
      const data = await response.json();
      return data.data || [];
    },
  });

  // Fetch execution logs
  const { data: executionLogs = [], isLoading: isLoadingLogs } = useQuery<ExecutionLog[]>({
    queryKey: ['/api/operations/scheduler/logs'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/operations/scheduler/logs');
      const data = await response.json();
      return data.data || [];
    },
  });

  // Calculate statistics
  const stats = {
    active: plans.filter(p => p.status === 'Active').length,
    closed: plans.filter(p => p.status === 'Closed').length,
    cancelled: plans.filter(p => p.status === 'Cancelled').length,
    failed: plans.filter(p => p.status === 'Failed').length,
    scheduledToday: scheduledPlans.length,
  };

  if (isLoadingPlans) {
    return (
      <div className="min-h-screen bg-background px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-6 md:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-6 md:py-8 lg:py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6">
          Operations Console
        </h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Plans</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Closed Plans</p>
                  <p className="text-2xl font-bold">{stats.closed}</p>
                </div>
                <XCircle className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold">{stats.failed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled Today</p>
                  <p className="text-2xl font-bold">{stats.scheduledToday}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">All Plans</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Plans</TabsTrigger>
            <TabsTrigger value="logs">Execution Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-4">
            <div className="flex gap-4 items-center">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PlanStatus | 'all')}>
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

              <Select value={planTypeFilter} onValueChange={(v) => setPlanTypeFilter(v as PlanType | 'all')}>
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

            {plans.length === 0 ? (
              <EmptyState
                title="No Plans Found"
                description="No systematic plans match the selected filters."
              />
            ) : (
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

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
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
                            <div>
                              <p className="text-sm text-muted-foreground">Retry Count</p>
                              <p className="font-medium">
                                {plan.retryCount} / {plan.maxRetries}
                              </p>
                            </div>
                          </div>

                          {plan.failureReason && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                              <p className="text-sm text-red-800">
                                <strong>Failure Reason:</strong> {plan.failureReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
            </div>

            {isLoadingScheduled ? (
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
            ) : scheduledPlans.length === 0 ? (
              <EmptyState
                title="No Plans Scheduled"
                description={`No plans are scheduled for execution on ${format(new Date(selectedDate), 'MMM dd, yyyy')}.`}
              />
            ) : (
              <div className="space-y-4">
                {scheduledPlans.map((plan) => (
                  <Card key={plan.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        {planTypeIcons[plan.planType]}
                        <h3 className="font-semibold">{plan.planType} Plan #{plan.id}</h3>
                        <Badge className={statusColors[plan.status]}>{plan.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Amount: ₹{plan.amount.toLocaleString()} | 
                        Client ID: {plan.clientId} |
                        Next Execution: {plan.nextExecutionDate ? format(new Date(plan.nextExecutionDate), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            {isLoadingLogs ? (
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
            ) : executionLogs.length === 0 ? (
              <EmptyState
                title="No Execution Logs"
                description="No execution logs are available yet."
              />
            ) : (
              <div className="space-y-4">
                {executionLogs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={
                                log.status === 'Success'
                                  ? 'bg-green-100 text-green-800'
                                  : log.status === 'Failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {log.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">Plan: {log.planId}</span>
                            {log.orderId && (
                              <span className="text-sm text-muted-foreground">Order: {log.orderId}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Date: {format(new Date(log.executionDate), 'MMM dd, yyyy')} | 
                            Time: {format(new Date(log.executionTime), 'HH:mm:ss')} |
                            Retry Count: {log.retryCount}
                          </p>
                          {log.failureReason && (
                            <p className="text-sm text-red-600 mt-2">
                              <strong>Failure Reason:</strong> {log.failureReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

