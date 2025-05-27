import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Building, 
  Globe, 
  ChevronRight, 
  ChevronDown 
} from "lucide-react";

const categoryIcons = {
  market_analysis: TrendingUp,
  regulatory_update: AlertTriangle,
  company_news: Building,
  economic_indicator: Globe,
  investment_strategy: Lightbulb,
};

const getRelevanceColor = (score: number) => {
  if (score >= 8) return "bg-green-500";
  if (score >= 6) return "bg-yellow-500";
  return "bg-red-500";
};

export function TalkingPointsCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const { data: talkingPoints = [], isLoading } = useQuery({
    queryKey: ['/api/talking-points'],
  });

  const toggleItemExpansion = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const hasMore = talkingPoints.length > 2;

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
                {talkingPoints.slice(0, 2).map((point: any) => {
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
                {talkingPoints.slice(2).map((point: any) => {
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