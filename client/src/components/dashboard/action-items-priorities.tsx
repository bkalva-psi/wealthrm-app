import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Calendar, CheckSquare, Users, AlertCircle, AlertTriangle } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

export function ActionItemsPriorities() {
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d");
  const [isOpen, setIsOpen] = useState(true);
  
  // Fetch all data types for comprehensive action items
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments/today'],
  });
  
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });
  
  const { data: weekClosures, isLoading: closuresLoading } = useQuery({
    queryKey: ['/api/action-items/deal-closures'],
  });
  
  const { data: priorityAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/portfolio-alerts'],
  });
  
  const { data: urgentComplaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ['/api/complaints'],
  });
  
  const isLoading = appointmentsLoading || tasksLoading || closuresLoading || alertsLoading || complaintsLoading;
  
  // Organize data into actionable categories
  const actionCategories = {
    appointments: {
      title: 'Upcoming Meetings',
      count: appointments?.length || 0,
      items: appointments || [],
      icon: Calendar,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 border-blue-200',
      description: 'Client meetings and calls scheduled for today'
    },
    tasks: {
      title: 'Urgent Tasks',
      count: tasks?.filter(task => task.priority === 'high' || task.priority === 'urgent').length || 0,
      items: tasks?.filter(task => task.priority === 'high' || task.priority === 'urgent') || [],
      icon: CheckSquare,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50 border-amber-200',
      description: 'High-priority tasks and overdue items requiring immediate attention'
    },
    closures: {
      title: 'Expected Closures',
      count: weekClosures?.length || 0,
      items: weekClosures || [],
      icon: Users,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-200',
      description: 'Deal closures and prospect conversions expected this week'
    },
    complaints: {
      title: 'Customer Complaints',
      count: urgentComplaints?.filter(complaint => complaint.severity === 'high' || complaint.severity === 'urgent').length || 0,
      items: urgentComplaints?.filter(complaint => complaint.severity === 'high' || complaint.severity === 'urgent') || [],
      icon: AlertTriangle,
      color: 'text-red-700',
      bgColor: 'bg-red-50 border-red-200',
      description: 'Urgent customer complaints requiring immediate resolution'
    },
    alerts: {
      title: 'Priority Alerts',
      count: priorityAlerts?.length || 0,
      items: priorityAlerts || [],
      icon: AlertCircle,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50 border-orange-200',
      description: 'Portfolio alerts and client issues requiring immediate review'
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="p-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const totalActionItems = Object.values(actionCategories).reduce((sum, category) => sum + category.count, 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Action Items & Priorities
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  {totalActionItems}
                </span>
              </CardTitle>
              <span className="text-xs text-slate-500">{formattedDate}</span>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="p-3 space-y-3">
            {Object.entries(actionCategories).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <Collapsible key={key}>
                  <div className={cn("border rounded-lg", category.bgColor)}>
                    <CollapsibleTrigger asChild>
                      <div className="p-3 hover:bg-white/50 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", category.color)} />
                            <span className="text-sm font-medium">{category.title}</span>
                            {category.count > 0 && (
                              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", category.color, "bg-white")}>
                                {category.count}
                              </span>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{category.description}</p>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-3 pb-3 space-y-2">
                        {category.items.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">No items at this time</p>
                        ) : (
                          category.items.slice(0, 5).map((item, index) => (
                            <div key={index} className="bg-white rounded p-2 border border-slate-100">
                              {key === 'appointments' && (
                                <div>
                                  <div className="font-medium text-sm">{item.title}</div>
                                  <div className="text-xs text-slate-600">
                                    {item.clientName} • {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                  </div>
                                </div>
                              )}
                              
                              {key === 'tasks' && (
                                <div>
                                  <div className="font-medium text-sm">{item.title}</div>
                                  <div className="text-xs text-slate-600">
                                    Priority: {item.priority} • Status: {item.status}
                                  </div>
                                </div>
                              )}
                              
                              {key === 'closures' && (
                                <div>
                                  <div className="font-medium text-sm">{item.client_name}</div>
                                  <div className="text-xs text-slate-600">
                                    Expected: ₹{(item.expected_amount / 100000).toFixed(1)}L • {format(new Date(item.expected_close_date), 'MMM dd')}
                                  </div>
                                </div>
                              )}
                              
                              {key === 'complaints' && (
                                <div>
                                  <div className="font-medium text-sm">{item.subject}</div>
                                  <div className="text-xs text-slate-600">
                                    {item.clientName} • {item.severity} • {item.status}
                                  </div>
                                </div>
                              )}
                              
                              {key === 'alerts' && (
                                <div>
                                  <div className="font-medium text-sm">{item.title}</div>
                                  <div className="text-xs text-slate-600">
                                    Priority: {item.priority}
                                    {item.clientName && ` • Client: ${item.clientName}`}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
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