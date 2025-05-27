import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ChevronDown, Megaphone, Target, AlertTriangle, Package, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  target_audience: string;
  valid_from: string;
  valid_until: string;
  author: string;
  action_required: boolean;
  action_deadline: string;
  tags: string[];
  created_at: string;
  is_active: boolean;
}

const typeIcons = {
  campaign: Target,
  compliance: AlertTriangle,
  incentive: Zap,
  product_update: Package,
  regulation: FileText,
};

const priorityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200",
  low: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200",
};

const typeColors = {
  campaign: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  compliance: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  incentive: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  product_update: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  regulation: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
};

export function AnnouncementsCard() {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ['/api/announcements'],
  });

  const toggleItemExpansion = (itemKey: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isDeadlineApproaching = (deadlineString: string) => {
    if (!deadlineString) return false;
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const displayAnnouncements = isExpanded ? announcements : announcements.slice(0, 3);
  const hasMore = announcements.length > 3;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-blue-600" />
              Announcements
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasMore && (
                <span className="text-sm text-muted-foreground">
                  {isExpanded ? announcements.length : 3} of {announcements.length}
                </span>
              )}
              {hasMore && (
                isExpanded ? 
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground" /> :
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground" />
              )}
            </div>
          </CollapsibleTrigger>
        </Collapsible>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <>
            <div className="space-y-3">
              {displayAnnouncements.map((announcement) => {
                const announcementKey = `announcement-${announcement.id}`;
                const isItemExpanded = expandedItems[announcementKey];
                const IconComponent = typeIcons[announcement.type as keyof typeof typeIcons] || Megaphone;
                const priorityColor = priorityColors[announcement.priority as keyof typeof priorityColors];
                
                return (
                  <div key={announcement.id} className="space-y-2">
                    <div 
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/40 transition-colors cursor-pointer",
                        priorityColor
                      )}
                      onClick={() => toggleItemExpansion(announcementKey)}
                    >
                      <IconComponent className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm leading-tight">{announcement.title}</h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {announcement.action_required && (
                              <AlertTriangle className="h-3 w-3 text-orange-500" title="Action Required" />
                            )}
                            {isItemExpanded ? 
                              <ChevronDown className="h-3 w-3 text-muted-foreground" /> :
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            }
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{announcement.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs px-2 py-0", typeColors[announcement.type as keyof typeof typeColors])}
                          >
                            {announcement.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(announcement.created_at)}</span>
                          {announcement.action_deadline && isDeadlineApproaching(announcement.action_deadline) && (
                            <Badge variant="destructive" className="text-xs">
                              Due {formatDate(announcement.action_deadline)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isItemExpanded && (
                      <div className="ml-7 p-3 bg-background border rounded-lg">
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-sm mb-2">Full Details</h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {announcement.content}
                            </p>
                          </div>
                          
                          {announcement.action_required && (
                            <div className="p-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Action Required</span>
                              </div>
                              {announcement.action_deadline && (
                                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                                  Deadline: {new Date(announcement.action_deadline).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              )}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t text-xs">
                            <div>
                              <span className="text-muted-foreground">Author:</span>
                              <span className="ml-1 font-medium">{announcement.author}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Priority:</span>
                              <span className="ml-1 font-medium capitalize">{announcement.priority}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Target:</span>
                              <span className="ml-1 font-medium">{announcement.target_audience.replace('_', ' ')}</span>
                            </div>
                            {announcement.valid_until && (
                              <div>
                                <span className="text-muted-foreground">Valid Until:</span>
                                <span className="ml-1 font-medium">{formatDate(announcement.valid_until)}</span>
                              </div>
                            )}
                          </div>
                          
                          {announcement.tags && announcement.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {announcement.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleContent className="space-y-3">
                  {announcements.slice(3).map((announcement) => {
                    const announcementKey = `announcement-${announcement.id}`;
                    const isItemExpanded = expandedItems[announcementKey];
                    const IconComponent = typeIcons[announcement.type as keyof typeof typeIcons] || Megaphone;
                    const priorityColor = priorityColors[announcement.priority as keyof typeof priorityColors];
                    
                    return (
                      <div key={announcement.id} className="space-y-2">
                        <div 
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/40 transition-colors cursor-pointer",
                            priorityColor
                          )}
                          onClick={() => toggleItemExpansion(announcementKey)}
                        >
                          <IconComponent className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm leading-tight">{announcement.title}</h4>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {announcement.action_required && (
                                  <AlertTriangle className="h-3 w-3 text-orange-500" title="Action Required" />
                                )}
                                {isItemExpanded ? 
                                  <ChevronDown className="h-3 w-3 text-muted-foreground" /> :
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                }
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{announcement.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                variant="secondary" 
                                className={cn("text-xs px-2 py-0", typeColors[announcement.type as keyof typeof typeColors])}
                              >
                                {announcement.type.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{formatDate(announcement.created_at)}</span>
                              {announcement.action_deadline && isDeadlineApproaching(announcement.action_deadline) && (
                                <Badge variant="destructive" className="text-xs">
                                  Due {formatDate(announcement.action_deadline)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {isItemExpanded && (
                          <div className="ml-7 p-3 bg-background border rounded-lg">
                            <div className="space-y-3">
                              <div>
                                <h5 className="font-medium text-sm mb-2">Full Details</h5>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {announcement.content}
                                </p>
                              </div>
                              
                              {announcement.action_required && (
                                <div className="p-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Action Required</span>
                                  </div>
                                  {announcement.action_deadline && (
                                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                                      Deadline: {new Date(announcement.action_deadline).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 gap-4 pt-2 border-t text-xs">
                                <div>
                                  <span className="text-muted-foreground">Author:</span>
                                  <span className="ml-1 font-medium">{announcement.author}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Priority:</span>
                                  <span className="ml-1 font-medium capitalize">{announcement.priority}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Target:</span>
                                  <span className="ml-1 font-medium">{announcement.target_audience.replace('_', ' ')}</span>
                                </div>
                                {announcement.valid_until && (
                                  <div>
                                    <span className="text-muted-foreground">Valid Until:</span>
                                    <span className="ml-1 font-medium">{formatDate(announcement.valid_until)}</span>
                                  </div>
                                )}
                              </div>
                              
                              {announcement.tags && announcement.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {announcement.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No announcements available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}