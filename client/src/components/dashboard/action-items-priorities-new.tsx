import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, Clock, TrendingUp, AlertTriangle, MessageSquare, ChevronDown, ChevronRight } from "lucide-react";
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
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 border-blue-200',
      description: 'Client meetings and calls scheduled for today'
    },
    tasks: {
      title: 'Urgent Tasks', 
      count: tasks?.filter(task => task.priority === 'high' || task.priority === 'urgent').length || 0,
      items: tasks?.filter(task => task.priority === 'high' || task.priority === 'urgent') || [],
      icon: Clock,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50 border-orange-200',
      description: 'High priority tasks requiring immediate attention'
    },
    closures: {
      title: 'Expected Deal Closures',
      count: weekClosures?.length || 0,
      items: weekClosures || [],
      icon: TrendingUp,
      color: 'text-green-700',
      bgColor: 'bg-green-50 border-green-200',
      description: 'Prospects likely to close this week'
    },
    alerts: {
      title: 'Portfolio Alerts',
      count: priorityAlerts?.filter(alert => alert.priority === 'high').length || 0,
      items: priorityAlerts?.filter(alert => alert.priority === 'high') || [],
      icon: AlertTriangle,
      color: 'text-red-700',
      bgColor: 'bg-red-50 border-red-200',
      description: 'Critical portfolio notifications'
    },
    complaints: {
      title: 'Active Complaints',
      count: urgentComplaints?.filter(complaint => complaint.status === 'open' || complaint.status === 'in_progress').length || 0,
      items: urgentComplaints?.filter(complaint => complaint.status === 'open' || complaint.status === 'in_progress') || [],
      icon: MessageSquare,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50 border-purple-200',
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
      <Card>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full p-3 h-auto justify-start hover:bg-transparent">
            <div className="flex items-center gap-3 w-full">
              <div className="p-1.5 rounded-lg bg-white/60">
                <Clock size={20} className="text-slate-700" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-sm font-medium text-slate-700">Action Items & Priorities</h2>
                <p className="text-xs text-slate-500">{formattedDate} • {totalActionItems} items requiring attention</p>
              </div>
              <ChevronRight size={20} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="p-3 space-y-3 mt-4">
            {Object.entries(actionCategories).map(([key, category]) => {
              const isExpanded = expandedCategories.has(key);
              if (category.count === 0) return null;
              
              return (
                <Collapsible key={key} open={isExpanded} onOpenChange={() => toggleCategory(key)}>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full p-3 h-auto justify-start hover:bg-slate-50">
                        <div className="flex items-center gap-3 w-full">
                          <div className={`p-1.5 rounded-lg ${category.bgColor}`}>
                            <category.icon size={14} className={category.color} />
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="text-sm font-medium text-slate-700">{category.title}</h3>
                            <p className="text-xs text-slate-500">{category.count} item{category.count !== 1 ? 's' : ''}</p>
                          </div>
                          <ChevronRight size={14} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="text-sm text-muted-foreground">
                        {key === 'appointments' && 'Today\'s scheduled client meetings and appointments requiring your attention.'}
                        {key === 'tasks' && 'Pending tasks and follow-ups that need completion today.'}
                        {key === 'closures' && 'Deal closures and prospect conversions expected this week.'}
                        {key === 'complaints' && 'Active client complaints requiring immediate resolution.'}
                        {key === 'alerts' && 'Portfolio alerts and market notifications affecting your clients.'}
                      </div>
                      <div className="mt-3 px-3 pb-3 space-y-2">
                        {category.items.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">No items at this time</p>
                        ) : (
                          category.items.slice(0, 5).map((item, index) => {
                            const itemKey = `${key}-${item.id || index}`;
                            const isItemExpanded = expandedItems.has(itemKey);
                            
                            return (
                              <div key={index} className="bg-white rounded border border-slate-100 overflow-hidden">
                                <Button
                                  variant="ghost"
                                  className="w-full p-2 h-auto justify-start hover:bg-slate-50"
                                  onClick={() => toggleItem(itemKey)}
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    <div className="flex-1 text-left">
                                      {key === 'appointments' && (
                                        <div>
                                          <div className="font-medium text-sm">{item.title}</div>
                                          <div className="text-xs text-slate-600">
                                            {item.clientName} • {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {key === 'tasks' && (
                                        <div>
                                          <div className="font-medium text-sm">{item.title}</div>
                                          <div className="text-xs text-slate-600">
                                            Priority: {item.priority} • Status: {item.status}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {key === 'closures' && (
                                        <div>
                                          <div className="font-medium text-sm">{item.client_name}</div>
                                          <div className="text-xs text-slate-600">
                                            Expected: ₹{(item.expected_amount / 100000).toFixed(1)}L • {format(new Date(item.expected_close_date), 'MMM dd')}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {key === 'complaints' && (
                                        <div>
                                          <div className="font-medium text-sm">{item.subject}</div>
                                          <div className="text-xs text-slate-600">
                                            {item.clientName} • {item.severity} • {item.status}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {key === 'alerts' && (
                                        <div>
                                          <div className="font-medium text-sm">{item.title}</div>
                                          <div className="text-xs text-slate-600">
                                            Priority: {item.priority}
                                            {item.clientName && ` • Client: ${item.clientName}`}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <ChevronRight 
                                      size={14} 
                                      className={`text-slate-400 transition-transform ${isItemExpanded ? 'rotate-90' : ''}`} 
                                    />
                                  </div>
                                </Button>
                                
                                {isItemExpanded && (
                                  <div className="px-4 pb-3 space-y-2 bg-slate-25">
                                    {key === 'appointments' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Client:</span>
                                          <span className="font-medium text-slate-800">{item.clientName}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Time:</span>
                                          <span className="font-medium text-slate-800">
                                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Type:</span>
                                          <span className="font-medium text-slate-800">{item.type || 'Meeting'}</span>
                                        </div>
                                        {item.location && (
                                          <div className="flex justify-between text-xs">
                                            <span className="text-slate-600">Location:</span>
                                            <span className="font-medium text-slate-800">{item.location}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {key === 'tasks' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Priority:</span>
                                          <span className="font-medium text-slate-800 capitalize">{item.priority || 'Normal'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Due Date:</span>
                                          <span className="font-medium text-slate-800">
                                            {item.dueDate ? format(new Date(item.dueDate), "MMM dd, yyyy") : 'Not set'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Status:</span>
                                          <span className="font-medium text-slate-800 capitalize">{item.status || 'Pending'}</span>
                                        </div>
                                        {item.description && (
                                          <div className="text-xs">
                                            <span className="text-slate-600">Description:</span>
                                            <p className="font-medium text-slate-800 mt-1">{item.description}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {key === 'closures' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Client:</span>
                                          <span className="font-medium text-slate-800">{item.client_name}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Expected Amount:</span>
                                          <span className="font-medium text-slate-800">₹{(item.expected_amount / 100000).toFixed(1)}L</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Close Date:</span>
                                          <span className="font-medium text-slate-800">
                                            {format(new Date(item.expected_close_date), "MMM dd, yyyy")}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Status:</span>
                                          <span className="font-medium text-slate-800 capitalize">{item.status || 'In Progress'}</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {key === 'alerts' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Client:</span>
                                          <span className="font-medium text-slate-800">{item.clientName}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Priority:</span>
                                          <span className="font-medium text-slate-800 capitalize">{item.priority}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Type:</span>
                                          <span className="font-medium text-slate-800">{item.type || 'General Alert'}</span>
                                        </div>
                                        {item.description && (
                                          <div className="text-xs">
                                            <span className="text-slate-600">Details:</span>
                                            <p className="font-medium text-slate-800 mt-1">{item.description}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {key === 'complaints' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Client:</span>
                                          <span className="font-medium text-slate-800">{item.clientName}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Category:</span>
                                          <span className="font-medium text-slate-800">{item.category || 'General'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Priority:</span>
                                          <span className="font-medium text-slate-800 capitalize">{item.severity || 'Medium'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-600">Status:</span>
                                          <span className="font-medium text-slate-800 capitalize">{item.status}</span>
                                        </div>
                                        {item.description && (
                                          <div className="text-xs">
                                            <span className="text-slate-600">Issue:</span>
                                            <p className="font-medium text-slate-800 mt-1">{item.description}</p>
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