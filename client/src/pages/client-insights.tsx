import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Target, Phone, Mail, User, PieChart, Receipt, FileText, FileBarChart, Lightbulb, ChevronDown, ChevronUp, Calendar } from "lucide-react";

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

  const { data: client } = useQuery({
    queryKey: ['/api/clients', clientId],
    enabled: !!clientId
  });

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Client Card */}
      {client && (
        <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm border-l-4 border-l-slate-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.hash = `/clients`}
                className="mr-4 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div>
                <button 
                  onClick={() => window.location.hash = `/clients/${clientId}/personal`}
                  className="text-xl font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {client.fullName}
                </button>
                
                {client.phone && (
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
                
                {client.email && (
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Title Band with Navigation */}
      <div className="bg-white border-b border-gray-200 px-1 py-4">
        <div className="flex justify-between items-center px-5 mb-3">
          <h2 className="text-2xl font-bold text-gray-900">Client Insights</h2>
        </div>
        
        <div className="grid grid-cols-7 gap-1 px-1">
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

      <div className="p-6 space-y-6">
        {/* Single Insights Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
                Client Insights
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
            {insights && insights.length > 0 ? (
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
      </div>
    </div>
  );
}