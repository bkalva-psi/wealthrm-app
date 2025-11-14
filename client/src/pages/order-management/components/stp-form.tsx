/**
 * STP (Systematic Transfer Plan) Form Component
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { STPFormData, Frequency } from '../types/systematic-plans.types';
import { Product } from '../types/order.types';

interface STPFormProps {
  products: Product[];
  onSubmit: (data: STPFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function STPForm({ products, onSubmit, onCancel, isLoading = false }: STPFormProps) {
  const [formData, setFormData] = useState<STPFormData>({
    sourceSchemeId: 0,
    targetSchemeId: 0,
    amount: 0,
    startDate: '',
    frequency: 'Monthly',
    installments: 6,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sourceSchemeId || formData.sourceSchemeId === 0) {
      newErrors.sourceSchemeId = 'Please select a source scheme';
    }

    if (!formData.targetSchemeId || formData.targetSchemeId === 0) {
      newErrors.targetSchemeId = 'Please select a target scheme';
    }

    if (formData.sourceSchemeId === formData.targetSchemeId && formData.sourceSchemeId !== 0) {
      newErrors.targetSchemeId = 'Source and target schemes must be different';
    }

    if (formData.amount < 1000) {
      newErrors.amount = 'STP amount must be at least ₹1,000';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate <= today) {
        newErrors.startDate = 'Start date must be a future date';
      }
    }

    if (formData.installments < 1) {
      newErrors.installments = 'Installments must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit(formData);
    }
  };

  const sourceProduct = products.find(p => p.id === formData.sourceSchemeId);
  const targetProduct = products.find(p => p.id === formData.targetSchemeId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create STP Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sourceSchemeId">Source Scheme *</Label>
            <Select
              value={formData.sourceSchemeId.toString()}
              onValueChange={(value) => setFormData({ ...formData, sourceSchemeId: parseInt(value) })}
            >
              <SelectTrigger id="sourceSchemeId">
                <SelectValue placeholder="Select source scheme" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.schemeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sourceSchemeId && (
              <p className="text-sm text-destructive">{errors.sourceSchemeId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetSchemeId">Target Scheme *</Label>
            <Select
              value={formData.targetSchemeId.toString()}
              onValueChange={(value) => setFormData({ ...formData, targetSchemeId: parseInt(value) })}
            >
              <SelectTrigger id="targetSchemeId">
                <SelectValue placeholder="Select target scheme" />
              </SelectTrigger>
              <SelectContent>
                {products
                  .filter(p => p.id !== formData.sourceSchemeId)
                  .map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.schemeName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.targetSchemeId && (
              <p className="text-sm text-destructive">{errors.targetSchemeId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">STP Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              min="1000"
              step="100"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="Minimum ₹1,000"
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
            {sourceProduct && formData.amount > 0 && (
              <p className="text-sm text-muted-foreground">
                Ensure sufficient holdings in source scheme
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency *</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value as Frequency })}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="installments">Number of Installments *</Label>
            <Input
              id="installments"
              type="number"
              min="1"
              value={formData.installments}
              onChange={(e) => setFormData({ ...formData, installments: parseInt(e.target.value) || 0 })}
            />
            {errors.installments && (
              <p className="text-sm text-destructive">{errors.installments}</p>
            )}
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors above before submitting.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create STP Plan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

