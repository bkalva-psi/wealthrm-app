import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Calendar, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

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
  const [showAll, setShowAll] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

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
  const displayedPoints = showAll ? activeTalkingPoints : activeTalkingPoints.slice(0, 3);

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <Lightbulb className="h-6 w-6 text-ujjivan-primary" />
          <h1 className="text-2xl font-bold text-slate-900">Insights</h1>
          <Badge variant="secondary" className="ml-auto">
            {activeTalkingPoints.length} Active
          </Badge>
        </div>
        
        <p className="text-slate-600 mt-2">
          Market insights and conversation starters to enhance client discussions
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {activeTalkingPoints.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            {displayedPoints.map((point, index) => {
              const isExpanded = expandedItems.has(point.id);
              return (
                <div
                  key={point.id}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                    index !== displayedPoints.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                  onClick={() => toggleExpanded(point.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 mb-1">
                        {point.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="capitalize">{point.category.replace('_', ' ')}</span>
                        <span>{format(new Date(point.created_at), 'MMM dd')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-4">
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                        <strong>Summary:</strong> {point.summary}
                      </div>
                      
                      <div className="prose prose-sm text-slate-700">
                        <p>{point.detailed_content}</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
                        <div className="flex items-center text-sm text-slate-500">
                          <Tag className="h-4 w-4 mr-1" />
                          <span className="font-medium">{point.source}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-slate-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Valid until: {format(new Date(point.valid_until), 'MMM dd, yyyy')}
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
                    </div>
                  )}
                </div>
              );
            })}

            {activeTalkingPoints.length > 3 && (
              <div className="p-4 border-t border-slate-100">
                <Button
                  variant="ghost"
                  className="w-full text-slate-600 hover:text-slate-900"
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
                      Show More ({activeTalkingPoints.length - 3} more)
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
              <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Insights</h3>
              <p className="text-slate-500">Check back later for new market insights and conversation starters.</p>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}