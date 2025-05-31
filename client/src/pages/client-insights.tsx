import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Target, Phone, Mail, User, PieChart, Receipt, FileText, FileBarChart, Lightbulb, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { getTierColor } from "@/lib/utils";
import { clientApi } from "@/lib/api";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ClientInsight {
  id: number;
  clientId: number;
  type: 'opportunity' | 'risk' | 'performance' | 'allocation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  recommendation: string;
  priority: number;
  validUntil: string;
  createdAt: string;
  isActive: boolean;
}

interface Client {
  id: number;
  fullName: string;
  tier: string;
  aum: string;
  riskProfile: string;
  phone?: string;
  email?: string;
}

export default function ClientInsights() {
  const [clientId, setClientId] = useState<number | null>(null);
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [showPortfolioAlerts, setShowPortfolioAlerts] = useState(true);
  const [showInvestmentOpportunities, setShowInvestmentOpportunities] = useState(true);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<number>>(new Set());
  const [expandedOpportunities, setExpandedOpportunities] = useState<Set<number>>(new Set());

  const toggleAlertExpansion = (alertId: number) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId);
    } else {
      newExpanded.add(alertId);
    }
    setExpandedAlerts(newExpanded);
  };

  const toggleOpportunityExpansion = (opportunityId: number) => {
    const newExpanded = new Set(expandedOpportunities);
    if (newExpanded.has(opportunityId)) {
      newExpanded.delete(opportunityId);
    } else {
      newExpanded.add(opportunityId);
    }
    setExpandedOpportunities(newExpanded);
  };
  
  // Set page title and get client ID from URL
  useEffect(() => {
    document.title = "Client Insights | Wealth RM";
    
    // Get client ID from URL
    const hash = window.location.hash;
    const match = hash.match(/\/clients\/(\d+)\/insights/);
    if (match && match[1]) {
      setClientId(Number(match[1]));
    }
  }, []);
  
  const { data: insights } = useQuery({
    queryKey: ['/api/client-insights'],
    enabled: !!clientId
  });

  // Fetch client data using the same pattern as portfolio page
  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientId ? clientApi.getClient(clientId) : null,
    enabled: !!clientId,
  });

  // Fetch portfolio alerts
  const { data: portfolioAlerts } = useQuery({
    queryKey: ['/api/portfolio-alerts'],
    enabled: !!clientId
  });

  // Mock investment opportunities data for now
  const investmentOpportunities = [
    {
      id: 1,
      title: "Diversify into Small Cap",
      description: "Consider adding exposure to small cap mutual funds for higher growth potential",
      priority: "medium",
      category: "Asset Allocation"
    },
    {
      id: 2,
      title: "Tax Saving Opportunity",
      description: "Invest in ELSS funds before March 31st to save taxes under Section 80C",
      priority: "high",
      category: "Tax Planning"
    }
  ];

  const handleBackClick = () => {
    window.location.hash = '/clients';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      case 'performance': return <Target className="h-4 w-4" />;
      case 'allocation': return <TrendingDown className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
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
    <div className="px-1 py-4 pb-20 md:pb-6 md:px-6">
      {/* Consistent Header Band */}
      <div className={`bg-white border rounded-lg p-4 mb-2 shadow-sm border-l-4 ${client ? getTierColor(client.tier).border.replace('border-', 'border-l-') : 'border-l-slate-300'}`}>
        <div className="flex items-center justify-between">
          {/* Left side - Back arrow and client info */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackClick}
              className="mr-4 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div>
              {isLoading ? (
                <div className="space-y-1">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  {/* Line 1: Client Name */}
                  <button 
                    onClick={() => window.location.hash = `/clients/${clientId}/personal`}
                    className="text-xl font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {client?.fullName}
                  </button>
                  
                  {/* Line 2: Phone Number */}
                  {client?.phone && (
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <a 
                        href={`tel:${client.phone}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        title="Call client"
                      >
                        {client.phone}
                      </a>
                    </div>
                  )}
                  
                  {/* Line 3: Email */}
                  {client?.email && (
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <a 
                        href={`mailto:${client.email}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        title="Send email to client"
                      >
                        {client.email}
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page Header with Navigation */}
      <div className="bg-white border-b border-gray-200 px-1 py-3">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 ml-3">Client Insights</h2>
        
        {/* Navigation Icons */}
        <div className="grid grid-cols-8 gap-3 ml-3">
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/personal`}
            title="Personal Profile"
          >
            <User className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/portfolio`}
            title="Portfolio"
          >
            <PieChart className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/transactions`}
            title="Transactions"
          >
            <Receipt className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/appointments`}
            title="Appointments"
          >
            <Calendar className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/communications`}
            title="Notes"
          >
            <FileText className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => {
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              
              if (isMobile) {
                window.location.href = `/api/clients/${clientId}/portfolio-report`;
              } else {
                window.open(`/api/clients/${clientId}/portfolio-report`, '_blank');
              }
            }}
            title="Portfolio Report"
          >
            <FileBarChart className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg bg-blue-50 border border-blue-200 h-12 w-full"
            title="Client Insights"
          >
            <Lightbulb className="h-6 w-6 text-blue-600" />
          </button>
        </div>
      </div>

      <div className="space-y-6 px-3">
        {/* Portfolio Alerts Collapsible Card */}
        <Card>
          <Collapsible open={showPortfolioAlerts} onOpenChange={setShowPortfolioAlerts}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Portfolio Alerts
                  </CardTitle>
                  {showPortfolioAlerts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {portfolioAlerts && Array.isArray(portfolioAlerts) && portfolioAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {portfolioAlerts.slice(0, showAllInsights ? portfolioAlerts.length : 3).map((alert: any) => {
                      const isExpanded = expandedAlerts.has(alert.id);
                      return (
                        <div key={alert.id} className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleAlertExpansion(alert.id)}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{alert.title}</span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                              <p className="text-xs font-medium text-gray-700">Action: {alert.action}</p>
                              {alert.severity && (
                                <p className="text-xs text-gray-500 mt-1">Severity: {alert.severity}</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {portfolioAlerts.length > 3 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowAllInsights(!showAllInsights)}
                        className="text-xs w-full"
                      >
                        {showAllInsights ? 'Show Less' : `Show More (${portfolioAlerts.length - 3} more)`}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No portfolio alerts at the moment.</p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Investment Opportunities Collapsible Card */}
        <Card>
          <Collapsible open={showInvestmentOpportunities} onOpenChange={setShowInvestmentOpportunities}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    Investment Opportunities
                  </CardTitle>
                  {showInvestmentOpportunities ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {investmentOpportunities.slice(0, showAllInsights ? investmentOpportunities.length : 3).map((opportunity: any) => {
                    const isExpanded = expandedOpportunities.has(opportunity.id);
                    return (
                      <div key={opportunity.id} className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleOpportunityExpansion(opportunity.id)}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{opportunity.title}</span>
                          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-600 mb-2">{opportunity.description}</p>
                            <p className="text-xs font-medium text-gray-700">Category: {opportunity.category}</p>
                            {opportunity.recommendation && (
                              <p className="text-xs text-gray-600 mt-1">Recommendation: {opportunity.recommendation}</p>
                            )}
                            {opportunity.impact && (
                              <p className="text-xs text-gray-500 mt-1">Impact: {opportunity.impact}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {investmentOpportunities.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowAllInsights(!showAllInsights)}
                      className="text-xs w-full"
                    >
                      {showAllInsights ? 'Show Less' : `Show More (${investmentOpportunities.length - 3} more)`}
                    </Button>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
}