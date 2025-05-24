import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TrendingUp, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { clientApi } from "@/lib/api";

export default function ClientPortfolioPage() {
  const [clientId, setClientId] = useState<number | null>(null);
  
  // Set page title
  useEffect(() => {
    document.title = "Client Portfolio | Wealth RM";
    
    // Get client ID from URL
    const hash = window.location.hash;
    const match = hash.match(/\/clients\/(\d+)\/portfolio/);
    if (match && match[1]) {
      setClientId(Number(match[1]));
    }
  }, []);
  
  // Fetch client data
  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientId ? clientApi.getClient(clientId) : null,
    enabled: !!clientId,
  });
  
  const handleBackClick = () => {
    window.location.hash = "/clients";
  };
  
  if (!clientId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Client not found</h1>
        <Button onClick={handleBackClick}>Back to Clients</Button>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {isLoading ? (
            <Skeleton className="h-8 w-40" />
          ) : (
            `${client?.fullName}'s Portfolio`
          )}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Assets Under Management</p>
                <h3 className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-24" /> : client?.aum}
                </h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <LineChart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Risk Profile</p>
                <h3 className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-8 w-24" /> : (client?.riskProfile || "N/A")}
                </h3>
              </div>
              <div className="bg-amber-100 p-2 rounded-full">
                <LineChart className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Annual Performance</p>
                <h3 className="text-2xl font-bold flex items-center">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      {client?.yearlyPerformance ? 
                        <>
                          {client.yearlyPerformance > 0 ? "+" : ""}
                          {client.yearlyPerformance.toFixed(2)}%
                          <TrendingUp className={`h-5 w-5 ml-2 ${client.yearlyPerformance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                        </> : 
                        "N/A"
                      }
                    </>
                  )}
                </h3>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-medium mb-4">Asset Allocation</h2>
          <div className="h-60 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
            Portfolio chart placeholder - would show asset allocation visualization
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-slate-50 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Placeholder: Portfolio Section</h2>
        <p className="text-slate-600 mb-2">
          This is a placeholder for the Client Portfolio page. In a full implementation, this would display:
        </p>
        <ul className="list-disc pl-5 text-slate-600 space-y-1">
          <li>Detailed asset allocation charts</li>
          <li>Investment product holdings</li>
          <li>Performance metrics and benchmarks</li>
          <li>Historical returns visualization</li>
          <li>Investment recommendations</li>
        </ul>
      </div>
    </div>
  );
}