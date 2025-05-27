import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ChevronDown, TrendingUp, BarChart3, AlertCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

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

const categoryIcons = {
  quarterly_results: BarChart3,
  market_analysis: TrendingUp,
  regulatory_update: AlertCircle,
  product_launch: Lightbulb,
  compliance: AlertCircle,
  product_update: Lightbulb,
};

const categoryColors = {
  quarterly_results: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  market_analysis: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", 
  regulatory_update: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  product_launch: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  compliance: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  product_update: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
};

export function TalkingPointsCard() {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: talkingPoints = [], isLoading } = useQuery<TalkingPoint[]>({
    queryKey: ['/api/talking-points'],
  });



  const toggleItemExpansion = (itemKey: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const displayPoints = isExpanded ? talkingPoints : talkingPoints.slice(0, 3);
  const hasMore = talkingPoints.length > 3;

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700">Talking Points</h2>
          <Lightbulb className="h-4 w-4 text-slate-500" />
        </div>
      </div>
      
      <div className="divide-y divide-slate-200">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="px-4 py-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full p-0 h-auto justify-start hover:bg-transparent">
                <div className="flex items-center gap-2 w-full">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-medium text-slate-700 flex-1 text-left">
                    Key Market Insights ({talkingPoints.length})
                  </span>
                  {hasMore && (
                    isExpanded ? 
                      <ChevronDown className="h-4 w-4 text-slate-400" /> :
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            
            {isLoading ? (
              <div className="space-y-2 mt-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : talkingPoints.length > 0 ? (
              <div className="space-y-2 mt-3">
                {talkingPoints.slice(0, 2).map((point) => {
                  const pointKey = `talking-point-${point.id}`;
                  const isItemExpanded = expandedItems[pointKey];
                  const IconComponent = categoryIcons[point.category as keyof typeof categoryIcons] || Lightbulb;
                  return (
                    <div key={point.id}>
                      <div 
                        className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1 rounded"
                        onClick={() => toggleItemExpansion(pointKey)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{point.title}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <div 
                            className={cn("w-2 h-2 rounded-full", getRelevanceColor(point.relevance_score))}
                            title={`Relevance: ${point.relevance_score}/10`}
                          />
                        </div>
                      </div>
                      {isItemExpanded && (
                        <div className="mt-2 ml-6 p-2 bg-blue-50 rounded-md text-xs">
                          <div className="space-y-1">
                            <div><span className="font-medium">Summary:</span> {point.summary}</div>
                            <div><span className="font-medium">Details:</span> {point.detailed_content}</div>
                            <div><span className="font-medium">Source:</span> {point.source}</div>
                            <div><span className="font-medium">Valid until:</span> {format(new Date(point.valid_until), "MMM d, yyyy")}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-3">No talking points available</p>
            )}
          </div>
          
          <CollapsibleContent>
            {talkingPoints.length > 2 && (
              <div className="px-4 py-3 space-y-2">
                {talkingPoints.slice(2).map((point) => {
                  const pointKey = `talking-point-${point.id}`;
                  const isItemExpanded = expandedItems[pointKey];
                  const IconComponent = categoryIcons[point.category as keyof typeof categoryIcons] || Lightbulb;
                  return (
                    <div key={point.id}>
                      <div 
                        className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1 rounded"
                        onClick={() => toggleItemExpansion(pointKey)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{point.title}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <div 
                            className={cn("w-2 h-2 rounded-full", getRelevanceColor(point.relevance_score))}
                            title={`Relevance: ${point.relevance_score}/10`}
                          />
                        </div>
                      </div>
                      {isItemExpanded && (
                        <div className="mt-2 ml-6 p-2 bg-blue-50 rounded-md text-xs">
                          <div className="space-y-1">
                            <div><span className="font-medium">Summary:</span> {point.summary}</div>
                            <div><span className="font-medium">Details:</span> {point.detailed_content}</div>
                            <div><span className="font-medium">Source:</span> {point.source}</div>
                            <div><span className="font-medium">Valid until:</span> {format(new Date(point.valid_until), "MMM d, yyyy")}</div>
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
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : talkingPoints.length > 0 ? (
          <>
            <div className="space-y-3">
              {displayPoints.map((point) => {
                const pointKey = `talking-point-${point.id}`;
                const isItemExpanded = expandedItems[pointKey];
                const IconComponent = categoryIcons[point.category as keyof typeof categoryIcons] || Lightbulb;
                
                return (
                  <div key={point.id} className="space-y-2">
                    <div 
                      className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => toggleItemExpansion(pointKey)}
                    >
                      <IconComponent className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-xs leading-tight text-foreground">{point.title}</h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <div 
                              className={cn("w-2 h-2 rounded-full", getRelevanceColor(point.relevance_score))}
                              title={`Relevance: ${point.relevance_score}/10`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {isItemExpanded && (
                      <div className="ml-7 p-3 bg-background border rounded-lg">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {point.summary}
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge 
                                variant="secondary" 
                                className={cn("text-xs px-2 py-0", categoryColors[point.category as keyof typeof categoryColors])}
                              >
                                {point.category.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{formatDate(point.created_at)}</span>
                            </div>
                            <h5 className="font-medium text-sm mb-2">Detailed Information</h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {point.detailed_content}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-xs text-muted-foreground">Source: {point.source}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">Relevance:</span>
                              <span className="text-xs font-medium">{point.relevance_score}/10</span>
                            </div>
                          </div>
                          {point.tags && point.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {point.tags.map((tag, index) => (
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
                  {talkingPoints.slice(3).map((point) => {
                    const pointKey = `talking-point-${point.id}`;
                    const isItemExpanded = expandedItems[pointKey];
                    const IconComponent = categoryIcons[point.category as keyof typeof categoryIcons] || Lightbulb;
                    
                    return (
                      <div key={point.id} className="space-y-2">
                        <div 
                          className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                          onClick={() => toggleItemExpansion(pointKey)}
                        >
                          <IconComponent className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm leading-tight">{point.title}</h4>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <div 
                                  className={cn("w-2 h-2 rounded-full", getRelevanceColor(point.relevance_score))}
                                  title={`Relevance: ${point.relevance_score}/10`}
                                />
                                {isItemExpanded ? 
                                  <ChevronDown className="h-3 w-3 text-muted-foreground" /> :
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                }
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{point.summary}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                variant="secondary" 
                                className={cn("text-xs px-2 py-0", categoryColors[point.category as keyof typeof categoryColors])}
                              >
                                {point.category.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{formatDate(point.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {isItemExpanded && (
                          <div className="ml-7 p-3 bg-background border rounded-lg">
                            <div className="space-y-3">
                              <div>
                                <h5 className="font-medium text-sm mb-2">Detailed Information</h5>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {point.detailed_content}
                                </p>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-xs text-muted-foreground">Source: {point.source}</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">Relevance:</span>
                                  <span className="text-xs font-medium">{point.relevance_score}/10</span>
                                </div>
                              </div>
                              {point.tags && point.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {point.tags.map((tag, index) => (
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
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No talking points available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}