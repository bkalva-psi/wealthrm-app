import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, DollarSign } from "lucide-react";
import { Link } from "wouter";

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
}

export default function ClientInsights() {
  const { clientId } = useParams();

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['/api/clients', clientId],
  });

  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/client-insights', clientId],
  });

  const { data: portfolioMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/client-insights', clientId, 'metrics'],
  });

  if (clientLoading || insightsLoading || metricsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'performance': return <Target className="h-4 w-4 text-blue-600" />;
      case 'allocation': return <DollarSign className="h-4 w-4 text-purple-600" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const opportunityInsights = (insights as ClientInsight[]).filter((insight: ClientInsight) => insight.type === 'opportunity');
  const riskInsights = (insights as ClientInsight[]).filter((insight: ClientInsight) => insight.type === 'risk');
  const performanceInsights = (insights as ClientInsight[]).filter((insight: ClientInsight) => insight.type === 'performance');
  const allocationInsights = (insights as ClientInsight[]).filter((insight: ClientInsight) => insight.type === 'allocation');

  return (
    <div className="p-6 space-y-6">
      {/* Header - Client Card */}
      {client && (
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.hash = `/clients/${clientId}/portfolio`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{(client as Client).fullName}</h1>
                    <div className="space-y-1 mt-1">
                      {(client as Client).phone && (
                        <p className="text-sm text-gray-600">{(client as Client).phone}</p>
                      )}
                      {(client as Client).email && (
                        <p className="text-sm text-gray-600">{(client as Client).email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant="outline" className="capitalize mb-2">
                      {(client as Client).tier} Client
                    </Badge>
                    <p className="text-sm text-gray-500">AUM: {(client as Client).aum}</p>
                    <p className="text-sm text-gray-500">Risk: {(client as Client).riskProfile}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Title */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-gray-900">Client Insights</h2>
        <p className="text-gray-600 mt-1">Portfolio analysis and personalized recommendations</p>
      </div>

      {/* Quick Metrics */}
      {portfolioMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Portfolio Score</p>
                  <p className="text-2xl font-bold text-blue-600">{(portfolioMetrics as any)?.portfolioScore}/100</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Risk Level</p>
                  <p className="text-2xl font-bold text-orange-600">{(portfolioMetrics as any)?.riskLevel}/10</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Diversification</p>
                  <p className="text-2xl font-bold text-green-600">{(portfolioMetrics as any)?.diversificationScore}%</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last Review</p>
                  <p className="text-2xl font-bold text-purple-600">{(portfolioMetrics as any)?.daysSinceReview}</p>
                  <p className="text-xs text-gray-500">days ago</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Opportunity Insights */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Growth Opportunities ({opportunityInsights.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunityInsights.map((insight: ClientInsight) => (
            <Card key={insight.id} className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                  <Badge className={getImpactColor(insight.impact)}>
                    {insight.impact.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">{insight.description}</p>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-1">Recommendation:</p>
                  <p className="text-sm text-green-700">{insight.recommendation}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{insight.category}</span>
                  <span>Valid until {new Date(insight.validUntil).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Risk Insights */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Risk Alerts ({riskInsights.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {riskInsights.map((insight: ClientInsight) => (
            <Card key={insight.id} className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                  <Badge className={getImpactColor(insight.impact)}>
                    {insight.impact.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">{insight.description}</p>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">Recommendation:</p>
                  <p className="text-sm text-red-700">{insight.recommendation}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{insight.category}</span>
                  <span>Valid until {new Date(insight.validUntil).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Performance Analysis ({performanceInsights.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {performanceInsights.map((insight: ClientInsight) => (
            <Card key={insight.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                  <Badge className={getImpactColor(insight.impact)}>
                    {insight.impact.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">{insight.description}</p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Recommendation:</p>
                  <p className="text-sm text-blue-700">{insight.recommendation}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{insight.category}</span>
                  <span>Valid until {new Date(insight.validUntil).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Allocation Insights */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
            Asset Allocation ({allocationInsights.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allocationInsights.map((insight: ClientInsight) => (
            <Card key={insight.id} className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                  <Badge className={getImpactColor(insight.impact)}>
                    {insight.impact.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">{insight.description}</p>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-purple-800 mb-1">Recommendation:</p>
                  <p className="text-sm text-purple-700">{insight.recommendation}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{insight.category}</span>
                  <span>Valid until {new Date(insight.validUntil).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {(insights as ClientInsight[]).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
            <p className="text-gray-600">
              Client insights will appear here based on portfolio analysis and market conditions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}