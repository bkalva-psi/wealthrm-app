import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardCard, TaskCard } from "@/components/ui/standard-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, ChevronDown, ChevronUp, AlertTriangle, CheckSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isToday, isAfter, isBefore, isYesterday, addDays } from "date-fns";

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  clientId?: number;
  prospectId?: number;
  priority?: string;
  status?: string;
  assignedTo?: string;
  notes?: string;
}

// NEW UPDATED Tasks page with two-card layout
export default function TasksUpdated() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dueDateFilter, setDueDateFilter] = useState("all");
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
  });
  
  // Collapsible state for cards - start expanded
  const [tasksCollapsed, setTasksCollapsed] = useState(false);
  const [alertsCollapsed, setAlertsCollapsed] = useState(false);
  
  // Item expansion state and list visibility
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [expandedAlerts, setExpandedAlerts] = useState<Set<number>>(new Set());
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Set page title and force reload indicator
  useEffect(() => {
    document.title = "Tasks | Wealth RM - NEW VERSION";
    console.log("NEW UPDATED TASKS PAGE LOADED SUCCESSFULLY");
  }, []);
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/tasks', { completed: statusFilter === 'completed' ? true : statusFilter === 'pending' ? false : undefined }],
  });

  const { data: portfolioAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/portfolio-alerts'],
  });

  // Filtered tasks based on search and filters
  const filteredTasks = (tasks as Task[] || []).filter((task: Task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && task.completed) ||
      (statusFilter === 'pending' && !task.completed);
    
    // Priority filter (assuming tasks have priority field)
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    // Due date filter
    let matchesDueDate = true;
    if (dueDateFilter !== 'all' && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const tomorrow = addDays(today, 1);
      const endOfWeek = addDays(today, 7 - today.getDay());
      const endOfNextWeek = addDays(endOfWeek, 7);
      
      switch (dueDateFilter) {
        case 'overdue':
          matchesDueDate = isBefore(dueDate, today);
          break;
        case 'today':
          matchesDueDate = isToday(dueDate);
          break;
        case 'tomorrow':
          matchesDueDate = isToday(tomorrow) && isToday(dueDate);
          break;
        case 'this_week':
          matchesDueDate = !isBefore(dueDate, today) && !isAfter(dueDate, endOfWeek);
          break;
        case 'next_week':
          matchesDueDate = !isBefore(dueDate, endOfWeek) && !isAfter(dueDate, endOfNextWeek);
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDueDate;
  });

  // Filtered alerts based on search
  const filteredAlerts = (portfolioAlerts as any[] || []).filter((alert: any) => 
    alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      await apiRequest("PUT", `/api/tasks/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      await apiRequest("POST", "/api/tasks", taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task created",
        description: "New task has been created successfully.",
      });
      setIsNewTaskDialogOpen(false);
      setNewTask({
        title: "",
        description: "",
        dueDate: format(new Date(), "yyyy-MM-dd"),
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleTaskToggle = (task: Task, completed: boolean) => {
    updateTaskMutation.mutate({ id: task.id, completed });
  };

  // Helper functions for item expansion
  const toggleTaskExpansion = (taskId: number) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };
  
  const toggleAlertExpansion = (alertId: number) => {
    setExpandedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };
  
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Task title is required.",
        variant: "destructive",
      });
      return;
    }
    
    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate + 'T00:00:00.000Z',
      completed: false,
    });
  };
  
  const getDueStatus = (dueDate?: string) => {
    if (!dueDate) return { text: "No due date", color: "text-slate-500" };
    
    const date = new Date(dueDate);
    const today = new Date();
    
    if (isToday(date)) {
      return { text: "Due today", color: "text-orange-600 font-medium" };
    } else if (isYesterday(date)) {
      return { text: "Overdue", color: "text-red-600 font-medium" };
    } else if (isBefore(date, today)) {
      return { text: "Overdue", color: "text-red-600 font-medium" };
    } else if (isAfter(date, addDays(today, 7))) {
      return { text: `Due: ${format(date, "MMM d")}`, color: "text-slate-600" };
    } else {
      return { text: `Due: ${format(date, "MMM d")}`, color: "text-slate-600" };
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Tasks</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
            <DialogTrigger asChild>
            <Button size="icon" className="rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your list. Fill out the details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter task title" 
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter task description" 
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input 
                    id="dueDate" 
                    type="date" 
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Tasks Card */}
        <Card>
          <CardHeader className="sticky top-0 bg-white z-10 border-b">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setTasksCollapsed(!tasksCollapsed)}>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                Tasks ({(tasks as Task[] || []).filter(task => !task.completed).length})
              </CardTitle>
              <Button variant="ghost" size="sm">
                {tasksCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
            {!tasksCollapsed && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue placeholder="Due Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="next_week">Next Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardHeader>
          
          {!tasksCollapsed && (
            <CardContent>
              
              {isLoading ? (
                <div className="space-y-4">
                  {Array(2).fill(0).map((_, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-md">
                      <Skeleton className="h-4 w-4 mt-1" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const currentFilteredTasks = filteredTasks.filter(task => !task.completed);
                    const tasksToShow = showAllTasks ? currentFilteredTasks : currentFilteredTasks.slice(0, 2);
                    
                    return currentFilteredTasks.length > 0 ? (
                      <>
                        {tasksToShow.map((task: Task, index: number) => {
                          const dueStatus = getDueStatus(task.dueDate);
                          
                          return (
                            <TaskCard
                              key={`task-${task.id}-${index}`}
                              task={{
                                ...task,
                                status: task.completed ? 'completed' : 
                                        dueStatus.text === 'Overdue' ? 'overdue' : 'pending'
                              }}
                              onComplete={(task) => handleTaskToggle(task, true)}
                              onEdit={(task) => {
                                setNewTask({
                                  title: task.title,
                                  description: task.description || '',
                                  dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
                                });
                                setIsNewTaskDialogOpen(true);
                              }}
                              onView={(task) => {
                                alert(`Task Details:\n\nTitle: ${task.title}\nDescription: ${task.description || 'No description'}\nDue Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}\nStatus: ${task.status}\nClient: ${task.clientName || 'Not assigned'}`);
                              }}
                            />
                          );
                        })}
                        
                        {/* Show More/Less button for Tasks */}
                        {currentFilteredTasks.length > 2 && (
                          <div className="pt-2 border-t border-slate-100">
                            <Button 
                              variant="ghost" 
                              onClick={() => setShowAllTasks(!showAllTasks)}
                              className="w-full text-blue-600 hover:text-blue-700 h-8 text-sm"
                            >
                              {showAllTasks ? 'Show less' : `Show ${currentFilteredTasks.length - 2} more`}
                            </Button>
                          </div>
                        )}

                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-500">No tasks to display</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setIsNewTaskDialogOpen(true)}
                        >
                          Create a task
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Portfolio Alerts Card */}
        <Card>
          <CardHeader className="cursor-pointer sticky top-16 bg-white z-10 border-b" onClick={() => setAlertsCollapsed(!alertsCollapsed)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Portfolio Alerts ({(portfolioAlerts as any[] || []).length})
              </CardTitle>
              <Button variant="ghost" size="sm">
                {alertsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          
          {!alertsCollapsed && (
            <CardContent>
              {alertsLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-md">
                      <Skeleton className="h-4 w-4 mt-1" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const alerts = (portfolioAlerts as any[] || []);
                    const alertsToShow = showAllAlerts ? alerts : alerts.slice(0, 2);
                    
                    return alerts.length > 0 ? (
                      <>
                        {alertsToShow.map((alert: any) => (
                          <StandardCard
                            key={alert.id}
                            title={alert.title}
                            subtitle={alert.client_name ? `Client: ${alert.client_name}` : undefined}
                            status={{
                              label: alert.severity,
                              variant: alert.severity === 'high' ? 'destructive' : 
                                      alert.severity === 'medium' ? 'default' : 'secondary'
                            }}
                            summary={
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {alert.message}
                              </p>
                            }
                            details={
                              alert.created_at && (
                                <div className="text-sm">
                                  <p className="text-muted-foreground mb-1">Created</p>
                                  <p>{new Date(alert.created_at).toLocaleDateString()}</p>
                                </div>
                              )
                            }
                            actions={
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                                <Button variant="default" size="sm">
                                  Resolve
                                </Button>
                              </div>
                            }
                          />
                        ))}
                        
                        {/* Show More/Less button for Portfolio Alerts */}
                        {alerts.length > 2 && (
                          <div className="pt-2 border-t border-slate-100">
                            <Button 
                              variant="ghost" 
                              onClick={() => setShowAllAlerts(!showAllAlerts)}
                              className="w-full text-blue-600 hover:text-blue-700 h-8 text-sm"
                            >
                              {showAllAlerts ? 'Show less' : `Show ${alerts.length - 2} more`}
                            </Button>
                          </div>
                        )}

                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-500">No portfolio alerts at this time</p>
                        <p className="text-xs text-slate-400 mt-2">Your clients' portfolios are performing well</p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}