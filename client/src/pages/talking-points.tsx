import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";

interface TalkingPoint {
  id: number;
  title: string;
  category: string;
  summary: string;
  detailed_content: string;
  source: string;
  relevance_score: number;
  valid_until: string;
  tags: string[];
  created_at: string;
  is_active: boolean;
}

export default function TalkingPointsPage() {
  const { data: talkingPoints, isLoading } = useQuery<TalkingPoint[]>({
    queryKey: ['/api/talking-points'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading talking points...</div>
      </div>
    );
  }

  const activeTalkingPoints = talkingPoints?.filter(point => point.is_active) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Lightbulb className="h-6 w-6 text-ujjivan-primary" />
        <h1 className="text-2xl font-bold text-slate-900">Talking Points</h1>
        <Badge variant="secondary" className="ml-auto">
          {activeTalkingPoints.length} Active Points
        </Badge>
      </div>
      
      <p className="text-slate-600">
        Market insights and conversation starters to enhance client discussions
      </p>

      <div className="grid gap-6">
        {activeTalkingPoints.map((point) => (
          <Card key={point.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    {point.title}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {point.summary}
                  </CardDescription>
                </div>
                <Badge 
                  variant={point.relevance_score >= 8 ? "default" : "secondary"}
                  className="ml-4 shrink-0"
                >
                  Score: {point.relevance_score}/10
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="prose prose-sm text-slate-700">
                <p>{point.detailed_content}</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center text-sm text-slate-500">
                  <Tag className="h-4 w-4 mr-1" />
                  Category: <span className="font-medium ml-1 capitalize">{point.category.replace('_', ' ')}</span>
                </div>
                
                <div className="flex items-center text-sm text-slate-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  Valid until: {format(new Date(point.valid_until), 'MMM dd, yyyy')}
                </div>
                
                <div className="flex items-center text-sm text-slate-500">
                  Source: <span className="font-medium ml-1">{point.source}</span>
                </div>
              </div>
              
              {point.tags && point.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {point.tags.map((tag, index) => (
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

      {activeTalkingPoints.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Talking Points</h3>
              <p className="text-slate-500">Check back later for new market insights and conversation starters.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}