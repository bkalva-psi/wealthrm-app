import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ChevronRight, TrendingUp, Users, DollarSign, Target, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Types for authentic database data
interface BusinessMetrics {
  totalAum: number;
  totalClients: number;
  revenueMonthToDate: number;
  pipelineValue: number;
}

interface DrillDownData {
  category: string;
  value: number;
  count?: number;
  percentage: number;
  hasSecondLevel?: boolean;
  categoryKey?: string;
}

interface Dimension {
  id: string;
  name: string;
  chartType: 'donut' | 'bar';
  data: DrillDownData[];
}

export function BusinessSnapshotStructured() {
  const [isMainCardExpanded, setIsMainCardExpanded] = useState(true);
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set());

  // Fetch authentic business metrics from database
  const { data: businessMetrics, isLoading } = useQuery({
    queryKey: ['/api/business-metrics/1'],
    staleTime: 0,
    refetchOnMount: true
  });

  // Debug log to verify authentic data
  console.log('Authentic business metrics data:', businessMetrics);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    } else {
      return `₹${value.toLocaleString()}`;
    }
  };

  const formatNumber = (value: number) => value.toLocaleString();

  // Metrics configuration using theme colors
  const metricsConfig = {
    aum: {
      title: 'Total AUM',
      value: businessMetrics?.totalAum || 0,
      formatter: formatCurrency,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-muted border-border',
      dimensions: []
    },
    clients: {
      title: 'Active Clients',
      value: businessMetrics?.totalClients || 0,
      formatter: formatNumber,
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-muted border-border',
      dimensions: []
    },
    revenue: {
      title: 'Revenue MTD',
      value: businessMetrics?.revenueMonthToDate || 0,
      formatter: formatCurrency,
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-muted border-border',
      dimensions: []
    },
    pipeline: {
      title: 'Pipeline Value',
      value: businessMetrics?.pipelineValue || 0,
      formatter: formatCurrency,
      icon: Target,
      color: 'text-secondary',
      bgColor: 'bg-muted border-border',
      dimensions: []
    }
  };

  const toggleMetric = (metricKey: string) => {
    const newExpanded = new Set(expandedMetrics);
    if (newExpanded.has(metricKey)) {
      newExpanded.delete(metricKey);
      // Also collapse all dimensions for this metric
      const newExpandedDimensions = new Set(expandedDimensions);
      Object.keys(metricsConfig).forEach(key => {
        if (key === metricKey) {
          newExpandedDimensions.delete(`${metricKey}-dimension-0`);
        }
      });
      setExpandedDimensions(newExpandedDimensions);
    } else {
      newExpanded.add(metricKey);
    }
    setExpandedMetrics(newExpanded);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  const renderChart = (dimension: Dimension) => {
    if (dimension.chartType === 'donut') {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={dimension.data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {dimension.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dimension.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading authentic business data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isMainCardExpanded} onOpenChange={setIsMainCardExpanded}>
      <Card className="bg-card text-card-foreground border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 transform hover:scale-[1.01]">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 transition-all duration-300 hover:bg-primary/20 hover:scale-110">
                  <BarChart3 size={20} className="text-primary transition-all duration-300" />
                </div>
                <CardTitle className="text-lg transition-colors duration-300">Key Performance Indicators</CardTitle>
              </div>
              {isMainCardExpanded ? (
                <ChevronDown size={20} className="transition-all duration-300 text-primary" />
              ) : (
                <ChevronRight size={20} className="transition-all duration-300 text-muted-foreground hover:text-primary" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="transition-all duration-500 ease-in-out data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <CardContent className="space-y-3 pt-0">
            {Object.entries(metricsConfig).map(([key, config]) => {
              const isExpanded = expandedMetrics.has(key);
              const IconComponent = config.icon;
              
              return (
                <Collapsible key={key} open={isExpanded} onOpenChange={() => toggleMetric(key)}>
                  <div className={`rounded-lg border p-3 ${config.bgColor} transition-all duration-300 hover:shadow-md hover:scale-[1.02] transform`}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-0 h-auto hover:bg-transparent transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg bg-background/60 ${config.color} transition-all duration-300 group-hover:scale-110 group-hover:bg-background/80`}>
                            <IconComponent size={18} className="transition-transform duration-300" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-sm transition-colors duration-300">{config.title}</h3>
                            <p className="text-lg font-bold text-foreground transition-all duration-300 group-hover:scale-105">
                              {config.formatter(config.value)}
                            </p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown size={14} className="transition-all duration-300 text-primary rotate-0" />
                        ) : (
                          <ChevronRight size={14} className="transition-all duration-300 text-muted-foreground group-hover:text-primary rotate-0" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-3 transition-all duration-500 ease-in-out data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
                      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border-l-4 border-primary/50 animate-in slide-in-from-top-2 duration-300">
                        {key === 'aum' && 'View breakdown by asset class, product type, and client tier to analyze portfolio composition and identify growth opportunities.'}
                        {key === 'clients' && 'Analyze client distribution by tier (Platinum, Gold, Silver) and risk profile to optimize relationship management strategies.'}
                        {key === 'revenue' && 'Track revenue streams by product categories and commission structures to identify top-performing investment areas.'}
                        {key === 'pipeline' && 'Monitor prospect pipeline stages and expected closure dates to forecast upcoming business opportunities.'}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}