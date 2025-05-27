import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { Clock, AlertTriangle, Calendar, Mail, CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(timeString: string) {
  const date = new Date(timeString);
  return format(date, "h:mm a");
}

function getTaskUrgencyScore(task: any) {
  const now = new Date();
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  
  if (!dueDate) return 0;
  
  const timeDiff = dueDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  // Overdue tasks get highest priority
  if (daysDiff < 0) return 1000 + Math.abs(daysDiff);
  
  // Due today
  if (daysDiff === 0) {
    if (task.priority === "high") return 900;
    if (task.priority === "medium") return 800;
    return 700;
  }
  
  // Due tomorrow or soon
  if (daysDiff <= 3) {
    if (task.priority === "high") return 600;
    if (task.priority === "medium") return 500;
    return 400;
  }
  
  return 100;
}

function getTaskStatusIcon(status: string) {
  switch (status?.toLowerCase()) {
    case "completed":
      return <CheckCircle className="h-3 w-3 text-green-600" />;
    case "in-progress":
      return <AlertCircle className="h-3 w-3 text-blue-600" />;
    default:
      return <XCircle className="h-3 w-3 text-slate-400" />;
  }
}

function getPriorityBadge(priority: string) {
  switch (priority?.toLowerCase()) {
    case "high":
      return <Badge variant="destructive" className="text-xs">High</Badge>;
    case "medium":
      return <Badge variant="secondary" className="text-xs">Medium</Badge>;
    case "low":
      return <Badge variant="outline" className="text-xs">Low</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">Normal</Badge>;
  }
}

export function AgendaCard() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d");
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleItem = (itemType: string, itemId: number) => {
    const key = `${itemType}-${itemId}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Fetch all required data
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });
  
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments/today'],
  });
  
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/portfolio-alerts'],
  });

  // Process and sort tasks by urgency
  const urgentTasks = tasks ? 
    [...tasks]
      .sort((a, b) => getTaskUrgencyScore(b) - getTaskUrgencyScore(a))
      .slice(0, 3) : [];

  // Sort appointments by time
  const todayAppointments = appointments ? 
    [...appointments]
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 3) : [];

  // Sort alerts by priority (assuming high priority alerts come first)
  const priorityAlerts = alerts ? 
    [...alerts]
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      })
      .slice(0, 3) : [];

  // Mock recent emails (in real implementation, this would come from communications API)
  const recentEmails = [
    {
      id: 1,
      subject: "Portfolio Review Request",
      clientName: "Arjun Kumar",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      subject: "Investment Query - Tax Saving",
      clientName: "Priya Patel", 
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      subject: "Meeting Reschedule Request",
      clientName: "Nisha Bajaj",
      timestamp: "6 hours ago"
    }
  ];

  const isLoading = tasksLoading || appointmentsLoading || alertsLoading;

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700">Today's Agenda</h2>
          <span className="text-xs text-slate-500">{formattedDate}</span>
        </div>
      </div>
      
      <div className="divide-y divide-slate-200">
        {/* 1. Urgent Tasks Section */}
        <Collapsible open={expandedSections.tasks} onOpenChange={() => toggleSection('tasks')}>
          <div className="px-4 py-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full p-0 h-auto justify-start hover:bg-transparent">
                <div className="flex items-center gap-2 w-full">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wide flex-1 text-left">Urgent Tasks</h3>
                  {expandedSections.tasks ? (
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            
            <div className="mt-2">
              {isLoading ? (
                <div className="space-y-2">
                  {Array(2).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : urgentTasks.length > 0 ? (
                <div className="space-y-2">
                  {urgentTasks.slice(0, 2).map((task) => {
                    const taskKey = `task-${task.id}`;
                    const isExpanded = expandedItems[taskKey];
                    return (
                      <div key={task.id}>
                        <div 
                          className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1 rounded"
                          onClick={() => toggleItem('task', task.id)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getTaskStatusIcon(task.status)}
                            <span className="truncate">{task.title}</span>
                          </div>
                          {getPriorityBadge(task.priority)}
                        </div>
                        {isExpanded && (
                          <div className="mt-2 ml-6 p-2 bg-orange-50 rounded-md text-xs">
                            <div className="space-y-1">
                              <div><span className="font-medium">Due:</span> {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No due date"}</div>
                              <div><span className="font-medium">Status:</span> {task.status}</div>
                              <div><span className="font-medium">Priority:</span> {task.priority}</div>
                              {task.description && <div><span className="font-medium">Details:</span> {task.description}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No urgent tasks</p>
              )}
            </div>
            
            <CollapsibleContent>
              {urgentTasks.length > 2 && (
                <div className="space-y-2 mt-2">
                  {urgentTasks.slice(2).map((task) => {
                    const taskKey = `task-${task.id}`;
                    const isExpanded = expandedItems[taskKey];
                    return (
                      <div key={task.id}>
                        <div 
                          className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1 rounded"
                          onClick={() => toggleItem('task', task.id)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getTaskStatusIcon(task.status)}
                            <span className="truncate">{task.title}</span>
                            <span className="text-slate-400 text-xs">Due: {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "No date"}</span>
                          </div>
                          {getPriorityBadge(task.priority)}
                        </div>
                        {isExpanded && (
                          <div className="mt-2 ml-6 p-2 bg-orange-50 rounded-md text-xs">
                            <div className="space-y-1">
                              <div><span className="font-medium">Due:</span> {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No due date"}</div>
                              <div><span className="font-medium">Status:</span> {task.status}</div>
                              <div><span className="font-medium">Priority:</span> {task.priority}</div>
                              {task.description && <div><span className="font-medium">Details:</span> {task.description}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* 2. Appointments Section */}
        <Collapsible open={expandedSections.appointments} onOpenChange={() => toggleSection('appointments')}>
          <div className="px-4 py-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full p-0 h-auto justify-start hover:bg-transparent">
                <div className="flex items-center gap-2 w-full">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wide flex-1 text-left">Appointments</h3>
                  {expandedSections.appointments ? (
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            
            <div className="mt-2">
              {isLoading ? (
                <div className="space-y-2">
                  {Array(2).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : todayAppointments.length > 0 ? (
                <div className="space-y-2">
                  {todayAppointments.slice(0, 2).map((appointment) => {
                    const appointmentKey = `appointment-${appointment.id}`;
                    const isExpanded = expandedItems[appointmentKey];
                    return (
                      <div key={appointment.id}>
                        <div 
                          className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1 rounded"
                          onClick={() => toggleItem('appointment', appointment.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">{appointment.title}</div>
                            <div className="text-slate-500">{appointment.clientName}</div>
                          </div>
                          <div className="text-slate-600 ml-2">
                            {formatTime(appointment.startTime)}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-2 ml-6 p-2 bg-blue-50 rounded-md text-xs">
                            <div className="space-y-1">
                              <div><span className="font-medium">Client:</span> {appointment.clientName}</div>
                              <div><span className="font-medium">Time:</span> {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</div>
                              <div><span className="font-medium">Duration:</span> {Math.round((new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime()) / (1000 * 60))} minutes</div>
                              {appointment.description && <div><span className="font-medium">Notes:</span> {appointment.description}</div>}
                              {appointment.location && <div><span className="font-medium">Location:</span> {appointment.location}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No appointments today</p>
              )}
            </div>
            
            <CollapsibleContent>
              {todayAppointments.length > 2 && (
                <div className="space-y-2 mt-2">
                  {todayAppointments.slice(2).map((appointment) => {
                    const appointmentKey = `appointment-${appointment.id}`;
                    const isExpanded = expandedItems[appointmentKey];
                    return (
                      <div key={appointment.id}>
                        <div 
                          className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-2 bg-blue-50 rounded-md"
                          onClick={() => toggleItem('appointment', appointment.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">{appointment.title}</div>
                            <div className="text-slate-500">{appointment.clientName}</div>
                          </div>
                          <div className="text-blue-600 text-xs font-medium">
                            {formatTime(appointment.startTime)}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-2 ml-6 p-2 bg-blue-100 rounded-md text-xs">
                            <div className="space-y-1">
                              <div><span className="font-medium">Client:</span> {appointment.clientName}</div>
                              <div><span className="font-medium">Time:</span> {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</div>
                              <div><span className="font-medium">Duration:</span> {Math.round((new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime()) / (1000 * 60))} minutes</div>
                              {appointment.description && <div><span className="font-medium">Notes:</span> {appointment.description}</div>}
                              {appointment.location && <div><span className="font-medium">Location:</span> {appointment.location}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* 3. Priority Alerts Section */}
        <Collapsible open={expandedSections.alerts} onOpenChange={() => toggleSection('alerts')}>
          <div className="px-4 py-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full p-0 h-auto justify-start hover:bg-transparent">
                <div className="flex items-center gap-2 w-full">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wide flex-1 text-left">Priority Alerts</h3>
                  {expandedSections.alerts ? (
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            
            <div className="mt-2">
              {isLoading ? (
                <div className="space-y-2">
                  {Array(2).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : priorityAlerts.length > 0 ? (
                <div className="space-y-2">
                  {priorityAlerts.slice(0, 2).map((alert) => {
                    const alertKey = `alert-${alert.id}`;
                    const isExpanded = expandedItems[alertKey];
                    return (
                      <div key={alert.id}>
                        <div 
                          className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1 rounded"
                          onClick={() => toggleItem('alert', alert.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{alert.title}</div>
                          </div>
                          <Badge 
                            variant={alert.priority === "high" ? "destructive" : "secondary"} 
                            className="text-xs ml-2"
                          >
                            {alert.priority}
                          </Badge>
                        </div>
                        {isExpanded && (
                          <div className="mt-2 ml-6 p-2 bg-red-50 rounded-md text-xs">
                            <div className="space-y-1">
                              <div><span className="font-medium">Priority:</span> {alert.priority ? alert.priority.toUpperCase() : "HIGH"}</div>
                              <div><span className="font-medium">Category:</span> {alert.category || "Portfolio Management"}</div>
                              <div><span className="font-medium">Details:</span> {alert.description || "This alert requires immediate attention from the relationship manager."}</div>
                              <div><span className="font-medium">Action Required:</span> Review portfolio allocation and contact client if necessary</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No alerts</p>
              )}
            </div>
            
            <CollapsibleContent>
              {priorityAlerts.length > 2 && (
                <div className="space-y-2 mt-2">
                  {priorityAlerts.slice(2).map((alert) => {
                    const alertKey = `alert-${alert.id}`;
                    const isExpanded = expandedItems[alertKey];
                    return (
                      <div key={alert.id}>
                        <div 
                          className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-2 bg-red-50 rounded-md"
                          onClick={() => toggleItem('alert', alert.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">{alert.title}</div>
                          </div>
                          <Badge 
                            variant={alert.priority === "high" ? "destructive" : "secondary"} 
                            className="text-xs"
                          >
                            {alert.priority}
                          </Badge>
                        </div>
                        {isExpanded && (
                          <div className="mt-2 ml-6 p-2 bg-red-100 rounded-md text-xs">
                            <div className="space-y-1">
                              <div><span className="font-medium">Priority:</span> {alert.priority ? alert.priority.toUpperCase() : "HIGH"}</div>
                              <div><span className="font-medium">Category:</span> {alert.category || "Portfolio Management"}</div>
                              <div><span className="font-medium">Details:</span> {alert.description || "This alert requires immediate attention from the relationship manager."}</div>
                              <div><span className="font-medium">Action Required:</span> Review portfolio allocation and contact client if necessary</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* 4. Recent Customer Emails Section */}
        <Collapsible open={expandedSections.emails} onOpenChange={() => toggleSection('emails')}>
          <div className="px-4 py-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full p-0 h-auto justify-start hover:bg-transparent">
                <div className="flex items-center gap-2 w-full">
                  <Mail className="h-4 w-4 text-green-600" />
                  <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wide flex-1 text-left">Recent Emails</h3>
                  {expandedSections.emails ? (
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            
            <div className="mt-2">
              <div className="space-y-2">
                {recentEmails.slice(0, 2).map((email) => {
                  const emailKey = `email-${email.id}`;
                  const isExpanded = expandedItems[emailKey];
                  return (
                    <div key={email.id}>
                      <div 
                        className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1 rounded"
                        onClick={() => toggleItem('email', email.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{email.subject}</div>
                          <div className="text-slate-500">{email.clientName}</div>
                        </div>
                        <div className="text-slate-600 ml-2">
                          {email.timestamp}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-2 ml-6 p-2 bg-green-50 rounded-md text-xs">
                          <div className="space-y-1">
                            <div><span className="font-medium">From:</span> {email.clientName}</div>
                            <div><span className="font-medium">Subject:</span> {email.subject}</div>
                            <div><span className="font-medium">Received:</span> {email.timestamp}</div>
                            <div><span className="font-medium">Preview:</span> This email contains important queries about portfolio performance and investment strategies that require your attention.</div>
                            <div><span className="font-medium">Action:</span> Click to open full email in communications center</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <CollapsibleContent>
              {recentEmails.length > 2 && (
                <div className="space-y-2 mt-2">
                  {recentEmails.slice(2).map((email) => {
                    const emailKey = `email-${email.id}`;
                    const isExpanded = expandedItems[emailKey];
                    return (
                      <div key={email.id}>
                        <div 
                          className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-2 bg-green-50 rounded-md"
                          onClick={() => toggleItem('email', email.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">{email.subject}</div>
                            <div className="text-slate-500">{email.clientName}</div>
                          </div>
                          <div className="text-green-600 text-xs font-medium">
                            {email.timestamp}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-2 ml-6 p-2 bg-green-100 rounded-md text-xs">
                            <div className="space-y-1">
                              <div><span className="font-medium">From:</span> {email.clientName}</div>
                              <div><span className="font-medium">Subject:</span> {email.subject}</div>
                              <div><span className="font-medium">Received:</span> {email.timestamp}</div>
                              <div><span className="font-medium">Preview:</span> This email contains important queries about portfolio performance and investment strategies that require your attention.</div>
                              <div><span className="font-medium">Action:</span> Click to open full email in communications center</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </Card>
  );
}