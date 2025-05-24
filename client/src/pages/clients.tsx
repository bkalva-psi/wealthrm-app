import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getTierColor, formatRelativeDate } from "@/lib/utils";
import { 
  Search,
  UserPlus,
  Filter,
  ChevronDown
} from "lucide-react";

interface Client {
  id: number;
  fullName: string;
  initials: string;
  tier: string;
  aum: string;
  aumValue: number;
  email: string;
  phone: string;
  lastContactDate: string;
  riskProfile: string;
}

export default function Clients() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Set page title
  useEffect(() => {
    document.title = "Clients | Wealth RM";
  }, []);
  
  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/clients'],
  });
  
  const filteredClients = clients && searchQuery 
    ? clients.filter((client: Client) => 
        client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.includes(searchQuery)
      )
    : clients;
  
  const filteredByTier = filteredClients && activeTab !== "all"
    ? filteredClients.filter((client: Client) => client.tier === activeTab)
    : filteredClients;
  
  const handleClientClick = (clientId: number) => {
    navigate(`/clients/${clientId}`);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Clients</h1>
          <p className="text-sm text-slate-600">Manage your client relationships</p>
        </div>
        <Button
          onClick={() => navigate("/clients/new")}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Client
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search clients by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="outline">Export</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Clients</TabsTrigger>
          <TabsTrigger value="platinum">Platinum</TabsTrigger>
          <TabsTrigger value="gold">Gold</TabsTrigger>
          <TabsTrigger value="silver">Silver</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {/* Responsive table for larger screens */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Client Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      AUM
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Risk Profile
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Last Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {isLoading ? (
                    Array(5).fill(0).map((_, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="ml-4">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-32 mt-1" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-6 w-16" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredByTier && filteredByTier.length > 0 ? (
                    filteredByTier.map((client: Client) => {
                      const tierColors = getTierColor(client.tier);
                      
                      return (
                        <tr 
                          key={`desktop-${client.id}`} 
                          className="hover:bg-slate-50 cursor-pointer"
                          onClick={() => handleClientClick(client.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                                {client.initials}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-800">{client.fullName}</div>
                                <div className="text-xs text-slate-500">{client.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tierColors.bg} ${tierColors.text}`}>
                              {client.tier.charAt(0).toUpperCase() + client.tier.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            {client.aum}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-700">
                              {client.riskProfile.charAt(0).toUpperCase() + client.riskProfile.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {formatRelativeDate(client.lastContactDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                        {searchQuery ? "No clients match your search criteria" : "No clients found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Card layout for mobile screens */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-8 w-20 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">AUM</div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Risk Profile</div>
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Last Contact</div>
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Contact</div>
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredByTier && filteredByTier.length > 0 ? (
              filteredByTier.map((client: Client) => {
                const tierColors = getTierColor(client.tier);
                
                return (
                  <Card 
                    key={`mobile-${client.id}`} 
                    className="overflow-hidden hover:shadow-md cursor-pointer transition-shadow"
                    onClick={() => handleClientClick(client.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-lg">
                          {client.initials}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-800">{client.fullName}</h3>
                          <div className="text-xs text-slate-500">{client.email}</div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tierColors.bg} ${tierColors.text}`}>
                          {client.tier.charAt(0).toUpperCase() + client.tier.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">AUM</div>
                          <div className="text-sm font-medium text-slate-700">{client.aum}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Risk Profile</div>
                          <div className="text-sm text-slate-700">
                            {client.riskProfile.charAt(0).toUpperCase() + client.riskProfile.slice(1)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Last Contact</div>
                          <div className="text-sm text-slate-500">
                            {formatRelativeDate(client.lastContactDate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Contact</div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-sm text-slate-500">
                  {searchQuery ? "No clients match your search criteria" : "No clients found"}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
