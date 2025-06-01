import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { 
  ChevronRight, 
  ChevronDown,
  TrendingUp, 
  AlertTriangle, 
  Building, 
  Globe, 
  Lightbulb 
} from "lucide-react";

const categoryIcons = {
  market_analysis: TrendingUp,
  regulatory_update: AlertTriangle,
  company_news: Building,
  economic_indicator: Globe,
  investment_strategy: Lightbulb,
};

export function TalkingPointsCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { data: talkingPoints = [], isLoading } = useQuery({
    queryKey: ['/api/talking-points'],
  });

  // Group talking points by category
  const groupedPoints = talkingPoints.reduce((groups: any, point: any) => {
    const category = point.category || 'general';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(point);
    return groups;
  }, {});

  const categories = {
    market_analysis: {
      title: 'Market Analysis',
      color: 'text-primary',
      count: groupedPoints.market_analysis?.length || 0,
      items: groupedPoints.market_analysis || []
    },
    regulatory_update: {
      title: 'Regulatory Updates',
      color: 'text-secondary',
      count: groupedPoints.regulatory_update?.length || 0,
      items: groupedPoints.regulatory_update || []
    },
    company_news: {
      title: 'Company News',
      color: 'text-primary',
      count: groupedPoints.company_news?.length || 0,
      items: groupedPoints.company_news || []
    },
    economic_indicator: {
      title: 'Economic Indicators',
      color: 'text-secondary',
      count: groupedPoints.economic_indicator?.length || 0,
      items: groupedPoints.economic_indicator || []
    },
    investment_strategy: {
      title: 'Investment Strategy',
      color: 'text-primary',
      count: groupedPoints.investment_strategy?.length || 0,
      items: groupedPoints.investment_strategy || []
    }
  };

  const totalTalkingPoints = Object.values(categories).reduce((sum, category) => sum + category.count, 0);

  const toggleCategory = (categoryKey: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

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
      <Card className="bg-card text-card-foreground border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 transform hover:scale-[1.01]">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 transition-all duration-300 hover:bg-primary/20 hover:scale-110">
                  <Lightbulb size={20} className="text-primary transition-all duration-300" />
                </div>
                <CardTitle className="text-lg transition-colors duration-300">Market Insights</CardTitle>
              </div>
              {isOpen ? (
                <ChevronDown size={20} className="transition-all duration-300 text-primary" />
              ) : (
                <ChevronRight size={20} className="transition-all duration-300 text-muted-foreground hover:text-primary" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <h3 className="font-semibold text-sm">Market Insights</h3>
                  <p className="text-lg font-bold text-amber-600">
                    {totalTalkingPoints}
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mt-3">
                Market insights, regulatory updates, and investment strategies to discuss with clients.
              </div>
              
              <div className="mt-3 space-y-3">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  Object.entries(categories).map(([key, category]) => {
                    if (category.count === 0) return null;
                    
                    const isExpanded = expandedCategories.has(key);
                    const IconComponent = categoryIcons[key as keyof typeof categoryIcons] || Lightbulb;
                    
                    return (
                      <Collapsible key={key} open={isExpanded} onOpenChange={() => toggleCategory(key)}>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full p-2 h-auto justify-between hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg bg-background/60 ${category.color}`}>
                                <IconComponent size={18} />
                              </div>
                              <div className="text-left">
                                <h3 className="font-semibold text-sm">{category.title}</h3>
                                <p className={`text-lg font-bold ${category.color}`}>
                                  {category.count}
                                </p>
                              </div>
                            </div>
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </Button>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="mt-3">
                          <div className="mt-3 px-3 pb-3 space-y-2">
                            {category.items.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">No items at this time</p>
                            ) : (
                              category.items.slice(0, 5).map((item: any, index: number) => {
                                const itemKey = `${key}-${item.id || index}`;
                                const isItemExpanded = expandedItems.has(itemKey);
                                
                                return (
                                  <div key={index} className="bg-card rounded border border-border overflow-hidden">
                                    <Button
                                      variant="ghost"
                                      className="w-full p-2 h-auto justify-start hover:bg-muted/50"
                                      onClick={() => toggleItem(itemKey)}
                                    >
                                      <div className="flex items-center gap-2 w-full">
                                        <div className="flex-1 text-left">
                                          <div className="font-medium text-sm">{item.title}</div>
                                          <div className="text-xs text-muted-foreground">
                                            Relevance: {item.relevance_score}/10 • {item.source}
                                          </div>
                                        </div>
                                        {isItemExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                      </div>
                                    </Button>
                                    {isItemExpanded && (
                                      <div className="px-3 pb-3">
                                        <div className="text-sm space-y-2">
                                          <div><span className="font-medium">Summary:</span> {item.summary}</div>
                                          <div><span className="font-medium">Details:</span> {item.detailed_content}</div>
                                          <div><span className="font-medium">Valid until:</span> {format(new Date(item.valid_until), "MMM d, yyyy")}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}