import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { clientApi } from "@/lib/api";
import { formatRelativeDate } from "@/lib/utils";

export default function ClientTransactionsPage() {
  const [clientId, setClientId] = useState<number | null>(null);
  
  // Set page title
  useEffect(() => {
    document.title = "Client Transactions | Wealth RM";
    
    // Get client ID from URL
    const hash = window.location.hash;
    const match = hash.match(/\/clients\/(\d+)\/transactions/);
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
            `${client?.fullName}'s Transactions`
          )}
        </h1>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Transaction Summary</h2>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-50 p-3 rounded">
              <p className="text-xs text-slate-500">Last Transaction</p>
              <p className="font-medium">
                {isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  client?.lastTransactionDate ? formatRelativeDate(new Date(client.lastTransactionDate)) : "N/A"
                )}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded">
              <p className="text-xs text-slate-500">Average Transaction Value</p>
              <p className="font-medium">₹1.25 L</p>
            </div>
            <div className="bg-slate-50 p-3 rounded">
              <p className="text-xs text-slate-500">Total Transactions (YTD)</p>
              <p className="font-medium">12</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-medium mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {/* Transaction entries */}
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">SIP Investment</h3>
                  <p className="text-xs text-slate-500">Equity Fund Purchase</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">+ ₹50,000</p>
                <p className="text-xs text-slate-500">{formatRelativeDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <CreditCard className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium">Account Fee</h3>
                  <p className="text-xs text-slate-500">Quarterly Management Fee</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-amber-600">- ₹12,500</p>
                <p className="text-xs text-slate-500">{formatRelativeDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium">Fund Withdrawal</h3>
                  <p className="text-xs text-slate-500">Redemption Request</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-red-600">- ₹2,00,000</p>
                <p className="text-xs text-slate-500">{formatRelativeDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-slate-50 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Placeholder: Transactions Section</h2>
        <p className="text-slate-600 mb-2">
          This is a placeholder for the Client Transactions page. In a full implementation, this would display:
        </p>
        <ul className="list-disc pl-5 text-slate-600 space-y-1">
          <li>Complete transaction history with filtering options</li>
          <li>Transaction categorization and analysis</li>
          <li>Investment patterns and trends</li>
          <li>Transaction statements and reports</li>
          <li>Scheduled upcoming transactions</li>
        </ul>
      </div>
    </div>
  );
}