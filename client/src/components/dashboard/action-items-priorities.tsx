import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, Clock, TrendingUp, AlertTriangle, MessageSquare, ChevronDown, ChevronRight, CheckSquare } from "lucide-react";
import { format } from "date-fns";

export function ActionItemsPriorities() {
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d");
  const [isOpen, setIsOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
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
  
  const formatTime = (dateTime: string | Date) => {
    return format(new Date(dateTime), "h:mm a");
  };

  // Organize data into actionable categories
  const actionCategories = {
    appointments: {
      title: 'Today\'s Meetings',
      count: appointments?.length || 0,
      items: appointments || [],
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-muted border-border',
      description: 'Client meetings and calls scheduled for today'
    },
    tasks: {
      title: 'Urgent Tasks', 
      count: tasks?.filter(task => task.priority === 'high' || task.priority === 'urgent').length || 0,
      items: tasks?.filter(task => task.priority === 'high' || task.priority === 'urgent') || [],
      icon: Clock,
      color: 'text-secondary',
      bgColor: 'bg-muted border-border',
      description: 'High priority tasks requiring immediate attention'
    },
    closures: {
      title: 'Expected Deal Closures',
      count: weekClosures?.length || 0,
      items: weekClosures || [],
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-muted border-border',
      description: 'Prospects likely to close this week'
    },
    alerts: {
      title: 'Portfolio Alerts',
      count: priorityAlerts?.length || 0,
      items: priorityAlerts || [],
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-muted border-border',
      description: 'Portfolio alerts and market notifications affecting your clients'
    },
    complaints: {
      title: 'Active Complaints',
      count: urgentComplaints?.filter(complaint => complaint.status === 'open' || complaint.status === 'in_progress').length || 0,
      items: urgentComplaints?.filter(complaint => complaint.status === 'open' || complaint.status === 'in_progress') || [],
      icon: MessageSquare,
      color: 'text-secondary',
      bgColor: 'bg-muted border-border',
      description: 'Unresolved client issues requiring attention'
    }
  };

  const totalActionItems = Object.values(actionCategories).reduce((sum, category) => sum + category.count, 0);

  const toggleCategory = (categoryKey: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleItem = (itemKey: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemKey)) {
      newExpanded.delete(itemKey);
    } else {
      newExpanded.add(itemKey);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-card text-card-foreground border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 transform hover:scale-[1.01]">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 transition-all duration-300 hover:bg-primary/20 hover:scale-110">
                  <CheckSquare size={20} className="text-primary transition-all duration-300" />
                </div>
                <CardTitle className="text-lg transition-colors duration-300">Action Items & Priorities</CardTitle>
              </div>
              {isOpen ? (
                <ChevronDown size={20} className="transition-all duration-300 text-primary" />
              ) : (
                <ChevronRight size={20} className="transition-all duration-300 text-muted-foreground hover:text-primary" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="transition-all duration-500 ease-in-out data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <CardContent className="space-y-3 pt-0">
            {Object.entries(actionCategories).map(([key, category]) => {
              const isExpanded = expandedCategories.has(key);
              if (category.count === 0) return null;
              const IconComponent = category.icon;
              
              return (
                <Collapsible key={key} open={isExpanded} onOpenChange={() => toggleCategory(key)}>
                  <div className={`rounded-lg border p-3 ${category.bgColor} transition-all duration-300 hover:shadow-md hover:scale-[1.02] transform`}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-0 h-auto hover:bg-transparent"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg bg-background/60 ${category.color}`}>
                            <IconComponent size={18} />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-sm text-muted-foreground leading-tight">{category.title}</h3>
                            <p className="text-xl font-bold text-foreground leading-tight tracking-tight">
                              {category.count}
                            </p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-3">
                      <div className="text-sm text-muted-foreground">
                        {key === 'appointments' && 'Today\'s scheduled client meetings and appointments requiring your attention.'}
                        {key === 'tasks' && 'Pending tasks and follow-ups that need completion today.'}
                        {key === 'closures' && 'Deal closures and prospect conversions expected this week.'}
                        {key === 'complaints' && 'Active client complaints requiring immediate resolution.'}
                        {key === 'alerts' && 'Portfolio alerts and market notifications affecting your clients.'}
                      </div>
                      <div className="mt-3 px-3 pb-3 space-y-2">
                        {category.items.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No items at this time</p>
                        ) : (
                          category.items.slice(0, 5).map((item, index) => {
                            const itemKey = `${key}-${item.id || index}`;
                            const isItemExpanded = expandedItems.has(itemKey);
                            
                            return (
                              <div key={index} className="bg-background border border-border rounded overflow-hidden">
                                <Button
                                  variant="ghost"
                                  className="w-full p-2 h-auto justify-start hover:bg-accent/20 text-foreground"
                                  onClick={() => toggleItem(itemKey)}
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    <div className="flex-1 text-left">
                                      {key === 'appointments' && (
                                        <div>
                                          <div className="font-medium text-sm text-foreground">{item.title}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {item.clientName} • {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {key === 'tasks' && (
                                        <div>
                                          <div className="font-medium text-sm text-foreground">{item.title}</div>
                                          <div className="text-xs text-muted-foreground">
                                            Priority: {item.priority} • Status: {item.status}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {key === 'closures' && (
                                        <div>
                                          <div className="font-medium text-sm text-foreground">{item.client_name}</div>
                                          <div className="text-xs text-muted-foreground">
                                            Expected: ₹{(item.expected_amount / 100000).toFixed(1)}L • {format(new Date(item.expected_close_date), 'MMM dd')}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {key === 'complaints' && (
                                        <div>
                                          <div className="font-medium text-sm text-foreground">{item.subject}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {item.clientName} • {item.severity} • {item.status}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {key === 'alerts' && (
                                        <div>
                                          <div className="font-medium text-sm text-foreground">{item.title}</div>
                                          <div className="text-xs text-muted-foreground">
                                            Priority: {item.priority}
                                            {item.clientName && ` • Client: ${item.clientName}`}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <ChevronRight 
                                      size={14} 
                                      className={`text-muted-foreground transition-transform ${isItemExpanded ? 'rotate-90' : ''}`} 
                                    />
                                  </div>
                                </Button>
                                
                                {isItemExpanded && (
                                  <div className="px-4 pb-3 space-y-2 bg-muted/20">
                                    {key === 'appointments' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Client:</span>
                                          <span className="font-medium text-foreground">{item.clientName}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Time:</span>
                                          <span className="font-medium text-foreground">
                                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Type:</span>
                                          <span className="font-medium text-foreground">{item.type || 'Meeting'}</span>
                                        </div>
                                        {item.location && (
                                          <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Location:</span>
                                            <span className="font-medium text-foreground">{item.location}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {key === 'tasks' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Priority:</span>
                                          <span className="font-medium text-foreground capitalize">{item.priority || 'Normal'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Due Date:</span>
                                          <span className="font-medium text-foreground">
                                            {item.dueDate ? format(new Date(item.dueDate), "MMM dd, yyyy") : 'Not set'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Status:</span>
                                          <span className="font-medium text-foreground capitalize">{item.status || 'Pending'}</span>
                                        </div>
                                        {item.description && (
                                          <div className="text-xs">
                                            <span className="text-muted-foreground">Description:</span>
                                            <p className="font-medium text-foreground mt-1">{item.description}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {key === 'closures' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Client:</span>
                                          <span className="font-medium text-foreground">{item.client_name}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Expected Amount:</span>
                                          <span className="font-medium text-foreground">₹{(item.expected_amount / 100000).toFixed(1)}L</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Close Date:</span>
                                          <span className="font-medium text-foreground">
                                            {format(new Date(item.expected_close_date), "MMM dd, yyyy")}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Status:</span>
                                          <span className="font-medium text-foreground capitalize">{item.status || 'In Progress'}</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {key === 'alerts' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Client:</span>
                                          <span className="font-medium text-foreground">{item.clientName}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Priority:</span>
                                          <span className="font-medium text-foreground capitalize">{item.priority}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Type:</span>
                                          <span className="font-medium text-foreground">{item.type || 'General Alert'}</span>
                                        </div>
                                        {item.description && (
                                          <div className="text-xs">
                                            <span className="text-muted-foreground">Details:</span>
                                            <p className="font-medium text-foreground mt-1">{item.description}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {key === 'complaints' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Client:</span>
                                          <span className="font-medium text-foreground">{item.clientName}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Category:</span>
                                          <span className="font-medium text-foreground">{item.category || 'General'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Priority:</span>
                                          <span className="font-medium text-foreground capitalize">{item.severity || 'Medium'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-muted-foreground">Status:</span>
                                          <span className="font-medium text-foreground capitalize">{item.status}</span>
                                        </div>
                                        {item.description && (
                                          <div className="text-xs">
                                            <span className="text-muted-foreground">Issue:</span>
                                            <p className="font-medium text-foreground mt-1">{item.description}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
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