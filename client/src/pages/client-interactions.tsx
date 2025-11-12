import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PhoneCall, Calendar, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { clientApi } from "@/lib/api";
import { formatRelativeDate } from "@/lib/utils";

export default function ClientInteractionsPage() {
  const [clientId, setClientId] = useState<number | null>(null);
  
  // Set page title
  useEffect(() => {
    document.title = "Client Interactions | Wealth RM";
    
    // Get client ID from URL
    const hash = window.location.hash;
    const match = hash.match(/\/clients\/(\d+)\/interactions/);
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
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 lg:py-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Client not found</h1>
        <Button onClick={handleBackClick}>Back to Clients</Button>
      </div>
    );
  }
  
  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 lg:py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
          {isLoading ? (
            <Skeleton className="h-8 w-40" />
          ) : (
            `${client?.fullName}'s Interactions`
          )}
        </h1>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-medium">Interaction Summary</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <PhoneCall className="h-4 w-4" />
                Log Call
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Schedule Meeting
              </Button>
            </div>
          </div>
          
          <div className="space-y-1 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Contact:</span>
              <span className="font-medium">
                {isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  client?.lastContactDate ? formatRelativeDate(new Date(client.lastContactDate)) : "N/A"
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Contact Method:</span>
              <span className="font-medium">Phone Call</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Next Scheduled:</span>
              <span className="font-medium">Next Tuesday at 2:00 PM</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-medium mb-4">Recent Interactions</h2>
          <div className="space-y-4">
            {/* Interaction entries */}
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">Portfolio Review Call</h3>
                  <p className="text-sm text-muted-foreground">Discussed recent market volatility and portfolio performance</p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <PhoneCall className="h-4 w-4" />
                  <span className="text-xs">{formatRelativeDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))}</span>
                </div>
              </div>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">Investment Strategy Meeting</h3>
                  <p className="text-sm text-muted-foreground">Quarterly strategy review and allocation adjustments</p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">{formatRelativeDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))}</span>
                </div>
              </div>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">Tax Planning Email</h3>
                  <p className="text-sm text-muted-foreground">Sent year-end tax planning recommendations</p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-xs">{formatRelativeDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-muted p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Placeholder: Interactions Section</h2>
        <p className="text-muted-foreground mb-2">
          This is a placeholder for the Client Interactions page. In a full implementation, this would display:
        </p>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>Complete interaction history across all channels</li>
          <li>Ability to log new interactions (calls, meetings, emails)</li>
          <li>Scheduled future interactions</li>
          <li>Follow-up reminders and action items</li>
          <li>Communication preferences and optimal contact times</li>
        </ul>
      </div>
    </div>
  );
}