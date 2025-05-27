import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Clock, AlertTriangle, Calendar, Mail, CheckCircle, AlertCircle, XCircle } from "lucide-react";
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
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d");
  
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
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wide">Urgent Tasks</h3>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              {Array(2).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : urgentTasks.length > 0 ? (
            <div className="space-y-2">
              {urgentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getTaskStatusIcon(task.status)}
                    <span className="truncate">{task.title}</span>
                  </div>
                  {getPriorityBadge(task.priority)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No urgent tasks</p>
          )}
        </div>

        {/* 2. Appointments Section */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wide">Appointments</h3>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              {Array(2).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : todayAppointments.length > 0 ? (
            <div className="space-y-2">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{appointment.title}</div>
                    <div className="text-slate-500">{appointment.clientName}</div>
                  </div>
                  <div className="text-slate-600 ml-2">
                    {formatTime(appointment.startTime)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No appointments today</p>
          )}
        </div>

        {/* 3. Priority Alerts Section */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wide">Priority Alerts</h3>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              {Array(2).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : priorityAlerts.length > 0 ? (
            <div className="space-y-2">
              {priorityAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between text-xs">
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
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No alerts</p>
          )}
        </div>

        {/* 4. Recent Customer Emails Section */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-green-600" />
            <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wide">Recent Emails</h3>
          </div>
          
          <div className="space-y-2">
            {recentEmails.map((email) => (
              <div key={email.id} className="flex items-center justify-between text-xs">
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{email.subject}</div>
                  <div className="text-slate-500">{email.clientName}</div>
                </div>
                <div className="text-slate-600 ml-2">
                  {email.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}