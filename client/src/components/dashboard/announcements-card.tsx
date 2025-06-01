import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="px-4 py-3 border-b border-slate-200 bg-white">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full p-0 h-auto justify-between hover:bg-transparent">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/60">
                  <Megaphone size={18} className="text-slate-500" />
                </div>
                <h2 className="text-sm font-medium text-slate-700">Announcements</h2>
              </div>
              {hasMore && (
                isExpanded ? 
                  <ChevronDown size={20} className="text-slate-400" /> :
                  <ChevronRight size={20} className="text-slate-400" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CardContent className="space-y-3 pt-0">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="text-left">
                <h3 className="font-semibold text-sm">Product Updates</h3>
                <p className="text-lg font-bold text-blue-600">
                  {announcements.length}
                </p>
              </div>
            </div>
            
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
                          <IconComponent size={18} className="text-muted-foreground" />
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
          
          
          <CollapsibleContent className="mt-3">
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
                          <IconComponent size={18} className="text-muted-foreground" />
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
        </CardContent>
      </Collapsible>
    </Card>
  );
}