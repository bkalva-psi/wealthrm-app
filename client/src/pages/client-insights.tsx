import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Target, Phone, Mail, User, PieChart, Receipt, FileText, FileBarChart, Lightbulb, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { getTierColor } from "@/lib/utils";

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
  const { clientId } = useParams();
  const [showAllInsights, setShowAllInsights] = useState(false);
  
  const { data: insights } = useQuery({
    queryKey: ['/api/client-insights'],
    enabled: !!clientId
  });

  const { data: client, isLoading } = useQuery({
    queryKey: ['/api/clients', clientId],
    enabled: !!clientId
  });

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

  return (
    <div className="px-1 py-4 pb-20 md:pb-6 md:px-6">
      {/* Consistent Header Band */}
      <div className={`bg-white border rounded-lg p-4 mb-2 shadow-sm border-l-4 ${client ? getTierColor(client.tier || '').border.replace('border-', 'border-l-') : 'border-l-slate-300'}`}>
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
        {/* Single Insights Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
                Insights & Recommendations
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllInsights(!showAllInsights)}
                className="flex items-center gap-2"
              >
                {showAllInsights ? (
                  <>
                    Show Less <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show More <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights && Array.isArray(insights) && insights.length > 0 ? (
              <>
                {/* Show first insight by default */}
                {insights.slice(0, 1).map((insight: ClientInsight) => (
                  <div key={insight.id} className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getInsightIcon(insight.type)}
                          <h4 className="font-semibold text-blue-800">{insight.title}</h4>
                          <Badge 
                            variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        <p className="text-sm font-medium text-blue-700 mb-2">
                          Recommendation: {insight.recommendation}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 gap-4">
                          <span>Category: {insight.category}</span>
                          <span>Valid until: {new Date(insight.validUntil).toLocaleDateString()}</span>
                          <span>Priority: {insight.priority}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Show remaining insights when expanded */}
                {showAllInsights && insights.slice(1).map((insight: ClientInsight) => (
                  <div key={insight.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getInsightIcon(insight.type)}
                          <h4 className="font-semibold text-gray-800">{insight.title}</h4>
                          <Badge 
                            variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Recommendation: {insight.recommendation}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 gap-4">
                          <span>Category: {insight.category}</span>
                          <span>Valid until: {new Date(insight.validUntil).toLocaleDateString()}</span>
                          <span>Priority: {insight.priority}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No insights available for this client at the moment.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Items Card */}
        <Card className="overflow-hidden border-0 shadow-md">
          <CardHeader className="pb-3 bg-gradient-to-r from-amber-500/90 to-amber-600/90">
            <CardTitle className="flex items-center text-lg text-white font-semibold">
              <AlertTriangle className="h-5 w-5 mr-2 text-white" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg shadow-sm">
                <h4 className="text-sm font-medium text-amber-800 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-amber-500" />
                  <span className="font-semibold">Rebalance Portfolio</span>
                </h4>
                <p className="text-xs text-amber-700 mt-2 leading-relaxed">
                  Your equity allocation has drifted 5% above target. Consider rebalancing to maintain your risk profile.
                </p>
                <div className="mt-3">
                  <Button size="sm" variant="outline" className="text-xs bg-white text-amber-600 border-amber-300 hover:bg-amber-50">
                    Review Allocation
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm">
                <h4 className="text-sm font-medium text-blue-800 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-semibold">Fixed Deposit Maturing</span>
                </h4>
                <p className="text-xs text-blue-700 mt-2 leading-relaxed">
                  Your HDFC Bank FD of ₹3,00,000 is maturing in 15 days. Contact your RM for reinvestment options.
                </p>
                <div className="mt-3">
                  <Button size="sm" variant="outline" className="text-xs bg-white text-blue-600 border-blue-300 hover:bg-blue-50">
                    View Options
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}