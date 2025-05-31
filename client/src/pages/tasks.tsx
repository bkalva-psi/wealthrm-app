import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, CalendarDays, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, AlertTriangle, CheckSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { format, isToday, isAfter, isBefore, isYesterday, addDays } from "date-fns";

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  clientId?: number;
  prospectId?: number;
}

// Updated Tasks page with two-card layout
export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
  });
  
  // Collapsible state for cards
  const [tasksCollapsed, setTasksCollapsed] = useState(false);
  const [alertsCollapsed, setAlertsCollapsed] = useState(false);
  
  // Pagination state
  const [tasksVisibleCount, setTasksVisibleCount] = useState(2);
  const [alertsVisibleCount, setAlertsVisibleCount] = useState(5);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Set page title and force reload indicator
  useEffect(() => {
    document.title = "Tasks | Wealth RM - Updated";
    console.log("NEW TASKS PAGE LOADED");
  }, []);
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const { data: portfolioAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/portfolio-alerts'],
  });
  
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
  
  const filterTasks = (tasks: Task[] | undefined, status: string) => {
    if (!tasks) return [];
    
    let filtered = [...tasks];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by tab
    switch (status) {
      case "upcoming":
        return filtered.filter(task => 
          !task.completed && 
          task.dueDate && 
          isAfter(new Date(task.dueDate), new Date())
        );
      case "today":
        return filtered.filter(task => 
          !task.completed && 
          task.dueDate && 
          isToday(new Date(task.dueDate))
        );
      case "overdue":
        return filtered.filter(task => 
          !task.completed && 
          task.dueDate && 
          isBefore(new Date(task.dueDate), new Date()) &&
          !isToday(new Date(task.dueDate))
        );
      case "completed":
        return filtered.filter(task => task.completed);
      default:
        return filtered;
    }
  };
  
  const getDueStatus = (dueDate?: string) => {
    if (!dueDate) return { text: "No due date", color: "text-slate-500" };
    
    const date = new Date(dueDate);
    
    if (isToday(date)) {
      return { text: "Due today", color: "text-amber-600" };
    } else if (isYesterday(date)) {
      return { text: "Due yesterday", color: "text-red-600" };
    } else if (isBefore(date, new Date())) {
      return { text: `Overdue: ${format(date, "MMM d")}`, color: "text-red-600" };
    } else if (isBefore(date, addDays(new Date(), 2))) {
      return { text: "Due tomorrow", color: "text-amber-600" };
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
      
      <div className="space-y-6">
        {/* Tasks Card */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setTasksCollapsed(!tasksCollapsed)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                Tasks ({(tasks as Task[] || []).filter(task => !task.completed).length})
              </CardTitle>
              <Button variant="ghost" size="sm">
                {tasksCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          
          {!tasksCollapsed && (
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
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
                    const filteredTasks = (tasks as Task[] || [])
                      .filter(task => !task.completed)
                      .filter(task => 
                        searchQuery === "" || 
                        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .slice(0, tasksVisibleCount);
                    
                    return filteredTasks.length > 0 ? (
                      <>
                        {filteredTasks.map((task: Task) => {
                          const dueStatus = getDueStatus(task.dueDate);
                          
                          return (
                            <div key={task.id} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">
                              <Checkbox
                                id={`task-${task.id}`}
                                checked={task.completed}
                                onCheckedChange={(checked) => handleTaskToggle(task, !!checked)}
                                className="h-4 w-4 mt-1"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={`task-${task.id}`}
                                  className={`block text-sm font-medium ${
                                    task.completed ? "text-slate-500 line-through" : "text-slate-800"
                                  }`}
                                >
                                  {task.title}
                                </label>
                                {task.description && (
                                  <p className={`text-xs mt-1 ${
                                    task.completed ? "text-slate-400" : "text-slate-600"
                                  }`}>
                                    {task.description}
                                  </p>
                                )}
                                <span className={`text-xs ${dueStatus.color} mt-1 block`}>
                                  {task.completed ? "Completed" : dueStatus.text}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        
                        {(tasks as Task[] || []).filter(task => !task.completed).length > tasksVisibleCount && (
                          <Button 
                            variant="outline" 
                            className="w-full mt-4"
                            onClick={() => setTasksVisibleCount(prev => prev + 5)}
                          >
                            Show 5 more tasks
                          </Button>
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
          <CardHeader className="cursor-pointer" onClick={() => setAlertsCollapsed(!alertsCollapsed)}>
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
                    const alerts = (portfolioAlerts as any[] || []).slice(0, alertsVisibleCount);
                    
                    return alerts.length > 0 ? (
                      <>
                        {alerts.map((alert: any) => (
                          <div key={alert.id} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">
                            <div className={`h-4 w-4 mt-1 rounded-full ${
                              alert.severity === 'high' ? 'bg-red-500' : 
                              alert.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                            }`} />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-slate-800">{alert.title}</h4>
                              <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-slate-500">
                                  {alert.client_name ? `Client: ${alert.client_name}` : ''}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  alert.severity === 'high' ? 'bg-red-100 text-red-700' : 
                                  alert.severity === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {alert.severity}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {(portfolioAlerts as any[] || []).length > alertsVisibleCount && (
                          <Button 
                            variant="outline" 
                            className="w-full mt-4"
                            onClick={() => setAlertsVisibleCount(prev => prev + 5)}
                          >
                            Show 5 more alerts
                          </Button>
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
