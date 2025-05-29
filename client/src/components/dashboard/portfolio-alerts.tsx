import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getSeverityColor, formatRelativeDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, AlertTriangle, User, Clock } from "lucide-react";

interface PortfolioAlert {
  id: number;
  title: string;
  description: string;
  clientId: number;
  severity: string;
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
  severity: string;
  status: string;
  priority: string;
  reportedDate: string;
  targetResolutionDate: string;
  reportedVia: string;
  escalationLevel: number;
  isRegulatory: boolean;
  resolutionRating: number | null;
}

export function PortfolioAlerts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [complaintsOpen, setComplaintsOpen] = useState(false);
  
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['/api/portfolio-alerts'],
  });

  const { data: complaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ['/api/complaints'],
  });
  
  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, read }: { id: number, read: boolean }) => {
      await apiRequest("PUT", `/api/portfolio-alerts/${id}`, { read });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio-alerts'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update alert status. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleDismiss = (alert: PortfolioAlert) => {
    updateAlertMutation.mutate({ id: alert.id, read: true });
  };
  
  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <Badge variant="destructive">3 New</Badge>;
      case 'warning':
        return <Badge variant="secondary">New</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700">Portfolio Alerts</h2>
          {!isLoading && alerts?.some((alert: PortfolioAlert) => !alert.read) && (
            <Badge variant="destructive">
              {alerts.filter((alert: PortfolioAlert) => !alert.read).length} New
            </Badge>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-slate-200">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="px-4 py-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))
        ) : alerts && alerts.length > 0 ? (
          alerts.slice(0, 3).map((alert: PortfolioAlert) => {
            const severityColors = getSeverityColor(alert.severity);
            const isCritical = alert.severity === "critical";
            
            return (
              <div 
                key={alert.id} 
                className={`px-4 py-3 ${isCritical ? `bg-red-50 border-l-4 ${severityColors.border}` : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{alert.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{alert.description}</p>
                    <div className="mt-2 flex space-x-2">
                      <Button 
                        size="sm" 
                        className="inline-flex items-center px-2 py-1 shadow-sm text-white"
                      >
                        {alert.severity === "critical" ? "Review" : 
                         alert.severity === "warning" ? "Adjust Portfolio" : "Reinvestment Options"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="inline-flex items-center px-2 py-1 border border-slate-300 text-xs font-medium bg-white text-slate-700 hover:bg-slate-50"
                        onClick={() => handleDismiss(alert)}
                      >
                        {alert.severity === "critical" ? "Dismiss" : 
                         alert.severity === "warning" ? "Later" : "Remind Later"}
                      </Button>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{formatRelativeDate(alert.createdAt)}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-slate-500">No portfolio alerts</p>
          </div>
        )}
      </div>
      
      <CardFooter className="px-4 py-3 bg-slate-50 flex justify-center">
        <Button variant="link" size="sm" className="text-xs font-medium text-primary-600 hover:text-primary-700">
          View All Alerts
        </Button>
      </CardFooter>
    </Card>

    {/* Complaints Section */}
    <Card className="overflow-hidden mt-4">
      <Collapsible open={complaintsOpen} onOpenChange={setComplaintsOpen}>
        <CollapsibleTrigger asChild>
          <div className="px-4 py-3 border-b border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h2 className="text-sm font-medium text-slate-700">Complaints</h2>
                {!complaintsLoading && complaints && complaints.length > 0 && (
                  <Badge variant="destructive">{complaints.filter((c: Complaint) => c.status === 'open').length} Open</Badge>
                )}
              </div>
              {complaintsOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="divide-y divide-slate-200">
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
              complaints.slice(0, 3).map((complaint: Complaint) => {
                const isUrgent = complaint.priority === 'urgent';
                const isCritical = complaint.severity === 'critical';
                const isRegulatory = complaint.isRegulatory;
                
                return (
                  <div 
                    key={complaint.id} 
                    className={`px-4 py-3 ${isUrgent ? 'bg-red-50 border-l-4 border-l-red-500' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-slate-800">{complaint.title}</p>
                          {isRegulatory && (
                            <Badge variant="outline" className="text-xs">Regulatory</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                          <User className="h-3 w-3" />
                          <span>{complaint.clientName}</span>
                          <span>•</span>
                          <span className="capitalize">{complaint.category.replace('_', ' ')}</span>
                        </div>
                        
                        <p className="text-xs text-slate-600 mb-2">{complaint.description}</p>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={
                              complaint.severity === 'critical' ? 'destructive' : 
                              complaint.severity === 'high' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {complaint.severity.toUpperCase()}
                          </Badge>
                          <Badge 
                            variant={
                              complaint.status === 'open' ? 'destructive' : 
                              complaint.status === 'in_progress' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {complaint.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {complaint.escalationLevel > 1 && (
                            <Badge variant="outline" className="text-xs">
                              L{complaint.escalationLevel}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Reported {formatRelativeDate(complaint.reportedDate)}</span>
                          </div>
                          {complaint.targetResolutionDate && (
                            <span>Due: {formatRelativeDate(complaint.targetResolutionDate)}</span>
                          )}
                        </div>
                        
                        <div className="mt-2 flex space-x-2">
                          <Button 
                            size="sm" 
                            className="inline-flex items-center px-2 py-1 shadow-sm text-white text-xs"
                          >
                            {complaint.status === 'open' ? 'Investigate' : 'Follow Up'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="inline-flex items-center px-2 py-1 border border-slate-300 text-xs font-medium bg-white text-slate-700 hover:bg-slate-50"
                          >
                            Contact Client
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-slate-500">No complaints</p>
              </div>
            )}
          </div>
          
          {complaints && complaints.length > 3 && (
            <div className="px-4 py-3 bg-slate-50 flex justify-center border-t">
              <Button variant="link" size="sm" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                View All {complaints.length} Complaints
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
