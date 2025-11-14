import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ProductList from './components/product-list';
import ProductCart from './components/product-cart';
import TransactionMode from './components/transaction-mode';
import NomineeForm from './components/nominee-form';
import FullSwitchRedemptionPanel from './components/full-switch-redemption-panel';
import OrderInfoOverlay from './components/overlays/order-info-overlay';
import DocumentsOverlay from './components/overlays/documents-overlay';
import DeviationsOverlay from './components/overlays/deviations-overlay';
import OrderBook from './components/order-book';
import { CartItem, TransactionModeData, Nominee, FullSwitchData, FullRedemptionData, Deviation, Order } from './types/order.types';
import { apiRequest } from '@/lib/queryClient';
import { validateOrder, validateOrderWithProducts, validateNomineePercentages, validatePAN, validateGuardianInfo } from './utils/order-validations';
import { useQuery } from '@tanstack/react-query';
import { Product } from './types/order.types';

export default function OrderManagementPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [transactionMode, setTransactionMode] = useState<TransactionModeData | null>(null);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [optOutOfNomination, setOptOutOfNomination] = useState(false);
  const [fullSwitchData, setFullSwitchData] = useState<FullSwitchData | null>(null);
  const [fullRedemptionData, setFullRedemptionData] = useState<FullRedemptionData | null>(null);
  const [activeTab, setActiveTab] = useState('products');
  
  // Overlay states
  const [orderInfoOverlay, setOrderInfoOverlay] = useState<{open: boolean, cartItemId: string | null}>({open: false, cartItemId: null});
  const [documentsOverlay, setDocumentsOverlay] = useState<{open: boolean, productId: number | null}>({open: false, productId: null});
  const [deviationsOverlay, setDeviationsOverlay] = useState<{open: boolean, productId: number | null, deviations: Deviation[]}>({open: false, productId: null, deviations: []});
  const [acknowledgedDeviations, setAcknowledgedDeviations] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // Fetch products for validation
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/order-management/products'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/order-management/products');
      const data = await response.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
  });

  const handleAddToCart = (product: any) => {
    const newItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      schemeName: product.schemeName,
      transactionType: 'Purchase',
      amount: product.minInvestment,
      nav: product.nav,
    };
    setCartItems([...cartItems, newItem]);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const handleUpdateCartItem = (itemId: string, updates: Partial<CartItem>) => {
    setCartItems(cartItems.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  // Overlay handlers
  const handleOpenOrderInfo = (cartItemId: string) => {
    setOrderInfoOverlay({open: true, cartItemId});
  };

  const handleOpenDocuments = (productId: number) => {
    setDocumentsOverlay({open: true, productId});
  };

  const handleOpenDeviations = (productId: number) => {
    // Mock deviations - in real app, fetch from API
    const mockDeviations: Deviation[] = [
      {
        type: 'Amount Below Minimum' as const,
        description: 'Order amount is below the minimum investment requirement for this scheme.',
        impact: 'Order may be rejected by RTA',
        resolutionOptions: ['Increase order amount', 'Select different scheme'],
        acknowledged: acknowledgedDeviations.has(`amount-${productId}`),
      },
    ];
    setDeviationsOverlay({open: true, productId, deviations: mockDeviations});
  };

  const handleAcknowledgeDeviation = (deviationType: string) => {
    const key = `${deviationType}-${deviationsOverlay.productId}`;
    setAcknowledgedDeviations(new Set([...acknowledgedDeviations, key]));
  };

  const handleSubmitOrder = async () => {
    // Comprehensive validation with product data and CRISIL rules
    // Mock market values - in production, fetch from holdings API
    const marketValues = new Map<number, number>();
    cartItems.forEach(item => {
      // Mock: assume market value is 2x the amount for redemption/switch
      // Note: Full Redemption/Switch don't need market value validation per BRD
      if ((item.transactionType === 'Redemption' || item.transactionType === 'Switch') && 
          item.transactionType !== 'Full Redemption' && item.transactionType !== 'Full Switch') {
        marketValues.set(item.productId, item.amount * 2);
      }
    });

    const validation = validateOrderWithProducts(
      cartItems,
      products,
      nominees,
      optOutOfNomination,
      transactionMode?.euin,
      marketValues
    );

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setValidationWarnings(validation.warnings);
      // Scroll to top to show validation errors
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      toast({
        title: 'Validation Error',
        description: `Please fix ${validation.errors.length} error(s) before submitting.`,
        variant: 'destructive',
      });
      return;
    }

    if (validation.warnings.length > 0) {
      setValidationWarnings(validation.warnings);
      // Show warnings but allow submission
      validation.warnings.forEach(warning => {
        toast({
          title: 'Validation Warning',
          description: warning,
        });
      });
    } else {
      setValidationWarnings([]);
    }
    
    // Clear errors if validation passes
    setValidationErrors([]);

    // Additional checks
    if (!transactionMode || !transactionMode.mode) {
      setValidationErrors(['Please select a transaction mode.']);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      toast({
        title: 'Validation Error',
        description: 'Please select a transaction mode.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        cartItems,
        transactionMode: {
          ...transactionMode,
          euin: transactionMode.euin || undefined,
        },
        nominees: optOutOfNomination ? [] : nominees,
        optOutOfNomination,
        fullSwitchData,
        fullRedemptionData,
      };

      // Submit to /orders/submit endpoint
      const response = await apiRequest('POST', '/api/order-management/orders/submit', orderData);
      const responseData = await response.json() as {success: boolean, message: string, data: Order};

      if (responseData.success && responseData.data) {
        toast({
          title: 'Order Submitted Successfully',
          description: `Order ${responseData.data.modelOrderId} has been submitted and is pending approval.`,
        });

        // Clear validation messages
        setValidationErrors([]);
        setValidationWarnings([]);
        
        // Reset form
        setCartItems([]);
        setTransactionMode(null);
        setNominees([]);
        setOptOutOfNomination(false);
        setFullSwitchData(null);
        setFullRedemptionData(null);
        setActiveTab('order-book'); // Navigate to order book after submission

        // In production, redirect to order book or order confirmation page
        // window.location.hash = `/order-management/orders/${responseData.data.id}`;
      }
    } catch (error: any) {
      // Handle structured error response
      let errorMessage = 'Failed to submit order. Please try again.';
      
      // apiRequest throws Error with message containing status and response text
      if (error.message) {
        try {
          // Try to parse error message for structured response
          const errorMatch = error.message.match(/\d+: (.+)/);
          if (errorMatch && errorMatch[1]) {
            const errorText = errorMatch[1];
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.errors && Array.isArray(errorData.errors)) {
                errorMessage = errorData.errors.join('. ');
              } else if (errorData.message) {
                errorMessage = errorData.message;
              }
            } catch {
              // If not JSON, use the error text as-is
              errorMessage = errorText;
            }
          } else {
            errorMessage = error.message;
          }
        } catch {
          errorMessage = error.message || 'Failed to submit order. Please try again.';
        }
      }

      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-6 md:py-8 lg:py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
          Order Management
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid grid-cols-2 sm:flex w-full sm:w-auto">
            <TabsTrigger value="products" className="text-xs sm:text-sm">Products</TabsTrigger>
            <TabsTrigger value="cart" className="text-xs sm:text-sm">Cart ({cartItems.length})</TabsTrigger>
            <TabsTrigger value="review" className="text-xs sm:text-sm">Review & Submit</TabsTrigger>
            <TabsTrigger value="order-book" className="text-xs sm:text-sm">Order Book</TabsTrigger>
          </TabsList>

          {/* Validation Errors Display */}
          {validationErrors.length > 0 && (
            <Card className="border-destructive/50 bg-destructive/5 dark:bg-destructive/10" role="alert" aria-live="polite">
              <CardContent className="pt-4 sm:pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-destructive dark:text-red-400 flex items-center gap-2 text-base sm:text-lg">
                      <AlertTriangle className="h-5 w-5" />
                      Validation Errors ({validationErrors.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setValidationErrors([])}
                      aria-label="Dismiss validation errors"
                      className="h-6 w-6 sm:h-8 sm:w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-destructive dark:text-red-300">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="pl-2">{error}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Warnings Display */}
          {validationWarnings.length > 0 && (
            <Card className="border-yellow-500 bg-yellow-500/5" role="alert" aria-live="polite">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-yellow-700 dark:text-yellow-500 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Validation Warnings ({validationWarnings.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setValidationWarnings([])}
                      aria-label="Dismiss validation warnings"
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-500">
                    {validationWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <TabsContent value="products" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Selection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductList 
                      onAddToCart={handleAddToCart}
                      onOpenDocuments={handleOpenDocuments}
                      onOpenDeviations={handleOpenDeviations}
                    />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Cart Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductCart 
                      items={cartItems}
                      onRemove={handleRemoveFromCart}
                      onUpdateQuantity={(id, quantity) => {
                        const item = cartItems.find(i => i.id === id);
                        if (item && item.nav) {
                          // Calculate amount based on quantity and NAV
                          const newAmount = quantity * item.nav;
                          handleUpdateCartItem(id, { 
                            amount: newAmount,
                            units: quantity
                          });
                        }
                      }}
                      onEdit={handleOpenOrderInfo}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cart" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Cart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductCart 
                      items={cartItems}
                      onRemove={handleRemoveFromCart}
                      onUpdateQuantity={(id, quantity) => {
                        const item = cartItems.find(i => i.id === id);
                        if (item && item.nav) {
                          // Calculate amount based on quantity and NAV
                          const newAmount = quantity * item.nav;
                          handleUpdateCartItem(id, { 
                            amount: newAmount,
                            units: quantity
                          });
                        }
                      }}
                      onEdit={handleOpenOrderInfo}
                      editable
                    />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Cart Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Total Items:</span>
                        <span className="text-sm font-semibold text-foreground">{cartItems.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Total Amount:</span>
                        <span className="text-lg font-bold text-foreground">
                          ₹{cartItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <TransactionMode
                    value={transactionMode?.mode || null}
                    onChange={(mode, data) => setTransactionMode({ mode, ...data, ...transactionMode })}
                    modeData={transactionMode || undefined}
                    onDataChange={(data) => setTransactionMode({ ...transactionMode, ...data, mode: transactionMode?.mode || null })}
                    required
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nominee Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <NomineeForm
                    value={nominees}
                    onChange={setNominees}
                    optOut={optOutOfNomination}
                    onOptOutChange={setOptOutOfNomination}
                  />
                </CardContent>
              </Card>
            </div>

            {(fullSwitchData || fullRedemptionData) && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {fullSwitchData ? 'Full Switch Details' : 'Full Redemption Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {fullSwitchData && (
                    <FullSwitchRedemptionPanel type="switch" data={fullSwitchData} />
                  )}
                  {fullRedemptionData && (
                    <FullSwitchRedemptionPanel type="redemption" data={fullRedemptionData} />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('cart')}
                    disabled={isSubmitting}
                  >
                    Back to Cart
                  </Button>
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting || cartItems.length === 0}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Order'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="order-book" className="space-y-6">
            <OrderBook 
              onViewOrder={(orderId) => {
                // Navigate to order details or show in overlay
                toast({
                  title: 'Order Details',
                  description: `Viewing order ${orderId}`,
                });
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Overlays */}
        {orderInfoOverlay.cartItemId && (() => {
          const cartItem = cartItems.find(item => item.id === orderInfoOverlay.cartItemId);
          return cartItem ? (
            <OrderInfoOverlay
              cartItem={cartItem}
              open={orderInfoOverlay.open}
              onOpenChange={(open) => setOrderInfoOverlay({open, cartItemId: open ? orderInfoOverlay.cartItemId : null})}
              onUpdate={handleUpdateCartItem}
            />
          ) : null;
        })()}

        {documentsOverlay.productId !== null && (
          <DocumentsOverlay
            productId={documentsOverlay.productId}
            open={documentsOverlay.open}
            onOpenChange={(open) => setDocumentsOverlay({open, productId: open ? documentsOverlay.productId : null})}
          />
        )}

        {deviationsOverlay.productId !== null && (
          <DeviationsOverlay
            deviations={deviationsOverlay.deviations}
            open={deviationsOverlay.open}
            onOpenChange={(open) => setDeviationsOverlay({open, productId: open ? deviationsOverlay.productId : null, deviations: []})}
            onAcknowledge={handleAcknowledgeDeviation}
          />
        )}
      </div>
    </div>
  );
}

