import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, TrendingUp, Users, DollarSign, Target, ExpandIcon, ShrinkIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

const formatCurrency = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)} K`;
  return `₹${value}`;
};

const formatNumber = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

export function BusinessSnapshotCardSimultaneous() {
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set());

  // Main business metrics query
  const { data: businessMetrics, isLoading } = useQuery<BusinessMetrics>({
    queryKey: ['/api/business-metrics/1'],
    enabled: true,
  });

  // AUM dimensions data
  const aumDimensions = [
    {
      id: 'asset-class',
      name: 'Asset Class',
      chartType: 'donut' as const,
      data: [
        { category: 'Structured Products', value: 2127654, percentage: 28 },
        { category: 'Bonds', value: 1840214, percentage: 24 },
        { category: 'Fixed Deposits', value: 1716186, percentage: 22 },
        { category: 'Alternative Investments', value: 901195, percentage: 12 },
        { category: 'Mutual Funds', value: 465860, percentage: 6 },
        { category: 'Insurance', value: 349145, percentage: 5 },
        { category: 'Equity', value: 233609, percentage: 3 }
      ]
    },
    {
      id: 'product-type',
      name: 'Product Type',
      chartType: 'donut' as const,
      data: [
        { category: 'Structured Products', value: 2127654, percentage: 28 },
        { category: 'Bonds', value: 1840214, percentage: 24 },
        { category: 'Fixed Deposits', value: 1716186, percentage: 22 },
        { category: 'Alternative Investments', value: 901195, percentage: 12 },
        { category: 'Mutual Funds', value: 465860, percentage: 6 },
        { category: 'Insurance', value: 349145, percentage: 5 },
        { category: 'Equity', value: 233609, percentage: 3 }
      ]
    },
    {
      id: 'customer-type',
      name: 'Customer Type',
      chartType: 'donut' as const,
      data: [
        { category: 'Gold', value: 2728331, percentage: 36 },
        { category: 'Silver', value: 2581510, percentage: 34 },
        { category: 'Platinum', value: 2324022, percentage: 30 }
      ]
    },
    {
      id: 'risk-profile',
      name: 'Risk Profile',
      chartType: 'donut' as const,
      data: [
        { category: 'Moderate', value: 2667419, percentage: 35 },
        { category: 'Conservative', value: 2640577, percentage: 35 },
        { category: 'Aggressive', value: 2325867, percentage: 30 }
      ]
    },
    {
      id: 'age-group',
      name: 'Age Group',
      chartType: 'bar' as const,
      data: [
        { category: '30-45', value: 6090982, percentage: 80 },
        { category: '46-60', value: 1456972, percentage: 19 },
        { category: 'Under 30', value: 85909, percentage: 1 }
      ]
    },
    {
      id: 'city',
      name: 'City',
      chartType: 'bar' as const,
      data: [
        { category: 'Gaya', value: 3779037, percentage: 49 },
        { category: 'Surat', value: 2007355, percentage: 26 },
        { category: 'New Delhi', value: 1443050, percentage: 19 },
        { category: 'Mysuru', value: 230758, percentage: 3 },
        { category: 'Udaipur', value: 87754, percentage: 1 },
        { category: 'Jalandhar', value: 85909, percentage: 1 }
      ]
    }
  ];

  // Toggle individual dimension
  const toggleDimension = (dimensionId: string) => {
    const newExpanded = new Set(expandedDimensions);
    if (newExpanded.has(dimensionId)) {
      newExpanded.delete(dimensionId);
    } else {
      newExpanded.add(dimensionId);
    }
    setExpandedDimensions(newExpanded);
  };

  // Toggle all dimensions
  const toggleAllDimensions = () => {
    if (expandedDimensions.size === aumDimensions.length) {
      setExpandedDimensions(new Set());
    } else {
      setExpandedDimensions(new Set(aumDimensions.map(d => d.id)));
    }
  };

  const renderChart = (dimension: any) => {
    if (dimension.chartType === 'donut') {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={dimension.data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {dimension.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dimension.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: any) => formatCurrency(value)} />
            <Bar dataKey="value" fill="#3b82f6" />
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
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Business Snapshot
          <Button
            onClick={toggleAllDimensions}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            {expandedDimensions.size === aumDimensions.length ? (
              <>
                <ShrinkIcon className="h-4 w-4 mr-1" />
                Collapse All
              </>
            ) : (
              <>
                <ExpandIcon className="h-4 w-4 mr-1" />
                Expand All
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main AUM Metric */}
        <div className="space-y-2">
          <div 
            className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30"
            onClick={() => toggleAllDimensions()}
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Total AUM</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(businessMetrics?.totalAum || 0)}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {expandedDimensions.size} of {aumDimensions.length} expanded
            </Badge>
          </div>

          {/* All Dimensions */}
          <div className="space-y-3">
            {aumDimensions.map((dimension) => (
              <div key={dimension.id} className="border rounded-lg">
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => toggleDimension(dimension.id)}
                >
                  <span className="font-medium text-gray-900 dark:text-gray-100">{dimension.name}</span>
                  {expandedDimensions.has(dimension.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
                
                {expandedDimensions.has(dimension.id) && (
                  <div className="px-3 pb-3 border-t bg-gray-50 dark:bg-gray-800/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                      {/* Chart */}
                      <div>
                        {renderChart(dimension)}
                      </div>
                      
                      {/* Data Table */}
                      <div className="space-y-2">
                        {dimension.data.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-gray-700 dark:text-gray-300">{item.category}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(item.value)}</div>
                              <div className="text-gray-500">{item.percentage}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}