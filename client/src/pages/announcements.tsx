import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Calendar, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";

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
  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ['/api/announcements'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading announcements...</div>
      </div>
    );
  }

  const activeAnnouncements = announcements?.filter(announcement => announcement.is_active) || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'campaign': return 'bg-blue-100 text-blue-800';
      case 'policy': return 'bg-purple-100 text-purple-800';
      case 'product': return 'bg-indigo-100 text-indigo-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Megaphone className="h-6 w-6 text-ujjivan-primary" />
        <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
        <Badge variant="secondary" className="ml-auto">
          {activeAnnouncements.length} Active
        </Badge>
      </div>
      
      <p className="text-slate-600">
        Important updates, campaigns, and communications from the product team
      </p>

      <div className="grid gap-6">
        {activeAnnouncements.map((announcement) => (
          <Card key={announcement.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPriorityColor(announcement.priority)} variant="outline">
                      {announcement.priority.toUpperCase()}
                    </Badge>
                    <Badge className={getTypeColor(announcement.type)} variant="secondary">
                      {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                    </Badge>
                    {announcement.action_required && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Action Required
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    {announcement.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="prose prose-sm text-slate-700">
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
              
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center text-sm text-slate-500">
                  <User className="h-4 w-4 mr-1" />
                  By: <span className="font-medium ml-1">{announcement.author}</span>
                </div>
                
                <div className="flex items-center text-sm text-slate-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  Valid until: {format(new Date(announcement.valid_until), 'MMM dd, yyyy')}
                </div>
                
                <div className="flex items-center text-sm text-slate-500">
                  Target: <span className="font-medium ml-1 capitalize">{announcement.target_audience.replace('_', ' ')}</span>
                </div>
              </div>
              
              {announcement.tags && announcement.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {announcement.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {activeAnnouncements.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Announcements</h3>
              <p className="text-slate-500">Check back later for new updates and communications.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}