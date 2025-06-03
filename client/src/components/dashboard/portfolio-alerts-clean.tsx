import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";

interface PortfolioAlert {
  id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertType: string;
  clientId?: number;
  read: boolean;
  createdAt: Date;
}

export function PortfolioAlertsClean() {
  const { data: alerts, isLoading: alertsLoading } = useQuery<PortfolioAlert[]>({
    queryKey: ['/api/portfolio-alerts'],
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-medium text-foreground">Priority Alerts</h2>
          {!alertsLoading && alerts && alerts.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {alerts.filter(alert => !alert.read).length} New
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {alertsLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="px-4 py-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex gap-2 mt-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))
          ) : alerts && alerts.length > 0 ? (
            alerts.slice(0, 3).map((alert) => {
              const isUrgent = alert.severity === 'critical';
              
              return (
                <div key={alert.id} className={`px-4 py-3 transition-colors ${alert.read ? 'bg-muted/50' : 'bg-background hover:bg-muted/50'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        {isUrgent && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className={`text-sm font-medium leading-tight ${alert.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                            {alert.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                        <span className="text-xs text-muted-foreground capitalize">{alert.severity}</span>
                        <span className="text-xs text-muted-foreground/60">•</span>
                        <span className="text-xs text-muted-foreground">{alert.alertType}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(alert.createdAt), 'MMM d')}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <TrendingUp className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">All caught up!</p>
              <p className="text-xs text-slate-400">No urgent alerts at this time</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-slate-50 flex justify-center">
        <Button variant="link" size="sm" className="text-xs font-medium text-primary-600 hover:text-primary-700">
          View All Alerts
        </Button>
      </CardFooter>
    </Card>
  );
}