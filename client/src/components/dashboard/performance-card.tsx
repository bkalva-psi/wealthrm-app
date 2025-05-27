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

  // Sample metrics structure (will be replaced with real data)
  const metrics: PerformanceMetric[] = [
    {
      name: "New Clients",
      icon: Users,
      target: 8,
      actual: 6,
      unit: "clients",
      rank: 5,
      percentile: 72,
      totalRMs: 15
    },
    {
      name: "Net New Money",
      icon: DollarSign,
      target: 50,
      actual: 45,
      unit: "L",
      rank: 3,
      percentile: 85,
      totalRMs: 15
    },
    {
      name: "Client Meetings",
      icon: Calendar,
      target: 25,
      actual: 28,
      unit: "meetings",
      rank: 2,
      percentile: 90,
      totalRMs: 15
    },
    {
      name: "Prospect Pipeline",
      icon: Target,
      target: 75,
      actual: 82,
      unit: "L",
      rank: 1,
      percentile: 95,
      totalRMs: 15
    },
    {
      name: "Revenue",
      icon: TrendingUp,
      target: 12,
      actual: 11.5,
      unit: "L",
      rank: 4,
      percentile: 78,
      totalRMs: 15
    }
  ];

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
                {metrics.slice(0, 2).map((metric) => {
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
              <div className="mt-3 space-y-2">
                {metrics.slice(0, 2).map((metric) => {
                  const medal = getRankMedal(metric.rank || 0);
                  return (
                    <div key={metric.name} className="flex items-center gap-2 text-xs">
                      <div className="w-4 text-center">
                        {medal || `#${metric.rank}`}
                      </div>
                      <span className="flex-1 truncate">{metric.name}</span>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs px-1 py-0", getPercentileColor(metric.percentile || 0))}
                      >
                        {metric.percentile}%ile
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <CollapsibleContent>
            <div className="px-4 py-3 space-y-3">
              {metrics.map((metric) => {
                const medal = getRankMedal(metric.rank || 0);
                return (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 text-center text-sm">
                          {medal || `#${metric.rank}`}
                        </div>
                        <span className="text-sm font-medium">{metric.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getPercentileColor(metric.percentile || 0))}
                        >
                          {metric.percentile}th percentile
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 pl-8">
                      Rank {metric.rank} of {metric.totalRMs} RMs • {metric.actual}{metric.unit} this {selectedPeriod === "Q" ? "quarter" : "period"}
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}