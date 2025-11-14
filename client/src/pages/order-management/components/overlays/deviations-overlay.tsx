import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Deviation } from '../../types/order.types';

interface DeviationsOverlayProps {
  deviations: Deviation[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcknowledge: (deviationType: string) => void;
}

export default function DeviationsOverlay({ 
  deviations, 
  open, 
  onOpenChange,
  onAcknowledge 
}: DeviationsOverlayProps) {
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  // Ensure deviations is always an array
  const deviationsArray = Array.isArray(deviations) ? deviations : [];

  const handleAcknowledge = (deviation: Deviation) => {
    setAcknowledged({ ...acknowledged, [deviation.type]: true });
    onAcknowledge(deviation.type);
  };

  const allAcknowledged = deviationsArray.length > 0 && deviationsArray.every(d => acknowledged[d.type] || d.acknowledged);

  const getDeviationColor = (type: string) => {
    if (type.includes('Critical') || type.includes('Maximum')) return 'destructive';
    if (type.includes('Minimum')) return 'default';
    return 'default';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Order Deviations
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Please review and acknowledge the following deviations before proceeding
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {deviationsArray.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No deviations found for this order.</p>
            </div>
          ) : (
            deviationsArray.map((deviation) => {
            const isAcknowledged = acknowledged[deviation.type] || deviation.acknowledged;
            return (
              <Alert
                key={deviation.type}
                variant={getDeviationColor(deviation.type)}
                className={isAcknowledged ? 'opacity-60' : ''}
              >
                <AlertTriangle className="h-4 w-4" />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{deviation.type}</h4>
                      <p className="text-sm mt-1">{deviation.description}</p>
                    </div>
                    {isAcknowledged && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Impact:</p>
                    <p className="text-sm">{deviation.impact}</p>
                  </div>

                  {deviation.resolutionOptions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Resolution Options:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {deviation.resolutionOptions.map((option, idx) => (
                          <li key={idx}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!isAcknowledged && (
                    <div className="mt-4 flex items-center space-x-2">
                      <Checkbox
                        id={`ack-${deviation.type}`}
                        checked={acknowledged[deviation.type] || false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleAcknowledge(deviation);
                          }
                        }}
                      />
                      <Label htmlFor={`ack-${deviation.type}`} className="cursor-pointer text-sm">
                        I acknowledge this deviation and wish to proceed
                      </Label>
                    </div>
                  )}
                </div>
              </Alert>
            );
          }))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            disabled={!allAcknowledged}
            className="w-full sm:w-auto"
          >
            {allAcknowledged ? 'Proceed with Order' : 'Acknowledge All Deviations'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

