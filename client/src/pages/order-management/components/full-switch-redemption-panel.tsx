import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FullSwitchData, FullRedemptionData } from '../types/order.types';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FullSwitchRedemptionPanelProps {
  type: 'switch' | 'redemption';
  data: FullSwitchData | FullRedemptionData;
}

export default function FullSwitchRedemptionPanel({ type, data }: FullSwitchRedemptionPanelProps) {
  if (type === 'switch') {
    const switchData = data as FullSwitchData;
    return (
      <Card className="border-border bg-muted/30" role="region" aria-label="Full Switch Details">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-lg">Full Switch Details</CardTitle>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Badge variant="outline" className="bg-muted" aria-label="Read-only data">Read Only</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Special Flags Section */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-md space-y-2">
            <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
              <AlertCircle className="h-4 w-4" />
              Special Flags
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Close Account: <span className="text-green-700 dark:text-green-400">Y</span></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Bypass Min Validations: <span className="text-green-700 dark:text-green-400">Enabled</span></span>
              </div>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              Full Switch transactions bypass minimum investment validations and automatically close the source account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source-scheme">Source Scheme</Label>
              <Input
                id="source-scheme"
                value={switchData.sourceScheme}
                readOnly
                className="bg-background"
                aria-readonly="true"
                aria-label="Source scheme (read-only)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-scheme">Target Scheme</Label>
              <Input
                id="target-scheme"
                value={switchData.targetScheme}
                readOnly
                className="bg-background"
                aria-readonly="true"
                aria-label="Target scheme (read-only)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="units">Units</Label>
              <Input
                id="units"
                value={switchData.units.toFixed(4)}
                readOnly
                className="bg-background"
                aria-readonly="true"
                aria-label={`Units: ${switchData.units.toFixed(4)} (read-only)`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="close-ac">Close Account</Label>
              <Input
                id="close-ac"
                value={switchData.closeAc ? 'Y' : 'N'}
                readOnly
                className="bg-background font-semibold"
                aria-readonly="true"
                aria-label={`Close account: ${switchData.closeAc ? 'Yes' : 'No'} (read-only)`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const redemptionData = data as FullRedemptionData;
  return (
    <Card className="border-border bg-muted/30" role="region" aria-label="Full Redemption Details">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="text-lg">Full Redemption Details</CardTitle>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Badge variant="outline" className="bg-muted" aria-label="Read-only data">Read Only</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Special Flags Section */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-md space-y-2">
          <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
            <AlertCircle className="h-4 w-4" />
            Special Flags
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Close Account: <span className="text-green-700 dark:text-green-400">Y</span></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Bypass Min Validations: <span className="text-green-700 dark:text-green-400">Enabled</span></span>
            </div>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            Full Redemption transactions bypass minimum investment validations and automatically close the account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="scheme-name">Scheme Name</Label>
            <Input
              id="scheme-name"
              value={redemptionData.schemeName}
              readOnly
              className="bg-background"
              aria-readonly="true"
              aria-label={`Scheme name: ${redemptionData.schemeName} (read-only)`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="units">Units</Label>
            <Input
              id="units"
              value={redemptionData.units.toFixed(4)}
              readOnly
              className="bg-background"
              aria-readonly="true"
              aria-label={`Units: ${redemptionData.units.toFixed(4)} (read-only)`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              value={`₹${redemptionData.amount.toLocaleString()}`}
              readOnly
              className="bg-background"
              aria-readonly="true"
              aria-label={`Amount: ₹${redemptionData.amount.toLocaleString()} (read-only)`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="close-ac">Close Account</Label>
            <Input
              id="close-ac"
              value={redemptionData.closeAc ? 'Y' : 'N'}
              readOnly
              className="bg-background font-semibold"
              aria-readonly="true"
              aria-label={`Close account: ${redemptionData.closeAc ? 'Yes' : 'No'} (read-only)`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

