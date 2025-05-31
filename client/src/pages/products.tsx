import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Search, Filter, ChevronDown, Download, FileText, TrendingUp, Users, Calendar, Shield, ChevronUp, Mail, MessageCircle } from "lucide-react";

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
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

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
  const categories = Array.from(new Set(products.map(p => p.category)));
  const riskLevels = Array.from(new Set(products.map(p => p.riskLevel)));

  const toggleCardExpansion = (productId: number) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(productId)) {
      newExpandedCards.delete(productId);
    } else {
      newExpandedCards.add(productId);
    }
    setExpandedCards(newExpandedCards);
  };

  const isCardExpanded = (productId: number) => expandedCards.has(productId);

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

  const handleDownload = async (product: Product) => {
    if (!product.factsheetUrl) {
      console.log('No factsheet available for download');
      return;
    }
    
    try {
      // Fetch the PDF from the database/server
      const response = await fetch(product.factsheetUrl);
      if (!response.ok) throw new Error('Failed to fetch PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${product.name}_Factsheet.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleMail = async (product: Product) => {
    try {
      // Generate PDF filename based on product name
      const filename = `${product.name.toLowerCase().replace(/\s+/g, '-')}-factsheet.pdf`;
      
      // Fetch the PDF from our document generation endpoint
      const response = await fetch(`/documents/${filename}`);
      if (!response.ok) throw new Error('Failed to fetch PDF');
      
      const blob = await response.blob();
      
      // Prepare email content with attachment reference
      const subject = `${product.name} - Product Factsheet`;
      const body = `Dear Sir/Madam,

Please find herewith attached the details as you have requested for the given product: ${product.name}.

Product Details:
- Category: ${product.category}
- Risk Level: ${product.riskLevel}
- Minimum Investment: ${product.minInvestment}
${product.expectedReturns ? `- Expected Returns: ${product.expectedReturns}` : ''}

The product factsheet document is attached to this email for your reference.

Best regards,
Ujjivan Small Finance Bank`;

      // For modern browsers, try to use Web Share API with file attachment
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: subject,
            text: body,
            files: [file]
          });
          return;
        }
      }

      // Fallback: Create a downloadable link and open email client
      const url = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(url);

      // Also open email client with enhanced message
      const enhancedBody = `${body}

Note: The PDF document has been downloaded to your device. Please attach it to this email before sending.`;

      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(enhancedBody)}`;
      window.location.href = mailtoLink;

    } catch (error) {
      console.error('Mail preparation failed:', error);
      // Final fallback: open email client with text content and download link
      const subject = `${product.name} - Product Information`;
      const body = `Dear Sir/Madam,

Please find herewith the details as you have requested for the given product: ${product.name}.

Product Details:
- Category: ${product.category}
- Risk Level: ${product.riskLevel}
- Minimum Investment: ${product.minInvestment}
${product.expectedReturns ? `- Expected Returns: ${product.expectedReturns}` : ''}

You can download the product factsheet from: ${window.location.origin}/documents/${product.name.toLowerCase().replace(/\s+/g, '-')}-factsheet.pdf

Best regards,
Ujjivan Small Finance Bank`;

      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
    }
  };

  const handleWhatsApp = async (product: Product) => {
    try {
      // Generate PDF filename based on product name
      const filename = `${product.name.toLowerCase().replace(/\s+/g, '-')}-factsheet.pdf`;
      
      // Fetch the PDF from our document generation endpoint
      const response = await fetch(`/documents/${filename}`);
      if (!response.ok) throw new Error('Failed to fetch PDF');
      
      const blob = await response.blob();
      
      // Prepare WhatsApp message
      const message = `Dear Sir/Madam,

Thank you for your interest in ${product.name}.

Please find herewith the details as you have requested:

📊 *Product Details:*
• Category: ${product.category}
• Risk Level: ${product.riskLevel}
• Minimum Investment: ${product.minInvestment}
${product.expectedReturns ? `• Expected Returns: ${product.expectedReturns}` : ''}

I have attached the product factsheet document for your reference.

Best regards,
Ujjivan Small Finance Bank`;

      // For modern browsers with Web Share API support
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${product.name} - Product Information`,
            text: message,
            files: [file]
          });
          return;
        }
      }

      // Fallback: Download PDF and open WhatsApp with message
      const url = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(url);

      // Open WhatsApp with enhanced message
      const enhancedMessage = `${message}

Note: I have downloaded the PDF document to your device. Please attach it when sending this message.`;

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(enhancedMessage)}`;
      window.open(whatsappUrl, '_blank');

    } catch (error) {
      console.error('WhatsApp preparation failed:', error);
      // Final fallback: open WhatsApp with text content and download link
      const message = `Dear Sir/Madam,

Thank you for your interest in ${product.name}.

📊 *Product Details:*
• Category: ${product.category}
• Risk Level: ${product.riskLevel}
• Minimum Investment: ${product.minInvestment}
${product.expectedReturns ? `• Expected Returns: ${product.expectedReturns}` : ''}

You can download the product factsheet from: ${window.location.origin}/documents/${product.name.toLowerCase().replace(/\s+/g, '-')}-factsheet.pdf

Best regards,
Ujjivan Small Finance Bank`;

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const isExpanded = isCardExpanded(product.id);
              return (
                <Card 
                  key={product.id} 
                  className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${product.featured ? 'ring-2 ring-blue-200' : ''}`}
                  onClick={() => toggleCardExpansion(product.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {product.productCode} • {product.category}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {product.featured && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Featured
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Summary View - Always Visible */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Min Investment</p>
                        <p className="font-medium">{product.minInvestment}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Risk Level</p>
                        <Badge className={`text-xs ${getRiskColor(product.riskLevel)}`}>
                          {product.riskLevel}
                        </Badge>
                      </div>
                    </div>

                    {product.expectedReturns && (
                      <div className="text-sm">
                        <p className="text-gray-600">Expected Returns</p>
                        <p className="font-medium text-green-700">{product.expectedReturns}</p>
                      </div>
                    )}

                    {/* Expanded View - Conditional */}
                    {isExpanded && (
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-700">
                          {product.description}
                        </p>

                        {/* Performance Metrics */}
                        {(product.totalInvestors || product.totalSubscriptions) && (
                          <div className="flex items-center gap-4 text-xs text-gray-600">
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
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Key Features</p>
                            <div className="space-y-1">
                              {product.keyFeatures.map((feature, index) => (
                                <div key={index} className="text-xs text-gray-600 flex items-start gap-2">
                                  <span className="text-green-600 mt-0.5">•</span>
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Additional Details */}
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          {product.tenure && (
                            <div>
                              <p className="text-gray-600">Tenure</p>
                              <p className="font-medium">{product.tenure}</p>
                            </div>
                          )}
                          
                          {product.lockInPeriod && (
                            <div>
                              <p className="text-gray-600">Lock-in Period</p>
                              <p className="font-medium">{product.lockInPeriod} months</p>
                            </div>
                          )}
                          
                          {product.managementFee && (
                            <div>
                              <p className="text-gray-600">Management Fee</p>
                              <p className="font-medium">{product.managementFee}% p.a.</p>
                            </div>
                          )}
                          
                          {product.exitLoad && (
                            <div>
                              <p className="text-gray-600">Exit Load</p>
                              <p className="font-medium">{product.exitLoad}</p>
                            </div>
                          )}
                        </div>

                        {/* Regulatory Information */}
                        {product.regulatoryApprovals && product.regulatoryApprovals.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Regulatory Approvals</p>
                            <div className="flex flex-wrap gap-1">
                              {product.regulatoryApprovals.map((approval, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {approval}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tax Information */}
                        {product.taxImplications && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Tax Implications</p>
                            <p className="text-xs text-gray-600">{product.taxImplications}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(product);
                            }}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMail(product);
                            }}
                          >
                            <Mail className="h-4 w-4" />
                            Mail
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsApp(product);
                            }}
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}