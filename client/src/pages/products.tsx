import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronDown, Download, Plus } from "lucide-react";

// Product data (in a real app, this would come from API)
const products = [
  {
    id: 1,
    name: "Premium Wealth Management",
    category: "Wealth Management",
    minInvestment: "₹50 L",
    riskLevel: "Moderate",
    returns: "12-15% p.a.",
    description: "Comprehensive wealth management solution for high-net-worth individuals including personalized portfolio management, tax planning, and estate planning.",
    featured: true,
    tags: ["High Net Worth", "Tax Efficient"]
  },
  {
    id: 2,
    name: "Balanced Growth Portfolio",
    category: "Mutual Funds",
    minInvestment: "₹10 L",
    riskLevel: "Moderate",
    returns: "10-12% p.a.",
    description: "A balanced portfolio of equity and debt funds designed to provide steady growth with moderate risk.",
    featured: false,
    tags: ["Balanced", "Growth"]
  },
  {
    id: 3,
    name: "Equity Growth Fund",
    category: "Mutual Funds",
    minInvestment: "₹5 L",
    riskLevel: "High",
    returns: "15-18% p.a.",
    description: "Aggressive equity fund focused on capital appreciation through investments in high-growth sectors.",
    featured: true,
    tags: ["High Growth", "Equity"]
  },
  {
    id: 4,
    name: "Fixed Income Portfolio",
    category: "Fixed Income",
    minInvestment: "₹25 L",
    riskLevel: "Low",
    returns: "7-8% p.a.",
    description: "Conservative portfolio focused on generating steady income through investments in bonds, fixed deposits, and debt instruments.",
    featured: false,
    tags: ["Income", "Low Risk"]
  },
  {
    id: 5,
    name: "Tax-Advantaged Investment Plan",
    category: "Tax Planning",
    minInvestment: "₹1.5 L",
    riskLevel: "Low to Moderate",
    returns: "8-10% p.a.",
    description: "Investment solutions designed to maximize tax benefits under Section 80C while providing moderate returns.",
    featured: false,
    tags: ["Tax Saving", "ELSS"]
  },
  {
    id: 6,
    name: "Corporate Treasury Management",
    category: "Corporate Solutions",
    minInvestment: "₹1 Cr",
    riskLevel: "Low",
    returns: "6-8% p.a.",
    description: "Treasury management solutions for corporate clients focusing on liquidity management and short-term investments.",
    featured: false,
    tags: ["Corporate", "Treasury"]
  },
  {
    id: 7,
    name: "Real Estate Investment Trust",
    category: "Alternative Investments",
    minInvestment: "₹25 L",
    riskLevel: "Moderate",
    returns: "9-11% p.a.",
    description: "REIT investments providing exposure to commercial real estate with regular income distributions.",
    featured: true,
    tags: ["Real Estate", "Income"]
  },
  {
    id: 8,
    name: "Private Equity Fund",
    category: "Alternative Investments",
    minInvestment: "₹1 Cr",
    riskLevel: "Very High",
    returns: "18-25% p.a.",
    description: "Access to private equity investments in high-growth companies with potential for significant returns.",
    featured: false,
    tags: ["Private Equity", "High Return"]
  }
];

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Set page title
  useEffect(() => {
    document.title = "Products | Wealth RM";
  }, []);
  
  // Filter products based on search query and active tab
  const filteredProducts = products.filter(product => {
    // Filter by search query
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by tab
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "featured" && product.featured) ||
      product.category.toLowerCase() === activeTab.toLowerCase();
    
    return matchesSearch && matchesTab;
  });
  
  // Get unique categories for tabs
  const categories = Array.from(new Set(products.map(product => product.category)));
  
  const getRiskLevelColor = (riskLevel: string) => {
    if (riskLevel.includes("Low")) return "bg-green-100 text-green-800";
    if (riskLevel.includes("Moderate")) return "bg-amber-100 text-amber-800";
    if (riskLevel.includes("High")) return "bg-red-100 text-red-800";
    return "bg-slate-100 text-slate-800";
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Products</h1>
          <p className="text-sm text-slate-600">Browse and recommend financial products</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Product Catalog
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Request Product
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category.toLowerCase()}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription>{product.category}</CardDescription>
                      </div>
                      {product.featured && (
                        <Badge variant="secondary" className="bg-primary-50 text-primary-700 hover:bg-primary-100">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">{product.description}</p>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div>
                        <span className="font-medium text-slate-700">Min Investment:</span>
                      </div>
                      <div className="text-slate-800">{product.minInvestment}</div>
                      
                      <div>
                        <span className="font-medium text-slate-700">Risk Level:</span>
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(product.riskLevel)}`}>
                          {product.riskLevel}
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-slate-700">Expected Returns:</span>
                      </div>
                      <div className="text-slate-800">{product.returns}</div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="bg-slate-50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t bg-slate-50 px-6 py-3">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button size="sm">Recommend</Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-slate-500">No products match your search criteria</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
