/**
 * SIP (Systematic Investment Plan) Form Component
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { SIPFormData, Frequency } from '../types/systematic-plans.types';
import { Product } from '../types/order.types';

interface SIPFormProps {
  products: Product[];
  onSubmit: (data: SIPFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SIPForm({ products, onSubmit, onCancel, isLoading = false }: SIPFormProps) {
  const [formData, setFormData] = useState<SIPFormData>({
    schemeId: 0,
    amount: 0,
    startDate: '',
    frequency: 'Monthly',
    installments: 12,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.schemeId || formData.schemeId === 0) {
      newErrors.schemeId = 'Please select a scheme';
    }

    if (formData.amount < 1000) {
      newErrors.amount = 'SIP amount must be at least ₹1,000';
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

  const selectedProduct = products.find(p => p.id === formData.schemeId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create SIP Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schemeId">Scheme *</Label>
            <Select
              value={formData.schemeId.toString()}
              onValueChange={(value) => setFormData({ ...formData, schemeId: parseInt(value) })}
            >
              <SelectTrigger id="schemeId">
                <SelectValue placeholder="Select scheme" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.schemeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.schemeId && (
              <p className="text-sm text-destructive">{errors.schemeId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">SIP Amount (₹) *</Label>
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
            {selectedProduct && formData.amount > 0 && (
              <p className="text-sm text-muted-foreground">
                Minimum investment: ₹{selectedProduct.minInvestment.toLocaleString()}
                {selectedProduct.maxInvestment && ` | Maximum: ₹${selectedProduct.maxInvestment.toLocaleString()}`}
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
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
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
              {isLoading ? 'Creating...' : 'Create SIP Plan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

