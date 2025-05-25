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
import BenchmarkComparisonChart from "../components/charts/BenchmarkComparisonChart";
import FixedTooltipChart from "../components/charts/FixedTooltipChart";

// Mock data for portfolio holdings
const mockHoldings = [
  { 
    name: "HDFC Top 100 Fund", 
    type: "Mutual Fund - Equity", 
    value: 1250000, 
    allocation: 25, 
    gain: 15.4, 
    oneYearReturn: 17.8, 
    benchmark: "NIFTY 50", 
    benchmarkReturn: 16.3, 
    alphaReturn: 1.5 
  },
  { 
    name: "SBI Small Cap Fund", 
    type: "Mutual Fund - Equity", 
    value: 875000, 
    allocation: 17.5, 
    gain: 22.8, 
    oneYearReturn: 24.2, 
    benchmark: "NIFTY SMALLCAP 250", 
    benchmarkReturn: 20.5, 
    alphaReturn: 3.7 
  },
  { 
    name: "ICICI Prudential Corporate Bond Fund", 
    type: "Mutual Fund - Debt", 
    value: 1000000, 
    allocation: 20, 
    gain: 7.2, 
    oneYearReturn: 8.4, 
    benchmark: "CRISIL Corporate Bond Index", 
    benchmarkReturn: 7.8, 
    alphaReturn: 0.6 
  },
  { 
    name: "Reliance Industries Ltd.", 
    type: "Direct Equity", 
    value: 625000, 
    allocation: 12.5, 
    gain: 18.7, 
    oneYearReturn: 22.4, 
    benchmark: "NIFTY 50", 
    benchmarkReturn: 16.3, 
    alphaReturn: 6.1 
  },
  { 
    name: "HDFC Bank Ltd.", 
    type: "Direct Equity", 
    value: 500000, 
    allocation: 10, 
    gain: 9.8, 
    oneYearReturn: 12.3, 
    benchmark: "NIFTY BANK", 
    benchmarkReturn: 14.7, 
    alphaReturn: -2.4 
  },
  { 
    name: "Gold ETF", 
    type: "Gold ETF", 
    value: 375000, 
    allocation: 7.5, 
    gain: 11.2, 
    oneYearReturn: 14.6, 
    benchmark: "MCX Gold", 
    benchmarkReturn: 14.2, 
    alphaReturn: 0.4 
  },
  { 
    name: "HDFC Savings Account", 
    type: "Cash", 
    value: 375000, 
    allocation: 7.5, 
    gain: 3.5, 
    oneYearReturn: 3.5, 
    benchmark: "Savings Rate", 
    benchmarkReturn: 3.5, 
    alphaReturn: 0.0 
  },
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
            <Progress value={value} className="h-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Local performance chart component (simplified for now)
function LocalPerformanceChart({ periods }: { periods: { label: string, value: number }[] }) {
  // Find highest and lowest performance values
  const maxValue = Math.max(...periods.map(period => period.value));
  const minValue = Math.min(...periods.map(period => period.value));
  
  // Group periods into rows as requested
  const shortTermPeriods = periods.filter(p => ['1M', '3M', '6M'].includes(p.label));
  const mediumTermPeriods = periods.filter(p => ['1Y', '3Y', '5Y'].includes(p.label));
  const longTermPeriods = periods.filter(p => ['YTD', 'Since Inception'].includes(p.label));
  
  // Render a single performance item
  const renderPeriodItem = (period: {label: string, value: number}) => (
    <div key={period.label} className="flex flex-col items-center">
      <span className={`text-sm ${
        period.value >= 0 ? 'text-green-600' : 'text-red-600'
      } ${
        period.value === maxValue || period.value === minValue ? 'font-bold' : 'font-medium'
      }`}>
        {period.value > 0 ? '+' : ''}{period.value.toFixed(1)}%
      </span>
      <span className="text-xs text-slate-500">{period.label}</span>
    </div>
  );
  
  // Render a group of performance items
  const renderPeriodGroup = (periodGroup: {label: string, value: number}[]) => (
    <div className="flex justify-between gap-4">
      {periodGroup.map(renderPeriodItem)}
    </div>
  );
  
  return (
    <div className="mt-4">
      {/* Desktop view with organized rows */}
      <div className="hidden md:block space-y-4">
        {renderPeriodGroup(shortTermPeriods)}
        {renderPeriodGroup(mediumTermPeriods)}
        {renderPeriodGroup(longTermPeriods)}
      </div>
      
      {/* Mobile view - compact grid layout */}
      <div className="md:hidden space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {shortTermPeriods.map(period => (
            <div key={period.label} className="flex flex-col items-center p-2 bg-slate-50 rounded-md">
              <span className={`text-sm ${
                period.value >= 0 ? 'text-green-600' : 'text-red-600'
              } ${
                period.value === maxValue || period.value === minValue ? 'font-bold' : 'font-medium'
              }`}>
                {period.value > 0 ? '+' : ''}{period.value.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500">{period.label}</span>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {mediumTermPeriods.map(period => (
            <div key={period.label} className="flex flex-col items-center p-2 bg-slate-50 rounded-md">
              <span className={`text-sm ${
                period.value >= 0 ? 'text-green-600' : 'text-red-600'
              } ${
                period.value === maxValue || period.value === minValue ? 'font-bold' : 'font-medium'
              }`}>
                {period.value > 0 ? '+' : ''}{period.value.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500">{period.label}</span>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {longTermPeriods.map(period => (
            <div key={period.label} className="flex flex-col items-center p-2 bg-slate-50 rounded-md">
              <span className={`text-sm ${
                period.value >= 0 ? 'text-green-600' : 'text-red-600'
              } ${
                period.value === maxValue || period.value === minValue ? 'font-bold' : 'font-medium'
              }`}>
                {period.value > 0 ? '+' : ''}{period.value.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500">{period.label}</span>
            </div>
          ))}
        </div>
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
              <th className="px-4 py-3 text-right font-medium text-slate-500">Current Gain</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">1Y Return</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Benchmark</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Benchmark Return</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Alpha</th>
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
                <td className={`px-4 py-3 text-right ${holding.oneYearReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {holding.oneYearReturn > 0 ? '+' : ''}{holding.oneYearReturn}%
                </td>
                <td className="px-4 py-3 text-slate-600">{holding.benchmark}</td>
                <td className={`px-4 py-3 text-right ${holding.benchmarkReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {holding.benchmarkReturn > 0 ? '+' : ''}{holding.benchmarkReturn}%
                </td>
                <td className={`px-4 py-3 text-right font-medium ${holding.alphaReturn > 0 ? 'text-green-600' : holding.alphaReturn < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                  {holding.alphaReturn > 0 ? '+' : ''}{holding.alphaReturn}%
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
            
            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-2">
              <div>
                <div className="text-xs text-slate-500">Value</div>
                <div className="font-medium">₹{(holding.value / 100000).toFixed(2)} L</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Allocation</div>
                <div className="font-medium text-right">{holding.allocation}%</div>
              </div>
              
              <div>
                <div className="text-xs text-slate-500">1Y Return</div>
                <div className={`font-medium ${holding.oneYearReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {holding.oneYearReturn > 0 ? '+' : ''}{holding.oneYearReturn}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Alpha</div>
                <div className={`font-medium text-right ${holding.alphaReturn > 0 ? 'text-green-600' : holding.alphaReturn < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                  {holding.alphaReturn > 0 ? '+' : ''}{holding.alphaReturn}%
                </div>
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500">Benchmark</div>
              <div className="flex justify-between items-center">
                <div className="font-medium text-sm">{holding.benchmark}</div>
                <div className={`text-xs ${holding.benchmarkReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {holding.benchmarkReturn > 0 ? '+' : ''}{holding.benchmarkReturn}%
                </div>
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
    if (score <= 2) return "Very Conservative";
    if (score <= 4) return "Conservative";
    if (score <= 6) return "Moderate";
    if (score <= 8) return "Aggressive";
    return "Very Aggressive";
  };
  
  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Risk Profile</h4>
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
        <div 
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ 
            width: `${(score / 10) * 100}%`,
            background: `linear-gradient(to right, #10b981, ${score <= 5 ? '#f59e0b' : '#ef4444'})` 
          }}
        ></div>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-500">Conservative</span>
        <span className="text-xs font-medium">{getScoreLabel(score)}</span>
        <span className="text-xs text-slate-500">Aggressive</span>
      </div>
    </div>
  );
}

// Transactions component
function TransactionsTable({ transactions }: { transactions: any[] }) {
  return (
    <div>
      {/* Table for desktop/tablet */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Security</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Transaction Type</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Units</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Price</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Total Value</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{transaction.date}</td>
                <td className="px-4 py-3">{transaction.security}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.type === 'BUY' 
                      ? 'bg-green-100 text-green-800' 
                      : transaction.type === 'SELL'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{transaction.units.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">₹{transaction.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">₹{(transaction.units * transaction.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Card view for mobile */}
      <div className="md:hidden space-y-4">
        {transactions.map((transaction, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-sm">{transaction.security}</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                transaction.type === 'BUY' 
                  ? 'bg-green-100 text-green-800' 
                  : transaction.type === 'SELL'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
              }`}>
                {transaction.type}
              </span>
            </div>
            <div className="text-xs text-slate-500 mb-3">{transaction.date}</div>
            
            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-2">
              <div>
                <div className="text-xs text-slate-500">Units</div>
                <div className="font-medium">{transaction.units.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Price</div>
                <div className="font-medium text-right">₹{transaction.price.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500">Total Value</div>
              <div className="font-medium">₹{(transaction.units * transaction.price).toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main portfolio component
export default function ClientPortfolioPage() {
  const { id } = Object.fromEntries(new URLSearchParams(window.location.hash.split('?')[1])) as { id?: string };
  const [activeTab, setActiveTab] = useState("overview");
  const { data: client, isLoading, error } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const data = await clientApi.getClient(Number(id));
      console.log("Client data in portfolio page:", data);
      return data;
    },
    enabled: !!id && !isNaN(Number(id))
  });
  
  useEffect(() => {
    // Set document title
    document.title = client ? `${client.fullName} - Portfolio | Ujjival Wealth` : "Client Portfolio | Ujjival Wealth";
  }, [client]);
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Client</h2>
          <p className="text-slate-600">Failed to load client data. Please try again later.</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </div>
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
  
  // Set default AUM value for demo purposes
  const defaultAumValue = 2500000;
  
  // Generate realistic AUM trend data based on current value and relationship start date
  const generateAumTrendData = (currentValue: number, clientSince?: Date | null): {date: string, value: number}[] => {
    const data: {date: string, value: number}[] = [];
    const today = new Date();
    
    // Default to 3 years ago if no relationship start date provided
    let startDate = new Date(today.getFullYear() - 3, today.getMonth(), 1);
    
    if (clientSince && clientSince instanceof Date && !isNaN(clientSince.getTime())) {
      startDate = new Date(clientSince);
    }
    
    // Ensure we use the earlier of the two dates
    startDate = startDate > new Date(today.getFullYear() - 3, today.getMonth(), 1) 
      ? new Date(today.getFullYear() - 3, today.getMonth(), 1)
      : startDate;
    
    // Initial value (assume it was about 70% of current value at the start)
    let value = currentValue * 0.7;
    
    // Generate monthly data points
    for (let date = new Date(startDate); date <= today; date.setMonth(date.getMonth() + 1)) {
      // Add random growth with slight upward bias (between -3% to +5% monthly change)
      const monthlyChange = (Math.random() * 8 - 3) / 100;
      value = value * (1 + monthlyChange);
      
      data.push({
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        value: Math.round(value)
      });
    }
    
    // Ensure the last value matches the current AUM
    if (data.length > 0) {
      data[data.length - 1].value = currentValue;
    }
    
    return data;
  };
  
  // Format client info into transaction data
  const generateTransactionData = () => {
    return [
      { 
        date: "2023-05-15", 
        security: "HDFC Top 100 Fund", 
        type: "BUY", 
        units: 450.75, 
        price: 550.25 
      },
      { 
        date: "2023-04-28", 
        security: "SBI Small Cap Fund", 
        type: "BUY", 
        units: 325.50, 
        price: 480.75 
      },
      { 
        date: "2023-03-17", 
        security: "HDFC Bank Ltd.", 
        type: "SELL", 
        units: 45.00, 
        price: 1625.50 
      },
      { 
        date: "2023-02-22", 
        security: "ICICI Prudential Corporate Bond Fund", 
        type: "BUY", 
        units: 1250.80, 
        price: 24.75 
      },
      { 
        date: "2023-01-05", 
        security: "Gold ETF", 
        type: "BUY", 
        units: 75.25, 
        price: 430.50 
      },
      { 
        date: "2022-12-14", 
        security: "Reliance Industries Ltd.", 
        type: "BUY", 
        units: 28.50, 
        price: 2450.75 
      },
      { 
        date: "2022-11-30", 
        security: "SBI Small Cap Fund", 
        type: "SIP", 
        units: 25.40, 
        price: 472.25 
      },
      { 
        date: "2022-11-30", 
        security: "HDFC Top 100 Fund", 
        type: "SIP", 
        units: 18.75, 
        price: 532.50 
      },
    ];
  };
  
  // Extract client data safely with proper fallbacks
  const aumValue = client?.aumValue || getAumValue(client?.aum) || 2500000;
  const yearlyPerformance = client?.oneYearReturn || 12.5; // Get from oneYearReturn property
  const clientSinceDate = client?.clientSince ? new Date(client.clientSince) : null;
  const transactions = generateTransactionData();
  
  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Back button and client info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2 p-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-40" /> : client?.fullName || "Client Portfolio"}
            </h1>
            <div className="flex items-center text-sm text-slate-500">
              <CalendarDays className="h-4 w-4 mr-1" />
              <span>Client since: {isLoading ? <Skeleton className="h-4 w-24 inline-block" /> : 
                client?.clientSince ? new Date(client.clientSince).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'short'
                }) : "N/A"
              }</span>
              <span className="mx-2">•</span>
              <Clock className="h-4 w-4 mr-1" />
              <span>Last update: {isLoading ? <Skeleton className="h-4 w-24 inline-block" /> : "May 20, 2023"}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <FileText className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="gap-1">
            <Shield className="h-4 w-4" />
            Review
          </Button>
        </div>
      </div>
      
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="Assets Under Management"
          value={client?.aum || "₹25.00 L"}
          icon={<Wallet className="h-5 w-5" />}
          description="Total portfolio value"
          color="blue"
          isLoading={isLoading}
        />
        
        <MetricCard 
          title="Invested Amount"
          value={`₹${(((client?.aumValue || defaultAumValue) * 0.85) / 100000).toFixed(2)} L`}
          icon={<DollarSign className="h-5 w-5" />}
          description="Principal investment"
          color="indigo"
          isLoading={isLoading}
        />
        
        <MetricCard 
          title="Unrealized Gains"
          value={`₹${(((client?.aumValue || defaultAumValue) * 0.15) / 100000).toFixed(2)} L`}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Growth in portfolio value"
          color="green"
          trend={15.8}
          isLoading={isLoading}
        />
        
        <MetricCard 
          title="XIRR"
          value={`${yearlyPerformance}%`}
          icon={<Percent className="h-5 w-5" />}
          description="Annualized returns"
          color="amber"
          isLoading={isLoading}
        />
      </div>
      
      {/* Tabs for different portfolio views */}
      <Tabs defaultValue="overview" className="space-y-4 flex-grow">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full sticky top-0 z-10 bg-white">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>
        
        {/* Portfolio Overview Tab */}
        <TabsContent value="overview" className="space-y-4 pt-6">
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
                        data={mockAssetAllocation} 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium mb-2">AUM Trend (3 Years)</h3>
                    <div className="flex-1 border rounded-md p-4 h-52">
                      <SimpleAumTrendChart aumValue={client?.aumValue || 5000000} />
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
              <CardHeader>
                <CardTitle className="text-lg">Performance Snapshot</CardTitle>
                <CardDescription>Returns across time periods</CardDescription>
              </CardHeader>
              <CardContent>
                <LocalPerformanceChart periods={performancePeriods} />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Exposures</CardTitle>
                <CardDescription>Top holdings in your portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <AllocationChart 
                  data={{
                    "Reliance Industries": 8.4,
                    "HDFC Bank": 6.8,
                    "TCS": 5.3,
                    "Infosys": 4.9,
                    "ICICI Bank": 4.2,
                    "Others": 70.4
                  }} 
                  title="Companies" 
                  color="blue" 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Portfolio Efficiency</CardTitle>
                <CardDescription>Risk vs. Return with Efficient Frontier</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <div className="h-full">
                  <FixedTooltipChart holdings={mockHoldings} />
                </div>
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
            <Card className="overflow-hidden border-0 shadow-md">
              <CardHeader className="pb-3 bg-gradient-to-r from-amber-500/90 to-amber-600/90">
                <CardTitle className="flex items-center text-lg text-white font-semibold">
                  <AlertCircle className="h-5 w-5 mr-2 text-white" />
                  Portfolio Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 space-y-3">
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-md">
                    <h4 className="font-medium text-sm text-amber-800">Market Volatility Alert</h4>
                    <p className="text-xs text-amber-700 mt-1">
                      Recent market volatility has increased. Consider reviewing your small-cap allocation which has seen a 12.4% swing in the last month.
                    </p>
                  </div>
                  
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-md">
                    <h4 className="font-medium text-sm text-red-800">Sector Concentration Risk</h4>
                    <p className="text-xs text-red-700 mt-1">
                      Your portfolio has 36% allocation to financial services, which exceeds the recommended 25% sector limit.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-md">
                    <h4 className="font-medium text-sm text-blue-800">Rebalancing Due</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Portfolio has drifted from target allocation. Last rebalanced: 6 months ago.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-0 shadow-md">
              <CardHeader className="pb-3 bg-gradient-to-r from-green-500/90 to-green-600/90">
                <CardTitle className="flex items-center text-lg text-white font-semibold">
                  <Target className="h-5 w-5 mr-2 text-white" />
                  Investment Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 space-y-3">
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-md">
                    <h4 className="font-medium text-sm text-green-800">International Diversification</h4>
                    <p className="text-xs text-green-700 mt-1">
                      Add exposure to US markets through index funds to increase geographic diversification.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-300">International Equity</Badge>
                      <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-300">Diversification</Badge>
                    </div>
                    <div className="mt-3">
                      <Button size="sm" variant="outline" className="text-xs bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50">
                        View Funds
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Holdings Tab */}
        <TabsContent value="holdings" className="space-y-4 pt-4 md:pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Holdings</CardTitle>
              <CardDescription>All investments in your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <HoldingsTable holdings={mockHoldings} />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Top Performers
                </CardTitle>
                <CardDescription>Best performing holdings in your portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockHoldings
                    .sort((a, b) => b.gain - a.gain)
                    .slice(0, 5)
                    .map((holding, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-50">
                        <div className="flex items-start space-x-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium text-xs">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{holding.name}</div>
                            <div className="text-xs text-slate-500">{holding.type}</div>
                          </div>
                        </div>
                        <div className="text-green-600 font-medium">+{holding.gain}%</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ArrowDownRight className="h-5 w-5 mr-2 text-red-500" />
                  Underperformers
                </CardTitle>
                <CardDescription>Holdings that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockHoldings
                    .sort((a, b) => a.gain - b.gain)
                    .slice(0, 5)
                    .map((holding, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-50">
                        <div className="flex items-start space-x-2">
                          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-medium text-xs">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{holding.name}</div>
                            <div className="text-xs text-slate-500">{holding.type}</div>
                          </div>
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
        <TabsContent value="performance" className="space-y-4 pt-4 md:pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
              <CardDescription>AUM trend over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <AumTrendChart currentValue={client?.aumValue || defaultAumValue} />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Benchmark Comparison</CardTitle>
                <CardDescription>Portfolio vs. Benchmark</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <BenchmarkComparisonChart aumValue={client?.aumValue || defaultAumValue} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Risk-Weighted Return Analysis</CardTitle>
                <CardDescription>Key risk metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Standard Deviation</div>
                    <div className="font-medium text-lg">12.4%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Sharpe Ratio</div>
                    <div className="font-medium text-lg">1.18</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Alpha</div>
                    <div className="font-medium text-lg text-green-600">+2.4%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Max Drawdown</div>
                    <div className="font-medium text-lg text-red-600">-14.2%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Drawdown Recovery</div>
                    <div className="font-medium text-lg">124 days</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Beta</div>
                    <div className="font-medium text-lg">0.87</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Information Ratio</div>
                    <div className="font-medium text-lg">1.05</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance by Time Period</CardTitle>
              <CardDescription>Returns across different time frames</CardDescription>
            </CardHeader>
            <CardContent>
              <LocalPerformanceChart periods={performancePeriods} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4 pt-4 md:pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 8 transactions in your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsTable transactions={transactions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}