import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  TrendingUp, 
  ChevronRight, 
  ChevronDown,
  Target,
  Users,
  DollarSign,
  Calendar,
  Award,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

type Period = "M" | "Q" | "HY" | "Y";

interface PerformanceMetric {
  name: string;
  icon: React.ComponentType<any>;
  target: number;
  actual: number;
  unit: string;
  rank?: number;
  percentile?: number;
  totalRMs?: number;
}

const PERIOD_LABELS = {
  M: "Monthly",
  Q: "Quarterly", 
  HY: "Half-Yearly",
  Y: "Yearly"
};

export function PerformanceCard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("Q");
  const [targetsExpanded, setTargetsExpanded] = useState(false);
  const [peersExpanded, setPeersExpanded] = useState(false);
  const [showMobileValues, setShowMobileValues] = useState(false);

  // Fetch performance data based on selected period
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['/api/performance', selectedPeriod],
    select: (data: any) => data || { targets: [], actuals: [], peers: [] }
  });

  const getProgressPercentage = (actual: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.round((actual / target) * 100), 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 80) return "text-green-600 bg-green-50";
    if (percentile >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getRankMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  // Generate realistic metrics based on selected period
  const getMetricsForPeriod = (period: Period): PerformanceMetric[] => {
    const baseData = {
      M: { // Monthly
        newClients: { target: 3, actual: 2 },
        netNewMoney: { target: 15, actual: 12 },
        clientMeetings: { target: 8, actual: 9 },
        prospectPipeline: { target: 20, actual: 22 },
        revenue: { target: 3, actual: 2.8 }
      },
      Q: { // Quarterly  
        newClients: { target: 8, actual: 6 },
        netNewMoney: { target: 50, actual: 45 },
        clientMeetings: { target: 25, actual: 28 },
        prospectPipeline: { target: 75, actual: 82 },
        revenue: { target: 12, actual: 11.5 }
      },
      HY: { // Half-Yearly
        newClients: { target: 18, actual: 14 },
        netNewMoney: { target: 120, actual: 108 },
        clientMeetings: { target: 55, actual: 62 },
        prospectPipeline: { target: 180, actual: 195 },
        revenue: { target: 28, actual: 26.5 }
      },
      Y: { // Yearly
        newClients: { target: 35, actual: 28 },
        netNewMoney: { target: 250, actual: 225 },
        clientMeetings: { target: 120, actual: 135 },
        prospectPipeline: { target: 400, actual: 420 },
        revenue: { target: 60, actual: 58 }
      }
    };

    const data = baseData[period];
    return [
      {
        name: "New Clients",
        icon: Users,
        target: data.newClients.target,
        actual: data.newClients.actual,
        unit: "",
        rank: 5,
        percentile: 72,
        totalRMs: 15
      },
      {
        name: "Net New Money",
        icon: DollarSign,
        target: data.netNewMoney.target,
        actual: data.netNewMoney.actual,
        unit: "L",
        rank: 3,
        percentile: 85,
        totalRMs: 15
      },
      {
        name: "Client Meetings",
        icon: Calendar,
        target: data.clientMeetings.target,
        actual: data.clientMeetings.actual,
        unit: "",
        rank: 2,
        percentile: 90,
        totalRMs: 15
      },
      {
        name: "Prospect Pipeline",
        icon: Target,
        target: data.prospectPipeline.target,
        actual: data.prospectPipeline.actual,
        unit: "L",
        rank: 1,
        percentile: 95,
        totalRMs: 15
      },
      {
        name: "Revenue",
        icon: TrendingUp,
        target: data.revenue.target,
        actual: data.revenue.actual,
        unit: "L",
        rank: 4,
        percentile: 78,
        totalRMs: 15
      }
    ];
  };

  const metrics = getMetricsForPeriod(selectedPeriod);

  // Prepare spider chart data for peer comparison
  const spiderChartData = metrics.map((metric) => ({
    metric: metric.name.split(' ')[0], // Use short names for the chart
    fullName: metric.name, // Full name for tooltip
    percentile: metric.percentile || 0,
    rank: metric.rank,
    fullWidth: 100 // For reference circle
  }));

  // Generate quarterly trend data for last 8 quarters
  const generateQuarterlyTrend = () => {
    const quarters = [];
    const currentDate = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const quarterDate = new Date(currentDate);
      quarterDate.setMonth(currentDate.getMonth() - (i * 3));
      const year = quarterDate.getFullYear();
      const quarter = Math.floor(quarterDate.getMonth() / 3) + 1;
      
      quarters.push({
        quarter: `Q${quarter} ${year.toString().slice(-2)}`,
        newClients: Math.max(50, 72 + Math.random() * 30 - 15), // Trend around current 72%
        netNewMoney: Math.max(60, 85 + Math.random() * 20 - 10), // Trend around current 85%
        clientMeetings: Math.max(70, 90 + Math.random() * 15 - 7), // Trend around current 90%
        prospectPipeline: Math.max(80, 95 + Math.random() * 10 - 5), // Trend around current 95%
        revenue: Math.max(55, 78 + Math.random() * 25 - 12) // Trend around current 78%
      });
    }
    return quarters;
  };

  const quarterlyTrendData = generateQuarterlyTrend();

  // Calculate Y-axis domain based on actual data range
  const getYAxisDomain = () => {
    const allValues = quarterlyTrendData.flatMap(quarter => [
      quarter.newClients,
      quarter.netNewMoney,
      quarter.clientMeetings,
      quarter.prospectPipeline,
      quarter.revenue
    ]);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const padding = (maxValue - minValue) * 0.1; // 10% padding
    return [Math.max(0, minValue - padding), maxValue + padding];
  };

  // Calculate overall average percentile
  const overallAveragePercentile = Math.round(
    metrics.reduce((sum, metric) => sum + (metric.percentile || 0), 0) / metrics.length
  );

  // Custom tooltip component for desktop hover
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-slate-200 rounded shadow-lg text-xs">
          <p className="font-medium">{data.fullName}</p>
          <p className="text-blue-600">
            {data.percentile}th percentile (Rank #{data.rank})
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-medium text-slate-700">Performance</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Period Selector */}
            <div className="flex bg-slate-100 rounded-md p-0.5">
              {Object.entries(PERIOD_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPeriod(key as Period)}
                  className={cn(
                    "px-2 py-1 text-xs rounded transition-colors",
                    selectedPeriod === key
                      ? "bg-white text-slate-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-slate-200">
        {/* Performance vs Targets Section */}
        <Collapsible open={targetsExpanded} onOpenChange={setTargetsExpanded}>
          <div className="px-4 py-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full p-0 h-auto justify-start hover:bg-transparent">
                <div className="flex items-center gap-2 w-full">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-slate-700 flex-1 text-left">
                    My Performance vs Targets ({PERIOD_LABELS[selectedPeriod]})
                  </span>
                  {targetsExpanded ? 
                    <ChevronDown className="h-4 w-4 text-slate-400" /> :
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  }
                </div>
              </Button>
            </CollapsibleTrigger>
            
            {!targetsExpanded && (
              <div className="mt-3 space-y-2">
                {metrics.map((metric) => {
                  const percentage = getProgressPercentage(metric.actual, metric.target);
                  const IconComponent = metric.icon;
                  return (
                    <div key={metric.name} className="flex items-center gap-2 text-xs">
                      <IconComponent className="h-4 w-4 text-slate-400" />
                      <span className="flex-1 truncate">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">{metric.actual}{metric.unit}</span>
                        <div className="w-8 h-2 bg-slate-200 rounded-full">
                          <div 
                            className={cn("h-full rounded-full", getProgressColor(percentage))}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className={cn("text-xs", percentage >= 100 ? "text-green-600" : "text-slate-500")}>
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <CollapsibleContent>
            <div className="px-4 py-3 space-y-3">
              {metrics.map((metric) => {
                const percentage = getProgressPercentage(metric.actual, metric.target);
                const IconComponent = metric.icon;
                return (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium">{metric.name}</span>
                      </div>
                      <Badge variant={percentage >= 100 ? "default" : "secondary"} className="text-xs">
                        {percentage >= 100 ? "Achieved" : "In Progress"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Target: {metric.target}{metric.unit}</span>
                        <span>Actual: {metric.actual}{metric.unit}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full">
                        <div 
                          className={cn("h-full rounded-full transition-all", getProgressColor(percentage))}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-slate-500">{percentage}% of target</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Peer Comparison Section */}
        <Collapsible open={peersExpanded} onOpenChange={setPeersExpanded}>
          <div className="px-4 py-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full p-0 h-auto justify-start hover:bg-transparent">
                <div className="flex items-center gap-2 w-full">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-slate-700 flex-1 text-left">
                    Peer Comparison ({PERIOD_LABELS[selectedPeriod]})
                  </span>
                  {peersExpanded ? 
                    <ChevronDown className="h-4 w-4 text-slate-400" /> :
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  }
                </div>
              </Button>
            </CollapsibleTrigger>
            
            {!peersExpanded && (
              <div className="mt-3">
                {/* Overall Percentile Score - Graphical Display */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div className="text-center mb-3">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{overallAveragePercentile}%ile</div>
                    <div className="text-sm text-blue-700 font-medium">Overall Percentile Score</div>
                    <div className="text-xs text-slate-600 mt-1">
                      {overallAveragePercentile >= 80 ? "Strong compared to peers" : 
                       overallAveragePercentile >= 60 ? "Average compared to peers" : 
                       "Weak compared to peers"}
                    </div>
                  </div>

                  {/* Visual Progress Ring */}
                  <div className="flex justify-center mb-3">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        {/* Background circle */}
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="2"
                        />
                        {/* Progress circle */}
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={overallAveragePercentile >= 80 ? "#10b981" : overallAveragePercentile >= 60 ? "#3b82f6" : "#f59e0b"}
                          strokeWidth="2"
                          strokeDasharray={`${overallAveragePercentile}, 100`}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-700">{overallAveragePercentile}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Tier Indicator */}
                  <div className="flex justify-center">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      overallAveragePercentile >= 80 ? "bg-green-100 text-green-700" :
                      overallAveragePercentile >= 60 ? "bg-blue-100 text-blue-700" :
                      "bg-orange-100 text-orange-700"
                    )}>
                      {overallAveragePercentile >= 80 ? "🏆 Strong Performer" : 
                       overallAveragePercentile >= 60 ? "💪 Average Performer" : 
                       "📈 Needs Improvement"}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 text-center mt-3">
                  Expand to see detailed metrics and quarterly trends
                </div>
              </div>
            )}
          </div>
          
          <CollapsibleContent>
            <div className="px-4 py-3 space-y-4">

              {/* Individual Performance Indicators */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-slate-600">Individual Performance Metrics</div>
                <div className="grid grid-cols-1 gap-2">
                  {metrics.map((metric) => {
                    const medal = getRankMedal(metric.rank || 0);
                    return (
                      <div key={metric.name} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-6 text-center text-sm">
                            {medal || `#${metric.rank}`}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{metric.name}</div>
                            <div className="text-xs text-slate-500">
                              Rank {metric.rank} of {metric.totalRMs} RMs
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getPercentileColor(metric.percentile || 0))}
                        >
                          {metric.percentile}%ile
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quarterly Trend Line Chart */}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs font-medium text-slate-600 mb-3 text-center">
                  Percentile Performance Trends (Last 8 Quarters)
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={quarterlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="quarter" 
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        domain={getYAxisDomain()}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        label={{ value: 'Percentile', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '10px', fill: '#64748b' } }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                        formatter={(value: any, name: string) => [`${Math.round(value)}%ile`, name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')]}
                        labelFormatter={(label) => `Quarter: ${label}`}
                      />
                      <Line type="monotone" dataKey="newClients" stroke="#ef4444" strokeWidth={2} name="newClients" dot={false} />
                      <Line type="monotone" dataKey="netNewMoney" stroke="#f59e0b" strokeWidth={2} name="netNewMoney" dot={false} />
                      <Line type="monotone" dataKey="clientMeetings" stroke="#10b981" strokeWidth={2} name="clientMeetings" dot={false} />
                      <Line type="monotone" dataKey="prospectPipeline" stroke="#3b82f6" strokeWidth={2} name="prospectPipeline" dot={false} />
                      <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="revenue" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="text-xs text-slate-500 text-center mt-2">
                  Track your improvement over time across all key metrics
                </div>
              </div>

              {/* Current Spider Chart for Reference */}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-slate-600">
                    Current Quarter Snapshot
                  </div>
                  <button 
                    onClick={() => setShowMobileValues(!showMobileValues)}
                    className="md:hidden text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {showMobileValues ? 'Hide' : 'Show'} Values
                    <div className="w-3 h-3 border border-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    </div>
                  </button>
                </div>
                
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={spiderChartData}>
                      <PolarGrid />
                      <PolarAngleAxis 
                        dataKey="metric" 
                        tick={{ fontSize: 10, fill: '#64748b' }}
                      />
                      <PolarRadiusAxis 
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 8, fill: '#94a3b8' }}
                        tickCount={5}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Radar 
                        name="Your Performance" 
                        dataKey="percentile" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Radar 
                        name="Reference" 
                        dataKey="fullWidth" 
                        stroke="#e2e8f0" 
                        fill="transparent" 
                        strokeWidth={1}
                        strokeDasharray="2 2"
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                {showMobileValues && (
                  <div className="md:hidden mt-3 pt-3 border-t border-slate-300 space-y-2">
                    <div className="text-xs font-medium text-slate-600 mb-2">Chart Values:</div>
                    {spiderChartData.map((item) => (
                      <div key={item.metric} className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">{item.fullName}:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">{item.percentile}%ile</span>
                          <span className="text-slate-500">#{item.rank}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}