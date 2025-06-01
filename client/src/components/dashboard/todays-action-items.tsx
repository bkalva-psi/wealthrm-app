import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Calendar, CheckSquare, Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: number;
  title: string;
  clientName: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface Task {
  id: number;
  title: string;
  priority: string;
  dueDate: string;
  status: string;
}

interface DealClosure {
  id: number;
  client_name: string;
  expected_amount: number;
  expected_close_date: string;
  status: string;
}

interface Alert {
  id: number;
  title: string;
  priority: string;
  clientName?: string;
}

export function TodaysActionItems() {
  const [isMainCardExpanded, setIsMainCardExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Fetch today's appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments/today']
  });

  // Fetch urgent tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks']
  });

  // Fetch deal closures for this week
  const { data: dealClosures = [], isLoading: dealClosuresLoading } = useQuery({
    queryKey: ['/api/action-items/deal-closures']
  });

  // Fetch portfolio alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/portfolio-alerts']
  });

  const isLoading = appointmentsLoading || tasksLoading || dealClosuresLoading || alertsLoading;

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatTime = (timeString: string) => {
    try {
      return format(new Date(timeString), 'h:mm a');
    } catch {
      return timeString;
    }
  };

  // Filter urgent tasks (pending status)
  const urgentTasks = tasks.filter((task: Task) => 
    task.status === 'pending' || task.status === 'in_progress'
  ).slice(0, 3);

  // Filter high priority alerts
  const priorityAlerts = alerts.filter((alert: Alert) => 
    alert.priority === 'high' || alert.priority === 'critical'
  ).slice(0, 3);

  // Today's deal closures
  const todayClosures = dealClosures.filter((closure: DealClosure) => {
    const closeDate = new Date(closure.expected_close_date);
    const today = new Date();
    return closeDate.toDateString() === today.toDateString();
  });

  const sectionsConfig = {
    appointments: {
      title: 'Today\'s Appointments',
      count: appointments.length,
      items: appointments,
      icon: Calendar,
      color: 'text-teal-700',
      bgColor: 'bg-teal-50 border-teal-200',
      description: 'Scheduled client meetings and consultations for today'
    },
    tasks: {
      title: 'Urgent Tasks',
      count: urgentTasks.length,
      items: urgentTasks,
      icon: CheckSquare,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50 border-amber-200',
      description: 'High-priority tasks requiring immediate attention'
    },
    closures: {
      title: 'Expected Closures',
      count: todayClosures.length,
      items: todayClosures,
      icon: Users,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-200',
      description: 'Deal closures expected today and this week'
    },
    alerts: {
      title: 'Priority Alerts',
      count: priorityAlerts.length,
      items: priorityAlerts,
      icon: AlertCircle,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50 border-orange-200',
      description: 'Portfolio and client alerts requiring immediate review'
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading today's action items...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isMainCardExpanded} onOpenChange={setIsMainCardExpanded}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Today's Action Items</CardTitle>
              {isMainCardExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            {Object.entries(sectionsConfig).map(([key, config]) => {
              const isExpanded = expandedSections.has(key);
              const IconComponent = config.icon;
              
              return (
                <Collapsible key={key} open={isExpanded} onOpenChange={() => toggleSection(key)}>
                  <div className={`rounded-lg border p-3 ${config.bgColor}`}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-0 h-auto hover:bg-transparent"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg bg-white/60 ${config.color}`}>
                            <IconComponent size={18} />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-sm">{config.title}</h3>
                            <p className={`text-lg font-bold ${config.color}`}>
                              {config.count} {config.count === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-3">
                      <div className="text-sm text-muted-foreground mb-3">
                        {config.description}
                      </div>
                      
                      <div className="space-y-2">
                        {config.items.length === 0 ? (
                          <div className="text-sm text-muted-foreground italic">
                            No {config.title.toLowerCase()} for today
                          </div>
                        ) : (
                          config.items.map((item: any, index: number) => (
                            <div key={item.id || index} className="bg-white/70 rounded p-2 text-sm">
                              {key === 'appointments' && (
                                <div>
                                  <div className="font-medium">{item.title}</div>
                                  <div className="text-muted-foreground">
                                    {item.clientName} • {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                  </div>
                                </div>
                              )}
                              
                              {key === 'tasks' && (
                                <div>
                                  <div className="font-medium">{item.title}</div>
                                  <div className="text-muted-foreground">
                                    Priority: {item.priority} • Status: {item.status}
                                  </div>
                                </div>
                              )}
                              
                              {key === 'closures' && (
                                <div>
                                  <div className="font-medium">{item.client_name}</div>
                                  <div className="text-muted-foreground">
                                    Expected: {formatCurrency(item.expected_amount)} • {format(new Date(item.expected_close_date), 'MMM dd')}
                                  </div>
                                </div>
                              )}
                              
                              {key === 'alerts' && (
                                <div>
                                  <div className="font-medium">{item.title}</div>
                                  <div className="text-muted-foreground">
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