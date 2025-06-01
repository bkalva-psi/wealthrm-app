import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { clientApi } from "@/lib/api";

export default function ClientActionsPage() {
  const [clientId, setClientId] = useState<number | null>(null);
  
  // Set page title
  useEffect(() => {
    document.title = "Client Actions | Wealth RM";
    
    // Get client ID from URL
    const hash = window.location.hash;
    const match = hash.match(/\/clients\/(\d+)\/actions/);
    if (match && match[1]) {
      setClientId(Number(match[1]));
    }
  }, []);
  
  // Fetch client data
  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientId ? clientApi.getClient(clientId) : null,
    enabled: !!clientId,
  });
  
  // Fetch alerts for this client
  const { data: alerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['client-alerts', clientId],
    queryFn: () => clientId ? clientApi.getClientAlerts(clientId) : [],
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
          {isLoadingClient ? (
            <Skeleton className="h-8 w-40" />
          ) : (
            `${client?.fullName}'s Alerts & Actions`
          )}
        </h1>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          {isLoadingAlerts ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert: any) => (
                <div key={alert.id} className="border-l-4 border-red-500 pl-4 py-2">
                  <h3 className="font-medium">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No alerts found for this client.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="bg-slate-50 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Placeholder: Actions Section</h2>
        <p className="text-muted-foreground mb-2">
          This is a placeholder for the Client Actions page. In a full implementation, this would display:
        </p>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>Portfolio alerts requiring attention</li>
          <li>Recommended actions based on market conditions</li>
          <li>Scheduled follow-ups and reminders</li>
          <li>Action history and outcomes</li>
        </ul>
      </div>
    </div>
  );
}