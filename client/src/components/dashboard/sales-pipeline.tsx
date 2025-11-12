import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface SalesPipeline {
  id: number;
  stage: string;
  count: number;
  value: number;
}

interface ClosingDeal {
  id: number;
  name: string;
  product: string;
  value: string;
  probability: number;
}

// Sample closing deals (in a real application, this would come from API)
const closingDeals: ClosingDeal[] = [
  {
    id: 1,
    name: "Amit Sharma",
    product: "Mutual Funds",
    value: "₹50L",
    probability: 95
  },
  {
    id: 2,
    name: "Neha Verma",
    product: "Wealth Management",
    value: "₹75L",
    probability: 80
  }
];

export function SalesPipeline() {
  const { data: pipeline = [], isLoading } = useQuery<SalesPipeline[]>({
    queryKey: ['/api/sales-pipeline'],
  });
  
  const getStageData = (stage: string) => {
    if (!pipeline) return null;
    return pipeline.find((item: SalesPipeline) => item.stage === stage);
  };
  
  const newLeads = getStageData('new_leads');
  const qualified = getStageData('qualified');
  const proposal = getStageData('proposal');
  const closed = getStageData('closed');
  
  const getProbabilityColor = (probability: number) => {
    if (probability >= 90) return "text-amber-500";
    if (probability >= 70) return "text-secondary-500";
    return "text-primary-500";
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Sales Pipeline</h2>
          <Button variant="link" size="sm" className="text-xs text-primary hover:text-primary/90">
            View Details
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        {isLoading ? (
          <>
            <Skeleton className="h-2 w-full rounded-full mb-4" />
            <div className="grid grid-cols-4 gap-1 text-center mb-4">
              {Array(4).fill(0).map((_, index) => (
                <div key={index}>
                  <Skeleton className="h-4 w-24 mx-auto mb-1" />
                  <Skeleton className="h-6 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
            <Skeleton className="h-4 w-40 mb-2" />
            <div className="space-y-2">
              {Array(2).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded" />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-1">
              <div className="flex-grow h-2 bg-primary/20 rounded-l-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: newLeads ? `${(newLeads.count / 20) * 100}%` : "0%" }}
                ></div>
              </div>
              <div className="flex-grow h-2 bg-primary/20 overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: qualified ? `${(qualified.count / 20) * 100}%` : "0%" }}
                ></div>
              </div>
              <div className="flex-grow h-2 bg-primary/20 overflow-hidden">
                <div 
                  className="h-full bg-secondary" 
                  style={{ width: proposal ? `${(proposal.count / 20) * 100}%` : "0%" }}
                ></div>
              </div>
              <div className="flex-grow h-2 bg-primary/20 rounded-r-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: closed ? `${(closed.count / 20) * 100}%` : "0%" }}
                ></div>
              </div>
            </div>
            
            <div className="mt-2 grid grid-cols-4 gap-1 text-center">
              <div>
                <p className="text-xs font-medium text-foreground">New Leads</p>
                <p className="text-lg font-semibold text-primary">{newLeads?.count || 0}</p>
                <p className="text-xs text-muted-foreground">{newLeads ? formatCurrency(newLeads.value) : "₹0"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Qualified</p>
                <p className="text-lg font-semibold text-primary">{qualified?.count || 0}</p>
                <p className="text-xs text-muted-foreground">{qualified ? formatCurrency(qualified.value) : "₹0"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Proposal</p>
                <p className="text-lg font-semibold text-secondary">{proposal?.count || 0}</p>
                <p className="text-xs text-muted-foreground">{proposal ? formatCurrency(proposal.value) : "₹0"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Closed</p>
                <p className="text-lg font-semibold text-primary">{closed?.count || 0}</p>
                <p className="text-xs text-muted-foreground">{closed ? formatCurrency(closed.value) : "₹0"}</p>
              </div>
            </div>
            
            {/* Upcoming Conversions */}
            <div className="mt-4">
              <h3 className="text-xs font-medium text-foreground mb-2">Closing This Week</h3>
              <div className="space-y-2">
                {closingDeals.map((deal) => (
                  <div key={deal.id} className="bg-muted p-2 rounded flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{deal.name}</p>
                      <p className="text-xs text-muted-foreground">{deal.product} - {deal.value}</p>
                    </div>
                    <div className={`text-xs font-medium ${getProbabilityColor(deal.probability)}`}>
                      {deal.probability}% Probability
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
