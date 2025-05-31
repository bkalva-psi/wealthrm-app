import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isAfter, isBefore, isToday, isYesterday, addDays } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Search, 
  CalendarDays, 
  Clock, 
  XCircle, 
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  clientId?: number;
  clientName?: string;
}

interface Client {
  id: number;
  fullName: string;
}

interface ClientTasksProps {
  clientId?: string | number;
}

function ClientTasks({ clientId }: ClientTasksProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    clientId: "",
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Determine if we're showing all tasks or client-specific tasks
  const isAllTasks = !clientId || clientId === "all";
  const numericClientId = typeof clientId === 'string' && clientId !== "all" ? parseInt(clientId) : typeof clientId === 'number' ? clientId : null;
  
  // Set page title and default client for new tasks
  useEffect(() => {
    if (isAllTasks) {
      document.title = "Tasks | Wealth RM";
    } else {
      document.title = "Client Tasks | Wealth RM";
      // Pre-select client for new tasks when on client page
      if (numericClientId) {
        setNewTask(prev => ({ ...prev, clientId: numericClientId.toString() }));
      }
    }
  }, [isAllTasks, numericClientId]);

  // Extract client ID from URL for client-specific pages
  const [urlClientId, setUrlClientId] = useState<number | null>(null);
  
  useEffect(() => {
    if (!isAllTasks && !numericClientId) {
      const hash = window.location.hash;
      const match = hash.match(/\/clients\/(\d+)\/tasks/);
      if (match && match[1]) {
        const extractedClientId = parseInt(match[1]);
        setUrlClientId(extractedClientId);
        setNewTask(prev => ({ ...prev, clientId: extractedClientId.toString() }));
      }
    }
  }, [isAllTasks, numericClientId]);

  // Use the extracted client ID if no prop was provided
  const effectiveClientId = numericClientId || urlClientId;

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: isAllTasks ? ['/api/tasks'] : ['/api/tasks', 'client', effectiveClientId],
    queryFn: async () => {
      if (isAllTasks) {
        const response = await fetch('/api/tasks');
        return response.json();
      } else {
        const response = await fetch(`/api/tasks?clientId=${effectiveClientId}`);
        return response.json();
      }
    },
    enabled: isAllTasks || !!effectiveClientId,
  });

  // Fetch clients for task creation dropdown
  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
    enabled: isAllTasks, // Only load clients list when showing all tasks
  });

  // Fetch current client data for client-specific view
  const { data: currentClient } = useQuery({
    queryKey: ['/api/clients', effectiveClientId],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${effectiveClientId}`);
      return response.json();
    },
    enabled: !!effectiveClientId,
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
        clientId: isAllTasks ? "" : (effectiveClientId?.toString() || ""),
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

    if (isAllTasks && !newTask.clientId) {
      toast({
        title: "Validation Error", 
        description: "Please select a client for this task.",
        variant: "destructive",
      });
      return;
    }
    
    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate + 'T00:00:00.000Z',
      clientId: newTask.clientId ? parseInt(newTask.clientId) : null,
      completed: false,
    });
  };

  const filterTasks = (tasks: Task[] | undefined, status: string) => {
    if (!tasks) return [];
    
    let filtered = [...tasks];
    
    // Filter by search query first
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.clientName && task.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by status/tab
    switch (status) {
      case "upcoming":
        return filtered.filter(task => {
          if (task.completed) return false;
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          today.setHours(23, 59, 59, 999); // End of today
          return isAfter(dueDate, today);
        });
      case "today":
        return filtered.filter(task => {
          if (task.completed) return false;
          if (!task.dueDate) return false;
          return isToday(new Date(task.dueDate));
        });
      case "overdue":
        return filtered.filter(task => {
          if (task.completed) return false;
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of today
          return isBefore(dueDate, today);
        });
      case "completed":
        return filtered.filter(task => task.completed === true);
      case "all":
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

  const handleBackClick = () => {
    if (isAllTasks) {
      window.location.hash = "/";
    } else {
      window.location.hash = `/clients/${numericClientId}`;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {!isAllTasks && (
            <Button variant="ghost" size="sm" onClick={handleBackClick}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              {isAllTasks ? 'Tasks' : `Tasks - ${currentClient?.fullName || 'Client'}`}
            </h1>
          </div>
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
                {isAllTasks && (
                  <div className="grid gap-2">
                    <Label htmlFor="client">Client</Label>
                    <Select value={newTask.clientId} onValueChange={(value) => setNewTask({...newTask, clientId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {(clients || [])?.map((client: Client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Filter Dropdown */}
      <div className="flex items-center gap-3 mb-6">
        <Filter className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">Filter Tasks:</span>
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>All Tasks</span>
              </div>
            </SelectItem>
            <SelectItem value="today">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Today</span>
              </div>
            </SelectItem>
            <SelectItem value="upcoming">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>Upcoming</span>
              </div>
            </SelectItem>
            <SelectItem value="overdue">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                <span>Overdue</span>
              </div>
            </SelectItem>
            <SelectItem value="completed">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Completed</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {activeTab === "all" && "All Tasks"}
                {activeTab === "today" && "Today's Tasks"}
                {activeTab === "upcoming" && "Upcoming Tasks"}
                {activeTab === "overdue" && "Overdue Tasks"}
                {activeTab === "completed" && "Completed Tasks"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
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
                  {filterTasks(tasks || [], activeTab).length > 0 ? (
                    filterTasks(tasks || [], activeTab).map((task: Task) => {
                      const dueStatus = getDueStatus(task.dueDate);
                      
                      return (
                        <div key={task.id} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-md hover:bg-slate-50">
                          <Checkbox
                            id={`task-${task.id}`}
                            checked={task.completed}
                            onCheckedChange={(checked) => handleTaskToggle(task, !!checked)}
                            className="h-4 w-4 mt-1"
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
                            {isAllTasks && task.clientName && (
                              <p className="text-xs text-blue-600 mt-1">
                                Client: {task.clientName}
                              </p>
                            )}
                            <div className="flex justify-between items-center mt-2">
                              <span className={`text-xs ${dueStatus.color}`}>
                                {task.completed ? "Completed" : dueStatus.text}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 px-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Set Priority</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      );
                    })
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
                  )}
                </div>
              )}
            </CardContent>
          </Card>
    </div>
  );
}

export default ClientTasks;