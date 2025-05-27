import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Megaphone, 
  ChevronRight, 
  ChevronDown,
  AlertTriangle,
  TrendingUp,
  Gift,
  Users,
  Target,
  FileText
} from "lucide-react";
import { format } from "date-fns";
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
  product_update: TrendingUp,
  incentive: Gift,
  policy: FileText,
  general: Megaphone,
  team_update: Users
};

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-400';
  }
};

export function AnnouncementsCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['/api/announcements'],
    select: (data: any) => Array.isArray(data) ? data : []
  });

  const toggleItemExpansion = (itemKey: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const hasMore = announcements.length > 2;

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-medium text-slate-700">Announcements</h2>
          </div>
          {hasMore && (
            isExpanded ? 
              <ChevronDown className="h-4 w-4 text-slate-400" /> :
              <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>
      
      <div className="divide-y divide-slate-200">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="px-4 py-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full p-0 h-auto justify-start hover:bg-transparent">
                <div className="flex items-center gap-2 w-full">
                  <Megaphone className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-slate-700 flex-1 text-left">
                    Product Updates ({announcements.length})
                  </span>
                </div>
              </Button>
            </CollapsibleTrigger>
            
            {isLoading ? (
              <div className="space-y-2 mt-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : announcements.length > 0 ? (
              <div className="space-y-2 mt-3">
                {announcements.slice(0, 2).map((announcement: any) => {
                  const announcementKey = `announcement-${announcement.id}`;
                  const isItemExpanded = expandedItems[announcementKey];
                  const IconComponent = typeIcons[announcement.type as keyof typeof typeIcons] || Megaphone;
                  return (
                    <div key={announcement.id}>
                      <div 
                        className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1 rounded"
                        onClick={() => toggleItemExpansion(announcementKey)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{announcement.title}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {announcement.action_required && (
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                          )}
                          <div 
                            className={cn("w-2 h-2 rounded-full", getPriorityColor(announcement.priority))}
                            title={`Priority: ${announcement.priority}`}
                          />
                        </div>
                      </div>
                      {isItemExpanded && (
                        <div className="mt-2 ml-6 p-2 bg-orange-50 rounded-md text-xs">
                          <div className="space-y-1">
                            <div><span className="font-medium">Type:</span> {announcement.type.replace('_', ' ')}</div>
                            <div><span className="font-medium">Details:</span> {announcement.content}</div>
                            <div><span className="font-medium">From:</span> {announcement.author}</div>
                            <div><span className="font-medium">Valid until:</span> {format(new Date(announcement.valid_until), "MMM d, yyyy")}</div>
                            {announcement.action_required && (
                              <div><span className="font-medium">Action by:</span> {format(new Date(announcement.action_deadline), "MMM d, yyyy")}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-3">No announcements available</p>
            )}
          </div>
          
          <CollapsibleContent>
            {announcements.length > 2 && (
              <div className="px-4 py-3 space-y-2">
                {announcements.slice(2).map((announcement: any) => {
                  const announcementKey = `announcement-${announcement.id}`;
                  const isItemExpanded = expandedItems[announcementKey];
                  const IconComponent = typeIcons[announcement.type as keyof typeof typeIcons] || Megaphone;
                  return (
                    <div key={announcement.id}>
                      <div 
                        className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1 rounded"
                        onClick={() => toggleItemExpansion(announcementKey)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{announcement.title}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {announcement.action_required && (
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                          )}
                          <div 
                            className={cn("w-2 h-2 rounded-full", getPriorityColor(announcement.priority))}
                            title={`Priority: ${announcement.priority}`}
                          />
                        </div>
                      </div>
                      {isItemExpanded && (
                        <div className="mt-2 ml-6 p-2 bg-orange-50 rounded-md text-xs">
                          <div className="space-y-1">
                            <div><span className="font-medium">Type:</span> {announcement.type.replace('_', ' ')}</div>
                            <div><span className="font-medium">Details:</span> {announcement.content}</div>
                            <div><span className="font-medium">From:</span> {announcement.author}</div>
                            <div><span className="font-medium">Valid until:</span> {format(new Date(announcement.valid_until), "MMM d, yyyy")}</div>
                            {announcement.action_required && (
                              <div><span className="font-medium">Action by:</span> {format(new Date(announcement.action_deadline), "MMM d, yyyy")}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}