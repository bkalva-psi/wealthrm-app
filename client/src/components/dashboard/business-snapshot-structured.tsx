import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
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

  // Metrics configuration - ALL VALUES FROM AUTHENTIC DATABASE
  const metricsConfig = {
    aum: {
      title: 'Total AUM',
      value: businessMetrics?.totalAum || 0,
      formatter: formatCurrency,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      dimensions: [] // Will be populated by authentic API calls
    },
    clients: {
      title: 'Active Clients',
      value: businessMetrics?.totalClients || 0,
      formatter: formatNumber,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      dimensions: [] // Will be populated by authentic API calls
    },
    revenue: {
      title: 'Revenue MTD',
      value: businessMetrics?.revenueMonthToDate || 0,
      formatter: formatCurrency,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      dimensions: [] // Will be populated by authentic API calls
    },
    pipeline: {
      title: 'Pipeline Value',
      value: businessMetrics?.pipelineValue || 0,
      formatter: formatCurrency,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      dimensions: [] // Will be populated by authentic API calls
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
    <Card>
      <CardHeader>
        <CardTitle>Business Snapshot - Authentic Data Only</CardTitle>
        <p className="text-sm text-muted-foreground">
          All data fetched from database tables. Pipeline: {formatCurrency(businessMetrics?.pipelineValue || 0)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(metricsConfig).map(([key, config]) => {
          const isExpanded = expandedMetrics.has(key);
          const IconComponent = config.icon;
          
          return (
            <Collapsible key={key} open={isExpanded} onOpenChange={() => toggleMetric(key)}>
              <div className={`rounded-lg border p-4 ${config.bgColor}`}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto hover:bg-transparent"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white/50 ${config.color}`}>
                        <IconComponent size={20} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-sm">{config.title}</h3>
                        <p className={`text-lg font-bold ${config.color}`}>
                          {config.formatter(config.value)}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Drill-down data will be populated from authentic database sources
                  </div>
                  <div className="text-xs text-orange-600">
                    Note: Previously showing hardcoded mock data - now requires real API integration
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}