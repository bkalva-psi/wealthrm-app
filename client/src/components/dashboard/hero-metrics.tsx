import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, AlertTriangle, Target, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
}

function MetricCard({ title, value, change, changeType, icon, priority = 'medium' }: MetricCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200 hover:shadow-md",
      priority === 'high' && "ring-2 ring-blue-200 bg-blue-50/30",
      priority === 'medium' && "border-gray-200",
      priority === 'low' && "border-gray-100"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {change && (
              <div className={cn(
                "flex items-center text-sm font-medium",
                changeType === 'positive' && "text-green-600",
                changeType === 'negative' && "text-red-600",
                changeType === 'neutral' && "text-gray-600"
              )}>
                {changeType === 'positive' && <TrendingUp className="h-3 w-3 mr-1" />}
                {changeType === 'negative' && <TrendingDown className="h-3 w-3 mr-1" />}
                {change}
              </div>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-full",
            priority === 'high' && "bg-blue-100 text-blue-600",
            priority === 'medium' && "bg-gray-100 text-gray-600",
            priority === 'low' && "bg-gray-50 text-gray-500"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HeroMetrics() {
  // Fetch business metrics
  const { data: businessMetrics, isLoading: businessLoading } = useQuery({
    queryKey: ['/api/business-metrics/1'],
  });

  // Fetch performance data
  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ['/api/performance'],
  });

  // Fetch portfolio alerts for critical count
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/portfolio-alerts'],
  });

  // Fetch prospects for pipeline value
  const { data: prospects, isLoading: prospectsLoading } = useQuery({
    queryKey: ['/api/prospects'],
  });

  if (businessLoading || performanceLoading || alertsLoading || prospectsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate metrics
  const totalAum = businessMetrics?.totalAum || 0;
  const totalClients = businessMetrics?.totalClients || 0;
  const criticalAlerts = alerts?.filter((alert: any) => alert.priority === 'high')?.length || 0;
  
  // Calculate pipeline value from prospects
  const pipelineValue = prospects?.reduce((total: number, prospect: any) => {
    return total + (prospect.potentialValue || 0);
  }, 0) || 0;

  // Format currency values
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) { // 1 Crore
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) { // 1 Lakh
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  // Calculate month-to-date performance vs targets
  const monthlyTarget = performance?.targets?.find((t: any) => t.name === "New Clients")?.target || 0;
  const monthlyAchieved = performance?.targets?.find((t: any) => t.name === "New Clients")?.achieved || 0;
  const targetPercentage = monthlyTarget > 0 ? Math.round((monthlyAchieved / monthlyTarget) * 100) : 0;

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Key Performance Indicators</h2>
        <p className="text-sm text-gray-600">Real-time view of your portfolio and performance</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total AUM"
          value={formatCurrency(totalAum)}
          change="vs last month"
          changeType="positive"
          icon={<DollarSign className="h-5 w-5" />}
          priority="high"
        />
        
        <MetricCard
          title="Active Clients"
          value={totalClients.toString()}
          change={`${criticalAlerts} need attention`}
          changeType={criticalAlerts > 0 ? "negative" : "neutral"}
          icon={<Users className="h-5 w-5" />}
          priority="medium"
        />
        
        <MetricCard
          title="Monthly Target"
          value={`${targetPercentage}%`}
          change={`${monthlyAchieved}/${monthlyTarget} achieved`}
          changeType={targetPercentage >= 80 ? "positive" : targetPercentage >= 60 ? "neutral" : "negative"}
          icon={<Target className="h-5 w-5" />}
          priority="high"
        />
        
        <MetricCard
          title="Pipeline Value"
          value={formatCurrency(pipelineValue)}
          change={`${prospects?.length || 0} prospects`}
          changeType="positive"
          icon={<TrendingUp className="h-5 w-5" />}
          priority="medium"
        />
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts > 0 && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {criticalAlerts} critical alert{criticalAlerts > 1 ? 's' : ''} require immediate attention
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Review portfolio alerts for urgent client actions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}