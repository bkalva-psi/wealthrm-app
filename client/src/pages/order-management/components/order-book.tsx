import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/empty-state';
import { Search, Eye, Download, Calendar, Shield, X, FileDown } from 'lucide-react';
import { Order, OrderStatus } from '../types/order.types';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import AuthorizationPanel from './authorization-panel';
import FullSwitchRedemptionPanel from './full-switch-redemption-panel';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OrderBookProps {
  onViewOrder?: (orderId: number) => void;
}

const statusColors: Record<OrderStatus, string> = {
  'Pending': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 dark:border-yellow-500/30',
  'Pending Approval': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30',
  'In Progress': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30',
  'Settlement Pending': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20 dark:border-orange-500/30',
  'Executed': 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 dark:border-green-500/30',
  'Settled': 'bg-green-600/10 text-green-800 dark:text-green-300 border-green-600/20 dark:border-green-600/30',
  'Failed': 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 dark:border-red-500/30',
  'Settlement Reversal': 'bg-red-600/10 text-red-800 dark:text-red-300 border-red-600/20 dark:border-red-600/30',
};

export default function OrderBook({ onViewOrder }: OrderBookProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAuthorization, setShowAuthorization] = useState(false);
  const [viewOrderId, setViewOrderId] = useState<number | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const { data: orders, isLoading, error, refetch } = useQuery<Order[]>({
    queryKey: ['/api/order-management/orders'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/order-management/orders');
      const data = await response.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch order details for Full Switch/Redemption viewing
  const { data: orderDetails, isLoading: isLoadingDetails } = useQuery<Order | null>({
    queryKey: ['/api/order-management/orders', viewOrderId],
    queryFn: async () => {
      if (!viewOrderId) return null;
      const response = await apiRequest('GET', `/api/order-management/orders/${viewOrderId}`);
      const data = await response.json();
      return data;
    },
    enabled: !!viewOrderId && showOrderDetails,
  });

  const handleStatusChange = (orderId: number, newStatus: OrderStatus, reason?: string) => {
    // Update local state optimistically
    refetch();
    setShowAuthorization(false);
    setSelectedOrder(null);
  };

  const handleExportOrder = (order: Order) => {
    // Export order to PDF/XLS
    // In production, this would call an API endpoint: /api/order-management/orders/:id/export
    const orderData = {
      orderId: order.modelOrderId,
      status: order.status,
      submittedAt: order.submittedAt,
      items: order.orderFormData?.cartItems || [],
      transactionMode: order.orderFormData?.transactionMode || null,
      nominees: order.orderFormData?.nominees || [],
      rtaRefNo: order.rtaRefNo,
      paymentReferences: {
        orderPaymentReference: order.orderPaymentReference,
        pgPaymentReferenceNo: order.pgPaymentReferenceNo,
      },
      traceId: order.traceId,
      ipAddress: order.ipAddress,
    };
    
    // For now, create a downloadable JSON file
    // In production, this would generate PDF/XLS via API
    const blob = new Blob([JSON.stringify(orderData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${order.modelOrderId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportFilteredOrders = (ordersToExport: Order[]) => {
    // Export filtered orders to PDF/XLS
    // In production, this would call: /api/order-management/orders/export?filters=...
      const exportData = {
        exportDate: new Date().toISOString(),
        filters: {
          status: statusFilter,
          dateRange: dateFilter,
          searchQuery: searchQuery,
        },
        totalOrders: ordersToExport.length,
        orders: ordersToExport.map(order => {
          const cartItems = order.orderFormData?.cartItems || [];
          return {
            orderId: order.modelOrderId,
            status: order.status,
            submittedAt: order.submittedAt,
            amount: Array.isArray(cartItems) 
              ? cartItems.reduce((sum, item) => sum + (item.amount || 0), 0)
              : 0,
            itemCount: Array.isArray(cartItems) ? cartItems.length : 0,
            rtaRefNo: order.rtaRefNo,
            traceId: order.traceId,
          };
        }),
      };
    
    // For now, create a downloadable JSON file
    // In production, this would generate PDF/XLS via API
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Ensure orders is always an array before filtering
  const ordersArray = Array.isArray(orders) ? orders : [];
  const filteredOrders = ordersArray.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.modelOrderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.orderFormData?.cartItems && Array.isArray(order.orderFormData.cartItems) && 
       order.orderFormData.cartItems.some(item => 
         item.schemeName?.toLowerCase().includes(searchQuery.toLowerCase())
       ));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      const submittedDate = new Date(order.submittedAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          return daysDiff === 0;
        case 'week':
          return daysDiff <= 7;
        case 'month':
          return daysDiff <= 30;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalAmount = filteredOrders.reduce((sum, order) => {
    const cartItems = order.orderFormData?.cartItems;
    if (!cartItems || !Array.isArray(cartItems)) return sum;
    return sum + cartItems.reduce((itemSum, item) => itemSum + (item.amount || 0), 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Failed to load orders. Please try again.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredOrders.filter(o => o.status === 'Pending Approval').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredOrders.filter(o => o.status === 'Failed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Filters</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Export filtered orders to PDF/XLS
                  handleExportFilteredOrders(filteredOrders);
                }}
                disabled={filteredOrders.length === 0}
                aria-label="Export filtered orders"
                type="button"
              >
                <Download className="h-4 w-4 mr-2" />
                Export ({filteredOrders.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Order ID or Scheme Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  aria-label="Search orders"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Settlement Pending">Settlement Pending</SelectItem>
                <SelectItem value="Executed">Executed</SelectItem>
                <SelectItem value="Settled">Settled</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Settlement Reversal">Settlement Reversal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by date range">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
          title="No orders found"
          description={searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
            ? "Try adjusting your filters to find what you're looking for."
            : "No orders have been submitted yet."}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const cartItems = order.orderFormData?.cartItems || [];
            const orderAmount = Array.isArray(cartItems) 
              ? cartItems.reduce((sum, item) => sum + (item.amount || 0), 0)
              : 0;
            const itemCount = Array.isArray(cartItems) ? cartItems.length : 0;
            
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{order.modelOrderId}</h3>
                        <Badge 
                          variant="outline" 
                          className={statusColors[order.status]}
                        >
                          {order.status}
                        </Badge>
                        {order.rejectedReason && (
                          <Badge variant="destructive">Rejected</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Submitted:</span>
                          <p className="font-medium">
                            {format(new Date(order.submittedAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Items:</span>
                          <p className="font-medium">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <p className="font-medium">₹{orderAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mode:</span>
                          <p className="font-medium">{order.orderFormData?.transactionMode?.mode || 'N/A'}</p>
                        </div>
                      </div>

                      {order.rejectedReason && (
                        <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-md">
                          <p className="text-sm font-medium text-red-800 dark:text-red-200">Rejection Reason:</p>
                          <p className="text-sm text-red-700 dark:text-red-300">{order.rejectedReason}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {order.rtaRefNo && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">RTA</Badge>
                            <span className="font-medium">Ref:</span> 
                            <span className="font-mono">{order.rtaRefNo}</span>
                          </div>
                        )}
                        {order.orderPaymentReference && (
                          <div className="text-muted-foreground">
                            <span className="font-medium">Payment:</span> 
                            <span className="ml-1 font-mono text-xs" title={order.orderPaymentReference}>
                              {order.orderPaymentReference.length > 12 
                                ? `${order.orderPaymentReference.substring(0, 12)}...` 
                                : order.orderPaymentReference}
                            </span>
                          </div>
                        )}
                        {order.paymentlinkedstatus && (
                          <Badge 
                            variant={order.paymentlinkedstatus === 'Linked' ? 'default' : 'outline'}
                            className="text-xs"
                            aria-label={`Payment status: ${order.paymentlinkedstatus}`}
                          >
                            {order.paymentlinkedstatus}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {(order.status === 'Pending' || order.status === 'Pending Approval') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowAuthorization(true);
                          }}
                          type="button"
                          className="w-full sm:w-auto"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Authorize
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewOrderId(order.id);
                          setShowOrderDetails(true);
                        }}
                        type="button"
                        className="w-full sm:w-auto"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Download Order Details"
                        onClick={() => {
                          // Export order details to PDF/XLS
                          handleExportOrder(order);
                        }}
                        aria-label={`Download order ${order.modelOrderId} details`}
                        type="button"
                        className="w-full sm:w-auto"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Authorization Dialog */}
      {selectedOrder && (
        <Dialog open={showAuthorization} onOpenChange={setShowAuthorization}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Authorize Order - {selectedOrder.modelOrderId}</DialogTitle>
              <DialogDescription>
                Review and authorize or reject this order. Provide a reason if rejecting.
              </DialogDescription>
            </DialogHeader>
            <AuthorizationPanel
              order={selectedOrder}
              onStatusChange={handleStatusChange}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Order Details Dialog (for Full Switch/Redemption) */}
      {showOrderDetails && (
        <Dialog open={showOrderDetails} onOpenChange={(open) => {
          setShowOrderDetails(open);
          if (!open) {
            setViewOrderId(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <DialogTitle className="text-lg sm:text-xl">
                  Order Details - {orderDetails?.modelOrderId || 'Loading...'}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowOrderDetails(false);
                    setViewOrderId(null);
                  }}
                  aria-label="Close order details dialog"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <DialogDescription>
                View complete order details including transaction information and status.
              </DialogDescription>
            </DialogHeader>
            
            {isLoadingDetails ? (
              <div className="space-y-4" aria-live="polite" aria-busy="true">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : orderDetails ? (
              <div className="space-y-6">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Order ID</Label>
                        <p className="font-medium">{orderDetails.modelOrderId}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <Badge className={statusColors[orderDetails.status]}>
                          {orderDetails.status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Submitted</Label>
                        <p className="font-medium">
                          {format(new Date(orderDetails.submittedAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Transaction Mode</Label>
                        <p className="font-medium">{orderDetails.orderFormData?.transactionMode?.mode || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cart Items */}
                {orderDetails.orderFormData?.cartItems && Array.isArray(orderDetails.orderFormData.cartItems) && orderDetails.orderFormData.cartItems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Cart Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {orderDetails.orderFormData.cartItems.map((item, index) => (
                          <div key={item.id} className="p-4 border rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{item.schemeName}</h4>
                              <Badge variant="outline">{item.transactionType}</Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Amount:</span>
                                <p className="font-medium">₹{item.amount.toLocaleString()}</p>
                              </div>
                              {item.units && (
                                <div>
                                  <span className="text-muted-foreground">Units:</span>
                                  <p className="font-medium">{item.units.toFixed(4)}</p>
                                </div>
                              )}
                              {item.nav && (
                                <div>
                                  <span className="text-muted-foreground">NAV:</span>
                                  <p className="font-medium">₹{item.nav.toFixed(2)}</p>
                                </div>
                              )}
                              {item.closeAc !== undefined && (
                                <div>
                                  <span className="text-muted-foreground">Close AC:</span>
                                  <p className="font-medium">{item.closeAc ? 'Y' : 'N'}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Full Switch Data */}
                {orderDetails.orderFormData?.fullSwitchData && (
                  <FullSwitchRedemptionPanel
                    type="switch"
                    data={orderDetails.orderFormData.fullSwitchData}
                  />
                )}

                {/* Full Redemption Data */}
                {orderDetails.orderFormData?.fullRedemptionData && (
                  <FullSwitchRedemptionPanel
                    type="redemption"
                    data={orderDetails.orderFormData.fullRedemptionData}
                  />
                )}

                {/* Payment & Routing Information */}
                {(orderDetails.rtaRefNo || orderDetails.orderPaymentReference || orderDetails.pgPaymentReferenceNo || orderDetails.paymentlinkedstatus || orderDetails.payremarks || orderDetails.traceId) && (
                  <Card role="region" aria-label="Payment and Routing Information">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <CardTitle>Payment & Routing Information</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportOrder(orderDetails)}
                          aria-label="Export order details"
                          type="button"
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {orderDetails.rtaRefNo && (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Label className="text-muted-foreground">RTA Reference No</Label>
                                <Badge variant="secondary" className="text-xs">RTA Route</Badge>
                              </div>
                              <p className="font-medium font-mono text-sm">{orderDetails.rtaRefNo}</p>
                              <p className="text-xs text-muted-foreground mt-1">RTA Connector (CAMS/KFintech)</p>
                            </div>
                          )}
                          {orderDetails.orderPaymentReference && (
                            <div>
                              <Label className="text-muted-foreground">Order Payment Reference</Label>
                              <p 
                                className="font-medium font-mono text-sm break-all" 
                                title={orderDetails.orderPaymentReference}
                                aria-label={`Order payment reference: ${orderDetails.orderPaymentReference}`}
                              >
                                {orderDetails.orderPaymentReference}
                              </p>
                            </div>
                          )}
                          {orderDetails.pgPaymentReferenceNo && (
                            <div>
                              <Label className="text-muted-foreground">PG Payment Reference</Label>
                              <p 
                                className="font-medium font-mono text-sm break-all"
                                title={orderDetails.pgPaymentReferenceNo}
                                aria-label={`PG payment reference: ${orderDetails.pgPaymentReferenceNo}`}
                              >
                                {orderDetails.pgPaymentReferenceNo}
                              </p>
                            </div>
                          )}
                          {orderDetails.paymentlinkedstatus && (
                            <div>
                              <Label className="text-muted-foreground">Payment Status</Label>
                              <div className="mt-1">
                                <Badge 
                                  variant={orderDetails.paymentlinkedstatus === 'Linked' ? 'default' : 'outline'}
                                  aria-label={`Payment status: ${orderDetails.paymentlinkedstatus}`}
                                >
                                  {orderDetails.paymentlinkedstatus}
                                </Badge>
                              </div>
                            </div>
                          )}
                          {orderDetails.traceId && (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Label className="text-muted-foreground">Trace ID</Label>
                                <Badge variant="outline" className="text-xs">Observability</Badge>
                              </div>
                              <p 
                                className="font-medium font-mono text-xs break-all"
                                title={orderDetails.traceId}
                                aria-label={`Trace ID: ${orderDetails.traceId}`}
                              >
                                {orderDetails.traceId}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">For tracking & debugging</p>
                            </div>
                          )}
                          {orderDetails.ipAddress && (
                            <div>
                              <Label className="text-muted-foreground">IP Address</Label>
                              <p 
                                className="font-medium font-mono text-sm"
                                aria-label={`IP address: ${orderDetails.ipAddress}`}
                              >
                                {orderDetails.ipAddress}
                              </p>
                            </div>
                          )}
                        </div>
                        {orderDetails.payremarks && (
                          <div>
                            <Label className="text-muted-foreground">Payment Remarks</Label>
                            <p 
                              className="text-sm mt-1 p-2 bg-muted rounded-md"
                              aria-label={`Payment remarks: ${orderDetails.payremarks}`}
                            >
                              {orderDetails.payremarks}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Nominee Information */}
                {!orderDetails.orderFormData?.optOutOfNomination && 
                 orderDetails.orderFormData?.nominees && 
                 Array.isArray(orderDetails.orderFormData.nominees) && 
                 orderDetails.orderFormData.nominees.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Nominee Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {orderDetails.orderFormData.nominees.map((nominee, index) => (
                          <div key={nominee.id} className="p-4 border rounded-md">
                            <h4 className="font-semibold mb-2">Nominee {index + 1}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Name:</span>
                                <p className="font-medium">{nominee.name}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Relationship:</span>
                                <p className="font-medium">{nominee.relationship}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Percentage:</span>
                                <p className="font-medium">{nominee.percentage}%</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8" role="alert">
                <p className="text-destructive font-medium mb-2">Failed to load order details</p>
                <p className="text-sm text-muted-foreground">Please try again or contact support if the problem persists.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewOrderId(null);
                    setShowOrderDetails(false);
                  }}
                  className="mt-4"
                  type="button"
                >
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

