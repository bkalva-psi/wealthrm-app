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
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  // Fetch portfolio alerts
  const { data: portfolioAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/portfolio-alerts"],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData: any) => apiRequest("/api/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    }),
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
      apiRequest(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ completed }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error: any) => {
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
    toggleTaskMutation.mutate({ taskId: task.id, completed });
  };

  const getDueStatus = (dueDate?: string) => {
    if (!dueDate) return { text: "", color: "text-muted-foreground" };
    
    const due = new Date(dueDate);
    const now = new Date();
    
    if (isToday(due)) {
      return { text: "Due today", color: "text-orange-600" };
    } else if (isYesterday(due)) {
      return { text: "Overdue", color: "text-red-600" };
    } else if (isBefore(due, now)) {
      return { text: "Overdue", color: "text-red-600" };
    } else if (isAfter(due, addDays(now, 3))) {
      return { text: `Due ${format(due, "MMM d")}`, color: "text-muted-foreground" };
    } else {
      return { text: `Due ${format(due, "MMM d")}`, color: "text-blue-600" };
    }
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
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 p-0">
              <Plus className="h-6 w-6" />
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
        <div className="flex items-center justify-between mb-2">
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

        {/* Search Box */}
        {!tasksCollapsed && (
          <div className="mb-4 w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 !bg-background !border-input !text-foreground w-full"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--input)', color: 'var(--foreground)' }}
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
                            <div key={task.id} className="flex items-start space-x-3 p-3 border border-border rounded-md hover:bg-muted/50 cursor-pointer !bg-card w-full min-w-0">
                              <Checkbox
                                id={`task-${task.id}`}
                                checked={task.completed}
                                onCheckedChange={(checked) => handleTaskToggle(task, !!checked)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <label
                                  htmlFor={`task-${task.id}`}
                                  className={`block text-sm font-medium truncate ${
                                    task.completed ? "text-muted-foreground line-through" : "text-foreground"
                                  }`}
                                >
                                  {task.title}
                                </label>
                                {task.description && (
                                  <p className={`text-xs mt-1 truncate ${
                                    task.completed ? "text-muted-foreground" : "text-muted-foreground"
                                  }`}>
                                    {task.description}
                                  </p>
                                )}
                                {task.dueDate && (
                                  <p className={`text-xs mt-1 truncate ${dueStatus.color}`}>
                                    {dueStatus.text}
                                  </p>
                                )}
                              </div>
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