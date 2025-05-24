import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { clientApi } from "@/lib/api";

export default function ClientPersonalPage() {
  const [clientId, setClientId] = useState<number | null>(null);
  
  // Set page title
  useEffect(() => {
    document.title = "Client Information | Wealth RM";
    
    // Get client ID from URL
    const hash = window.location.hash;
    const match = hash.match(/\/clients\/(\d+)\/personal/);
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
            `${client?.fullName}'s Information`
          )}
        </h1>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : client ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 space-y-4">
                  <div className="h-40 w-40 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mx-auto">
                    <User className="h-20 w-20" />
                  </div>
                  <h2 className="text-xl font-medium text-center">{client.fullName}</h2>
                  <p className="text-center text-slate-500">{client.tier.toUpperCase()} Tier Client</p>
                </div>
                
                <div className="w-full md:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Phone</p>
                        <p>{client.phone || "Not provided"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <p>{client.email || "Not provided"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Address</p>
                        <p>Placeholder Address</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Client Since</p>
                        <p>{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>Could not load client information.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="bg-slate-50 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Placeholder: Personal Information Section</h2>
        <p className="text-slate-600 mb-2">
          This is a placeholder for the Client Personal Information page. In a full implementation, this would display:
        </p>
        <ul className="list-disc pl-5 text-slate-600 space-y-1">
          <li>Complete contact information</li>
          <li>KYC details and compliance status</li>
          <li>Family information</li>
          <li>Important client documents</li>
          <li>Client preferences and communication history</li>
        </ul>
      </div>
    </div>
  );
}