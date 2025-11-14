import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Info, FileText, AlertTriangle } from 'lucide-react';
import { Product } from '../types/order.types';
import { apiRequest } from '@/lib/queryClient';
import SchemeInfoOverlay from './overlays/scheme-info-overlay';
import DocumentsOverlay from './overlays/documents-overlay';

interface ProductListProps {
  onAddToCart: (product: Product) => void;
  onOpenDocuments?: (productId: number) => void;
  onOpenDeviations?: (productId: number) => void;
}

export default function ProductList({ 
  onAddToCart, 
  onOpenDocuments, 
  onOpenDeviations 
}: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [rtaFilter, setRtaFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [documentsProductId, setDocumentsProductId] = useState<number | null>(null);

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/order-management/products'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/order-management/products');
      const data = await response.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
  });

  // Ensure products is always an array before filtering
  const productsArray = Array.isArray(products) ? products : [];
  const filteredProducts = productsArray.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.schemeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesRta = rtaFilter === 'all' || product.rta === rtaFilter;
    return matchesSearch && matchesCategory && matchesRta && product.isWhitelisted;
  });

  const categories = Array.from(new Set(productsArray.map(p => p.category)));
  const rtas = Array.from(new Set(productsArray.map(p => p.rta)));

  if (isLoading) {
    return (
      <div data-testid="product-list-skeleton" className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <p className="text-sm font-medium text-destructive">Failed to load products. Please try again.</p>
        </div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-12 w-12 text-muted-foreground" />}
        title="No products found"
        description={searchQuery || categoryFilter !== 'all' || rtaFilter !== 'all'
          ? "Try adjusting your filters to find what you're looking for."
          : "No products available at this time."}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={rtaFilter} onValueChange={setRtaFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="RTA" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All RTAs</SelectItem>
            {rtas.map(rta => (
              <SelectItem key={rta} value={rta}>{rta}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{product.schemeName}</h3>
                    <Badge variant="outline">{product.category}</Badge>
                    <Badge variant="secondary">{product.rta}</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">NAV:</span> ₹{product.nav.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Min:</span> ₹{product.minInvestment.toLocaleString()}
                    </div>
                    {product.maxInvestment && (
                      <div>
                        <span className="font-medium">Max:</span> ₹{product.maxInvestment.toLocaleString()}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Risk:</span> {product.riskLevel}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0 sm:ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedProduct(product)}
                    aria-label={`View scheme info for ${product.schemeName}`}
                    title="Scheme Info"
                    type="button"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  {onOpenDocuments && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDocumentsProductId(product.id);
                        onOpenDocuments(product.id);
                      }}
                      aria-label={`View documents for ${product.schemeName}`}
                      title="Documents"
                      type="button"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                  {onOpenDeviations && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onOpenDeviations(product.id)}
                      aria-label={`View deviations for ${product.schemeName}`}
                      title="Deviations"
                      type="button"
                    >
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    </Button>
                  )}
                  <Button
                    onClick={() => onAddToCart(product)}
                    size="sm"
                    type="button"
                    aria-label={`Add ${product.schemeName} to cart`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scheme Info Overlay */}
      <SchemeInfoOverlay
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />

      {/* Documents Overlay */}
      {documentsProductId !== null && (
        <DocumentsOverlay
          productId={documentsProductId}
          open={documentsProductId !== null}
          onOpenChange={(open) => !open && setDocumentsProductId(null)}
        />
      )}
    </div>
  );
}

