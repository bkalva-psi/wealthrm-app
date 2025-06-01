import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { generateAvatar, svgToDataURL } from "@/lib/avatarGenerator";

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
  
  // Capitalize the first letter of tier
  const formatTier = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };
  
  // Handle section click with preventing event propagation
  const handleSectionClick = (e: React.MouseEvent, section: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Navigate based on section clicked
    window.location.hash = `/clients/${client.id}/${section}`;
  };
  
  return (
    <Card 
      className={`overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/10 transform interactive-hover mb-4 border-l-4 ${tierColors.border} !bg-card !border-border`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3 py-1">
          {/* Alert section - navigates to actions page */}
          {(client.alertCount ?? 0) > 0 && (
            <div 
              className="mt-1 relative cursor-pointer" 
              onClick={(e) => handleSectionClick(e, 'actions')}
              title="View client alerts and actions"
            >
              <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                <Bell className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {client.alertCount}
              </span>
            </div>
          )}
          
          {/* Personal details section */}
          <div className="flex-1 overflow-hidden">
            {/* Client name - navigates to personal info page */}
            <div 
              className="cursor-pointer"
              onClick={(e) => handleSectionClick(e, 'personal')}
              title="View client personal information"
            >
              <h3 className="text-sm font-medium text-foreground truncate hover:text-blue-600 transition-colors">{client.fullName}</h3>
            </div>
            
            {/* Phone - clickable to dial */}
            {client.phone && (
              <div className="text-xs text-muted-foreground mt-1">
                <a 
                  href={`tel:${client.phone}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  title="Call client"
                  onClick={(e) => e.stopPropagation()}
                >
                  {client.phone}
                </a>
              </div>
            )}
            
            {/* Email - clickable to send email */}
            {client.email && (
              <div className="text-xs text-muted-foreground mt-1">
                <a 
                  href={`mailto:${client.email}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors truncate"
                  title="Send email to client"
                  onClick={(e) => e.stopPropagation()}
                >
                  {client.email}
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Horizontal line below contact info */}
        <div className="h-px bg-slate-200 my-3"></div>
        
        <div className="grid grid-cols-2 gap-3 mt-2">
          {/* AUM section - navigates to portfolio page */}
          <div 
            className="border-r border-border pr-3 cursor-pointer" 
            onClick={(e) => handleSectionClick(e, 'portfolio')}
            title="View client portfolio"
          >
            <div className="text-xs text-muted-foreground mb-1">AUM</div>
            <div className="text-sm font-medium text-foreground">{client.aum}</div>
            {formatPerformance(client.yearlyPerformance)}
          </div>
          
          {/* Risk profile - non-clickable */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Risk Profile</div>
            <div className="text-sm text-foreground">
              {client.riskProfile ? client.riskProfile.charAt(0).toUpperCase() + client.riskProfile.slice(1) : 'Moderate'}
            </div>
          </div>
          
          {/* Last contact - navigates to communications page */}
          <div 
            className="border-r border-border pr-3 cursor-pointer" 
            onClick={(e) => handleSectionClick(e, 'communications')}
            title="View client communications"
          >
            <div className="text-xs text-muted-foreground mb-1">Last Contact</div>
            <div className="text-sm text-muted-foreground">
              {formatRelativeDate(client.lastContactDate)}
            </div>
          </div>
          
          {/* Last transaction - navigates to transactions page */}
          <div 
            className="cursor-pointer" 
            onClick={(e) => handleSectionClick(e, 'transactions')}
            title="View client transactions"
          >
            <div className="text-xs text-muted-foreground mb-1">Last Txn</div>
            <div className="text-sm text-muted-foreground">
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
  
  // Add debugging for clients
  console.log('Clients data received:', clients);
  
  // Filter clients based on search and filter options, then sort by alert count
  const filteredClients = clients
    ? clients
        .filter((client: Client) => {
          // Apply search filter
          const matchesSearch = !searchQuery || 
            client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (client.phone && client.phone.includes(searchQuery));
          
          // Apply additional filters with safer checks - default to true if value doesn't exist
          const matchesTier = client.tier ? filterOptions.includedTiers.includes(client.tier) : true;
          
          // Check risk profile with case insensitive comparison - default to true if missing
          const riskProfile = client.riskProfile ? client.riskProfile.toLowerCase() : '';
          const matchesRiskProfile = !riskProfile || filterOptions.riskProfiles.includes(riskProfile);
          
          // Set a maximum AUM value to avoid filtering out high-value clients
          const MAX_AUM = 100000000; // 10 Cr
          const aumValue = typeof client.aumValue === 'number' ? client.aumValue : 0;
          const matchesAum = aumValue >= filterOptions.minAum && 
                            (aumValue <= filterOptions.maxAum || filterOptions.maxAum >= MAX_AUM);
          
          // Check filter results
          const result = matchesSearch && matchesTier && matchesRiskProfile && matchesAum;
          if (!result) {
            console.log('Filtered out client:', client.id, client.fullName);
            console.log('  - Tier match:', matchesTier, 'Risk match:', matchesRiskProfile, 'AUM match:', matchesAum);
          }
          
          return result;
        })
        // Sort by alert count (descending)
        .sort((a, b) => {
          // Put clients with alerts first, sorted by most alerts
          const aAlertCount = a.alertCount || 0;
          const bAlertCount = b.alertCount || 0;
          return bAlertCount - aAlertCount;
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
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 animate-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Client Portfolio</h1>
            <p className="text-muted-foreground text-sm font-medium">
              {filteredClients.length} of {clients?.length || 0} clients
            </p>
          </div>
        </div>
      
        <Card className="mb-6 bg-card/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300 animate-in slide-in-from-bottom-4 duration-700 delay-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search clients..." 
                className="pl-10 bg-background border-input text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 relative !bg-background !border-input !text-foreground">
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
                <PopoverContent className="w-80 p-4 !bg-card !border-border" align="end">
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
                        <span className="text-xs text-muted-foreground">₹{(filterOptions.minAum / 100000).toFixed(1)}L</span>
                        <span className="text-xs text-muted-foreground">₹{(filterOptions.maxAum / 100000).toFixed(0)}L</span>
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
                              <div className="h-5 w-5 rounded-sm border border-border flex items-center justify-center">
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
                              <div className="h-5 w-5 rounded-sm border border-border flex items-center justify-center">
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
                    <div className="text-xs text-muted-foreground mb-1">AUM</div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Risk Profile</div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Last Contact</div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Contact</div>
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
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <X className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No clients found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {searchQuery || activeFilters > 0 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Add new clients by converting prospects."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
