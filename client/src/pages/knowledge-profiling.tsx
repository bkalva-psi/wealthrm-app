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
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight, ArrowLeft } from "lucide-react";

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, Response>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const { data: existingResult } = useQuery({
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/kp/results", clientId] });
      toast({
        title: "Assessment Completed",
        description: `Your knowledge level: ${data.knowledgeLevel}. Score: ${data.percentageScore.toFixed(1)}%`,
      });
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
    }
  });

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
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

  if (isLoading) {
    return (
      <div className="p-6 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading questionnaire...</p>
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

  if (existingResult?.is_complete && !isSubmitting) {
    return (
      <div className="p-6 min-h-screen bg-background">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Assessment Completed
              </CardTitle>
              <CardDescription>
                Your knowledge profiling assessment has been completed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Total Score</Label>
                  <p className="text-2xl font-bold">
                    {existingResult.total_score} / {existingResult.max_possible_score}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Percentage</Label>
                  <p className="text-2xl font-bold">{existingResult.percentage_score.toFixed(1)}%</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Knowledge Level</Label>
                <Badge className="mt-2 text-lg px-4 py-2">
                  {existingResult.knowledge_level || "N/A"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {existingResult.knowledge_level === "Basic" && "Limited financial literacy - recommend conservative guidance"}
                  {existingResult.knowledge_level === "Intermediate" && "Understands common products and risk/return trade-offs"}
                  {existingResult.knowledge_level === "Advanced" && "Confident & literate - eligible for complex products"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Completed On</Label>
                <p className="text-sm">
                  {new Date(existingResult.completed_at || existingResult.assessment_date).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              <Badge variant="outline">
                {answeredCount} / {questions.length} answered
              </Badge>
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
            <Button onClick={handleNext} disabled={!responses[currentQuestion.id]?.selected_option_id}>
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
