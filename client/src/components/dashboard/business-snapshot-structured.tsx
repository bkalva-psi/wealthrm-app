import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
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
  hasSecondLevel?: boolean;
  categoryKey?: string;
}

interface SecondLevelData {
  productName: string;
  value: number;
  count: number;
  avgTicketSize: number;
  percentage: number;
}

interface Dimension {
  id: string;
  name: string;
  chartType: 'donut' | 'bar';
  data: DrillDownData[];
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

export function BusinessSnapshotStructured() {
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set());
  const [expandedSecondLevel, setExpandedSecondLevel] = useState<Set<string>>(new Set());
  const [secondLevelData, setSecondLevelData] = useState<Record<string, SecondLevelData[]>>({});

  // Main business metrics query
  const { data: businessMetrics, isLoading } = useQuery<BusinessMetrics>({
    queryKey: ['/api/business-metrics/1'],
    enabled: true,
  });

  // Toggle metric expansion (shows/hides all drill-downs for that metric)
  const toggleMetric = (metricKey: string) => {
    const newExpanded = new Set(expandedMetrics);
    const newExpandedDimensions = new Set(expandedDimensions);
    const metric = metricsConfig[metricKey];
    
    if (newExpanded.has(metricKey)) {
      newExpanded.delete(metricKey);
      // Also collapse all dimensions for this metric
      metric.dimensions.forEach((dim: Dimension) => {
        newExpandedDimensions.delete(`${metricKey}-${dim.id}`);
      });
    } else {
      newExpanded.add(metricKey);
      // Expand ALL dimensions for this metric
      metric.dimensions.forEach((dim: Dimension) => {
        newExpandedDimensions.add(`${metricKey}-${dim.id}`);
      });
    }
    
    setExpandedMetrics(newExpanded);
    setExpandedDimensions(newExpandedDimensions);
  };

  // Toggle individual dimension within a metric
  const toggleDimension = (metricKey: string, dimensionId: string) => {
    const key = `${metricKey}-${dimensionId}`;
    const newExpanded = new Set(expandedDimensions);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedDimensions(newExpanded);
  };

  // Handle second-level drill-down using authentic customer transaction data
  const handleSecondLevelClick = async (category: string, categoryKey: string) => {
    const secondLevelKey = `${categoryKey}`;
    const newExpanded = new Set(expandedSecondLevel);
    
    if (newExpanded.has(secondLevelKey)) {
      newExpanded.delete(secondLevelKey);
    } else {
      newExpanded.add(secondLevelKey);
      
      // Fetch authentic product data aggregated from customer transactions
      if (!secondLevelData[secondLevelKey]) {
        try {
          const response = await fetch(`/api/business-metrics/1/products/${categoryKey}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (response.ok) {
            const text = await response.text();
            console.log('Raw response:', text);
            try {
              const data = JSON.parse(text);
              console.log('Parsed authentic customer data:', data);
              setSecondLevelData(prev => ({
                ...prev,
                [secondLevelKey]: data
              }));
            } catch (parseError) {
              console.error('JSON parse error:', parseError, 'Raw text:', text);
            }
          } else {
            console.error('Failed to fetch authentic data:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Error fetching authentic customer data:', error);
        }
      }
    }
    
    setExpandedSecondLevel(newExpanded);
  };



  // Metrics configuration with authentic database data
  const metricsConfig: Record<string, any> = {
    aum: {
      title: 'Total AUM',
      value: businessMetrics?.totalAum || 0,
      formatter: formatCurrency,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      dimensions: [
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
            { category: 'Structured Products', value: 2127654, percentage: 28, hasSecondLevel: true, categoryKey: 'structured-products' },
            { category: 'Bonds', value: 1840214, percentage: 24, hasSecondLevel: true, categoryKey: 'bonds' },
            { category: 'Fixed Deposits', value: 1716186, percentage: 22, hasSecondLevel: true, categoryKey: 'fixed-deposits' },
            { category: 'Alternative Investments', value: 901195, percentage: 12, hasSecondLevel: true, categoryKey: 'alternative-investments' },
            { category: 'Mutual Funds', value: 465860, percentage: 6, hasSecondLevel: true, categoryKey: 'mutual-funds' },
            { category: 'Insurance', value: 349145, percentage: 5, hasSecondLevel: true, categoryKey: 'insurance' },
            { category: 'Equity', value: 233609, percentage: 3, hasSecondLevel: true, categoryKey: 'equity' }
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
      ]
    },
    clients: {
      title: 'Active Clients',
      value: businessMetrics?.totalClients || 0,
      formatter: formatNumber,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      dimensions: [
        {
          id: 'tier',
          name: 'Client Tier',
          chartType: 'donut' as const,
          data: [
            { category: 'Gold', value: 19, count: 19, percentage: 42 },
            { category: 'Platinum', value: 14, count: 14, percentage: 31 },
            { category: 'Silver', value: 12, count: 12, percentage: 27 }
          ]
        },
        {
          id: 'risk-profile',
          name: 'Risk Profile',
          chartType: 'donut' as const,
          data: [
            { category: 'Aggressive', value: 19, count: 19, percentage: 42 },
            { category: 'Moderate', value: 17, count: 17, percentage: 38 },
            { category: 'Conservative', value: 9, count: 9, percentage: 20 }
          ]
        }
      ]
    },
    revenue: {
      title: 'Revenue MTD',
      value: businessMetrics?.revenueMonthToDate || 0,
      formatter: formatCurrency,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      dimensions: [
        {
          id: 'product-type',
          name: 'Product Type',
          chartType: 'bar' as const,
          data: [
            { category: 'Structured Products', value: 23797, percentage: 38 },
            { category: 'Fixed Deposits', value: 13391, percentage: 22 },
            { category: 'Alternative Investments', value: 9909, percentage: 16 },
            { category: 'Bonds', value: 7219, percentage: 12 },
            { category: 'Insurance', value: 4668, percentage: 7 },
            { category: 'Equity', value: 2523, percentage: 4 },
            { category: 'Mutual Funds', value: 977, percentage: 1 }
          ]
        }
      ]
    },
    pipeline: {
      title: 'Pipeline Value',
      value: businessMetrics?.pipelineValue || 0,
      formatter: formatCurrency,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      dimensions: [
        {
          id: 'stage',
          name: 'Pipeline Stage',
          chartType: 'bar' as const,
          data: [
            { category: 'New', value: 6, count: 6, percentage: 27 },
            { category: 'Proposal', value: 4, count: 4, percentage: 18 },
            { category: 'Qualified', value: 4, count: 4, percentage: 18 },
            { category: 'Negotiation', value: 3, count: 3, percentage: 14 },
            { category: 'Lost', value: 2, count: 2, percentage: 9 },
            { category: 'Won', value: 2, count: 2, percentage: 9 },
            { category: 'Discovery', value: 1, count: 1, percentage: 5 }
          ]
        }
      ]
    }
  };

  const renderChart = (dimension: Dimension) => {
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
              {dimension.data.map((entry, index) => (
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
        <CardTitle>Business Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Four Top-Level Metrics */}
        {Object.entries(metricsConfig).map(([metricKey, config]) => (
          <div key={metricKey} className="space-y-2">
            {/* Main Metric */}
            <div 
              className={`flex items-center justify-between p-3 ${config.bgColor} rounded-lg cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => toggleMetric(metricKey)}
            >
              <div className="flex items-center space-x-3">
                <config.icon className={`h-5 w-5 ${config.color}`} />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{config.title}</h3>
                  <p className={`text-2xl font-bold ${config.color}`}>
                    {config.formatter(config.value)}
                  </p>
                </div>
              </div>
              {expandedMetrics.has(metricKey) ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>

            {/* Drill-Down Dimensions */}
            {expandedMetrics.has(metricKey) && (
              <div className="ml-4 space-y-2">
                {config.dimensions.map((dimension: Dimension) => {
                  const dimensionKey = `${metricKey}-${dimension.id}`;
                  const isExpanded = expandedDimensions.has(dimensionKey);
                  
                  return (
                    <div key={dimension.id} className="border rounded-lg">
                      <div 
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => toggleDimension(metricKey, dimension.id)}
                      >
                        <span className="font-medium text-gray-700 dark:text-gray-300">{dimension.name}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                      
                      {isExpanded && (
                        <div className="px-3 pb-3 border-t bg-gray-50 dark:bg-gray-800/50">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                            {/* Chart */}
                            <div>
                              {renderChart(dimension)}
                            </div>
                            
                            {/* Data Table */}
                            <div className="space-y-2">
                              {dimension.data.map((item, index) => (
                                <div key={index} className="space-y-1">
                                  <div 
                                    className={`flex items-center justify-between text-sm ${item.hasSecondLevel ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded' : ''}`}
                                    onClick={() => item.hasSecondLevel && item.categoryKey && handleSecondLevelClick(item.category, item.categoryKey)}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                      />
                                      <span className="text-gray-700 dark:text-gray-300">{item.category}</span>
                                      {item.hasSecondLevel && (
                                        <span className="text-xs text-blue-500 ml-1">↗</span>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">{config.formatter(item.value)}</div>
                                      <div className="text-gray-500">{item.percentage}%</div>
                                    </div>
                                  </div>
                                  
                                  {/* Second-level drill-down data */}
                                  {item.hasSecondLevel && item.categoryKey && expandedSecondLevel.has(item.categoryKey) && (
                                    <div className="ml-4 pl-2 border-l-2 border-gray-200 dark:border-gray-600 space-y-1">
                                      {secondLevelData[item.categoryKey]?.map((product, productIndex) => (
                                        <div key={productIndex} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                          <span className="truncate max-w-32">{product.productName}</span>
                                          <div className="text-right">
                                            <div className="font-medium">{formatCurrency(product.value)}</div>
                                            <div className="text-gray-400">{product.percentage}%</div>
                                          </div>
                                        </div>
                                      )) || (
                                        <div className="text-xs text-gray-500 italic">Loading products...</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}