import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Order, OrderStatus } from '../types/order.types';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface AuthorizationPanelProps {
  order: Order;
  onStatusChange?: (orderId: number, newStatus: OrderStatus, reason?: string) => void;
}

export default function AuthorizationPanel({ order, onStatusChange }: AuthorizationPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const canAuthorize = order.status === 'Pending Approval';
  const canReject = order.status === 'Pending Approval' || order.status === 'Pending';

  const handleAuthorize = async () => {
    if (!canAuthorize) return;

    setIsProcessing(true);
    try {
      await apiRequest('POST', `/api/order-management/orders/${order.id}/authorize`, {});
      
      toast({
        title: 'Order Authorized',
        description: `Order ${order.modelOrderId} has been authorized successfully.`,
      });

      onStatusChange?.(order.id, 'In Progress');
    } catch (error: any) {
      toast({
        title: 'Authorization Failed',
        description: error.message || 'Failed to authorize order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!canReject || !rejectReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejecting this order.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await apiRequest('POST', `/api/order-management/orders/${order.id}/reject`, {
        reason: rejectReason,
      });
      
      toast({
        title: 'Order Rejected',
        description: `Order ${order.modelOrderId} has been rejected.`,
        variant: 'destructive',
      });

      onStatusChange?.(order.id, 'Failed', rejectReason);
      setShowRejectForm(false);
      setRejectReason('');
    } catch (error: any) {
      toast({
        title: 'Rejection Failed',
        description: error.message || 'Failed to reject order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaim = async () => {
    setIsProcessing(true);
    try {
      await apiRequest('POST', `/api/order-management/orders/${order.id}/claim`, {});
      
      toast({
        title: 'Order Claimed',
        description: `Order ${order.modelOrderId} has been claimed for authorization.`,
      });

      onStatusChange?.(order.id, 'Pending Approval');
    } catch (error: any) {
      toast({
        title: 'Claim Failed',
        description: error.message || 'Failed to claim order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRelease = async () => {
    setIsProcessing(true);
    try {
      await apiRequest('POST', `/api/order-management/orders/${order.id}/release`, {});
      
      toast({
        title: 'Order Released',
        description: `Order ${order.modelOrderId} has been released.`,
      });

      onStatusChange?.(order.id, 'Pending');
    } catch (error: any) {
      toast({
        title: 'Release Failed',
        description: error.message || 'Failed to release order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Authorization</CardTitle>
          <Badge variant="outline">{order.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {order.status === 'Pending' && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              This order is pending and available for authorization. Click "Claim" to start the authorization process.
            </AlertDescription>
          </Alert>
        )}

        {order.status === 'Pending Approval' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This order is claimed and ready for authorization. You can authorize or reject it.
            </AlertDescription>
          </Alert>
        )}

        {order.status === 'In Progress' && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              This order has been authorized and is in progress.
            </AlertDescription>
          </Alert>
        )}

        {order.rejectedReason && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Rejection Reason:</strong> {order.rejectedReason}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          {order.status === 'Pending' && (
            <Button
              onClick={handleClaim}
              disabled={isProcessing}
              variant="default"
              className="w-full sm:w-auto"
              type="button"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Claim for Authorization'
              )}
            </Button>
          )}

          {order.status === 'Pending Approval' && (
            <>
              <Button
                onClick={handleAuthorize}
                disabled={isProcessing}
                variant="default"
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                type="button"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Authorize Order
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowRejectForm(!showRejectForm)}
                disabled={isProcessing}
                variant="outline"
                className="w-full sm:w-auto"
                type="button"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Order
              </Button>
              <Button
                onClick={handleRelease}
                disabled={isProcessing}
                variant="outline"
                className="w-full sm:w-auto"
                type="button"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Release Order'
                )}
              </Button>
            </>
          )}
        </div>

        {showRejectForm && (
          <div className="space-y-2 p-4 border border-border rounded-md bg-muted/30">
            <Label htmlFor="reject-reason">Rejection Reason *</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter the reason for rejecting this order..."
              rows={3}
              className="resize-none"
              aria-required="true"
              aria-invalid={!rejectReason.trim() ? 'true' : 'false'}
              aria-describedby="reject-reason-help"
            />
            <p id="reject-reason-help" className="text-xs text-muted-foreground">
              Please provide a clear reason for rejecting this order.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
                variant="destructive"
                size="sm"
                className="w-full sm:w-auto"
                type="button"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason('');
                }}
                disabled={isProcessing}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                type="button"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {order.authorizedAt && (
          <div className="text-sm text-muted-foreground">
            <p>Authorized at: {new Date(order.authorizedAt).toLocaleString()}</p>
            {order.authorizedBy && <p>Authorized by: User ID {order.authorizedBy}</p>}
          </div>
        )}

        {order.rejectedAt && (
          <div className="text-sm text-muted-foreground">
            <p>Rejected at: {new Date(order.rejectedAt).toLocaleString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

