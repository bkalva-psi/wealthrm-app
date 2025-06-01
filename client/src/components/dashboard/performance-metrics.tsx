import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  formatCurrency, 
  getPercentageChangeColor 
} from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface PerformanceMetric {
  id: number;
  metricType: string;
  currentValue: number;
  targetValue: number;
  percentageChange: number;
  month: number;
  year: number;
}

interface AumTrend {
  id: number;
  month: number;
  year: number;
  currentValue: number;
  previousValue: number;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function PerformanceMetrics() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/performance-metrics'],
  });
  
  const { data: aumTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/aum-trends'],
  });
  
  const getMetricByType = (type: string) => {
    if (!metrics) return null;
    return metrics.find((metric: PerformanceMetric) => metric.metricType === type);
  };
  
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100));
  };
  
  const prepareChartData = () => {
    if (!aumTrends) return [];
    
    return aumTrends.map((trend: AumTrend) => ({
      name: months[trend.month - 1],
      current: trend.currentValue,
      previous: trend.previousValue,
    }));
  };
  
  const newAumMetric = getMetricByType('new_aum');
  const newClientsMetric = getMetricByType('new_clients');
  const revenueMetric = getMetricByType('revenue');
  const retentionMetric = getMetricByType('retention');
  
  const isLoading = metricsLoading || trendsLoading;
  const chartData = prepareChartData();
  
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-card">
        <h2 className="text-sm font-medium text-foreground">Your Performance</h2>
      </div>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {isLoading ? (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-slate-50 p-3 rounded-lg">
                <Skeleton className="h-4 w-16 mb-2" />
                <div className="flex items-baseline space-x-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-1.5 w-full mt-1 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))
          ) : (
            <>
              {newAumMetric && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">New AUM</p>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-lg font-semibold text-slate-800">
                      {formatCurrency(newAumMetric.currentValue)}
                    </p>
                    <p className={`ml-2 text-xs ${getPercentageChangeColor(newAumMetric.percentageChange)}`}>
                      {newAumMetric.percentageChange >= 0 ? '+' : ''}{newAumMetric.percentageChange}%
                    </p>
                  </div>
                  <div className="mt-1 w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className={`${newAumMetric.percentageChange >= 0 ? 'bg-success' : 'bg-amber-500'} h-1.5 rounded-full`} 
                      style={{ width: `${getProgressPercentage(newAumMetric.currentValue, newAumMetric.targetValue)}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Target: {formatCurrency(newAumMetric.targetValue)}
                  </p>
                </div>
              )}
              
              {newClientsMetric && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">New Clients</p>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-lg font-semibold text-slate-800">
                      {Math.round(newClientsMetric.currentValue)}
                    </p>
                    <p className={`ml-2 text-xs ${getPercentageChangeColor(newClientsMetric.percentageChange)}`}>
                      {newClientsMetric.percentageChange >= 0 ? '+' : ''}{newClientsMetric.percentageChange}%
                    </p>
                  </div>
                  <div className="mt-1 w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className={`${newClientsMetric.percentageChange >= 0 ? 'bg-success' : 'bg-amber-500'} h-1.5 rounded-full`} 
                      style={{ width: `${getProgressPercentage(newClientsMetric.currentValue, newClientsMetric.targetValue)}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Target: {Math.round(newClientsMetric.targetValue)}
                  </p>
                </div>
              )}
              
              {revenueMetric && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">Revenue Generated</p>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-lg font-semibold text-slate-800">
                      {formatCurrency(revenueMetric.currentValue)}
                    </p>
                    <p className={`ml-2 text-xs ${getPercentageChangeColor(revenueMetric.percentageChange)}`}>
                      {revenueMetric.percentageChange >= 0 ? '+' : ''}{revenueMetric.percentageChange}%
                    </p>
                  </div>
                  <div className="mt-1 w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className={`${revenueMetric.percentageChange >= 0 ? 'bg-success' : 'bg-amber-500'} h-1.5 rounded-full`} 
                      style={{ width: `${getProgressPercentage(revenueMetric.currentValue, revenueMetric.targetValue)}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Target: {formatCurrency(revenueMetric.targetValue)}
                  </p>
                </div>
              )}
              
              {retentionMetric && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">Client Retention</p>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-lg font-semibold text-slate-800">
                      {retentionMetric.currentValue}%
                    </p>
                    <p className={`ml-2 text-xs ${getPercentageChangeColor(retentionMetric.percentageChange)}`}>
                      {retentionMetric.percentageChange >= 0 ? '+' : ''}{retentionMetric.percentageChange}%
                    </p>
                  </div>
                  <div className="mt-1 w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className="bg-success h-1.5 rounded-full" 
                      style={{ width: `${retentionMetric.currentValue}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Target: {retentionMetric.targetValue}%
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Monthly Trend Chart */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-slate-500">Monthly AUM Trend</h3>
            <div className="text-xs text-slate-500">
              <span className="inline-block w-3 h-3 bg-primary-500 rounded-full mr-1"></span> Current Year
              <span className="inline-block w-3 h-3 bg-slate-300 rounded-full ml-2 mr-1"></span> Previous Year
            </div>
          </div>
          
          <div className="mt-2 h-32">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    fontSize={10}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(0), 'Value']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Bar 
                    dataKey="previous" 
                    fill="rgba(59, 130, 246, 0.2)" 
                    radius={[2, 2, 0, 0]} 
                    maxBarSize={14}
                  />
                  <Bar 
                    dataKey="current" 
                    fill="#3b82f6" 
                    radius={[2, 2, 0, 0]} 
                    maxBarSize={10}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-slate-500">No trend data available</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
