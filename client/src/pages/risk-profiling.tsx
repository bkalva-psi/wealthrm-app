import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertCircle, TrendingUp, BarChart3, Calendar, RefreshCw, Info, Eye, PlayCircle, ArrowLeft } from "lucide-react";
import { RiskProfilingForm } from "@/components/forms/risk-profiling-form";

export default function RiskProfiling() {
  // Extract clientId from URL hash query params
  const getClientIdFromHash = () => {
    const hash = window.location.hash;
    const match = hash.match(/[?&]clientId=(\d+)/);
    return match ? parseInt(match[1]) : null;
  };
  
  const [clientId, setClientId] = useState<number | null>(getClientIdFromHash());
  const [isRetaking, setIsRetaking] = useState(false);
  
  useEffect(() => {
    const updateClientId = () => {
      const hash = window.location.hash;
      const match = hash.match(/[?&]clientId=(\d+)/);
      setClientId(match ? parseInt(match[1]) : null);
    };
    
    updateClientId();
    window.addEventListener('hashchange', updateClientId);
    return () => window.removeEventListener('hashchange', updateClientId);
  }, []);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing results if clientId is provided
  const { data: existingResult, isLoading: isLoadingResults, refetch: refetchResults } = useQuery({
    queryKey: ["/api/rp/results", clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const response = await fetch(`/api/rp/results/${clientId}`, {
        credentials: "include"
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Failed to fetch results");
      const data = await response.json();
      return data || null;
    },
    enabled: !!clientId
  });

  const [showResults, setShowResults] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [kpCompleted, setKpCompleted] = useState(false);

  // Automatically show results if existing completed assessment is found
  // This effect handles both initial load and updates when results change
  useEffect(() => {
    if (isLoadingResults) {
      // Don't change state while loading
      return;
    }

    // Check if assessment is completed - handle both is_complete flag and presence of rp_score
    const isCompleted = existingResult?.is_complete === true || (existingResult?.rp_score !== null && existingResult?.rp_score !== undefined);
    
    if (isRetaking) {
      // User explicitly wants to retake: show form
      setShowForm(true);
      setShowResults(false);
    } else if (isCompleted) {
      // Assessment is completed: show results (scorecard)
      setShowResults(true);
      setShowForm(false);
    } else {
      // No completed assessment: show form to start questionnaire
      setShowResults(false);
      setShowForm(true);
    }
  }, [existingResult, isLoadingResults, isRetaking]);

  const handleFormSubmit = async (data: any) => {
    if (!clientId) {
      toast({
        title: "Error",
        description: "Client ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/rp/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          clientId,
          totalScore: data.totalScore,
          category: data.category,
          answers: data.answers,
        }),
      });

      // Check content type before parsing
      const contentType = response.headers.get("content-type") || "";
      
      if (!response.ok) {
        // Try to parse error as JSON, but handle HTML error pages
        let errorMessage = `Failed to save risk profile (${response.status})`;
        try {
          if (contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            // Response is HTML or text, read as text
            const text = await response.text();
            console.error("Server returned non-JSON response:", text.substring(0, 200));
            errorMessage = `Server error (${response.status}). Please check the server logs.`;
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      // Only parse as JSON if content type is correct
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server returned non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned invalid response format");
      }

      const result = await response.json();
      
      // Invalidate queries to force refetch - use exact query key format
      if (clientId) {
        // Invalidate all variations of the query key
        queryClient.invalidateQueries({ queryKey: [`/api/rp/results/${clientId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/rp/results`, clientId] });
        queryClient.invalidateQueries({ queryKey: ["/api/rp/results", clientId] });
        queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
        
        // Also invalidate by prefix to catch all related queries
        queryClient.invalidateQueries({ predicate: (query) => 
          query.queryKey[0] === "/api/rp/results" && query.queryKey[1] === clientId
        });
      }

      // Refetch results to show updated data
      await refetchResults();
      
      setIsSubmitting(false);
      
      toast({
        title: "Success!",
        description: `Risk Profile saved: ${result.finalCategory || result.final_category || data.category}`,
      });

      // Check if KP assessment is already completed
      let kpIsCompleted = false;
      try {
        const kpResponse = await fetch(`/api/kp/results/${clientId}`, {
          credentials: "include"
        });
        if (kpResponse.ok) {
          const kpData = await kpResponse.json();
          kpIsCompleted = kpData?.is_complete === true || (kpData?.total_score !== null && kpData?.total_score !== undefined);
        }
      } catch (error) {
        console.error("Error checking KP status:", error);
        // Continue with redirect even if check fails
      }

      setKpCompleted(kpIsCompleted);

      // Show success screen with manual redirect button
      setIsRedirecting(true);
    } catch (error) {
      console.error("Error saving risk profile:", error);
      setIsSubmitting(false);
      setIsRedirecting(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save risk profile",
        variant: "destructive",
      });
    }
  };

  const getRiskCategoryColor = (category: string) => {
    const normalized = (category || "").toLowerCase();
    switch (normalized) {
      case "conservative":
        return "bg-blue-600";
      case "moderate":
        return "bg-orange-500";
      case "moderately aggressive":
        return "bg-yellow-500";
      case "aggressive":
        return "bg-red-600";
      default:
        return "bg-muted";
    }
  };

  const getRiskCategoryDescription = (category: string) => {
    const normalized = (category || "").toLowerCase();
    switch (normalized) {
      case "conservative":
        return "You prefer stability and capital preservation over high returns. Your portfolio should focus on protecting your investments with minimal risk.";
      case "moderate":
        return "You seek a balanced approach between growth and stability. Your portfolio will have a mix of equity and debt instruments to provide steady growth with moderate risk.";
      case "moderately aggressive":
        return "You are comfortable with higher risk for potentially higher returns. Your portfolio will lean towards equity investments with some stability through debt instruments.";
      case "aggressive":
        return "You are willing to take significant risk to achieve maximum growth. Your portfolio will be heavily weighted towards equity investments with minimal debt allocation.";
      default:
        return "Your risk assessment has been completed successfully.";
    }
  };

  const riskCategoryInfo: Record<string, { expectedReturn: string; volatility: string; equityAllocation: string; debtAllocation: string }> = {
    Conservative: {
      expectedReturn: "6-8%",
      volatility: "Low",
      equityAllocation: "20-30%",
      debtAllocation: "70-80%",
    },
    Moderate: {
      expectedReturn: "8-12%",
      volatility: "Moderate",
      equityAllocation: "40-50%",
      debtAllocation: "50-60%",
    },
    "Moderately Aggressive": {
      expectedReturn: "12-15%",
      volatility: "Moderate-High",
      equityAllocation: "60-70%",
      debtAllocation: "30-40%",
    },
    Aggressive: {
      expectedReturn: "15%+",
      volatility: "High",
      equityAllocation: "80-90%",
      debtAllocation: "10-20%",
    },
  };

  // Show loading screen during submission
  if (isSubmitting) {
    return (
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-12 lg:pb-16 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium text-foreground mb-2">Saving Risk Profile...</p>
          <p className="text-muted-foreground">Please wait while we save your assessment results.</p>
        </div>
      </div>
    );
  }

  // Show success screen with manual redirect button
  if (isRedirecting) {
    const handleGoToKnowledgeProfiling = () => {
      if (clientId) {
        // The KP page will automatically show questionnaire or scorecard based on completion status
        // If KP is completed, it will show scorecard; if not, it will show questionnaire
        window.location.hash = `/knowledge-profiling?clientId=${clientId}`;
      }
    };

    return (
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-12 lg:pb-16 min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Risk Profile Saved Successfully!</h2>
              <p className="text-muted-foreground mb-6">
                Your risk profiling assessment has been completed and saved.
              </p>
              <Button 
                onClick={handleGoToKnowledgeProfiling}
                className="w-full"
                size="lg"
              >
                {kpCompleted 
                  ? "Go to Knowledge Profiling Score Card" 
                  : "Go to Knowledge Profiling Questionnaire"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingResults) {
    return (
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-12 lg:pb-16 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading risk profile...</p>
        </div>
      </div>
    );
  }

  // Show results page if assessment is complete
  // Check if assessment is completed - handle both is_complete flag and presence of rp_score
  const isResultCompleted = existingResult?.is_complete === true || (existingResult?.rp_score !== null && existingResult?.rp_score !== undefined);
  
  if (!isLoadingResults && isResultCompleted && showResults && !isRetaking) {
    const result = existingResult;
    const finalCategory = result.final_category || result.base_category || "Moderate";
    const categoryInfo = riskCategoryInfo[finalCategory] || riskCategoryInfo["Moderate"];

    const completedDate = new Date(result.completed_at || new Date());
    const validUntil = new Date(completedDate);
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    return (
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-12 lg:pb-16 min-h-screen bg-background">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => {
              if (clientId) {
                window.location.hash = `/clients/${clientId}/personal`;
              } else {
                window.location.hash = '/clients';
              }
            }}
            className="mb-4 w-full sm:w-auto h-11"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Client Profile
          </Button>
          
          {/* Main Results Card */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Risk Profile Result</h1>
              </div>

              {/* Primary Result Banner */}
              <div className={`${getRiskCategoryColor(finalCategory)} rounded-lg px-6 py-4 mb-6`}>
                <p className="text-white font-semibold text-lg mb-1">Your Risk Profile:</p>
                <p className="text-white text-3xl font-bold">{finalCategory}</p>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {getRiskCategoryDescription(finalCategory)}
              </p>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Overall Score */}
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <Label className="text-sm font-medium text-muted-foreground">Risk Score</Label>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {result.rp_score} / {result.max_possible_score}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.percentage_score?.toFixed(1) || "0"}% of maximum
                    </p>
                  </CardContent>
                </Card>

                {/* Risk Category */}
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <Label className="text-sm font-medium text-muted-foreground">Risk Category</Label>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {finalCategory}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.breakdown?.adjustment === "reduced" && "Adjusted down (Basic KP)"}
                      {result.breakdown?.adjustment === "increased" && "Adjusted up (Advanced KP)"}
                      {result.breakdown?.adjustment === "neutral" && "Based on assessment"}
                      {!result.breakdown && "Based on assessment"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Portfolio Recommendations */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Portfolio Recommendations</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Expected Return
                      </Label>
                      <p className="text-2xl font-bold text-foreground">
                        {categoryInfo.expectedReturn}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Volatility
                      </Label>
                      <p className="text-2xl font-bold text-foreground">
                        {categoryInfo.volatility}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Equity Allocation
                      </Label>
                      <p className="text-2xl font-bold text-foreground">
                        {categoryInfo.equityAllocation}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Debt Allocation
                      </Label>
                      <p className="text-2xl font-bold text-foreground">
                        {categoryInfo.debtAllocation}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Combined Assessment Info */}
              {result.breakdown && (
                <div className="mb-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Combined Assessment:</strong> Your risk profile combines both Risk Profiling (RP: {result.rp_score}) 
                      {result.kp_score !== null && ` and Knowledge Profiling (KP: ${result.kp_score})`} scores. 
                      {result.breakdown.adjustmentReason && ` ${result.breakdown.adjustmentReason}`}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Date and Validity */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 pb-6 border-b">
                <Calendar className="h-4 w-4" />
                <span>
                  Completed on {completedDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })} • Next review on {validUntil.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRetaking(true);
                    setShowResults(false);
                    setShowForm(true);
                    queryClient.invalidateQueries({ queryKey: ["/api/rp/results", clientId] });
                  }}
                  className="w-full sm:w-auto h-11 border-primary text-primary hover:bg-primary/10"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retake Assessment
                </Button>
                <Button
                  onClick={() => {
                    setIsRetaking(false);
                    if (clientId) {
                      window.location.hash = `/clients/${clientId}/personal`;
                    } else {
                      window.location.hash = '/clients';
                    }
                  }}
                  className="w-full sm:w-auto h-11 bg-primary hover:bg-primary/90"
                >
                  Accept and Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show form if retaking or no results exist
  // Check if assessment is completed - handle both is_complete flag and presence of rp_score
  const isCompleted = existingResult?.is_complete === true || (existingResult?.rp_score !== null && existingResult?.rp_score !== undefined);
  
  if (showForm || (!isCompleted && !isLoadingResults)) {
    if (!clientId) {
      return (
        <div className="p-6 min-h-screen bg-background flex items-center justify-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Client ID is missing. Please access this page through the client profile.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <div className="p-6 min-h-screen bg-background">
        <RiskProfilingForm
          clientId={clientId}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            if (clientId) {
              window.location.hash = `/clients/${clientId}/personal`;
            } else {
              window.location.hash = '/clients';
            }
          }}
          isLoading={false}
        />
      </div>
    );
  }

  // Fallback: should not reach here
  return null;
}

