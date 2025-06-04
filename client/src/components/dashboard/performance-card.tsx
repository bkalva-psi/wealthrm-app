import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronRight, 
  ChevronDown,
  TrendingUp,
  Target,
  Award,
  BarChart3
} from "lucide-react";
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
import PeerComparisonRadarChart from "@/components/charts/PeerComparisonRadarChart";
import PeerPerformanceTrendChart from "@/components/charts/PeerPerformanceTrendChart";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
  userId: number;
  month: number;
  year: number;
  totalAum: number;
  previousYearAum: number;
  growthPercentage: number;
  createdAt: Date;
}

interface PerformanceData {
  targets: any[];
  peerComparison: any[];
}

interface IncentiveData {
  earned: number;
  projected: number;
  possible: number;
  breakdown: {
    base: number;
    performance: number;
    team: number;
    special: number;
  };
}

export function PerformanceCard() {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Fetch performance data
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/performance-metrics'],
  });
  
  const { data: aumTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/aum-trends'],
  });

  // Fetch business metrics for consistent AUM data (same source as KPI cards)
  const { data: businessMetrics, isLoading: businessLoading } = useQuery({
    queryKey: ['/api/business-metrics/1'],
    staleTime: 0,
    refetchOnMount: true
  });

  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['/api/performance'],
  });

  const { data: incentiveData, isLoading: incentiveLoading } = useQuery({
    queryKey: ['/api/performance/incentives/1'],
  });

  const toggleCard = (cardKey: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardKey)) {
      newExpanded.delete(cardKey);
    } else {
      newExpanded.add(cardKey);
    }
    setExpandedCards(newExpanded);
  };

  const getMetricByType = (type: string) => {
    return (metrics as PerformanceMetric[])?.find(m => m.metricType === type);
  };

  const formatGrowthData = () => {
    if (!aumTrends) return [];
    return (aumTrends as AumTrend[]).map(trend => ({
      month: months[trend.month - 1],
      current: trend.totalAum / 10000000,
      previous: trend.previousYearAum / 10000000,
      growth: trend.growthPercentage
    }));
  };

  const cards = {
    yoy_growth: {
      title: 'YoY Growth',
      icon: TrendingUp,
      color: 'text-primary',
      isExpanded: expandedCards.has('yoy_growth')
    },
    comparative: {
      title: 'Comparative Performance',
      icon: BarChart3,
      color: 'text-purple-600 dark:text-purple-400',
      isExpanded: expandedCards.has('comparative')
    },
    incentives: {
      title: 'Incentives',
      icon: Award,
      color: 'text-primary',
      isExpanded: expandedCards.has('incentives')
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-card text-card-foreground border-unified transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 transform hover:scale-[1.01] interactive-hover">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-300 focus-enhanced">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg brand-accent-bg-subtle transition-all duration-300 hover:bg-primary/20 hover:scale-110 interactive-scale">
                  <Target size={20} className="brand-accent transition-all duration-300" />
                </div>
                <CardTitle className="text-lg transition-colors duration-300 brand-accent-subtle">Other performance indicators</CardTitle>
              </div>
              {isOpen ? (
                <ChevronDown size={20} className="transition-all duration-300 brand-accent" />
              ) : (
                <ChevronRight size={20} className="transition-all duration-300 text-muted-foreground hover:text-primary brand-accent-subtle" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {Object.entries(cards).map(([key, card]) => {
              const IconComponent = card.icon;
              const isExpanded = card.isExpanded;
              
              return (
                <Collapsible key={key} open={isExpanded} onOpenChange={() => toggleCard(key)}>
                  <div className="rounded-lg border p-3 sm:p-4 bg-muted border-border transition-all duration-300 hover:shadow-md hover:scale-[1.02] transform">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-0 h-auto hover:bg-transparent transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg bg-background/60 ${card.color} transition-all duration-300 group-hover:scale-110 group-hover:bg-background/80`}>
                            <IconComponent size={18} className="transition-transform duration-300" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-sm text-muted-foreground transition-colors duration-300 leading-tight">{card.title}</h3>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown size={16} className="text-muted-foreground transition-all duration-300" />
                        ) : (
                          <ChevronRight size={16} className="text-muted-foreground transition-all duration-300" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="transition-all duration-500 ease-in-out">
                      <div className="mt-4 space-y-4">
                        {key === 'yoy_growth' && (
                          <div>
                            {trendsLoading || businessLoading ? (
                              <Skeleton className="h-48 w-full" />
                            ) : (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="text-center p-3 bg-card/60 border border-border rounded-lg">
                                    <div className="text-xs text-muted-foreground mb-1">Current AUM</div>
                                    <div className="text-lg font-bold text-foreground">
                                      {formatCurrency((businessMetrics as any)?.totalAum || 0)}
                                    </div>
                                  </div>
                                  <div className="text-center p-3 bg-card/60 border border-border rounded-lg">
                                    <div className="text-xs text-muted-foreground mb-1">YoY Growth</div>
                                    <div className={`text-lg font-bold ${getPercentageChangeColor((aumTrends as AumTrend[])?.[0]?.growthPercentage || 0)}`}>
                                      {(aumTrends as AumTrend[])?.[0]?.growthPercentage?.toFixed(1) || 0}%
                                    </div>
                                  </div>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                  <BarChart data={formatGrowthData()}>
                                    <CartesianGrid 
                                      strokeDasharray="3 3" 
                                      opacity={0.3} 
                                      stroke="hsl(var(--border))"
                                    />
                                    <XAxis 
                                      dataKey="month" 
                                      fontSize={12} 
                                      tick={{ fill: 'hsl(var(--foreground))' }}
                                      axisLine={{ stroke: 'hsl(var(--border))' }}
                                      tickLine={{ stroke: 'hsl(var(--border))' }}
                                    />
                                    <YAxis 
                                      fontSize={12} 
                                      tick={{ fill: 'hsl(var(--foreground))' }}
                                      axisLine={{ stroke: 'hsl(var(--border))' }}
                                      tickLine={{ stroke: 'hsl(var(--border))' }}
                                    />
                                    <Tooltip 
                                      formatter={(value: number, name: string) => [`₹${value.toFixed(2)} Cr`, name]}
                                      labelFormatter={(label) => `Month: ${label}`}
                                      contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '6px',
                                        color: 'hsl(var(--foreground))',
                                        fontSize: '12px'
                                      }}
                                    />
                                    <Bar dataKey="current" fill="hsl(var(--primary))" name="Current Year" />
                                    <Bar dataKey="previous" fill="hsl(var(--muted-foreground))" name="Previous Year" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                          </div>
                        )}

                        {key === 'comparative' && (
                          <div>
                            {performanceLoading ? (
                              <Skeleton className="h-48 w-full" />
                            ) : (
                              <div className="space-y-4">
                                <div className="space-y-3">
                                  <h4 className="font-medium text-sm">Actual vs. Target</h4>
                                  {(performanceData as PerformanceData)?.targets?.map((target: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-card/60 border border-border rounded-lg">
                                      <span className="text-sm text-muted-foreground">{target.name}</span>
                                      <div className="text-right">
                                        <div className="text-sm font-medium">{target.actual} / {target.target}</div>
                                        <div className={`text-xs ${getPercentageChangeColor(target.achievement)}`}>
                                          {target.achievement}% achieved
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="space-y-4">
                                  <h4 className="font-medium text-sm">Peer Comparison</h4>
                                  
                                  {/* Summary Cards */}
                                  <div className="space-y-2">
                                    {(performanceData as PerformanceData)?.peerComparison?.map((peer: any, index: number) => (
                                      <div key={index} className="flex justify-between items-center p-3 bg-card/60 border border-border rounded-lg">
                                        <span className="text-sm text-muted-foreground">{peer.metric}</span>
                                        <div className="text-right">
                                          <div className="text-sm font-medium">{peer.yourValue}</div>
                                          <div className={`text-xs ${getPercentageChangeColor(peer.vsAverage)}`}>
                                            {peer.avgValue}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Performance Trend Chart - Full Width */}
                                  <div className="mt-4 -mx-3">
                                    <div className="px-3 mb-3">
                                      <h5 className="font-medium text-xs text-muted-foreground">Percentile Scores</h5>
                                    </div>
                                    <div className="bg-card/60 border border-border rounded-lg p-3">
                                      <PeerPerformanceTrendChart />
                                    </div>
                                  </div>

                                  {/* Radar Chart */}
                                  <div className="mt-4">
                                    <h5 className="font-medium text-xs text-muted-foreground mb-3">Performance Radar</h5>
                                    <div className="bg-card/60 border border-border rounded-lg p-3">
                                      <PeerComparisonRadarChart 
                                        data={(performanceData as PerformanceData)?.peerComparison?.map((peer: any) => ({
                                          metric: peer.metric,
                                          yourValue: peer.yourValue,
                                          avgValue: peer.avgValue,
                                          vsAverage: peer.vsAverage,
                                          percentile: parseInt(peer.avgValue.replace(/[^\d]/g, '')) || 50
                                        })) || []}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {key === 'incentives' && (
                          <div>
                            {incentiveLoading ? (
                              <Skeleton className="h-32 w-full" />
                            ) : (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="text-center p-3 bg-card/60 border border-border rounded-lg">
                                    <div className="text-xs text-muted-foreground mb-1">Earned</div>
                                    <div className="text-lg font-bold text-green-600">
                                      {formatCurrency((incentiveData as IncentiveData)?.earned || 0)}
                                    </div>
                                  </div>
                                  <div className="text-center p-3 bg-card/60 border border-border rounded-lg">
                                    <div className="text-xs text-muted-foreground mb-1">Projected</div>
                                    <div className="text-lg font-bold text-blue-600">
                                      {formatCurrency((incentiveData as IncentiveData)?.projected || 0)}
                                    </div>
                                  </div>
                                </div>
                                {(incentiveData as IncentiveData)?.breakdown && Object.entries((incentiveData as IncentiveData).breakdown).map(([category, amount]) => (
                                  <div key={category} className="flex justify-between items-center p-3 bg-card/60 border border-border rounded-lg">
                                    <span className="text-sm text-muted-foreground capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <div className="text-right">
                                      <div className="text-sm font-medium">{formatCurrency(amount as number)}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
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