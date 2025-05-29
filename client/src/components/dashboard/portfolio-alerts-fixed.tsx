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
    critical: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-blue-100 text-blue-800 border-blue-200"
  };

  const priorityColors = {
    urgent: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    normal: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-blue-100 text-blue-800 border-blue-200"
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <CardTitle className="text-sm font-medium text-slate-700">Priority Alerts</CardTitle>
            {!isLoading && alerts && alerts.length > 0 && (
              <Badge variant="destructive">{alerts.filter(alert => !alert.read).length} Unread</Badge>
            )}
          </div>
        </CardHeader>
        
        <div className="divide-y divide-slate-200">
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
                <div key={alert.id} className={`px-4 py-3 transition-colors ${alert.read ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        {isUrgent && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className={`text-sm font-medium leading-tight ${alert.read ? 'text-slate-500' : 'text-slate-900'}`}>
                            {alert.title}
                          </p>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 items-center">
                        <Badge 
                          variant={alert.severity === 'critical' ? 'destructive' : 'secondary'} 
                          className={`text-xs px-2 py-0.5 ${severityColors[alert.severity] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                        >
                          {alert.severity ? alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1) : 'Unknown'}
                        </Badge>
                        {alert.actionRequired && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 text-orange-600 border-orange-200">
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 ml-3">
                      <span className="text-xs text-slate-500">
                        {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }) : 'Unknown time'}
                      </span>
                      {!alert.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="h-6 px-2 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50"
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
              <AlertTriangle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No alerts at this time</p>
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
        <div className="px-4 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-medium text-slate-700">Complaints</h2>
            {!complaintsLoading && complaints && complaints.length > 0 && (
              <Badge variant="destructive">{complaints.filter((c) => c.status === 'open').length} Open</Badge>
            )}
          </div>
        </div>
        
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
            complaints.slice(0, 3).map((complaint) => {
              const isUrgent = complaint.priority === 'urgent';
              
              return (
                <div key={complaint.id} className="px-4 py-3 transition-colors bg-white hover:bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        {isUrgent && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-tight text-slate-900">
                            {complaint.title}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            Client: {complaint.clientName}
                          </p>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {complaint.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 items-center flex-wrap">
                        <Badge 
                          variant={complaint.severity === 'critical' ? 'destructive' : 'secondary'} 
                          className={`text-xs px-2 py-0.5 ${severityColors[complaint.severity] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                        >
                          {complaint.severity ? complaint.severity.charAt(0).toUpperCase() + complaint.severity.slice(1) : 'Unknown'}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0.5 ${priorityColors[complaint.priority] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
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
                      <span className="text-xs text-slate-500">
                        {complaint.reportedDate ? formatDistanceToNow(new Date(complaint.reportedDate), { addSuffix: true }) : 'Unknown date'}
                      </span>
                      <span className="text-xs text-slate-500">
                        Due: {complaint.targetResolutionDate ? formatDistanceToNow(new Date(complaint.targetResolutionDate), { addSuffix: true }) : 'Unknown date'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <AlertTriangle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No complaints at this time</p>
            </div>
          )}
        </div>
        
        <CardFooter className="px-4 py-3 bg-slate-50 flex justify-center">
          <Button variant="link" size="sm" className="text-xs font-medium text-primary-600 hover:text-primary-700">
            View All Complaints
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}