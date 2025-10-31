import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, User } from "lucide-react";
import { format } from "date-fns";

interface Complaint {
  id: number;
  clientId: number;
  clientName: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  assignedTo: number;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date | null;
}

export function ComplaintsCard() {
  const [showAll, setShowAll] = useState(false);

  const { data: complaints, isLoading: complaintsLoading } = useQuery<Complaint[]>({
    queryKey: ['/api/complaints'],
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-primary/10 text-primary border-primary/30';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const displayedComplaints = showAll ? complaints : complaints?.slice(0, 3);
  const openComplaints = complaints?.filter(c => c.status === 'open').length || 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-medium text-slate-700">Client Complaints</h2>
            {!complaintsLoading && openComplaints > 0 && (
              <Badge variant="destructive" className="text-xs">
                {openComplaints} Open
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
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
          ) : displayedComplaints && displayedComplaints.length > 0 ? (
            displayedComplaints.map((complaint) => {
              const isUrgent = complaint.severity === 'critical';
              
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
                          <div className="flex items-center gap-1 mt-1">
                            <User className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">{complaint.clientName}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getSeverityColor(complaint.severity)}`}
                        >
                          {complaint.severity.charAt(0).toUpperCase() + complaint.severity.slice(1)}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(complaint.status)}`}
                        >
                          {complaint.status.replace('_', ' ').charAt(0).toUpperCase() + complaint.status.replace('_', ' ').slice(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-slate-500 ml-2">
                      <Clock className="h-3 w-3" />
                      <span>{complaint.createdAt ? format(new Date(complaint.createdAt), 'MMM d') : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <AlertTriangle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No complaints at this time</p>
            </div>
          )}
        </div>
      </CardContent>

      {complaints && complaints.length > 3 && (
        <CardFooter className="px-4 py-3 border-t border-slate-200 bg-slate-50">
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs font-medium text-primary-600 hover:text-primary-700 w-full"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? `Show Less` : `View All ${complaints.length} Complaints`}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}