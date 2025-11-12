import { formatDistanceToNow } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PortfolioAlert {
  id: number;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  clientId?: number;
  read: boolean;
  actionRequired: boolean;
  createdAt: string;
}

interface Complaint {
  id: number;
  clientId: number;
  clientName: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  reportedDate: string;
  targetResolutionDate: string;
  reportedVia: string;
  escalationLevel: number;
  isRegulatory: boolean;
  resolutionRating: number | null;
}

export function PortfolioAlertsFixed() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: alerts, isLoading } = useQuery<PortfolioAlert[]>({
    queryKey: ['/api/portfolio-alerts'],
  });

  const { data: complaints, isLoading: complaintsLoading } = useQuery<Complaint[]>({
    queryKey: ['/api/complaints'],
  });
  
  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, read }: { id: number, read: boolean }) => {
      await apiRequest("PUT", `/api/portfolio-alerts/${id}`, { read });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio-alerts'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update alert status. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleMarkAsRead = (alertId: number) => {
    updateAlertMutation.mutate({ id: alertId, read: true });
  };

  const severityColors = {
    critical: "bg-destructive/10 text-destructive border-destructive/20",
    high: "bg-muted text-foreground border-border",
    medium: "bg-muted text-foreground border-border",
    low: "bg-accent text-accent-foreground border-border"
  };

  const priorityColors = {
    urgent: "bg-destructive/10 text-destructive border-destructive/20",
    high: "bg-muted text-foreground border-border",
    normal: "bg-muted text-foreground border-border",
    low: "bg-accent text-accent-foreground border-border"
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="px-4 py-3 border-b border-border bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <CardTitle className="text-sm font-medium text-foreground">Priority Alerts</CardTitle>
            {!isLoading && alerts && alerts.length > 0 && (
              <Badge variant="destructive">{alerts.filter(alert => !alert.read).length} Unread</Badge>
            )}
          </div>
        </CardHeader>
        
        <div className="divide-y divide-border">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="px-4 py-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-3/4" />
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
                <div key={alert.id} className={`px-4 py-3 transition-colors ${alert.read ? 'bg-muted' : 'bg-card hover:bg-muted'}`}>
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
                      
                      <div className="flex gap-2 items-center">
                        <Badge 
                          variant={alert.severity === 'critical' ? 'destructive' : 'secondary'} 
                          className={`text-xs px-2 py-0.5 ${severityColors[alert.severity] || 'bg-muted text-foreground border-border'}`}
                        >
                          {alert.severity ? alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1) : 'Unknown'}
                        </Badge>
                        {alert.actionRequired && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 text-primary border-primary/30">
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 ml-3">
                      <span className="text-xs text-muted-foreground">
                        {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }) : 'Unknown time'}
                      </span>
                      {!alert.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="h-6 px-2 text-xs text-primary hover:text-primary/90 hover:bg-primary/10"
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No alerts at this time</p>
            </div>
          )}
        </div>
        
        <CardFooter className="px-4 py-3 bg-muted flex justify-center">
          <Button variant="link" size="sm" className="text-xs font-medium text-primary hover:text-primary/90">
            View All Alerts
          </Button>
        </CardFooter>
      </Card>

      {/* Complaints Section */}
      <Card className="overflow-hidden mt-4">
        <div className="px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-medium text-foreground">Complaints</h2>
            {!complaintsLoading && complaints && complaints.length > 0 && (
              <Badge variant="destructive">{complaints.filter((c) => c.status === 'open').length} Open</Badge>
            )}
          </div>
        </div>
        
        <div className="divide-y divide-border">
          {complaintsLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="px-4 py-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-3/4" />
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
          ) : complaints && complaints.length > 0 ? (
            complaints.slice(0, 3).map((complaint) => {
              const isUrgent = complaint.severity === 'critical';
              
              return (
                <div key={complaint.id} className="px-4 py-3 transition-colors bg-card hover:bg-muted">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        {isUrgent && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-tight text-foreground">
                            {complaint.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Client: {complaint.clientName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {complaint.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 items-center flex-wrap">
                        <Badge 
                          variant={complaint.severity === 'critical' ? 'destructive' : 'secondary'} 
                          className={`text-xs px-2 py-0.5 ${severityColors[complaint.severity] || 'bg-muted text-foreground border-border'}`}
                        >
                          {complaint.severity ? complaint.severity.charAt(0).toUpperCase() + complaint.severity.slice(1) : 'Unknown'}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0.5 ${priorityColors[complaint.priority] || 'bg-muted text-foreground border-border'}`}
                        >
                          {complaint.priority ? complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1) : 'Normal'}
                        </Badge>
                        <Badge 
                          variant={complaint.status === 'open' ? 'destructive' : complaint.status === 'in_progress' ? 'default' : 'secondary'}
                          className="text-xs px-2 py-0.5"
                        >
                          {complaint.status ? complaint.status.replace('_', ' ').charAt(0).toUpperCase() + complaint.status.replace('_', ' ').slice(1) : 'Unknown'}
                        </Badge>
                        {complaint.escalationLevel > 1 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 text-red-600 border-red-200">
                            Level {complaint.escalationLevel}
                          </Badge>
                        )}
                        {complaint.isRegulatory && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 text-purple-600 border-purple-200">
                            Regulatory
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 ml-3">
                      <span className="text-xs text-muted-foreground">
                        {complaint.reportedDate ? formatDistanceToNow(new Date(complaint.reportedDate), { addSuffix: true }) : 'Unknown date'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Due: {complaint.targetResolutionDate ? formatDistanceToNow(new Date(complaint.targetResolutionDate), { addSuffix: true }) : 'Unknown date'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No complaints at this time</p>
            </div>
          )}
        </div>
        
        <CardFooter className="px-4 py-3 bg-muted flex justify-center">
          <Button variant="link" size="sm" className="text-xs font-medium text-primary hover:text-primary/90">
            View All Complaints
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}