import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingCart, Edit } from 'lucide-react';
import { CartItem } from '../types/order.types';
import { EmptyState } from '@/components/empty-state';

interface ProductCartProps {
  items: CartItem[];
  onRemove?: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onEdit?: (itemId: string) => void;
  editable?: boolean;
}

export default function ProductCart({ 
  items, 
  onRemove, 
  onUpdateQuantity,
  onEdit,
  editable = false 
}: ProductCartProps) {
  // Ensure items is always an array
  const itemsArray = Array.isArray(items) ? items : [];
  const totalAmount = itemsArray.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalItems = itemsArray.length;

  if (itemsArray.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart className="h-12 w-12 text-muted-foreground" />}
        title="Cart is empty"
        description="Add products from the product list to get started."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Cart Items */}
      <div className="space-y-3">
        {itemsArray.map((item) => (
          <Card key={item.id} className="border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground break-words">{item.schemeName}</h4>
                    <Badge variant="outline">{item.transactionType}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Amount:</span> ₹{item.amount.toLocaleString()}
                    </div>
                    {item.units && (
                      <div>
                        <span className="font-medium">Units:</span> {item.units.toFixed(4)}
                      </div>
                    )}
                    {item.nav && (
                      <div>
                        <span className="font-medium">NAV:</span> ₹{item.nav.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item.id)}
                      aria-label={`Edit ${item.schemeName} order details`}
                      title="Edit Order"
                      type="button"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {editable && onUpdateQuantity && (
                    <div className="flex items-center gap-2">
                      <label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity</label>
                      <Input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="1"
                        step="1"
                        value={item.nav && item.amount > 0 ? Math.round((item.amount / item.nav) * 10000) / 10000 : 1}
                        onChange={(e) => {
                          const quantity = Math.max(1, parseFloat(e.target.value) || 1);
                          onUpdateQuantity(item.id, quantity);
                        }}
                        className="w-20"
                        aria-label={`Quantity for ${item.schemeName}`}
                      />
                    </div>
                  )}
                  {onRemove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(item.id)}
                      aria-label={`Remove ${item.schemeName} from cart`}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Cart Summary */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Total Items:</span>
          <span className="text-sm font-semibold text-foreground">{totalItems}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Total Amount:</span>
          <span className="text-lg font-bold text-foreground">₹{totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

