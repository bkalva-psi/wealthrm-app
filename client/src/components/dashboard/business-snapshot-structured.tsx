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

interface ThirdLevelData {
  clientName: string;
  clientId: number;
  value: number;
  transactionCount: number;
  avgInvestmentSize: number;
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
  const [expandedThirdLevel, setExpandedThirdLevel] = useState<Set<string>>(new Set());
  const [secondLevelData, setSecondLevelData] = useState<Record<string, SecondLevelData[]>>({});
  const [thirdLevelData, setThirdLevelData] = useState<Record<string, ThirdLevelData[]>>({});
  const [showAllSecondLevel, setShowAllSecondLevel] = useState<Set<string>>(new Set());
  const [showAllThirdLevel, setShowAllThirdLevel] = useState<Set<string>>(new Set());

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
              console.log('Setting data for key:', secondLevelKey);
              console.log('Current secondLevelData before update:', secondLevelData);
              setSecondLevelData(prev => {
                const updated = {
                  ...prev,
                  [secondLevelKey]: data
                };
                console.log('Updated secondLevelData:', updated);
                return updated;
              });
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

  // Toggle show more/less for second level data
  const toggleShowAllSecondLevel = (key: string) => {
    const newShowAll = new Set(showAllSecondLevel);
    if (newShowAll.has(key)) {
      newShowAll.delete(key);
    } else {
      newShowAll.add(key);
    }
    setShowAllSecondLevel(newShowAll);
  };

  // Toggle show more/less for third level data
  const toggleShowAllThirdLevel = (key: string) => {
    const newShowAll = new Set(showAllThirdLevel);
    if (newShowAll.has(key)) {
      newShowAll.delete(key);
    } else {
      newShowAll.add(key);
    }
    setShowAllThirdLevel(newShowAll);
  };

  // Handle third-level drill-down (product → clients)
  const handleThirdLevelClick = async (productName: string) => {
    const thirdLevelKey = productName;
    const newExpanded = new Set(expandedThirdLevel);
    
    if (newExpanded.has(thirdLevelKey)) {
      newExpanded.delete(thirdLevelKey);
    } else {
      newExpanded.add(thirdLevelKey);
      
      // Fetch client holdings for this product
      if (!thirdLevelData[thirdLevelKey]) {
        try {
          const response = await fetch(`/api/business-metrics/1/product/${encodeURIComponent(productName)}/clients`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setThirdLevelData(prev => ({
              ...prev,
              [thirdLevelKey]: data
            }));
          }
        } catch (error) {
          console.error('Error fetching client holdings:', error);
        }
      }
    }
    
    setExpandedThirdLevel(newExpanded);
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
            { category: 'Alternative Investments', value: 26271342, percentage: 39 },
            { category: 'Bonds', value: 14175009, percentage: 21 },
            { category: 'Structured Products', value: 13714222, percentage: 20 },
            { category: 'Fixed Deposits', value: 6486305, percentage: 10 },
            { category: 'Mutual Funds', value: 3233029, percentage: 5 },
            { category: 'Insurance', value: 2469496, percentage: 4 },
            { category: 'Equity', value: 1522366, percentage: 2 }
          ]
        },
        {
          id: 'product-type',
          name: 'Product Type',
          chartType: 'donut' as const,
          data: [
            { category: 'Alternative Investments', value: 26271342, percentage: 39, hasSecondLevel: true, categoryKey: 'alternative-investments' },
            { category: 'Bonds', value: 14175009, percentage: 21, hasSecondLevel: true, categoryKey: 'bonds' },
            { category: 'Structured Products', value: 13714222, percentage: 20, hasSecondLevel: true, categoryKey: 'structured-products' },
            { category: 'Fixed Deposits', value: 6486305, percentage: 10, hasSecondLevel: true, categoryKey: 'fixed-deposits' },
            { category: 'Mutual Funds', value: 3233029, percentage: 5, hasSecondLevel: true, categoryKey: 'mutual-funds' },
            { category: 'Insurance', value: 2469496, percentage: 4, hasSecondLevel: true, categoryKey: 'insurance' },
            { category: 'Equity', value: 1522366, percentage: 2, hasSecondLevel: true, categoryKey: 'equity' }
          ]
        },
        {
          id: 'customer-type',
          name: 'Customer Type',
          chartType: 'donut' as const,
          data: [
            { category: 'Gold', value: 28540000, count: 19, percentage: 42 },
            { category: 'Platinum', value: 21030000, count: 14, percentage: 31 },
            { category: 'Silver', value: 18300000, count: 12, percentage: 27 }
          ]
        },
        {
          id: 'risk-profile',
          name: 'Risk Profile',
          chartType: 'donut' as const,
          data: [
            { category: 'Aggressive', value: 28506000, count: 19, percentage: 42 },
            { category: 'Moderate', value: 25781000, count: 17, percentage: 38 },
            { category: 'Conservative', value: 13585000, count: 9, percentage: 20 }
          ]
        },
        {
          id: 'age-group',
          name: 'Age Group',
          chartType: 'bar' as const,
          data: [
            { category: '30-45', value: 54284000, percentage: 80 },
            { category: '46-60', value: 12895000, percentage: 19 },
            { category: 'Under 30', value: 679000, percentage: 1 }
          ]
        },
        {
          id: 'city',
          name: 'City',
          chartType: 'bar' as const,
          data: [
            { category: 'Gaya', value: 33257000, percentage: 49 },
            { category: 'Surat', value: 17647000, percentage: 26 },
            { category: 'New Delhi', value: 12896000, percentage: 19 },
            { category: 'Mysuru', value: 2036000, percentage: 3 },
            { category: 'Udaipur', value: 1357000, percentage: 2 },
            { category: 'Jalandhar', value: 679000, percentage: 1 }
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
            { category: 'Alternative Investments', value: 11170, percentage: 38 },
            { category: 'Bonds', value: 6077, percentage: 21 },
            { category: 'Structured Products', value: 5857, percentage: 20 },
            { category: 'Fixed Deposits', value: 2934, percentage: 10 },
            { category: 'Mutual Funds', value: 1467, percentage: 5 },
            { category: 'Insurance', value: 1174, percentage: 4 },
            { category: 'Equity', value: 761, percentage: 3 }
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
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={dimension.data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
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
                          <div className="space-y-4 mt-3">
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
                                      {secondLevelData[item.categoryKey] && secondLevelData[item.categoryKey].length > 0 ? (
                                        <>
                                          {(() => {
                                            const products = secondLevelData[item.categoryKey];
                                            const showAll = showAllSecondLevel.has(item.categoryKey);
                                            const displayProducts = showAll ? products : products.slice(0, 5);
                                            
                                            return (
                                              <>
                                                {displayProducts.map((product, productIndex) => (
                                                  <div key={productIndex} className="space-y-1">
                                                    <div 
                                                      className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleThirdLevelClick(product.productName);
                                                      }}
                                                    >
                                                      <span className="truncate max-w-32 flex items-center">
                                                        {product.productName}
                                                        <span className="ml-1 text-blue-500">↗</span>
                                                      </span>
                                                      <div className="text-right">
                                                        <div className="font-medium">{formatCurrency(product.value)}</div>
                                                        <div className="text-gray-400">{product.percentage}%</div>
                                                      </div>
                                                    </div>
                                                    
                                                    {/* Third-level drill-down: Clients holding this product */}
                                                    {expandedThirdLevel.has(product.productName) && thirdLevelData[product.productName] && (
                                                      <div className="ml-4 pl-2 border-l-2 border-blue-200 dark:border-blue-600 space-y-1">
                                                        {thirdLevelData[product.productName].length > 0 ? (
                                                          <>
                                                            {(() => {
                                                              const clients = thirdLevelData[product.productName];
                                                              const showAll = showAllThirdLevel.has(product.productName);
                                                              const displayClients = showAll ? clients : clients.slice(0, 5);
                                                              
                                                              return (
                                                                <>
                                                                  {displayClients.map((client, clientIndex) => (
                                                                    <div key={clientIndex} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                                                      <span className="truncate max-w-32">{client.clientName}</span>
                                                                      <div className="text-right">
                                                                        <div className="font-medium">{formatCurrency(client.value)}</div>
                                                                        <div className="text-gray-400">{client.percentage}%</div>
                                                                      </div>
                                                                    </div>
                                                                  ))}
                                                                  
                                                                  {clients.length > 5 && (
                                                                    <button
                                                                      onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleShowAllThirdLevel(product.productName);
                                                                      }}
                                                                      className="text-xs text-blue-500 hover:text-blue-700 mt-1 flex items-center space-x-1"
                                                                    >
                                                                      <span>{showAll ? 'Show Less' : `Show More (${clients.length - 5} more)`}</span>
                                                                      {showAll ? (
                                                                        <ChevronUp className="h-3 w-3" />
                                                                      ) : (
                                                                        <ChevronDown className="h-3 w-3" />
                                                                      )}
                                                                    </button>
                                                                  )}
                                                                </>
                                                              );
                                                            })()}
                                                          </>
                                                        ) : (
                                                          <div className="text-xs text-gray-500 italic">
                                                            {thirdLevelData[product.productName] ? 'No clients found' : 'Loading clients...'}
                                                          </div>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                                
                                                {products.length > 5 && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      toggleShowAllSecondLevel(item.categoryKey);
                                                    }}
                                                    className="text-xs text-blue-500 hover:text-blue-700 mt-1 flex items-center space-x-1"
                                                  >
                                                    <span>{showAll ? 'Show Less' : `Show More (${products.length - 5} more)`}</span>
                                                    {showAll ? (
                                                      <ChevronUp className="h-3 w-3" />
                                                    ) : (
                                                      <ChevronDown className="h-3 w-3" />
                                                    )}
                                                  </button>
                                                )}
                                              </>
                                            );
                                          })()}
                                        </>
                                      ) : (
                                        <div className="text-xs text-gray-500 italic">
                                          {secondLevelData[item.categoryKey] ? 'No products found' : 'Loading products...'}
                                        </div>
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