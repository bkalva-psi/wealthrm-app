import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Shield, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, TrendingUp, BarChart3, Calendar, RefreshCw, Info, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RiskProfilingFormProps {
  clientId: number;
  onSubmit: (data: RiskProfilingData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface RiskProfilingData {
  answers: {
    [key: number]: number; // question number -> score (0-4)
  };
  totalScore: number;
  category: "Conservative" | "Moderate" | "Moderately Aggressive" | "Aggressive";
  completedAt: Date;
}

// Risk category descriptions and metrics
const riskCategoryInfo = {
  Conservative: {
    description: "You prefer stability and capital preservation over high returns. Your portfolio should focus on protecting your investments with minimal risk.",
    expectedReturn: "6-8%",
    volatility: "Low",
    equityAllocation: "20-30%",
    debtAllocation: "70-80%",
  },
  Moderate: {
    description: "You seek a balanced approach between growth and stability. Your portfolio will have a mix of equity and debt instruments to provide steady growth with moderate risk.",
    expectedReturn: "8-12%",
    volatility: "Moderate",
    equityAllocation: "40-50%",
    debtAllocation: "50-60%",
  },
  "Moderately Aggressive": {
    description: "You are comfortable with higher risk for potentially higher returns. Your portfolio will lean towards equity investments with some stability through debt instruments.",
    expectedReturn: "12-15%",
    volatility: "Moderate-High",
    equityAllocation: "60-70%",
    debtAllocation: "30-40%",
  },
  Aggressive: {
    description: "You are willing to take significant risk to achieve maximum growth. Your portfolio will be heavily weighted towards equity investments with minimal debt allocation.",
    expectedReturn: "15%+",
    volatility: "High",
    equityAllocation: "80-90%",
    debtAllocation: "10-20%",
  },
};

// Interface for database question structure
interface DbQuestion {
  id: number;
  question_text: string;
  section: string; // 'capacity', 'horizon', 'attitude'
  order_index: number;
  created_at?: string;
}

interface DbOption {
  id: number;
  question_id: number;
  option_text: string;
  score: number;
  order_index: number;
  created_at?: string;
}

// Transformed question structure for the component
interface Question {
  id: number;
  section: string;
  question: string;
  options: Array<{ label: string; score: number }>;
}

// Calculate category based on total score
const calculateCategory = (totalScore: number): "Conservative" | "Moderate" | "Moderately Aggressive" | "Aggressive" => {
  if (totalScore <= 20) return "Conservative";
  if (totalScore <= 40) return "Moderate";
  if (totalScore <= 60) return "Moderately Aggressive";
  return "Aggressive";
};

export function RiskProfilingForm({
  clientId,
  onSubmit,
  onCancel,
  isLoading = false,
}: RiskProfilingFormProps) {
  const { toast } = useToast();
  const [hasStarted, setHasStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [riskProfileResult, setRiskProfileResult] = useState<RiskProfilingData | null>(null);
  const [existingProfile, setExistingProfile] = useState<{ category: string; completedAt: Date; isValid: boolean } | null>(null);

  // Fetch questions from database
  const { data: dbQuestions = [], isLoading: isLoadingQuestions } = useQuery<DbQuestion[]>({
    queryKey: ["/api/rp/questions"],
    queryFn: async () => {
      const response = await fetch("/api/rp/questions", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
  });

  // Fetch options for all questions in parallel
  const { data: allOptions = [], isLoading: isLoadingOptions } = useQuery<DbOption[]>({
    queryKey: ["/api/rp/options", dbQuestions.map(q => q.id).sort().join(",")],
    queryFn: async () => {
      if (dbQuestions.length === 0) return [];
      
      // Fetch options for all questions in parallel
      const optionsPromises = dbQuestions.map(async (q) => {
        try {
          const response = await fetch(`/api/rp/questions/${q.id}/options`, {
            credentials: "include"
          });
          if (!response.ok) {
            console.warn(`Failed to fetch options for question ${q.id}`);
            return [];
          }
          return response.json();
        } catch (error) {
          console.error(`Error fetching options for question ${q.id}:`, error);
          return [];
        }
      });
      const optionsArrays = await Promise.all(optionsPromises);
      return optionsArrays.flat();
    },
    enabled: dbQuestions.length > 0,
  });

  // Transform database questions and options to component format
  const questions: Question[] = dbQuestions
    .sort((a, b) => a.order_index - b.order_index)
    .map((q) => {
      const questionOptions = allOptions
        .filter((opt) => opt.question_id === q.id)
        .sort((a, b) => a.order_index - b.order_index)
        .map((opt) => ({
          label: opt.option_text,
          score: opt.score,
        }));

      return {
        id: q.id,
        section: q.section,
        question: q.question_text,
        options: questionOptions,
      };
    })
    .filter((q) => q.options.length > 0); // Only include questions that have options

  // Calculate total score
  const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
  const category = calculateCategory(totalScore);
  const answeredCount = Object.keys(answers).length;

  const handleAnswerSelect = (questionId: number, score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: score,
    }));
  };

  const scrollToQuestion = (questionIndex: number) => {
    const element = document.getElementById(`question-${questionIndex + 1}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the question briefly
      element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }, 1000);
    }
  };

  const handleNext = () => {
    if (!currentAnswer && currentAnswer !== 0) {
      toast({
        title: "Please select an answer",
        description: "You must select an option before proceeding.",
        variant: "destructive",
      });
      return;
    }
    if (!isLastQuestion) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      scrollToQuestion(nextQuestion);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      const prevQuestion = currentQuestion - 1;
      setCurrentQuestion(prevQuestion);
      scrollToQuestion(prevQuestion);
    }
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    if (Object.keys(answers).length !== questions.length) {
      toast({
        title: "Incomplete questionnaire",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    const formData: RiskProfilingData = {
      answers,
      totalScore,
      category,
      completedAt: new Date(),
    };

    setRiskProfileResult(formData);
    setShowResults(true);
  };

  const handleAcceptAndContinue = () => {
    if (riskProfileResult) {
      onSubmit(riskProfileResult);
    }
  };

  const handleRetakeQuestionnaire = () => {
    setShowResults(false);
    setRiskProfileResult(null);
    setAnswers({});
    setCurrentQuestion(0);
    setHasStarted(true);
  };

  // Check for existing profile on component mount
  useEffect(() => {
    // TODO: Load from API/backend
    // const checkExistingProfile = async () => {
    //   const response = await fetch(`/api/clients/${clientId}/risk-profile`);
    //   const data = await response.json();
    //   if (data && data.isValid) {
    //     setExistingProfile(data);
    //   }
    // };
    // checkExistingProfile();
  }, [clientId]);


  // Show existing profile if valid (before starting questionnaire)
  if (existingProfile && existingProfile.isValid && !showResults && !hasStarted) {
    const expiryDate = new Date(existingProfile.completedAt);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const categoryInfo = riskCategoryInfo[existingProfile.category as keyof typeof riskCategoryInfo];
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Profile Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Existing risk profile from {new Date(existingProfile.completedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}: {existingProfile.category}
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              <div className="text-center py-6">
                <Badge
                  variant={
                    existingProfile.category === "Conservative"
                      ? "secondary"
                      : existingProfile.category === "Moderate"
                      ? "default"
                      : existingProfile.category === "Moderately Aggressive"
                      ? "outline"
                      : "destructive"
                  }
                  className="text-2xl px-6 py-2 mb-4"
                >
                  {existingProfile.category}
                </Badge>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                  {categoryInfo?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Expected Return</p>
                    <p className="text-xl font-bold">{categoryInfo?.expectedReturn}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Volatility</p>
                    <p className="text-xl font-bold">{categoryInfo?.volatility}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Equity Allocation</p>
                    <p className="text-xl font-bold">{categoryInfo?.equityAllocation}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Debt Allocation</p>
                    <p className="text-xl font-bold">{categoryInfo?.debtAllocation}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Valid until {expiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div className="flex justify-center gap-4 pt-6 border-t">
                <Button
                  onClick={() => {
                    setHasStarted(true);
                    setExistingProfile(null);
                  }}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
                <Button onClick={onCancel}>
                  Accept and Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show results screen after submission
  if (showResults && riskProfileResult) {
    const expiryDate = new Date(riskProfileResult.completedAt);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const categoryInfo = riskCategoryInfo[riskProfileResult.category];

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Profile Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center py-6">
                <Badge
                  variant={
                    riskProfileResult.category === "Conservative"
                      ? "secondary"
                      : riskProfileResult.category === "Moderate"
                      ? "default"
                      : riskProfileResult.category === "Moderately Aggressive"
                      ? "outline"
                      : "destructive"
                  }
                  className="text-2xl px-6 py-2 mb-4"
                >
                  Your Risk Profile: {riskProfileResult.category}
                </Badge>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                  {categoryInfo?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Expected Return</p>
                    <p className="text-xl font-bold">{categoryInfo?.expectedReturn}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-sm text-muted-foreground">Volatility</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Volatility measures how much investment prices fluctuate over time. Higher volatility means more price swings.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-xl font-bold">{categoryInfo?.volatility}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Equity Allocation</p>
                    <p className="text-xl font-bold">{categoryInfo?.equityAllocation}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Debt Allocation</p>
                    <p className="text-xl font-bold">{categoryInfo?.debtAllocation}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Completed on {riskProfileResult.completedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span>Valid for 1 year until {expiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div className="flex justify-center gap-4 pt-6 border-t">
                <Button
                  onClick={handleRetakeQuestionnaire}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retake Questionnaire
                </Button>
                <Button onClick={handleAcceptAndContinue} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Accept and Continue"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while fetching questions
  if (isLoadingQuestions || isLoadingOptions) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading questionnaire...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if no questions found
  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-4" />
              <CardTitle className="text-xl font-semibold mb-2">
                No Questions Available
              </CardTitle>
              <p className="text-muted-foreground mb-4">
                The risk profiling questionnaire has not been set up yet. Please contact your advisor.
              </p>
              <Button onClick={onCancel} variant="outline">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show start screen if not started
  if (!hasStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Shield className="h-16 w-16 text-primary mb-6" />
              <CardTitle className="text-2xl font-semibold mb-6">
                Risk Profiling Assessment
              </CardTitle>
              <div className="space-y-3 mb-8 max-w-lg">
                <p className="text-base text-muted-foreground">
                  Risk profiling helps us understand how comfortable you are with financial risk and market ups and downs.
                </p>
                <p className="text-base text-muted-foreground">
                  This allows us to suggest investments that match your comfort level and goals.
                </p>
              </div>
              <Button
                onClick={() => setHasStarted(true)}
                size="lg"
                className="px-8"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Questionnaire
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const currentAnswer = answers[question.id];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      {/* Top Card - Assessment Header */}
      <Card>
        <CardContent className="p-6">
          <CardTitle className="text-2xl font-semibold mb-4">
            Risk Profiling Assessment
          </CardTitle>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-sm text-muted-foreground text-right">
              {answeredCount}/{questions.length} answered
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Card - Current Question */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Question with Required Badge */}
            <div className="flex items-start gap-2">
              <Label className="text-lg font-semibold flex-1">
                {question.question}
              </Label>
              <Badge variant="destructive" className="text-xs">
                Required
              </Badge>
            </div>

            {/* Answer Options */}
            <RadioGroup
              value={currentAnswer?.toString()}
              onValueChange={(value) => handleAnswerSelect(question.id, parseInt(value))}
              className="space-y-3 mt-6"
            >
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <RadioGroupItem value={option.score.toString()} id={`q${question.id}-opt${index}`} />
                  <Label
                    htmlFor={`q${question.id}-opt${index}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={isFirstQuestion ? onCancel : handlePrevious}
          disabled={isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {isFirstQuestion ? "Cancel" : "Previous"}
        </Button>

        {isLastQuestion ? (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || Object.keys(answers).length !== questions.length}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {isLoading ? "Submitting..." : "Submit Risk Profile"}
          </Button>
        ) : (
          <Button type="button" onClick={handleNext} disabled={!currentAnswer && currentAnswer !== 0}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

