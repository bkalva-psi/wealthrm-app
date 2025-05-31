import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Search, Filter, ChevronDown, Download, FileText, TrendingUp, Users, Calendar, Shield } from "lucide-react";

interface Product {
  id: number;
  name: string;
  productCode: string;
  category: string;
  subCategory?: string;
  description: string;
  keyFeatures: string[];
  targetAudience?: string;
  minInvestment: string;
  maxInvestment?: string;
  riskLevel: string;
  expectedReturns?: string;
  lockInPeriod?: number;
  tenure?: string;
  exitLoad?: string;
  managementFee?: number;
  regulatoryApprovals: string[];
  taxImplications?: string;
  factsheetUrl?: string;
  kimsUrl?: string;
  applicationFormUrl?: string;
  isOpenForSubscription: boolean;
  launchDate?: string;
  maturityDate?: string;
  totalSubscriptions?: number;
  totalInvestors?: number;
  featured: boolean;
  tags: string[];
}

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products from database
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(product.category);
    
    const matchesRisk = selectedRiskLevels.length === 0 || 
      selectedRiskLevels.includes(product.riskLevel);
    
    return matchesSearch && matchesCategory && matchesRisk;
  });

  // Get unique categories and risk levels for filters
  const categories = [...new Set(products.map(p => p.category))];
  const riskLevels = [...new Set(products.map(p => p.riskLevel))];

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const handleRiskLevelChange = (riskLevel: string, checked: boolean) => {
    if (checked) {
      setSelectedRiskLevels([...selectedRiskLevels, riskLevel]);
    } else {
      setSelectedRiskLevels(selectedRiskLevels.filter(r => r !== riskLevel));
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'very low':
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'very high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = (url?: string, fileName?: string) => {
    if (url) {
      // In a real app, this would download the actual PDF
      console.log(`Downloading ${fileName || 'document'} from ${url}`);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load products. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            
            {/* Filters Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                {categories.map(category => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Risk Level</DropdownMenuLabel>
                {riskLevels.map(riskLevel => (
                  <DropdownMenuCheckboxItem
                    key={riskLevel}
                    checked={selectedRiskLevels.includes(riskLevel)}
                    onCheckedChange={(checked) => handleRiskLevelChange(riskLevel, checked)}
                  >
                    {riskLevel}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="h-12 w-12 mx-auto mb-4" />
              {searchTerm || selectedCategories.length > 0 || selectedRiskLevels.length > 0 
                ? "No products match your search criteria."
                : "No products available."}
            </div>
            {(searchTerm || selectedCategories.length > 0 || selectedRiskLevels.length > 0) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategories([]);
                  setSelectedRiskLevels([]);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
                {selectedCategories.length > 0 && (
                  <span className="ml-2">
                    • Categories: {selectedCategories.join(", ")}
                  </span>
                )}
                {selectedRiskLevels.length > 0 && (
                  <span className="ml-2">
                    • Risk: {selectedRiskLevels.join(", ")}
                  </span>
                )}
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <Card key={product.id} className={`transition-all duration-200 hover:shadow-lg ${product.featured ? 'ring-2 ring-blue-200' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {product.productCode} • {product.category}
                        </CardDescription>
                      </div>
                      {product.featured && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {product.description}
                    </p>

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Min Investment</p>
                          <p className="font-medium">{product.minInvestment}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Risk Level</p>
                          <Badge className={`text-xs ${getRiskColor(product.riskLevel)}`}>
                            {product.riskLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {product.expectedReturns && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Expected Returns</p>
                          <p className="font-medium text-green-700">{product.expectedReturns}</p>
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    {(product.totalInvestors || product.totalSubscriptions) && (
                      <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t">
                        {product.totalInvestors && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{product.totalInvestors.toLocaleString()} investors</span>
                          </div>
                        )}
                        {product.totalSubscriptions && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>₹{(product.totalSubscriptions / 10000000).toFixed(0)}Cr AUM</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Key Features */}
                    {product.keyFeatures && product.keyFeatures.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.keyFeatures.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {product.keyFeatures.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.keyFeatures.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    {product.factsheetUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 flex items-center gap-2"
                        onClick={() => handleDownload(product.factsheetUrl, `${product.name} Factsheet`)}
                      >
                        <FileText className="h-4 w-4" />
                        Factsheet
                      </Button>
                    )}
                    {product.applicationFormUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 flex items-center gap-2"
                        onClick={() => handleDownload(product.applicationFormUrl, `${product.name} Application`)}
                      >
                        <Download className="h-4 w-4" />
                        Apply
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}