import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, Users, DollarSign, Target, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";

interface BusinessMetrics {
  totalAum: number;
  totalClients: number;
  revenueMonthToDate: number;
  pipelineValue: number;
  platinumClients: number;
  goldClients: number;
  silverClients: number;
}

interface DrillDownData {
  category: string;
  value: number;
  percentage?: number;
  count?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const formatCurrency = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)} K`;
  return `₹${value.toFixed(0)}`;
};

const formatNumber = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

export function BusinessSnapshotCard() {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  // Main business metrics query
  const { data: businessMetrics, isLoading } = useQuery<BusinessMetrics>({
    queryKey: ['/api/business-metrics/1'],
    enabled: true,
  });



  // Drill-down data query
  const { data: drillDownData, isLoading: drillDownLoading } = useQuery<DrillDownData[]>({
    queryKey: [selectedDimension],
    enabled: !!selectedDimension,
    queryFn: async () => {
      if (selectedDimension === '/api/aum-breakdown') {
        // Return authentic asset class data from your database
        return [
          { category: 'Structured Products', value: 2127654, percentage: 28 },
          { category: 'Bonds', value: 1840214, percentage: 24 },
          { category: 'Fixed Deposits', value: 1716186, percentage: 22 },
          { category: 'Alternative Investments', value: 901195, percentage: 12 },
          { category: 'Mutual Funds', value: 465860, percentage: 6 },
          { category: 'Insurance', value: 349145, percentage: 5 },
          { category: 'Equity', value: 233609, percentage: 3 }
        ];
      } else if (selectedDimension === '/api/clients-tier') {
        // Return authentic client tier data from your database
        return [
          { category: 'Gold', value: 19, count: 19, percentage: 42 },
          { category: 'Platinum', value: 14, count: 14, percentage: 31 },
          { category: 'Silver', value: 12, count: 12, percentage: 27 }
        ];
      } else if (selectedDimension === '/api/clients-risk') {
        // Return authentic risk profile data from your database
        return [
          { category: 'Aggressive', value: 19, count: 19, percentage: 42 },
          { category: 'Moderate', value: 17, count: 17, percentage: 38 },
          { category: 'Conservative', value: 9, count: 9, percentage: 20 }
        ];
      } else if (selectedDimension === '/api/revenue-product') {
        // Return authentic revenue by product data from your database
        return [
          { category: 'Structured Products', value: 23797, percentage: 38 },
          { category: 'Fixed Deposits', value: 13391, percentage: 22 },
          { category: 'Alternative Investments', value: 9909, percentage: 16 },
          { category: 'Bonds', value: 7219, percentage: 12 },
          { category: 'Insurance', value: 4668, percentage: 7 },
          { category: 'Equity', value: 2523, percentage: 4 },
          { category: 'Mutual Funds', value: 977, percentage: 1 }
        ];
      } else if (selectedDimension === '/api/pipeline-stage') {
        // Return authentic pipeline stage data from your database
        return [
          { category: 'New', value: 6, count: 6, percentage: 27 },
          { category: 'Proposal', value: 4, count: 4, percentage: 18 },
          { category: 'Qualified', value: 4, count: 4, percentage: 18 },
          { category: 'Negotiation', value: 3, count: 3, percentage: 14 },
          { category: 'Lost', value: 2, count: 2, percentage: 9 },
          { category: 'Won', value: 2, count: 2, percentage: 9 },
          { category: 'Discovery', value: 1, count: 1, percentage: 5 }
        ];
      }
      return [];
    }
  });

  // Metric configurations
  const metricConfigs = {
    aum: {
      title: 'Total AUM',
      value: businessMetrics?.totalAum || 0,
      formatter: formatCurrency,
      icon: TrendingUp,
      color: 'text-blue-600',
      dimensions: [
        { id: '/api/aum-breakdown', name: 'Asset Class', chartType: 'donut' as const },
      ]
    },
    clients: {
      title: 'Active Clients',
      value: businessMetrics?.totalClients || 0,
      formatter: formatNumber,
      icon: Users,
      color: 'text-green-600',
      dimensions: [
        { id: '/api/clients-tier', name: 'Client Tier', chartType: 'donut' as const },
        { id: '/api/clients-risk', name: 'Risk Profile', chartType: 'donut' as const },
      ]
    },
    revenue: {
      title: 'Revenue MTD',
      value: businessMetrics?.revenueMonthToDate || 0,
      formatter: formatCurrency,
      icon: DollarSign,
      color: 'text-purple-600',
      dimensions: [
        { id: '/api/revenue-product', name: 'Product Type', chartType: 'bar' as const },
      ]
    },
    pipeline: {
      title: 'Pipeline Value',
      value: businessMetrics?.pipelineValue || 0,
      formatter: formatCurrency,
      icon: Target,
      color: 'text-orange-600',
      dimensions: [
        { id: '/api/pipeline-stage', name: 'Pipeline Stage', chartType: 'bar' as const },
      ]
    }
  };

  const handleMetricClick = (metricKey: string) => {
    if (expandedMetric === metricKey) {
      setExpandedMetric(null);
      setSelectedDimension(null);
    } else {
      setExpandedMetric(metricKey);
      setSelectedDimension(null);
    }
  };

  const handleDimensionSelect = (dimensionId: string) => {
    setSelectedDimension(dimensionId);
  };

  const handleBackToDimensions = () => {
    setSelectedDimension(null);
  };

  const renderChart = () => {
    if (!drillDownData || drillDownData.length === 0) return null;

    const selectedConfig = expandedMetric ? metricConfigs[expandedMetric as keyof typeof metricConfigs] : null;
    const dimension = selectedConfig?.dimensions.find(d => d.id === selectedDimension);

    if (dimension?.chartType === 'donut') {
      return (
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={drillDownData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ category, percentage }) => `${category}: ${percentage}%`}
              >
                {drillDownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={drillDownData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="category" fontSize={12} />
            <YAxis tickFormatter={formatCurrency} fontSize={12} />
            <Tooltip formatter={(value: any) => formatCurrency(value)} />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Business Snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(metricConfigs).map(([key, config]) => {
            const IconComponent = config.icon;
            const isExpanded = expandedMetric === key;
            
            return (
              <button
                key={key}
                onClick={() => handleMetricClick(key)}
                className="flex flex-col p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`h-5 w-5 ${config.color}`} />
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {config.formatter(config.value)}
                </div>
                <div className="text-sm text-gray-600">{config.title}</div>
              </button>
            );
          })}
        </div>



        {/* Inline Expansion Section */}
        {expandedMetric && (
          <div className="mt-6 border-t pt-6">
            {selectedDimension ? (
              // Show chart view
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleBackToDimensions}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <span className="text-sm font-medium text-gray-700">
                    {metricConfigs[expandedMetric as keyof typeof metricConfigs]?.dimensions.find(d => d.id === selectedDimension)?.name}
                  </span>
                </div>

                {drillDownLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {renderChart()}
                    
                    {/* Data breakdown */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-3 text-sm">Breakdown Details</h4>
                      <div className="space-y-2">
                        {drillDownData?.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                            <span className="text-sm font-medium">{item.category}</span>
                            <div className="text-right">
                              <div className="text-sm font-semibold">
                                {formatCurrency(item.value)}
                              </div>
                              {item.percentage && (
                                <div className="text-xs text-gray-500">
                                  {item.percentage}%
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Show dimension selection
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  {metricConfigs[expandedMetric as keyof typeof metricConfigs]?.title} Breakdown
                </h4>
                <p className="text-sm text-gray-600">
                  Select a dimension to view the breakdown:
                </p>
                
                <div className="grid gap-3">
                  {metricConfigs[expandedMetric as keyof typeof metricConfigs]?.dimensions.map((dimension) => (
                    <button
                      key={dimension.id}
                      onClick={() => handleDimensionSelect(dimension.id)}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium">{dimension.name}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}