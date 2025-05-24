import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { getTierColor, formatRelativeDate } from "@/lib/utils";
import { 
  Search,
  UserPlus,
  Filter as FilterIcon,
  ChevronDown,
  Download,
  X,
  Check,
  Phone,
  Mail,
  Bell
} from "lucide-react";
import { clientApi } from "@/lib/api";
import { Client } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";

// Filter options type definition
interface FilterOptions {
  minAum: number;
  maxAum: number;
  includedTiers: string[];
  riskProfiles: string[];
}

// Client Card component
interface ClientCardProps {
  client: Client;
  onClick: (id: number) => void;
}

function ClientCard({ client, onClick }: ClientCardProps) {
  const tierColors = getTierColor(client.tier);
  
  // Generate initials if not available
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  // Format performance value with sign and color
  const formatPerformance = (performance: number | null | undefined) => {
    if (performance === null || performance === undefined) {
      return <span className="text-xs text-emerald-600 mt-1">1Y +8.5%</span>;
    }
    
    const sign = performance >= 0 ? '+' : '';
    const colorClass = performance >= 0 ? 'text-emerald-600' : 'text-red-600';
    
    return <span className={`text-xs ${colorClass} mt-1`}>1Y {sign}{performance.toFixed(1)}%</span>;
  };
  
  // Calculate days since last transaction
  const getDaysSinceTransaction = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    
    const transactionDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - transactionDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} days ago`;
  };
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-md cursor-pointer transition-shadow mb-4"
      onClick={() => onClick(client.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-lg">
            {client.initials || getInitials(client.fullName)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-800">{client.fullName}</h3>
              {(client.alertCount ?? 0) > 0 && (
                <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center relative">
                  <Bell className="h-3 w-3 text-white" />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {client.alertCount}
                  </span>
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500">{client.phone}</div>
            <div className="text-xs text-slate-500">{client.email}</div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tierColors.bg} ${tierColors.text}`}>
            {client.tier.charAt(0).toUpperCase() + client.tier.slice(1)}
          </span>
        </div>
        
        {/* Horizontal line below contact info */}
        <div className="h-px bg-slate-200 my-3"></div>
        
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="border-r border-slate-200 pr-3">
            <div className="text-xs text-slate-500 mb-1">AUM</div>
            <div className="text-sm font-medium text-slate-700">{client.aum}</div>
            {formatPerformance(client.yearlyPerformance)}
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Risk Profile</div>
            <div className="text-sm text-slate-700">
              {client.riskProfile ? client.riskProfile.charAt(0).toUpperCase() + client.riskProfile.slice(1) : 'Moderate'}
            </div>
          </div>
          <div className="border-r border-slate-200 pr-3">
            <div className="text-xs text-slate-500 mb-1">Last Contact</div>
            <div className="text-sm text-slate-500">
              {formatRelativeDate(client.lastContactDate)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Last Txn</div>
            <div className="text-sm text-slate-500">
              {getDaysSinceTransaction(client.lastTransactionDate)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Clients() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    minAum: 0,
    maxAum: 10000000,
    includedTiers: ['platinum', 'gold', 'silver'],
    riskProfiles: ['conservative', 'moderate', 'aggressive']
  });
  
  const isMobile = useIsMobile();
  
  // Set page title
  useEffect(() => {
    document.title = "Clients | Wealth RM";
  }, []);
  
  // Use the clientApi service to fetch clients data
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientApi.getClients(),
  });
  
  // Calculate active filters
  useEffect(() => {
    if (clients) {
      calculateActiveFilters();
    }
  }, [filterOptions, clients]);
  
  const calculateActiveFilters = () => {
    let count = 0;
    
    if (filterOptions.minAum > 0) count++;
    if (filterOptions.maxAum < 10000000) count++;
    if (filterOptions.includedTiers.length < 3) count++;
    if (filterOptions.riskProfiles.length < 3) count++;
    
    setActiveFilters(count);
  };
  
  // Filter clients based on search and filter options
  const filteredClients = clients
    ? clients.filter((client: Client) => {
        // Apply search filter
        const matchesSearch = !searchQuery || 
          client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (client.phone && client.phone.includes(searchQuery));
        
        // Apply additional filters
        const matchesTier = filterOptions.includedTiers.includes(client.tier);
        const matchesRiskProfile = client.riskProfile ? filterOptions.riskProfiles.includes(client.riskProfile) : true;
        const matchesAum = client.aumValue >= filterOptions.minAum && 
                          client.aumValue <= filterOptions.maxAum;
        
        return matchesSearch && matchesTier && matchesRiskProfile && matchesAum;
      })
    : [];
  
  // Reset filters function
  const resetFilters = () => {
    setFilterOptions({
      minAum: 0,
      maxAum: 10000000,
      includedTiers: ['platinum', 'gold', 'silver'],
      riskProfiles: ['conservative', 'moderate', 'aggressive']
    });
  };
  
  // Export clients to CSV
  const exportClients = () => {
    if (!filteredClients || filteredClients.length === 0) return;
    
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'AUM', 'Tier', 'Risk Profile', 'Last Contact'];
    const rows = filteredClients.map(c => [
      c.fullName,
      c.email || '',
      c.phone || '',
      c.aum,
      c.tier,
      c.riskProfile,
      c.lastContactDate ? new Date(c.lastContactDate).toLocaleDateString() : ''
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle client click
  const handleClientClick = (clientId: number) => {
    window.location.hash = `/clients/${clientId}`;
  };
  
  // Handle add prospect click
  const handleAddProspectClick = () => {
    window.location.hash = "/add-prospect";
  };
  
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Clients</h1>
        <Button 
          onClick={handleAddProspectClick}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Prospect
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input 
                placeholder="Search clients..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 relative">
                    <FilterIcon className="h-4 w-4" />
                    Filter
                    {activeFilters > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                        {activeFilters}
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Filter Clients</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetFilters}
                      className="text-xs h-8 px-2"
                    >
                      Reset
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* AUM Range */}
                    <div>
                      <Label className="text-sm mb-2 block">AUM Range</Label>
                      <div className="mt-6 px-2">
                        <Slider 
                          defaultValue={[filterOptions.minAum, filterOptions.maxAum]}
                          max={10000000}
                          step={100000}
                          onValueChange={(values) => {
                            setFilterOptions(prev => ({
                              ...prev,
                              minAum: values[0],
                              maxAum: values[1]
                            }));
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-slate-500">₹{(filterOptions.minAum / 100000).toFixed(1)}L</span>
                        <span className="text-xs text-slate-500">₹{(filterOptions.maxAum / 100000).toFixed(0)}L</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Tier Filter */}
                    <div>
                      <Label className="text-sm mb-2 block">Client Tier</Label>
                      <div className="space-y-2 mt-2">
                        {['platinum', 'gold', 'silver'].map(tier => (
                          <div key={tier} className="flex items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-8 w-8 mr-2"
                              onClick={() => {
                                setFilterOptions(prev => {
                                  const isIncluded = prev.includedTiers.includes(tier);
                                  return {
                                    ...prev,
                                    includedTiers: isIncluded
                                      ? prev.includedTiers.filter(t => t !== tier)
                                      : [...prev.includedTiers, tier]
                                  };
                                });
                              }}
                            >
                              <div className="h-5 w-5 rounded-sm border border-slate-300 flex items-center justify-center">
                                {filterOptions.includedTiers.includes(tier) && (
                                  <Check className="h-3.5 w-3.5 text-primary-600" />
                                )}
                              </div>
                            </Button>
                            <span className="text-sm capitalize">{tier}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Risk Profile Filter */}
                    <div>
                      <Label className="text-sm mb-2 block">Risk Profile</Label>
                      <div className="space-y-2 mt-2">
                        {['conservative', 'moderate', 'aggressive'].map(profile => (
                          <div key={profile} className="flex items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-8 w-8 mr-2"
                              onClick={() => {
                                setFilterOptions(prev => {
                                  const isIncluded = prev.riskProfiles.includes(profile);
                                  return {
                                    ...prev,
                                    riskProfiles: isIncluded
                                      ? prev.riskProfiles.filter(p => p !== profile)
                                      : [...prev.riskProfiles, profile]
                                  };
                                });
                              }}
                            >
                              <div className="h-5 w-5 rounded-sm border border-slate-300 flex items-center justify-center">
                                {filterOptions.riskProfiles.includes(profile) && (
                                  <Check className="h-3.5 w-3.5 text-primary-600" />
                                )}
                              </div>
                            </Button>
                            <span className="text-sm capitalize">{profile}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button 
                variant="outline"
                className="flex items-center gap-2"
                onClick={exportClients}
                disabled={!filteredClients || filteredClients.length === 0}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, index) => (
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
          ))}
        </div>
      ) : filteredClients && filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client: Client) => (
            <ClientCard 
              key={client.id} 
              client={client} 
              onClick={handleClientClick} 
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="py-8">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <X className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No clients found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {searchQuery || activeFilters > 0 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Add new clients by converting prospects."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
