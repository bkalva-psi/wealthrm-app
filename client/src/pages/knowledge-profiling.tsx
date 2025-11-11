import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight, ArrowLeft, Shield, TrendingUp, BarChart3, Calendar, RefreshCw, Info, Calculator } from "lucide-react";
import { RiskMeter } from "@/components/risk-meter";

interface Question {
  id: number;
  question_text: string;
  question_category: string;
  question_type: string;
  display_order: number;
  is_required: boolean;
  help_text?: string;
  options: Option[];
}

interface Option {
  id: number;
  option_text: string;
  option_value: string;
  weightage: number;
  display_order: number;
}

interface Response {
  question_id: number;
  selected_option_id?: number;
  response_text?: string;
}

export default function KnowledgeProfiling() {
  // Extract clientId from URL hash query params
  const getClientIdFromHash = () => {
    const hash = window.location.hash;
    const match = hash.match(/[?&]clientId=(\d+)/);
    return match ? parseInt(match[1]) : null;
  };
  
  const [clientId, setClientId] = useState<number | null>(getClientIdFromHash());
  
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
  // Start directly at first question (0) - no intro page
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, Response>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any>(null);
  const [isRetaking, setIsRetaking] = useState(false);
  const [showRiskMeter, setShowRiskMeter] = useState(false);
  const [riskProfileData, setRiskProfileData] = useState<any>(null);

  // Fetch questionnaire
  const { data: questions = [], isLoading, error } = useQuery<Question[]>({
    queryKey: ["/api/kp/questionnaire"],
    queryFn: async () => {
      const response = await fetch("/api/kp/questionnaire");
      if (!response.ok) throw new Error("Failed to fetch questionnaire");
      return response.json();
    }
  });

  // Fetch existing results if clientId is provided
  const { data: existingResult, isLoading: isLoadingResults } = useQuery({
    queryKey: ["/api/kp/results", clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const response = await fetch(`/api/kp/results/${clientId}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Failed to fetch results");
      return response.json();
    },
    enabled: !!clientId
  });

  // Fetch RP results to check if both assessments are completed
  const { data: rpResult, isLoading: isLoadingRP } = useQuery({
    queryKey: ["/api/rp/results", clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const response = await fetch(`/api/rp/results/${clientId}`, {
        credentials: "include"
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Failed to fetch RP results");
      return response.json();
    },
    enabled: !!clientId
  });

  // Check if both assessments are completed
  const isKPCompleted = existingResult?.is_complete === true || (existingResult?.total_score !== null && existingResult?.total_score !== undefined);
  const isRPCompleted = rpResult?.is_complete === true || (rpResult?.rp_score !== null && rpResult?.rp_score !== undefined);
  const bothCompleted = isKPCompleted && isRPCompleted;

  // Automatically show results if existing completed assessment is found
  // For returning users: show scorecard immediately (skip intro page)
  // For first-time users: go directly to questionnaire
  useEffect(() => {
    if (!isLoadingResults && existingResult?.is_complete && !isRetaking) {
      // Returning user with completed assessment: show results immediately
      setSubmittedResult(existingResult);
      setShowResults(true);
      setCurrentQuestionIndex(-1); // Keep at -1 to prevent questionnaire from showing
    } else if (!isLoadingResults && (!existingResult || !existingResult.is_complete) && !isRetaking) {
      // First-time user: go directly to questionnaire
      setShowResults(false);
      setCurrentQuestionIndex(0); // Start at first question
    }
  }, [existingResult, isLoadingResults, isRetaking]);

  // Submit responses mutation
  const submitResponsesMutation = useMutation({
    mutationFn: async (data: { client_id: number; responses: Response[] }) => {
      const response = await fetch("/api/kp/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit responses");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/kp/results", clientId] });
      
      // Fetch the complete result with category breakdown
      if (clientId) {
        const resultResponse = await fetch(`/api/kp/results/${clientId}`);
        if (resultResponse.ok) {
          const fullResult = await resultResponse.json();
          setSubmittedResult(fullResult);
          setShowResults(true);
          setIsRetaking(false); // Reset retaking flag so results can be displayed
        }
      }
      
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
    }
  });

  const currentQuestion = currentQuestionIndex >= 0 ? questions[currentQuestionIndex] : null;
  const progress = questions.length > 0 && currentQuestionIndex >= 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(responses).length;
  const requiredQuestions = questions.filter(q => q.is_required);
  const requiredAnswered = requiredQuestions.every(q => responses[q.id]?.selected_option_id);

  const handleOptionSelect = (questionId: number, optionId: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        selected_option_id: optionId
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
    // No intro page - Previous button disabled at question 0
  };

  const handleSubmit = async () => {
    if (!clientId) {
      toast({
        title: "Error",
        description: "Client ID is required to submit responses",
        variant: "destructive"
      });
      return;
    }

    if (!requiredAnswered) {
      toast({
        title: "Incomplete",
        description: "Please answer all required questions before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    const responsesArray = Object.values(responses);
    submitResponsesMutation.mutate({
      client_id: clientId,
      responses: responsesArray
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      investment_basics: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      risk_management: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      tax_planning: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      portfolio_management: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      market_analysis: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      financial_products: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  if (isLoading || isLoadingResults) {
    return (
      <div className="p-6 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-background flex items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load questionnaire. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-6 min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
            <CardDescription>
              The knowledge profiling questionnaire is not available at this time.
              Please contact your relationship manager.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Get the result to display (either newly submitted or existing)
  // Prioritize existingResult for returning users to show scorecard immediately
  const displayResult = submittedResult || existingResult;

  // Helper function to capitalize first letter
  const capitalizeFirst = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Show Risk Meter if button was clicked
  if (showRiskMeter && riskProfileData) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowRiskMeter(false)}
              className="mb-4"
            >
              ← Back to Score Card
            </Button>
          </div>
          <RiskMeter
            finalCategory={riskProfileData.final_category || riskProfileData.base_category || "Moderate"}
            baseCategory={riskProfileData.base_category}
            rpScore={riskProfileData.rp_score}
            kpScore={riskProfileData.kp_score}
            knowledgeLevel={riskProfileData.knowledge_level}
            breakdown={riskProfileData.breakdown}
          />
        </div>
      </div>
    );
  }

  // PRIORITY: Show results page if assessment is complete
  // For returning users with completed assessment, show results immediately
  // Don't show results if user is actively retaking (isRetaking = true)
  if (!isLoadingResults && displayResult?.is_complete && !isSubmitting && !isRetaking) {
    const getKnowledgeLevelDescription = (level: string) => {
      const normalized = (level || "").toLowerCase();
      switch (normalized) {
        case "basic":
          return "You have foundational knowledge of financial concepts. We recommend starting with basic investment products and gradually expanding your portfolio as you gain more experience.";
        case "intermediate":
          return "You have a good understanding of investment concepts, risk and growth. Your profile is intermediate, which means you are ready for more diversified investments with moderate risk exposure.";
        case "advanced":
        case "expert":
          return "You have strong financial literacy and can handle complex investment strategies. You're eligible for sophisticated products including derivatives, alternative investments, and structured products.";
        default:
          return "Your knowledge assessment has been completed successfully.";
      }
    };

    const getKnowledgeLevelColor = (level: string) => {
      const normalized = (level || "").toLowerCase();
      switch (normalized) {
        case "basic":
          return "bg-blue-600";        // Basic
        case "intermediate":
          return "bg-orange-500";      // Intermediate
        case "advanced":
        case "expert":
          return "bg-green-600";       // Advanced/Expert
        default:
          return "bg-gray-600";
      }
    };

    const knowledgeLevel = displayResult.knowledge_level || "Basic";
    const knowledgeLevelDisplay = capitalizeFirst(knowledgeLevel);

    const completedDate = new Date(displayResult.completed_at || displayResult.assessment_date);
    const validUntil = new Date(completedDate);
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Main Results Card */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-gray-900">Knowledge Profile Result</h1>
              </div>

              {/* Primary Result Banner */}
              <div className={`${getKnowledgeLevelColor(knowledgeLevel)} rounded-lg px-6 py-4 mb-6`}>
                <p className="text-white font-semibold text-lg mb-1">Your Knowledge Profile:</p>
                <p className="text-white text-3xl font-bold">{knowledgeLevelDisplay}</p>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-8 leading-relaxed">
                {getKnowledgeLevelDescription(knowledgeLevel)}
              </p>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Overall Score */}
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <Label className="text-sm font-medium text-gray-600">Overall Score</Label>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {displayResult.percentage_score.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {displayResult.total_score} / {displayResult.max_possible_score} points
                    </p>
                  </CardContent>
                </Card>

                {/* Knowledge Level */}
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <Label className="text-sm font-medium text-gray-600">Knowledge Level</Label>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {knowledgeLevelDisplay}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on assessment results
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Category Breakdown */}
              {displayResult.categoryBreakdown && displayResult.categoryBreakdown.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {displayResult.categoryBreakdown.map((cat: any) => (
                      <Card key={cat.category} className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium text-gray-700">
                              {cat.categoryName}
                            </Label>
                            <div className="flex items-center gap-1">
                              <Info className="h-3 w-3 text-gray-400" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 mb-1">
                            {cat.percentage.toFixed(0)}%
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            {cat.score} / {cat.maxScore} points ({cat.questionCount} questions)
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Date and Validity */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 pb-6 border-b">
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
              <div className="flex items-center justify-end gap-3">
                 {/* Calculate Final Risk Score button - only show when both RP and KP are completed */}
                 {bothCompleted && !showRiskMeter && (
                   <Button
                     onClick={async () => {
                       // Fetch the combined risk profile data
                       if (clientId) {
                         try {
                           const response = await fetch(`/api/rp/results/${clientId}`, {
                             credentials: "include"
                           });
                           if (response.ok) {
                             const data = await response.json();
                             setRiskProfileData(data);
                             setShowRiskMeter(true);
                           }
                         } catch (error) {
                           console.error("Error fetching risk profile:", error);
                           toast({
                             title: "Error",
                             description: "Failed to load risk profile data",
                             variant: "destructive"
                           });
                         }
                       }
                     }}
                     className="bg-green-600 hover:bg-green-700 text-white"
                   >
                     <Calculator className="mr-2 h-4 w-4" />
                     Calculate Final Risk Score
                   </Button>
                 )}
                 {/* Retake Assessment button - always show for returning users, or Review Answers for first-time users */}
                 {isRetaking ? (
                   <Button
                     variant="outline"
                     onClick={async (e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       
                       // Reset to show questionnaire again to review answers
                       setShowResults(false);
                       setCurrentQuestionIndex(0);
                       // Keep responses so user can see their answers
                       
                       // Scroll to top
                       setTimeout(() => {
                         window.scrollTo({ top: 0, behavior: 'smooth' });
                       }, 100);
                     }}
                     className="border-primary text-primary hover:bg-primary/10 cursor-pointer"
                   >
                     Review Answers
                   </Button>
                 ) : (
                   <Button
                     variant="outline"
                     onClick={async (e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       
                       // First, mark as retaking to prevent auto-show results
                       setIsRetaking(true);
                       
                       // Then reset all state to allow retaking
                       setShowResults(false);
                       setSubmittedResult(null);
                       setCurrentQuestionIndex(0); // Go directly to questionnaire (skip intro page)
                       setResponses({});
                       
                       // Invalidate queries to fetch fresh data
                       await queryClient.invalidateQueries({ queryKey: ["/api/kp/results", clientId] });
                       await queryClient.invalidateQueries({ queryKey: ["/api/kp/questionnaire"] });
                       
                       // Use setTimeout to ensure state updates are processed
                       setTimeout(() => {
                         // Scroll to top to show the questionnaire
                         window.scrollTo({ top: 0, behavior: 'smooth' });
                       }, 100);
                     }}
                     className="border-primary text-primary hover:bg-primary/10 cursor-pointer"
                   >
                     <RefreshCw className="mr-2 h-4 w-4" />
                     Retake Assessment
                   </Button>
                 )}
                 {/* Show "Accept and Continue" for both returning users and first-time users who just completed */}
                 <Button
                   onClick={() => {
                     setIsRetaking(false); // Reset retaking flag
                     if (clientId) {
                       // Navigate to Family Information section (Section 3) after Knowledge Profiling completion
                       window.location.hash = `/clients/${clientId}/personal?section=family`;
                     } else {
                       window.location.hash = '/clients';
                     }
                   }}
                   className="bg-primary hover:bg-primary/90"
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

  // Show questionnaire only if:
  // 1. No completed assessment exists (first-time users), OR
  // 2. User is actively retaking the assessment
  // Don't show questionnaire for returning users with completed assessments
  if (currentQuestionIndex >= 0 && !showResults && (!existingResult?.is_complete || isRetaking)) {
    return (
      <div className="p-6 min-h-screen bg-background">
        <div className="max-w-3xl mx-auto">
          {/* Progress Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Knowledge Profiling Assessment</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {answeredCount} / {questions.length} questions
                  </p>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Current Question */}
          {currentQuestion && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
                    {currentQuestion.is_required && (
                      <Badge variant="destructive">Required</Badge>
                    )}
                  </div>
                  <Badge className={getCategoryColor(currentQuestion.question_category)}>
                    {currentQuestion.question_category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              </div>
              {currentQuestion.help_text && (
                <Alert className="mt-4">
                  <HelpCircle className="h-4 w-4" />
                  <AlertDescription>{currentQuestion.help_text}</AlertDescription>
                </Alert>
              )}
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={responses[currentQuestion.id]?.selected_option_id?.toString()}
                onValueChange={(value) => handleOptionSelect(currentQuestion.id, parseInt(value))}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                    <Label
                      htmlFor={`option-${option.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

           {currentQuestionIndex < questions.length - 1 ? (
             <Button onClick={handleNext} disabled={!currentQuestion || !responses[currentQuestion.id]?.selected_option_id}>
               Next
               <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
           ) : (
             <Button
               onClick={handleSubmit}
               disabled={!requiredAnswered || !clientId || isSubmitting}
             >
               {isSubmitting ? "Submitting..." : "Submit Assessment"}
             </Button>
           )}
         </div>

         {!clientId && (
           <Alert variant="destructive" className="mt-4">
             <AlertCircle className="h-4 w-4" />
             <AlertDescription>
               Client ID is missing. Please access this page through the client profile.
             </AlertDescription>
           </Alert>
         )}
       </div>
     </div>
   );
  }

  // Fallback: should not reach here, but return null to be safe
  return null;
}
