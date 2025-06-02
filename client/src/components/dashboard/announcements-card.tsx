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
      color: 'text-primary',
      count: groupedAnnouncements.campaign?.length || 0,
      items: groupedAnnouncements.campaign || []
    },
    policy_update: {
      title: 'Policy Updates',
      color: 'text-destructive',
      count: groupedAnnouncements.policy_update?.length || 0,
      items: groupedAnnouncements.policy_update || []
    },
    product_update: {
      title: 'Product Updates',
      color: 'text-secondary',
      count: groupedAnnouncements.product_update?.length || 0,
      items: groupedAnnouncements.product_update || []
    },
    training: {
      title: 'Training',
      color: 'text-primary',
      count: groupedAnnouncements.training?.length || 0,
      items: groupedAnnouncements.training || []
    },
    general: {
      title: 'General',
      color: 'text-muted-foreground',
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
      <Card className="bg-card text-card-foreground border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 transform hover:scale-[1.01]">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 transition-all duration-300 hover:bg-primary/20 hover:scale-110">
                  <Bell size={20} className="text-primary transition-all duration-300" />
                </div>
                <CardTitle className="text-lg transition-colors duration-300">Updates</CardTitle>
              </div>
              {isOpen ? (
                <ChevronDown size={20} className="transition-all duration-300 text-primary" />
              ) : (
                <ChevronRight size={20} className="transition-all duration-300 text-muted-foreground hover:text-primary" />
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
                  <p className="text-xl font-bold text-blue-600 leading-tight tracking-tight">
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
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full p-2 h-auto justify-between hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg bg-background/60 ${category.color}`}>
                                <IconComponent size={18} />
                              </div>
                              <div className="text-left">
                                <h3 className="font-semibold text-sm">{category.title}</h3>
                                <p className={`text-lg font-bold ${category.color}`}>
                                  {category.count}
                                </p>
                              </div>
                            </div>
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </Button>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="mt-3">
                          <div className="mt-3 px-3 pb-3 space-y-2">
                            {category.items.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">No items at this time</p>
                            ) : (
                              category.items.slice(0, 5).map((item: Announcement, index: number) => {
                                const itemKey = `${key}-${item.id || index}`;
                                const isItemExpanded = expandedItems.has(itemKey);
                                
                                return (
                                  <div key={index} className="bg-card rounded border border-border overflow-hidden">
                                    <Button
                                      variant="ghost"
                                      className="w-full p-2 h-auto justify-start hover:bg-muted/50"
                                      onClick={() => toggleItem(itemKey)}
                                    >
                                      <div className="flex items-center gap-2 w-full">
                                        <div className="flex-1 text-left">
                                          <div className="font-medium text-sm">{item.title}</div>
                                          <div className="text-xs text-muted-foreground">
                                            Priority: {item.priority} • {item.author}
                                          </div>
                                        </div>
                                        {isItemExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                      </div>
                                    </Button>
                                    {isItemExpanded && (
                                      <div className="px-3 pb-3">
                                        <div className="text-sm space-y-2">
                                          <div><span className="font-medium">Content:</span> {item.content}</div>
                                          <div><span className="font-medium">Valid until:</span> {format(new Date(item.valid_until), "MMM d, yyyy")}</div>
                                          {item.action_required && (
                                            <div><span className="font-medium">Action deadline:</span> {format(new Date(item.action_deadline), "MMM d, yyyy")}</div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </CollapsibleContent>
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