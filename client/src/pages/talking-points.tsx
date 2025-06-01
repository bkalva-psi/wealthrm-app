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
      <div className="min-h-screen bg-background transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <div className="text-muted-foreground font-medium">Loading talking points...</div>
            </div>
          </div>
        </div>
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
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Enhanced Sticky Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 backdrop-blur-sm bg-card/95 animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Market Insights</h1>
          <Badge variant="secondary" className="ml-auto font-semibold">
            {activeTalkingPoints.length} Active Points
          </Badge>
        </div>
        
        <p className="text-muted-foreground mt-2 font-medium leading-relaxed">
          Market insights and conversation starters to enhance client discussions
        </p>
      </div>

      {/* Enhanced Main Content */}
      <div className="p-6 space-y-6 animate-in fade-in duration-700 delay-200">
        {activeTalkingPoints.length > 0 ? (
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-0">
            {displayedPoints.map((point, index) => {
              const isExpanded = expandedItems.has(point.id);
              return (
                <div
                  key={point.id}
                  className={`p-6 cursor-pointer hover:bg-muted/30 transition-all duration-300 hover:scale-[1.01] animate-in slide-in-from-left-4 duration-500 ${
                    index !== displayedPoints.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => toggleExpanded(point.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {point.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="outline" className="capitalize font-medium">
                          {point.category.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="font-medium">{format(new Date(point.created_at), 'MMM dd, yyyy')}</span>
                        </div>
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
                      <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-lg">
                        <strong>Summary:</strong> {point.summary}
                      </div>
                      
                      <div className="prose prose-sm text-foreground">
                        <p>{point.detailed_content}</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Tag className="h-4 w-4 mr-1" />
                          <span className="font-medium">{point.source}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
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
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Active Insights</h3>
              <p className="text-muted-foreground">Check back later for new market insights and conversation starters.</p>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}