import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, User, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  target_audience: string;
  valid_from: string;
  valid_until: string;
  author: string;
  action_required: boolean;
  action_deadline?: string;
  tags: string[];
  created_at: string;
  is_active: boolean;
}

export default function AnnouncementsPage() {
  const [showAll, setShowAll] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ['/api/announcements'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-muted-foreground">Loading announcements...</div>
      </div>
    );
  }

  const activeAnnouncements = announcements?.filter(announcement => announcement.is_active) || [];
  const displayedAnnouncements = showAll ? activeAnnouncements : activeAnnouncements.slice(0, 3);

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-muted text-foreground border-border';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'campaign': return 'bg-blue-100 text-blue-800';
      case 'policy': return 'bg-purple-100 text-purple-800';
      case 'product': return 'bg-indigo-100 text-indigo-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-muted text-foreground';
    }
  };

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 bg-card border-b border-border p-6">
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6 text-ujjivan-primary" />
          <h1 className="text-2xl font-bold text-foreground">Updates</h1>
          <span className="ml-auto text-sm text-muted-foreground">
            {activeAnnouncements.length} Active
          </span>
        </div>
      </div>
      
      <div className="p-6 pt-0 space-y-6">
        {activeAnnouncements.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            {displayedAnnouncements.map((announcement, index) => {
              const isExpanded = expandedItems.has(announcement.id);
              return (
                <div
                  key={announcement.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    index !== displayedAnnouncements.length - 1 ? 'border-b border-border' : ''
                  }`}
                  onClick={() => toggleExpanded(announcement.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">
                        {announcement.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{announcement.author}</span>
                        <span>{format(new Date(announcement.created_at), 'MMM dd')}</span>
                        {announcement.action_required && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            Action Required
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-4">
                      <div className="prose prose-sm text-foreground">
                        <p className="whitespace-pre-wrap">{announcement.content}</p>
                      </div>
                      
                      {announcement.action_required && announcement.action_deadline && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">Action Deadline:</span>
                            <span>{format(new Date(announcement.action_deadline), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-1" />
                          By: <span className="font-medium ml-1">{announcement.author}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          Valid until: {format(new Date(announcement.valid_until), 'MMM dd, yyyy')}
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          Target: <span className="font-medium ml-1 capitalize">{announcement.target_audience.replace('_', ' ')}</span>
                        </div>
                      </div>
                      

                    </div>
                  )}
                </div>
              );
            })}

            {activeAnnouncements.length > 3 && (
              <div className="p-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show More ({activeAnnouncements.length - 3} more)
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Active Announcements</h3>
              <p className="text-muted-foreground">Check back later for new updates and communications.</p>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}