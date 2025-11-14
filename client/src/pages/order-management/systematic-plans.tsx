/**
 * Systematic Plans Page
 * Main page for managing SIP/STP/SWP plans
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import SIPForm from './components/sip-form';
import STPForm from './components/stp-form';
import SWPForm from './components/swp-form';
import SystematicPlansList from './components/systematic-plans-list';
import { SIPFormData, STPFormData, SWPFormData, SystematicPlan } from './types/systematic-plans.types';
import { Product } from './types/order.types';
import { apiRequest } from '@/lib/queryClient';

type PlanFormType = 'SIP' | 'STP' | 'SWP' | null;

export default function SystematicPlansPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [formType, setFormType] = useState<PlanFormType>(null);
  const queryClient = useQueryClient();

  // Fetch products for forms
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/order-management/products'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/order-management/products');
      const data = await response.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
  });

  // Create SIP mutation
  const createSIPMutation = useMutation({
    mutationFn: async (data: SIPFormData) => {
      const response = await apiRequest('POST', '/api/systematic-plans/sip', data);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create SIP plan');
      }
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/systematic-plans'] });
      toast({
        title: 'SIP Plan Created',
        description: `SIP plan ${data.data.id} has been created successfully.`,
      });
      setFormType(null);
      setActiveTab('list');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to create SIP plan';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Create STP mutation
  const createSTPMutation = useMutation({
    mutationFn: async (data: STPFormData) => {
      const response = await apiRequest('POST', '/api/systematic-plans/stp', data);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create STP plan');
      }
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/systematic-plans'] });
      toast({
        title: 'STP Plan Created',
        description: `STP plan ${data.data.id} has been created successfully.`,
      });
      setFormType(null);
      setActiveTab('list');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to create STP plan';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Create SWP mutation
  const createSWPMutation = useMutation({
    mutationFn: async (data: SWPFormData) => {
      const response = await apiRequest('POST', '/api/systematic-plans/swp', data);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create SWP plan');
      }
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/systematic-plans'] });
      toast({
        title: 'SWP Plan Created',
        description: `SWP plan ${data.data.id} has been created successfully.`,
      });
      setFormType(null);
      setActiveTab('list');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to create SWP plan';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleCreateSIP = async (data: SIPFormData) => {
    await createSIPMutation.mutateAsync(data);
  };

  const handleCreateSTP = async (data: STPFormData) => {
    await createSTPMutation.mutateAsync(data);
  };

  const handleCreateSWP = async (data: SWPFormData) => {
    await createSWPMutation.mutateAsync(data);
  };

  const handleModifyPlan = (plan: SystematicPlan) => {
    // TODO: Implement modify functionality
    toast({
      title: 'Modify Plan',
      description: 'Modify functionality will be implemented soon.',
    });
  };

  if (isLoadingProducts) {
    return (
      <div className="min-h-screen bg-background px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-6 md:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-6 md:py-8 lg:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Systematic Plans
          </h1>
          {activeTab === 'list' && (
            <div className="flex gap-2">
              <Button onClick={() => { setFormType('SIP'); setActiveTab('create'); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create SIP
              </Button>
              <Button onClick={() => { setFormType('STP'); setActiveTab('create'); }} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create STP
              </Button>
              <Button onClick={() => { setFormType('SWP'); setActiveTab('create'); }} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create SWP
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'list' | 'create'); if (v === 'list') setFormType(null); }}>
          <TabsList>
            <TabsTrigger value="list">My Plans</TabsTrigger>
            <TabsTrigger value="create">Create Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <SystematicPlansList onModify={handleModifyPlan} />
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            {!formType && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Select a plan type to create</p>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={() => setFormType('SIP')} size="lg">
                        Create SIP
                      </Button>
                      <Button onClick={() => setFormType('STP')} size="lg" variant="outline">
                        Create STP
                      </Button>
                      <Button onClick={() => setFormType('SWP')} size="lg" variant="outline">
                        Create SWP
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {formType === 'SIP' && (
              <SIPForm
                products={products}
                onSubmit={handleCreateSIP}
                onCancel={() => { setFormType(null); setActiveTab('list'); }}
                isLoading={createSIPMutation.isPending}
              />
            )}

            {formType === 'STP' && (
              <STPForm
                products={products}
                onSubmit={handleCreateSTP}
                onCancel={() => { setFormType(null); setActiveTab('list'); }}
                isLoading={createSTPMutation.isPending}
              />
            )}

            {formType === 'SWP' && (
              <SWPForm
                products={products}
                onSubmit={handleCreateSWP}
                onCancel={() => { setFormType(null); setActiveTab('list'); }}
                isLoading={createSWPMutation.isPending}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

