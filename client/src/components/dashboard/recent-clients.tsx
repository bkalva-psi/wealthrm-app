import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeDate, getTierColor } from "@/lib/utils";

interface Client {
  id: number;
  fullName: string;
  initials: string;
  tier: string;
  aum: string;
  lastContactDate: string;
}

export function RecentClients() {
  const [, navigate] = useLocation();
  
  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/clients/recent'],
  });
  
  const handleClientClick = (clientId: number) => {
    navigate(`/clients/${clientId}`);
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700">Recent Clients</h2>
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs text-primary-600 hover:text-primary-700"
            onClick={() => navigate("/clients")}
          >
            View All
          </Button>
        </div>
      </div>
      
      <div className="divide-y divide-slate-200">
        {isLoading ? (
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="px-4 py-3">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4 flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : clients && clients.length > 0 ? (
          clients.map((client: Client) => {
            const tierColors = getTierColor(client.tier);
            
            return (
              <div 
                key={client.id} 
                className="px-4 py-3 cursor-pointer hover:bg-slate-50"
                onClick={() => handleClientClick(client.id)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                      {client.initials}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-800">{client.fullName}</p>
                      <p className="text-sm text-slate-500">{client.aum}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-500">
                        Last contact: {formatRelativeDate(client.lastContactDate)}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tierColors.bg} ${tierColors.text}`}>
                        {client.tier.charAt(0).toUpperCase() + client.tier.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-slate-500">No recent clients</p>
          </div>
        )}
      </div>
      
      <CardFooter className="px-4 py-3 bg-slate-50 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-600 hover:text-primary-700 hover:bg-slate-100"
          onClick={() => navigate("/clients/new")}
        >
          + Add New Client
        </Button>
      </CardFooter>
    </Card>
  );
}
