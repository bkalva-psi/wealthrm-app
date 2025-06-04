import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { 
  ChevronRight, 
  ChevronDown,
  Megaphone,
  AlertCircle,
  Info,
  Star,
  Calendar,
  Bell
} from "lucide-react";

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
  campaign: Megaphone,
  policy_update: AlertCircle,
  general: Info,
  product_update: Star,
  training: Calendar,
};

export function AnnouncementsCard() {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['/api/announcements'],
  });

  // Group announcements by type
  const groupedAnnouncements = announcements.reduce((groups: any, announcement: Announcement) => {
    const type = announcement.type || 'general';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(announcement);
    return groups;
  }, {});

  const categories = {
    campaign: {
      title: 'Campaigns',
      color: 'text-accent-foreground',
      bgColor: 'bg-accent border-border',
      count: groupedAnnouncements.campaign?.length || 0,
      items: groupedAnnouncements.campaign || []
    },
    policy_update: {
      title: 'Policy Updates',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10 border-destructive/20',
      count: groupedAnnouncements.policy_update?.length || 0,
      items: groupedAnnouncements.policy_update || []
    },
    product_update: {
      title: 'Product Updates',
      color: 'text-accent-foreground',
      bgColor: 'bg-accent border-border',
      count: groupedAnnouncements.product_update?.length || 0,
      items: groupedAnnouncements.product_update || []
    },
    training: {
      title: 'Training',
      color: 'text-accent-foreground',
      bgColor: 'bg-accent border-border',
      count: groupedAnnouncements.training?.length || 0,
      items: groupedAnnouncements.training || []
    },
    general: {
      title: 'General',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted border-border',
      count: groupedAnnouncements.general?.length || 0,
      items: groupedAnnouncements.general || []
    }
  };

  const totalAnnouncements = Object.values(categories).reduce((sum, category) => sum + category.count, 0);

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
      <Card className="bg-card text-card-foreground border-unified transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 transform hover:scale-[1.01] interactive-hover">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-300 focus-enhanced">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg brand-accent-bg-subtle transition-all duration-300 hover:bg-primary/20 hover:scale-110 interactive-scale">
                  <Bell size={20} className="brand-accent transition-all duration-300" />
                </div>
                <CardTitle className="text-lg transition-colors duration-300 brand-accent-subtle">Updates</CardTitle>
              </div>
              {isOpen ? (
                <ChevronDown size={20} className="transition-all duration-300 brand-accent" />
              ) : (
                <ChevronRight size={20} className="transition-all duration-300 text-muted-foreground hover:text-primary brand-accent-subtle" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            <div className="px-3 sm:px-4 py-3 sm:py-4">
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <h3 className="font-semibold text-sm text-muted-foreground leading-tight">Updates</h3>
                  <p className="text-xl font-bold text-foreground transition-all duration-300 group-hover:scale-105 leading-tight tracking-tight">
                    {totalAnnouncements}
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mt-3">
                Important announcements, campaigns, and policy updates for relationship managers.
              </div>
              
              <div className="mt-3 space-y-3">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  Object.entries(categories).map(([key, category]) => {
                    if (category.count === 0) return null;
                    
                    const isExpanded = expandedCategories.has(key);
                    const IconComponent = typeIcons[key as keyof typeof typeIcons] || Info;
                    
                    return (
                      <Collapsible key={key} open={isExpanded} onOpenChange={() => toggleCategory(key)}>
                        <div className={`rounded-lg border p-3 ${category.bgColor}`}>
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
                                  <h3 className="font-semibold text-sm text-foreground">{category.title}</h3>
                                  <p className={`text-lg font-bold ${category.color}`}>
                                    {category.count}
                                  </p>
                                </div>
                              </div>
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </Button>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="mt-3">
                            <div className="space-y-2">
                              {category.items.length === 0 ? (
                                <div className="text-sm text-muted-foreground italic">
                                  No {category.title.toLowerCase()} at this time
                                </div>
                              ) : (
                                category.items.slice(0, 5).map((item: Announcement, index: number) => {
                                  const isItemExpanded = expandedItems.has(item.id?.toString() || index.toString());
                                  
                                  return (
                                    <div 
                                      key={item.id || index} 
                                      className="bg-background border border-border rounded p-3 text-sm hover:bg-muted/50 transition-colors cursor-pointer"
                                      onClick={() => {
                                        const itemKey = item.id?.toString() || index.toString();
                                        const newExpanded = new Set(expandedItems);
                                        if (newExpanded.has(itemKey)) {
                                          newExpanded.delete(itemKey);
                                        } else {
                                          newExpanded.add(itemKey);
                                        }
                                        setExpandedItems(newExpanded);
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="font-medium text-foreground mb-1 flex-1">{item.title}</div>
                                        <div className="text-muted-foreground ml-2">
                                          {isItemExpanded ? '−' : '+'}
                                        </div>
                                      </div>
                                      
                                      {!isItemExpanded && (
                                        <div className="text-muted-foreground text-xs">
                                          Priority: {item.priority} • {item.author}
                                        </div>
                                      )}
                                      
                                      {isItemExpanded && (
                                        <div className="mt-3 space-y-3">
                                          {item.content && (
                                            <div className="text-foreground text-xs leading-relaxed bg-muted/30 px-2 py-1 rounded">
                                              {item.content}
                                            </div>
                                          )}
                                          
                                          <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                                              {item.type}
                                            </span>
                                            <span className={`px-2 py-1 rounded ${
                                              item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                              item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                              'bg-green-100 text-green-700'
                                            }`}>
                                              {item.priority} priority
                                            </span>
                                          </div>
                                          
                                          {item.tags && item.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                              {item.tags.map((tag: string, tagIndex: number) => (
                                                <span key={tagIndex} className="bg-muted text-foreground text-xs px-1.5 py-0.5 rounded">
                                                  {tag}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                          
                                          <div className="text-muted-foreground text-xs pt-2 border-t border-border">
                                            <div>Author: {item.author}</div>
                                            {item.action_required && (
                                              <div className="text-orange-600 font-medium mt-1">Action Required</div>
                                            )}
                                            <div>Valid until: {format(new Date(item.valid_until), 'MMM dd, yyyy')}</div>
                                          </div>
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
                  })
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}