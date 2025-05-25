import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  TrendingUp, 
  LineChart,
  PieChart, 
  BarChart3, 
  CalendarDays, 
  Clock, 
  DollarSign, 
  Percent, 
  AlertTriangle,
  Shield,
  Target,
  Wallet,
  Landmark,
  Globe,
  Building,
  ChevronRight,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clientApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Import custom chart components
import AssetAllocationChart from "../components/charts/AssetAllocationChart";
import PerformanceChart from "../components/charts/PerformanceChart";
import BarChartComponent from "../components/charts/BarChart";
import SimpleAumTrendChart from "../components/charts/SimpleAumTrendChart";
import AumTrendChart from "../components/charts/AumTrendChart";

// Mock data for portfolio holdings
const mockHoldings = [
  { name: "HDFC Top 100 Fund", type: "Mutual Fund - Equity", value: 1250000, allocation: 25, gain: 15.4 },
  { name: "SBI Small Cap Fund", type: "Mutual Fund - Equity", value: 875000, allocation: 17.5, gain: 22.8 },
  { name: "ICICI Prudential Corporate Bond Fund", type: "Mutual Fund - Debt", value: 1000000, allocation: 20, gain: 7.2 },
  { name: "Reliance Industries Ltd.", type: "Direct Equity", value: 625000, allocation: 12.5, gain: 18.7 },
  { name: "HDFC Bank Ltd.", type: "Direct Equity", value: 500000, allocation: 10, gain: 9.8 },
  { name: "Gold ETF", type: "Gold ETF", value: 375000, allocation: 7.5, gain: 11.2 },
  { name: "HDFC Savings Account", type: "Cash", value: 375000, allocation: 7.5, gain: 3.5 },
];

// Mock data for performance periods
const performancePeriods = [
  { label: "1M", value: 2.8 },
  { label: "3M", value: 5.4 },
  { label: "6M", value: 8.7 },
  { label: "YTD", value: 11.2 },
  { label: "1Y", value: 14.5 },
  { label: "3Y", value: 12.3 },
  { label: "5Y", value: 11.8 },
  { label: "Since Inception", value: 13.2 },
];

// Mock asset allocation data
const mockAssetAllocation = {
  Equity: 65,
  "Fixed Income": 20,
  Gold: 7.5,
  Cash: 7.5
};

// Mock sector exposure
const mockSectorExposure = {
  "Financial Services": 28,
  "IT": 18,
  "Energy": 12,
  "Consumer Goods": 10,
  "Healthcare": 8,
  "Others": 24
};

// Mock geographic exposure
const mockGeographicExposure = {
  "India": 75,
  "US": 15,
  "Europe": 5,
  "Others": 5
};

// Portfolio metrics component
interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  description?: string;
  color?: string;
  trend?: number;
  isLoading?: boolean;
}

function MetricCard({ title, value, icon, description, color = "blue", trend, isLoading = false }: MetricCardProps) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };
  
  const iconBg = colorMap[color as keyof typeof colorMap] || colorMap.blue;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <div className="mt-1 flex items-baseline">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <h3 className="text-2xl font-bold flex items-center">
                  {value}
                  {trend !== undefined && (
                    <span className={`ml-2 text-sm flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trend > 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                      {Math.abs(trend).toFixed(1)}%
                    </span>
                  )}
                </h3>
              )}
            </div>
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
          </div>
          <div className={`p-2 rounded-full ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Allocation chart component (simplified for now)
function AllocationChart({ data, title, color = "blue" }: { data: Record<string, number>, title: string, color?: string }) {
  const colorMap = {
    blue: ["#4B7BF5", "#7698F8", "#9CB5FA", "#C1D1FC", "#E5EAFE"],
    green: ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#ECFDF5"],
    amber: ["#F59E0B", "#FBBF24", "#FCD34D", "#FDE68A", "#FEF3C7"],
    purple: ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"],
  };
  
  const colors = colorMap[color as keyof typeof colorMap] || colorMap.blue;
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="space-y-2">
        {Object.entries(data).map(([key, value], index) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center">
                <span className={`inline-block w-3 h-3 mr-2 rounded-sm`} style={{ backgroundColor: colors[index % colors.length] }}></span>
                {key}
              </span>
              <span className="font-medium">{value}%</span>
            </div>
            <Progress value={value} className={`h-1.5 bg-current`} style={{ color: colors[index % colors.length] }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Local performance chart component (simplified for now)
function LocalPerformanceChart({ periods }: { periods: { label: string, value: number }[] }) {
  return (
    <div className="mt-4">
      {/* Desktop view */}
      <div className="hidden md:flex flex-wrap gap-3">
        {periods.map((period) => (
          <div key={period.label} className="flex flex-col items-center">
            <span className={`text-sm font-medium ${period.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {period.value > 0 ? '+' : ''}{period.value.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500">{period.label}</span>
          </div>
        ))}
      </div>
      
      {/* Mobile view - grid layout */}
      <div className="md:hidden grid grid-cols-4 gap-2">
        {periods.map((period) => (
          <div key={period.label} className="flex flex-col items-center p-2 bg-slate-50 rounded-md">
            <span className={`text-sm font-medium ${period.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {period.value > 0 ? '+' : ''}{period.value.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500">{period.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Holdings table component
function HoldingsTable({ holdings }: { holdings: any[] }) {
  return (
    <div>
      {/* Table for desktop/tablet */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left font-medium text-slate-500">Security</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Type</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Value</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Allocation</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Gain/Loss</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding, index) => (
              <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{holding.name}</td>
                <td className="px-4 py-3 text-slate-600">{holding.type}</td>
                <td className="px-4 py-3 text-right">
                  ₹{(holding.value / 100000).toFixed(2)} L
                </td>
                <td className="px-4 py-3 text-right">{holding.allocation}%</td>
                <td className={`px-4 py-3 text-right ${holding.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {holding.gain > 0 ? '+' : ''}{holding.gain}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Card view for mobile */}
      <div className="md:hidden space-y-4">
        {holdings.map((holding, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-sm">{holding.name}</h4>
              <span className={`text-sm font-medium ${holding.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {holding.gain > 0 ? '+' : ''}{holding.gain}%
              </span>
            </div>
            <div className="text-xs text-slate-500 mb-3">{holding.type}</div>
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <div>
                <div className="text-xs text-slate-500">Value</div>
                <div className="font-medium">₹{(holding.value / 100000).toFixed(2)} L</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Allocation</div>
                <div className="font-medium text-right">{holding.allocation}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Risk assessment component
function RiskAssessment({ score }: { score: number }) {
  const getScoreLabel = (score: number) => {
    if (score <= 3) return "Low Risk";
    if (score <= 6) return "Moderate Risk";
    return "High Risk";
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Risk Score</span>
        <span className="text-sm font-medium">{score}/10</span>
      </div>
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full ${score <= 3 ? 'bg-green-500' : score <= 6 ? 'bg-amber-500' : 'bg-red-500'}`}
          style={{ width: `${score * 10}%` }}
        ></div>
      </div>
      <div className="text-xs text-slate-500">{getScoreLabel(score)}</div>
    </div>
  );
}

// Main portfolio page component
export default function ClientPortfolioPage() {
  const [clientId, setClientId] = useState<number | null>(null);
  
  // Set page title
  useEffect(() => {
    document.title = "Client Portfolio | Wealth RM";
    
    // Get client ID from URL
    const hash = window.location.hash;
    const match = hash.match(/\/clients\/(\d+)\/portfolio/);
    if (match && match[1]) {
      setClientId(Number(match[1]));
    }
  }, []);
  
  // Fetch client data
  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientId ? clientApi.getClient(clientId) : null,
    enabled: !!clientId,
  });
  
  const handleBackClick = () => {
    window.location.hash = "/clients";
  };
  
  if (!clientId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Client not found</h1>
        <Button onClick={handleBackClick}>Back to Clients</Button>
      </div>
    );
  }
  
  // Convert string AUM to numerical value for calculations if needed
  const getAumValue = (aumString?: string): number => {
    if (!aumString) return 0;
    // Extract numerical value from formatted string (e.g., "₹11.20 L" -> 1120000)
    const match = aumString.match(/₹([\d\.]+)\s*L/);
    return match ? parseFloat(match[1]) * 100000 : 0;
  };
  
  // Generate realistic AUM trend data based on current value and relationship start date
  const generateAumTrendData = (currentValue: number, clientSince?: Date | null): {date: string, value: number}[] => {
    const data: {date: string, value: number}[] = [];
    const today = new Date();
    
    // Default to 3 years ago if no relationship start date provided
    let startDate = new Date(today.getFullYear() - 3, today.getMonth(), 1);
    
    if (clientSince && clientSince instanceof Date && !isNaN(clientSince.getTime())) {
      startDate = new Date(clientSince);
    } else {
      // If client since is not a valid date, fall back to 3 years ago
      console.log("Using default start date for AUM trend chart");
    }
    
    // Generate monthly data points from start date to today
    let currentDate = new Date(startDate);
    let previousValue = currentValue * 0.85; // Start with a lower value
    
    // Add data point for start month
    data.push({
      date: currentDate.toISOString().slice(0, 7),
      value: previousValue
    });
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
    
    // Generate data points for all months between start and now
    while (currentDate <= today) {
      // Random fluctuation between -5% and +5%
      const fluctuation = 0.95 + (Math.random() * 0.1);
      
      // Gradually increase probability of growth as we approach present time
      const timeProgress = (currentDate.getTime() - startDate.getTime()) / 
                          (today.getTime() - startDate.getTime());
      const growthBias = 0.02 * timeProgress; // Up to 2% growth bias toward present time
      
      // Apply fluctuation with growth bias
      const newValue = previousValue * (fluctuation + growthBias);
      
      data.push({
        date: currentDate.toISOString().slice(0, 7),
        value: newValue
      });
      
      previousValue = newValue;
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Ensure the last value is the current AUM
    if (data.length > 0) {
      data[data.length - 1].value = currentValue;
    }
    
    return data;
  };
  
  const aumValue = getAumValue(client?.aum);
  
  return (
    <div className="p-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              `${client?.fullName}'s Portfolio`
            )}
          </h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Portfolio Report
          </Button>
          <Button variant="default" size="sm">
            <Target className="h-4 w-4 mr-2" />
            Investment Recommendations
          </Button>
        </div>
      </div>
      
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="Assets Under Management"
          value={client?.aum || "₹0"}
          icon={<Wallet className="h-5 w-5" />}
          description="Total portfolio value"
          color="blue"
          isLoading={isLoading}
        />
        
        <MetricCard 
          title="Invested Amount"
          value={`₹${((aumValue * 0.85) / 100000).toFixed(2)} L`}
          icon={<DollarSign className="h-5 w-5" />}
          description="Principal investment"
          color="indigo"
          isLoading={isLoading}
        />
        
        <MetricCard 
          title="Unrealized Gains"
          value={`₹${((aumValue * 0.15) / 100000).toFixed(2)} L`}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Growth in portfolio value"
          color="green"
          trend={15.8}
          isLoading={isLoading}
        />
        
        <MetricCard 
          title="XIRR"
          value={`${client?.yearlyPerformance || 12.5}%`}
          icon={<Percent className="h-5 w-5" />}
          description="Annualized returns"
          color="amber"
          isLoading={isLoading}
        />
      </div>
      
      {/* Tabs for different portfolio views */}
      <Tabs defaultValue="overview" className="space-y-4 flex-grow">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full sticky top-0 z-10 bg-white">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>
        
        {/* Portfolio Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Portfolio Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium mb-2">Asset Allocation</h3>
                    <div className="flex-1 h-52">
                      <AssetAllocationChart 
                        data={client?.assetAllocation || mockAssetAllocation} 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium mb-2">AUM Trend (3 Years)</h3>
                    <div className="flex-1 border rounded-md p-4 h-52">
                      <SimpleAumTrendChart aumValue={aumValue} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="link" className="ml-auto">
                  View Rebalancing Opportunities
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Performance Snapshot</CardTitle>
                <CardDescription>Returns across time periods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Returns by Period</h4>
                    <LocalPerformanceChart periods={performancePeriods} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="link" className="ml-auto">
                  Detailed Performance Analysis
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Portfolio Risk Profile</CardTitle>
                <CardDescription>Risk assessment metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <RiskAssessment score={client?.riskScore || 6} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Volatility</h4>
                      <div className="text-xl font-semibold mt-1">
                        {client?.volatility || 12.4}%
                      </div>
                      <p className="text-xs text-slate-500">Annual Standard Deviation</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">Sharpe Ratio</h4>
                      <div className="text-xl font-semibold mt-1">
                        {client?.sharpeRatio || 1.2}
                      </div>
                      <p className="text-xs text-slate-500">Risk-adjusted Returns</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Risk vs Category Average</h4>
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-amber-500 w-[65%]"></div>
                      <div className="absolute top-0 left-0 h-full border-r-2 border-slate-700 border-dashed" style={{ left: '45%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Lower Risk</span>
                      <span>Higher Risk</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sector Exposure</CardTitle>
                <CardDescription>Allocation by industry sectors</CardDescription>
              </CardHeader>
              <CardContent>
                <AllocationChart 
                  data={client?.sectorExposure || mockSectorExposure} 
                  title="Industry Sectors" 
                  color="purple" 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Geographic Exposure</CardTitle>
                <CardDescription>Allocation by regions</CardDescription>
              </CardHeader>
              <CardContent>
                <AllocationChart 
                  data={client?.geographicExposure || mockGeographicExposure} 
                  title="Regions" 
                  color="green" 
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Holdings</CardTitle>
              <CardDescription>Largest positions in the portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <HoldingsTable holdings={mockHoldings.slice(0, 5)} />
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" className="ml-auto" onClick={() => {
                  const element = document.querySelector('[data-value="holdings"]') as HTMLElement;
                  if (element) element.click();
                }}>
                View All Holdings
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                  Portfolio Alerts
                </CardTitle>
                <CardDescription>Important notices about your investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="text-sm font-medium text-amber-800 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                      Portfolio Rebalancing Due
                    </h4>
                    <p className="text-xs text-amber-700 mt-1">
                      Your equity allocation has drifted 5% above target. Consider rebalancing to maintain your risk profile.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      Fixed Deposit Maturing
                    </h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Your HDFC Bank FD of ₹3,00,000 is maturing in 15 days. Contact your RM for reinvestment options.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Target className="h-5 w-5 mr-2 text-indigo-500" />
                  Investment Opportunities
                </CardTitle>
                <CardDescription>Personalized recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h4 className="text-sm font-medium text-indigo-800">Increase Tax-Efficient Investments</h4>
                    <p className="text-xs text-indigo-700 mt-1">
                      Based on your tax bracket, consider additional ELSS funds to optimize tax savings.
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-white text-indigo-700 mr-1">ELSS Funds</Badge>
                      <Badge variant="outline" className="bg-white text-indigo-700">Tax Planning</Badge>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h4 className="text-sm font-medium text-indigo-800">International Diversification</h4>
                    <p className="text-xs text-indigo-700 mt-1">
                      Add exposure to US markets through index funds to increase geographic diversification.
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-white text-indigo-700 mr-1">International Equity</Badge>
                      <Badge variant="outline" className="bg-white text-indigo-700">Diversification</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Holdings Tab */}
        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Holdings</CardTitle>
              <CardDescription>All investments in your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <HoldingsTable holdings={mockHoldings} />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Asset Class Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <AllocationChart 
                  data={client?.assetAllocation || mockAssetAllocation} 
                  title="Current Allocation" 
                  color="blue" 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockHoldings
                    .sort((a, b) => b.gain - a.gain)
                    .slice(0, 3)
                    .map((holding, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">{holding.name}</div>
                          <div className="text-xs text-slate-500">{holding.type}</div>
                        </div>
                        <div className="text-green-600 font-medium">+{holding.gain}%</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Underperformers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockHoldings
                    .sort((a, b) => a.gain - b.gain)
                    .slice(0, 3)
                    .map((holding, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">{holding.name}</div>
                          <div className="text-xs text-slate-500">{holding.type}</div>
                        </div>
                        <div className={`font-medium ${holding.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.gain > 0 ? '+' : ''}{holding.gain}%
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Performance</CardTitle>
              <CardDescription>Portfolio value growth over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center bg-slate-50 rounded-lg">
              <div className="text-center">
                <LineChart className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-500">Performance chart</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Performance by Time Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {performancePeriods.map((period) => (
                    <div key={period.label} className="p-4 bg-slate-50 rounded-lg text-center">
                      <div className={`text-xl font-bold ${period.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {period.value > 0 ? '+' : ''}{period.value.toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-500">{period.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Benchmark Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Desktop view */}
                  <div className="hidden md:block space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Your Portfolio</div>
                        <div className="text-xs text-slate-500">1 Year Return</div>
                      </div>
                      <div className="text-green-600 font-medium">+{client?.yearlyPerformance || 14.5}%</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Nifty 50</div>
                        <div className="text-xs text-slate-500">Benchmark</div>
                      </div>
                      <div className="text-green-600 font-medium">+12.8%</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Category Average</div>
                        <div className="text-xs text-slate-500">Moderate Allocation</div>
                      </div>
                      <div className="text-green-600 font-medium">+11.2%</div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Alpha</div>
                        <div className="text-xs text-slate-500">Excess Return vs Benchmark</div>
                      </div>
                      <div className="text-green-600 font-medium">+1.7%</div>
                    </div>
                  </div>
                  
                  {/* Mobile view - card grid */}
                  <div className="md:hidden space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="text-sm text-slate-500">Your Portfolio</div>
                        <div className="text-lg font-medium text-green-600">+{client?.yearlyPerformance || 14.5}%</div>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="text-sm text-slate-500">Nifty 50</div>
                        <div className="text-lg font-medium text-green-600">+12.8%</div>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="text-sm text-slate-500">Category Avg</div>
                        <div className="text-lg font-medium text-green-600">+11.2%</div>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="text-sm text-slate-500">Alpha</div>
                        <div className="text-lg font-medium text-green-600">+1.7%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Risk Analysis Tab */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricCard 
              title="Risk Score"
              value={`${client?.riskScore || 6}/10`}
              icon={<AlertTriangle className="h-5 w-5" />}
              description="Moderate Risk"
              color="amber"
              isLoading={isLoading}
            />
            
            <MetricCard 
              title="Volatility"
              value={`${client?.volatility || 12.4}%`}
              icon={<LineChart className="h-5 w-5" />}
              description="Annualized Standard Deviation"
              color="purple"
              isLoading={isLoading}
            />
            
            <MetricCard 
              title="Sharpe Ratio"
              value={client?.sharpeRatio || 1.2}
              icon={<BarChart3 className="h-5 w-5" />}
              description="Risk-adjusted Returns"
              color="indigo"
              isLoading={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Breakdown</CardTitle>
                <CardDescription>Analysis of portfolio risk factors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Risk Contribution by Asset Class</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Equity</span>
                        <span className="font-medium">82%</span>
                      </div>
                      <Progress value={82} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Fixed Income</span>
                        <span className="font-medium">10%</span>
                      </div>
                      <Progress value={10} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Gold</span>
                        <span className="font-medium">6%</span>
                      </div>
                      <Progress value={6} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Cash</span>
                        <span className="font-medium">2%</span>
                      </div>
                      <Progress value={2} className="h-2" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Risk Concentration</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Top 5 Holdings</div>
                          <div className="text-xs text-slate-500">Portfolio Concentration</div>
                        </div>
                        <div className="font-medium">68%</div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Largest Sector</div>
                          <div className="text-xs text-slate-500">Financial Services</div>
                        </div>
                        <div className="font-medium">28%</div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Diversification Score</div>
                          <div className="text-xs text-slate-500">Overall Assessment</div>
                        </div>
                        <div className="font-medium">7/10</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Drawdown Analysis</CardTitle>
                <CardDescription>Historical downside risk assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Maximum Drawdown</h4>
                    <div className="text-2xl font-bold text-red-600">-18.5%</div>
                    <div className="text-xs text-slate-500">March 2020 (COVID-19 Crash)</div>
                  </div>
                  
                  <div className="h-40 flex items-center justify-center bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <LineChart className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-xs text-slate-500">Drawdown chart</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Recovery Time</div>
                        <div className="text-xs text-slate-500">Last Major Drawdown</div>
                      </div>
                      <div className="font-medium">7 Months</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Expected Drawdown</div>
                        <div className="text-xs text-slate-500">95% Confidence</div>
                      </div>
                      <div className="font-medium text-amber-600">-12.8%</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Value at Risk (Monthly)</div>
                        <div className="text-xs text-slate-500">95% Confidence</div>
                      </div>
                      <div className="font-medium text-amber-600">-5.2%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Financial Planning Tab */}
        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>Progress toward your investment objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-medium">Retirement Planning</h4>
                    <span className="text-sm text-green-600 font-medium">75% Funded</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Current: ₹37.5 L</span>
                    <span>Target: ₹50 L</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-medium">Children's Education</h4>
                    <span className="text-sm text-green-600 font-medium">60% Funded</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Current: ₹12 L</span>
                    <span>Target: ₹20 L</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-medium">Property Purchase</h4>
                    <span className="text-sm text-amber-600 font-medium">35% Funded</span>
                  </div>
                  <Progress value={35} className="h-2" indicatorClassName="bg-amber-500" />
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Current: ₹17.5 L</span>
                    <span>Target: ₹50 L</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Retirement Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60 flex items-center justify-center bg-slate-50 rounded-lg mb-4">
                  <div className="text-center">
                    <LineChart className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-500">Retirement projection chart</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-500">Retirement Age</div>
                    <div className="text-xl font-bold">60 years</div>
                  </div>
                  
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-500">Monthly Income</div>
                    <div className="text-xl font-bold">₹85,000</div>
                  </div>
                  
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-500">Projected Corpus</div>
                    <div className="text-xl font-bold">₹2.1 Cr</div>
                  </div>
                  
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-500">Funding Status</div>
                    <div className="text-xl font-bold text-green-600">75%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                      Increase Monthly SIP
                    </h4>
                    <p className="text-xs text-green-700 mt-1">
                      To reach your retirement goal, consider increasing your monthly SIP by ₹5,000.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-blue-600" />
                      Review Insurance Coverage
                    </h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Your life insurance coverage appears insufficient. We recommend increasing it to ₹1 Cr.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="text-sm font-medium text-amber-800 flex items-center">
                      <Landmark className="h-4 w-4 mr-2 text-amber-600" />
                      Tax Planning
                    </h4>
                    <p className="text-xs text-amber-700 mt-1">
                      You have ₹50,000 remaining in your Section 80C limit. Consider additional ELSS investments.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}