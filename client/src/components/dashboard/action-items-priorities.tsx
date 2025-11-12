import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, TrendingUp, AlertTriangle, MessageSquare, ChevronDown, ChevronRight, CheckSquare } from "lucide-react";
import { format } from "date-fns";

export function ActionItemsPriorities() {
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d");
  const [isOpen, setIsOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showMoreItems, setShowMoreItems] = useState<Set<string>>(new Set());
  
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

  // Normalize data with safe fallbacks
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeClosures = Array.isArray(weekClosures) ? weekClosures : [];
  const safeAlerts = Array.isArray(priorityAlerts) ? priorityAlerts : [];
  const safeComplaints = Array.isArray(urgentComplaints) ? urgentComplaints : [];
  
  // Organize data into actionable categories (less restrictive to avoid empty UI)
  const actionCategories = {
    appointments: {
      title: 'Today\'s Meetings',
      count: safeAppointments.length,
      items: safeAppointments.slice(0, 5),
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-muted border-border',
      description: 'Client meetings and calls scheduled for today'
    },
    tasks: {
      title: 'Tasks (Pending)', 
      count: safeTasks.filter((task: any) => !task.completed).length,
      items: safeTasks.filter((task: any) => !task.completed).slice(0, 5),
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-muted border-border',
      description: 'High priority tasks requiring immediate attention'
    },
    closures: {
      title: 'Expected Deal Closures',
      count: safeClosures.length,
      items: safeClosures.slice(0, 5),
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-muted border-border',
      description: 'Prospects likely to close this week'
    },
    alerts: {
      title: 'Portfolio Alerts',
      count: safeAlerts.length,
      items: safeAlerts.slice(0, 5),
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-muted border-border',
      description: 'Portfolio alerts and market notifications affecting your clients'
    },
    complaints: {
      title: 'Active Complaints',
      count: safeComplaints.filter((complaint: any) => complaint.status !== 'resolved').length,
      items: safeComplaints.filter((complaint: any) => complaint.status !== 'resolved').slice(0, 5),
      icon: MessageSquare,
      color: 'text-foreground',
      bgColor: 'bg-muted border-border',
      description: 'Unresolved client issues requiring attention'
    }
  };

  const totalActionItems = Object.values(actionCategories).reduce((sum, category) => sum + category.count, 0);

  const setCategoryOpen = (categoryKey: string, open: boolean) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (open) next.add(categoryKey);
      else next.delete(categoryKey);
      return next;
    });
  };

  const toggleItem = (itemKey: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  };

  const toggleShowMore = (categoryKey: string) => {
    setShowMoreItems(prev => {
      const next = new Set(prev);
      if (next.has(categoryKey)) next.delete(categoryKey);
      else next.add(categoryKey);
      return next;
    });
  };

  return (
    <Card className="bg-card text-card-foreground border-unified transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 transform hover:scale-[1.01] interactive-hover">
      <CardHeader className="hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-300">
        <button
          type="button"
          className="w-full flex items-center justify-between text-left focus:outline-none"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="action-items-priorities-content"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg brand-accent-bg-subtle transition-all duration-300 hover:bg-primary/20 hover:scale-110 interactive-scale">
              <CheckSquare size={20} className="brand-accent transition-all duration-300" />
            </div>
            <CardTitle className="text-lg transition-colors duration-300 brand-accent-subtle">Action Items & Priorities</CardTitle>
          </div>
          {isOpen ? (
            <ChevronDown size={20} className="transition-all duration-300 brand-accent" />
          ) : (
            <ChevronRight size={20} className="transition-all duration-300 text-muted-foreground hover:text-primary brand-accent-subtle" />
          )}
        </button>
      </CardHeader>
      
      <div
        id="action-items-priorities-content"
        className={isOpen ? "block" : "hidden"}
      >
        <CardContent className="space-y-3 pt-0">
          {/* Empty-state helper */}
          {totalActionItems === 0 && (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No action items found for today. You’re all caught up.
            </div>
          )}

          {Object.entries(actionCategories).map(([key, category]) => {
            const isExpanded = expandedCategories.has(key);
            const IconComponent = category.icon;
            
            return (
              <div key={key} className={`rounded-lg border p-3 sm:p-4 ${category.bgColor} transition-all duration-300 hover:shadow-md hover:scale-[1.02] transform`}>
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md transition-colors"
                  onClick={() => setCategoryOpen(key, !isExpanded)}
                  aria-expanded={isExpanded}
                  aria-controls={`category-${key}-content`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg bg-background/60 ${category.color}`}>
                      <IconComponent size={18} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-sm text-foreground leading-tight">{category.title}</h3>
                      <p className="text-xl font-bold text-foreground leading-tight tracking-tight">
                        {category.count}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                
                <div id={`category-${key}-content`} className={`mt-3 ${isExpanded ? 'block' : 'hidden'}`}>
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
                      <>
                        {(showMoreItems.has(key) ? category.items : category.items.slice(0, 5)).map((item, index) => {
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
                                        Expected: {item.expected_amount && !isNaN(item.expected_amount) 
                                          ? `₹${Math.round(item.expected_amount / 100000)} L`
                                          : 'TBD'
                                        } • {format(new Date(item.expected_close_date), 'MMM dd')}
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
                                          <span className="font-medium text-foreground">
                                            {item.expected_amount && !isNaN(item.expected_amount) 
                                              ? `₹${Math.round(item.expected_amount / 100000)} L`
                                              : 'TBD'
                                            }
                                          </span>
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
                      })}
                      
                      {category.items.length > 5 && (
                        <div className="mt-3 pt-2 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleShowMore(key)}
                            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showMoreItems.has(key) 
                              ? `Show Less (showing ${category.items.length})` 
                              : `Show More (${category.items.length - 5} more)`
                            }
                          </Button>
                        </div>
                      )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </div>
    </Card>
  );
}