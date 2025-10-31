import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, Users, IndianRupee, Target, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";

interface BusinessMetrics {
  totalAum: number;
  totalClients: number;
  revenueMonthToDate: number;
  pipelineValue: number;
  platinumClients: number;
  goldClients: number;
  silverClients: number;
  conservativeClients: number;
  moderateClients: number;
  aggressiveClients: number;
}

interface DrillDownData {
  category: string;
  value: number;
  percentage?: number;
  count?: number;
}

interface DrillDownDimension {
  id: string;
  name: string;
  endpoint: string;
  chartType: 'donut' | 'bar';
  icon: any;
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
    queryKey: ['/api/business-metrics', 1], // Using userId 1 for now
    enabled: true,
  });

  // Drill-down data query
  const { data: drillDownData, isLoading: drillDownLoading } = useQuery<DrillDownData[]>({
    queryKey: [selectedDimension],
    enabled: !!selectedDimension,
  });

  // Metric configurations with drill-down dimensions
  const metricConfigs = {
    aum: {
      title: 'Total AUM',
      value: businessMetrics?.totalAum || 0,
      formatter: formatCurrency,
      icon: TrendingUp,
      color: 'text-blue-600',
      dimensions: [
        { id: '/api/business-metrics/1/aum/asset-class', name: 'Asset Class', endpoint: '/api/business-metrics/1/aum/asset-class', chartType: 'donut' as const, icon: TrendingUp },
      ]
    },
    clients: {
      title: 'Active Clients',
      value: businessMetrics?.totalClients || 0,
      formatter: formatNumber,
      icon: Users,
      color: 'text-green-600',
      dimensions: [
        { id: '/api/business-metrics/1/clients/tier', name: 'Client Tier', endpoint: '/api/business-metrics/1/clients/tier', chartType: 'donut' as const, icon: Users },
        { id: '/api/business-metrics/1/clients/risk-profile', name: 'Risk Profile', endpoint: '/api/business-metrics/1/clients/risk-profile', chartType: 'donut' as const, icon: Users },
      ]
    },
    revenue: {
      title: 'Revenue MTD',
      value: businessMetrics?.revenueMonthToDate || 0,
      formatter: formatCurrency,
      icon: IndianRupee,
      color: 'text-purple-600',
      dimensions: [
        { id: '/api/business-metrics/1/revenue/product-type', name: 'Product Type', endpoint: '/api/business-metrics/1/revenue/product-type', chartType: 'bar' as const, icon: IndianRupee },
      ]
    },
    pipeline: {
      title: 'Pipeline Value',
      value: businessMetrics?.pipelineValue || 0,
      formatter: formatCurrency,
      icon: Target,
      color: 'text-primary',
      dimensions: [
        { id: '/api/business-metrics/1/pipeline/stage', name: 'Pipeline Stage', endpoint: '/api/business-metrics/1/pipeline/stage', chartType: 'bar' as const, icon: Target },
      ]
    }
  };

  const handleMetricClick = (metricKey: string) => {
    setSelectedMetric(metricKey);
    setSelectedDimension(null);
    setDrillDownOpen(true);
  };

  const handleDimensionSelect = (dimensionId: string) => {
    setSelectedDimension(dimensionId);
  };

  const handleBackToDimensions = () => {
    setSelectedDimension(null);
  };

  const renderChart = () => {
    if (!drillDownData || drillDownData.length === 0) return null;

    const selectedConfig = selectedMetric ? metricConfigs[selectedMetric as keyof typeof metricConfigs] : null;
    const dimension = selectedConfig?.dimensions.find(d => d.id === selectedDimension);

    if (dimension?.chartType === 'donut') {
      return (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={drillDownData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {drillDownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={drillDownData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="category" />
            <YAxis tickFormatter={formatCurrency} />
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Business Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(metricConfigs).map(([key, config]) => {
              const IconComponent = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => handleMetricClick(key)}
                  className="flex flex-col p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent className={`h-5 w-5 ${config.color}`} />
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {config.formatter(config.value)}
                  </div>
                  <div className="text-sm text-gray-600">{config.title}</div>
                </button>
              );
            })}
          </div>

          {/* Quick Insights */}
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Quick Insights</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {businessMetrics?.platinumClients || 0} Platinum clients
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {businessMetrics?.goldClients || 0} Gold clients  
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {businessMetrics?.silverClients || 0} Silver clients
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drill-down Modal */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMetric && metricConfigs[selectedMetric as keyof typeof metricConfigs]?.title} Breakdown
            </DialogTitle>
          </DialogHeader>

          {selectedDimension ? (
            // Show chart view
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleBackToDimensions}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <span className="text-sm text-gray-600">
                  {metricConfigs[selectedMetric as keyof typeof metricConfigs]?.dimensions.find(d => d.id === selectedDimension)?.name}
                </span>
              </div>

              {drillDownLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {renderChart()}
                  
                  {/* Data table */}
                  <div className="mt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-3">Breakdown Details</h4>
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
                  </div>
                </>
              )}
            </div>
          ) : (
            // Show dimension selection
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select a dimension to view the breakdown:
              </p>
              
              <div className="grid gap-3">
                {selectedMetric && metricConfigs[selectedMetric as keyof typeof metricConfigs]?.dimensions.map((dimension) => {
                  const IconComponent = dimension.icon;
                  return (
                    <button
                      key={dimension.id}
                      onClick={() => handleDimensionSelect(dimension.id)}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{dimension.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}