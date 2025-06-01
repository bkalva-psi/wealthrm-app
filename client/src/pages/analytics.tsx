import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, getPercentageChangeColor } from "@/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Data interfaces
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

interface SalesPipeline {
  id: number;
  stage: string;
  count: number;
  value: number;
}

// Chart colors
const COLORS = ["#3b82f6", "#14b8a6", "#f59e0b", "#ef4444", "#a855f7"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Analytics() {
  // Set page title
  useEffect(() => {
    document.title = "Analytics | Wealth RM";
  }, []);
  
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/performance-metrics'],
  });
  
  const { data: aumTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/aum-trends'],
  });
  
  const { data: pipeline, isLoading: pipelineLoading } = useQuery({
    queryKey: ['/api/sales-pipeline'],
  });
  
  // Data preparation functions
  const prepareTrendData = () => {
    if (!aumTrends) return [];
    
    return aumTrends.map((trend: AumTrend) => ({
      name: months[trend.month - 1],
      current: trend.currentValue,
      previous: trend.previousValue,
    }));
  };
  
  const preparePipelineData = () => {
    if (!pipeline) return [];
    
    return pipeline.map((item: SalesPipeline) => ({
      name: item.stage === "new_leads" ? "New Leads" :
            item.stage === "qualified" ? "Qualified" :
            item.stage === "proposal" ? "Proposal" : "Closed",
      value: item.value,
      count: item.count,
    }));
  };
  
  const prepareMetricsData = () => {
    if (!metrics) return [];
    
    const data = [
      { name: "New AUM", target: 0, current: 0, percentChange: 0 },
      { name: "New Clients", target: 0, current: 0, percentChange: 0 },
      { name: "Revenue", target: 0, current: 0, percentChange: 0 },
      { name: "Retention", target: 0, current: 0, percentChange: 0 },
    ];
    
    metrics.forEach((metric: PerformanceMetric) => {
      if (metric.metricType === "new_aum") {
        data[0].target = metric.targetValue;
        data[0].current = metric.currentValue;
        data[0].percentChange = metric.percentageChange;
      } else if (metric.metricType === "new_clients") {
        data[1].target = metric.targetValue;
        data[1].current = metric.currentValue;
        data[1].percentChange = metric.percentageChange;
      } else if (metric.metricType === "revenue") {
        data[2].target = metric.targetValue;
        data[2].current = metric.currentValue;
        data[2].percentChange = metric.percentageChange;
      } else if (metric.metricType === "retention") {
        data[3].target = metric.targetValue;
        data[3].current = metric.currentValue;
        data[3].percentChange = metric.percentageChange;
      }
    });
    
    return data;
  };
  
  const getKpiSummary = () => {
    const data = prepareMetricsData();
    return data.map(item => {
      let value = item.name === "Retention" 
        ? `${item.current}%` 
        : item.name === "New Clients" 
          ? Math.round(item.current).toString()
          : formatCurrency(item.current);
      
      return {
        name: item.name,
        value,
        target: item.name === "Retention" 
          ? `${item.target}%` 
          : item.name === "New Clients" 
            ? Math.round(item.target).toString()
            : formatCurrency(item.target),
        percentChange: item.percentChange,
      };
    });
  };
  
  const isLoading = metricsLoading || trendsLoading || pipelineLoading;
  const trendData = prepareTrendData();
  const pipelineData = preparePipelineData();
  const kpiSummary = getKpiSummary();
  
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="mb-6 animate-in slide-in-from-top-4 duration-500">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Performance Analytics</h1>
        <p className="text-muted-foreground text-sm font-medium mt-1">
          Comprehensive insights and performance metrics
        </p>
      </div>
      
      {/* Enhanced KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-200">
        {isLoading ? (
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
              <CardContent className="p-6">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-9 w-20 mb-2" />
                <div className="flex items-center">
                  <Skeleton className="h-4 w-16 mr-2" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          kpiSummary.map((kpi, index) => (
            <Card key={index} className="transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-l-4 border-l-primary/20 hover:border-l-primary/60">
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">{kpi.name}</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{kpi.value}</h3>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground mr-2">Target: {kpi.target}</span>
                  <span className={`text-xs ${getPercentageChangeColor(kpi.percentChange)}`}>
                    {kpi.percentChange >= 0 ? '+' : ''}{kpi.percentChange}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Sales Pipeline</TabsTrigger>
          <TabsTrigger value="clients">Client Analytics</TabsTrigger>
        </TabsList>
        
        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly AUM Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [value.toFixed(0), 'Value']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="current" 
                        stroke="#3b82f6" 
                        name="Current Year" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="previous" 
                        stroke="#94a3b8" 
                        name="Previous Year" 
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance vs Target</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareMetricsData()} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => {
                          if (name === 'Retention (%)') return [`${value}%`, name];
                          return [formatCurrency(value), name];
                        }}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="current" 
                        name="Current" 
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="target" 
                        name="Target" 
                        fill="#94a3b8" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Pipeline Tab */}
        <TabsContent value="pipeline">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Value Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pipelineData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pipelineData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Value']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Stage Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={pipelineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                      <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
                      <Tooltip 
                        formatter={(value: number, name: string) => {
                          if (name === 'Count') return [value, name];
                          return [formatCurrency(value), name];
                        }}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Bar 
                        yAxisId="left" 
                        dataKey="value" 
                        name="Value" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="count" 
                        name="Count" 
                        fill="#f59e0b" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Clients Tab */}
        <TabsContent value="clients">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Segmentation</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Client analytics data will be available in the next update.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Client Acquisition Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Client acquisition data will be available in the next update.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
