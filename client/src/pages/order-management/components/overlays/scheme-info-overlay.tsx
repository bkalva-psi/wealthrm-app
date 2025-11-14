import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Product } from '../../types/order.types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface SchemeInfoOverlayProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SchemeInfoOverlay({ product, open, onOpenChange }: SchemeInfoOverlayProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{product ? product.schemeName : 'Loading...'}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">Scheme Information</DialogDescription>
        </DialogHeader>

        {!product ? (
          <div className="space-y-4 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">AMC:</span>
              <p className="text-foreground">{product.amc || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Category:</span>
              <Badge variant="outline">{product.category}</Badge>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">RTA:</span>
              <p className="text-foreground">{product.rta}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Risk Level:</span>
              <p className="text-foreground">{product.riskLevel}</p>
            </div>
            {product.launchDate && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Launch Date:</span>
                <p className="text-foreground">{product.launchDate}</p>
              </div>
            )}
            {product.aum && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">AUM:</span>
                <p className="text-foreground">₹{product.aum.toLocaleString()}</p>
              </div>
            )}
            {product.expenseRatio && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Expense Ratio:</span>
                <p className="text-foreground">{product.expenseRatio}%</p>
              </div>
            )}
            {product.fundManager && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Fund Manager:</span>
                <p className="text-foreground">{product.fundManager}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-muted-foreground">Min Investment:</span>
              <p className="text-foreground">₹{product.minInvestment.toLocaleString()}</p>
            </div>
            {product.maxInvestment && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Max Investment:</span>
                <p className="text-foreground">₹{product.maxInvestment.toLocaleString()}</p>
              </div>
            )}
            {product.cutOffTime && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Cut-off Time:</span>
                <p className="text-foreground">{product.cutOffTime}</p>
              </div>
            )}
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

