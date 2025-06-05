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
  
  // Collapse states for cards
  const [tasksCollapsed, setTasksCollapsed] = useState(false);
  const [alertsCollapsed, setAlertsCollapsed] = useState(false);
  const [tasksVisibleCount, setTasksVisibleCount] = useState(5);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
    onSuccess: (data) => {
      console.log("=== TASKS DATA FROM API ===");
      console.log("All tasks:", data);
      console.log("Task IDs:", data?.map((t: any) => t.id));
      console.log("Total tasks:", data?.length);
      console.log("========================");
    }
  });

  // Fetch clients data for name lookup
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Fetch portfolio alerts
  const { data: portfolioAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/portfolio-alerts"],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData: any) => apiRequest("POST", "/api/tasks", taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsNewTaskDialogOpen(false);
      setNewTask({
        title: "",
        description: "",
        dueDate: format(new Date(), "yyyy-MM-dd"),
      });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  // Toggle task completion
  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: number; completed: boolean }) =>
      apiRequest("PUT", `/api/tasks/${taskId}`, { completed }),
    onMutate: async ({ taskId, completed }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/tasks"] });
      
      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(["/api/tasks"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["/api/tasks"], (old: any) => {
        if (!old) return old;
        return old.map((task: any) => 
          task.id === taskId ? { ...task, completed } : task
        );
      });
      
      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error: any, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(["/api/tasks"], context.previousTasks);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate(newTask);
  };

  const handleTaskToggle = (task: Task, completed: boolean) => {
    console.log("=== TASK TOGGLE DEBUG ===");
    console.log("Task ID:", task.id);
    console.log("Current task.completed:", task.completed);
    console.log("New completed value:", completed);
    console.log("========================");
    toggleTaskMutation.mutate({ taskId: task.id, completed });
  };

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

  const getDueStatus = (dueDate?: string) => {
    if (!dueDate) return { text: "", color: "text-muted-foreground" };
    
    const due = new Date(dueDate);
    const now = new Date();
    
    if (isToday(due)) {
      return { text: "Due today", color: "text-foreground font-semibold bg-amber-100 dark:bg-amber-900/20 px-2 py-1 rounded-md" };
    } else if (isYesterday(due)) {
      return { text: "Overdue", color: "text-foreground font-semibold bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded-md" };
    } else if (isBefore(due, now)) {
      return { text: "Overdue", color: "text-foreground font-semibold bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded-md" };
    } else if (isAfter(due, addDays(now, 3))) {
      return { text: `Due ${format(due, "MMM d")}`, color: "text-muted-foreground" };
    } else {
      return { text: `Due ${format(due, "MMM d")}`, color: "text-foreground font-medium" };
    }
  };

  // Helper function to get client name by ID
  const getClientName = (clientId?: number) => {
    if (!clientId || !clients) return null;
    const client = (clients as any[]).find((c: any) => c.id === clientId);
    return client?.fullName || null;
  };

  useEffect(() => {
    console.log("NEW UPDATED TASKS PAGE LOADED SUCCESSFULLY");
  }, []);

  return (
    <div className="tasks-page-container min-h-screen p-6" style={{ backgroundColor: 'hsl(222, 84%, 5%)' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="icon" 
              className="!bg-blue-600 hover:!bg-blue-700 !text-white dark:!bg-blue-500 dark:hover:!bg-blue-600 rounded-full hover:scale-105 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500/50"
              style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your list. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter task title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter task description (optional)"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleCreateTask}
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4 w-full overflow-hidden" style={{ backgroundColor: 'hsl(222, 84%, 5%)' }}>
        {/* Tasks Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-foreground">
              Tasks ({(tasks as Task[] || []).filter(task => !task.completed).length})
            </h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setTasksCollapsed(!tasksCollapsed)}
            className="text-foreground"
          >
            {tasksCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>

        {/* Search Box - Outside any card */}
        {!tasksCollapsed && (
          <div className="mb-6 w-full bg-transparent">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-input text-foreground w-full rounded-md"
              />
            </div>
          </div>
        )}

        {/* Tasks Card */}
        {!tasksCollapsed && (
          <Card className="!bg-card !border-border w-full" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <CardContent className="!bg-card w-full overflow-hidden p-6" style={{ backgroundColor: 'var(--card)' }}>
              {isLoading ? (
                <div className="space-y-4 bg-card">
                  {Array(2).fill(0).map((_, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border border-border rounded-md">
                      <Skeleton className="h-4 w-4 mt-1" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 bg-card w-full">
                  {(() => {
                    const allTasks = (tasks as Task[] || [])
                      .filter(task => 
                        searchQuery === "" || 
                        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
                      );
                    
                    const pendingTasks = allTasks.filter(task => !task.completed).slice(0, tasksVisibleCount);
                    const completedTasks = allTasks.filter(task => task.completed).slice(0, 3); // Show max 3 completed
                    const filteredTasks = [...pendingTasks, ...completedTasks];
                    
                    return filteredTasks.length > 0 ? (
                      <>
                        {filteredTasks.map((task: Task) => {
                          const dueStatus = getDueStatus(task.dueDate);
                          const isExpanded = expandedTasks.has(task.id);
                          
                          return (
                            <div key={task.id} className="border border-border rounded-md !bg-card w-full min-w-0">
                              <div 
                                className="flex items-start p-3 hover:bg-muted/50 cursor-pointer"
                                onClick={() => toggleTaskExpansion(task.id)}
                              >
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <div className="flex items-center justify-between">
                                    <div
                                      className={`block text-sm font-medium ${isExpanded ? '' : 'truncate'} ${
                                        task.completed ? "text-muted-foreground line-through" : "text-foreground"
                                      }`}
                                    >
                                      {task.title}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {task.dueDate && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${dueStatus.color} bg-muted/50`}>
                                          {dueStatus.text}
                                        </span>
                                      )}
                                      {isExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                  {!isExpanded && task.description && (
                                    <p className={`text-xs mt-1 truncate ${
                                      task.completed ? "text-muted-foreground" : "text-muted-foreground"
                                    }`}>
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {isExpanded && (
                                <div className="px-3 pb-3 border-t border-border/50 mt-2 pt-3">
                                  {task.description && (
                                    <div className="mb-3">
                                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</h4>
                                      <p className="text-sm text-foreground whitespace-pre-wrap">
                                        {task.description}
                                      </p>
                                    </div>
                                  )}
                                  {task.dueDate && (
                                    <div className="mb-3">
                                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Due Date</h4>
                                      <p className={`text-sm ${dueStatus.color}`}>
                                        {format(new Date(task.dueDate), 'EEEE, MMMM d, yyyy')}
                                      </p>
                                    </div>
                                  )}
                                  {(task.clientId || task.prospectId) && (
                                    <div className="mb-3">
                                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Related To</h4>
                                      <p className="text-sm text-foreground">
                                        {task.clientId ? (
                                          getClientName(task.clientId) ? 
                                            `Client: ${getClientName(task.clientId)}` : 
                                            `Client ID: ${task.clientId}`
                                        ) : `Prospect ID: ${task.prospectId}`}
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between pt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      task.completed 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                      {task.completed ? 'Completed' : 'Pending'}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTaskToggle(task, !task.completed);
                                      }}
                                    >
                                      {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {(tasks as Task[] || []).filter(task => !task.completed).length > tasksVisibleCount && (
                          <Button
                            variant="ghost"
                            onClick={() => setTasksVisibleCount(prev => prev + 5)}
                            className="w-full mt-4 text-blue-600 hover:text-blue-700"
                          >
                            Show More Tasks
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No active tasks found</p>
                        <p className="text-sm mt-2">
                          {searchQuery ? "Try adjusting your search" : "Create a new task to get started"}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Portfolio Alerts Card */}
        <Card className="!bg-card !border-border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <CardHeader className="cursor-pointer !bg-card" onClick={() => setAlertsCollapsed(!alertsCollapsed)} style={{ backgroundColor: 'var(--card)' }}>
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
            <CardContent className="!bg-card" style={{ backgroundColor: 'var(--card)' }}>
              {alertsLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border border-border rounded-md">
                      <Skeleton className="h-4 w-4 mt-1" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(portfolioAlerts as any[] || []).length > 0 ? (
                    (portfolioAlerts as any[]).map((alert: any) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 border border-border rounded-md hover:bg-muted/50">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-foreground">{alert.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                          {alert.clientName && (
                            <p className="text-xs text-blue-600 mt-1">Client: {alert.clientName}</p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(alert.createdAt), "MMM d")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No portfolio alerts</p>
                      <p className="text-sm mt-2">All portfolios are performing well</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}