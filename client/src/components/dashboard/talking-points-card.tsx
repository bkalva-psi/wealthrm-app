import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { ChevronRight, ChevronDown } from "lucide-react";

export function TalkingPointsCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { data: talkingPoints = [], isLoading } = useQuery({
    queryKey: ['/api/talking-points'],
  });

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
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Key Market Insights</CardTitle>
              <ChevronRight size={20} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CardContent className="space-y-3 pt-0">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="text-left">
                <h3 className="font-semibold text-sm">Key Market Insights</h3>
                <p className="text-lg font-bold text-amber-600">
                  {talkingPoints.length}
                </p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-2 mt-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : talkingPoints.length > 0 ? (
              <div className="mt-3 space-y-2">
                {talkingPoints.slice(0, 2).map((point: any) => {
                  const itemKey = `talking-point-${point.id}`;
                  const isItemExpanded = expandedItems.has(itemKey);
                  
                  return (
                    <div key={point.id} className="bg-white rounded border border-slate-100 overflow-hidden">
                      <Button
                        variant="ghost"
                        className="w-full p-2 h-auto justify-start hover:bg-slate-50"
                        onClick={() => toggleItem(itemKey)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm">{point.title}</div>
                            <div className="text-xs text-slate-600">
                              {point.category.replace('_', ' ')} • Relevance: {point.relevance_score}/10
                            </div>
                          </div>
                          {isItemExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                      </Button>
                      {isItemExpanded && (
                        <div className="px-3 pb-3">
                          <div className="text-sm space-y-2">
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
              <p className="text-xs text-slate-500 italic mt-3">No talking points available</p>
            )}
          </div>
          
          <CollapsibleContent className="mt-3">
            {talkingPoints.length > 2 && (
              <div className="px-4 py-3 space-y-2">
                {talkingPoints.slice(2).map((point: any) => {
                  const itemKey = `talking-point-${point.id}`;
                  const isItemExpanded = expandedItems.has(itemKey);
                  
                  return (
                    <div key={point.id} className="bg-white rounded border border-slate-100 overflow-hidden">
                      <Button
                        variant="ghost"
                        className="w-full p-2 h-auto justify-start hover:bg-slate-50"
                        onClick={() => toggleItem(itemKey)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm">{point.title}</div>
                            <div className="text-xs text-slate-600">
                              {point.category.replace('_', ' ')} • Relevance: {point.relevance_score}/10
                            </div>
                          </div>
                          {isItemExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                      </Button>
                      {isItemExpanded && (
                        <div className="px-3 pb-3">
                          <div className="text-sm space-y-2">
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
        </CardContent>
      </Card>
    </Collapsible>
  );
}