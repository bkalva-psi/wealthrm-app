import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Save, X, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface KpQuestion {
  id: number;
  question_text: string;
  question_category: string;
  question_type: string;
  display_order: number;
  is_active: boolean;
  is_required: boolean;
  help_text?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

interface KpQuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  option_value: string;
  weightage: number;
  display_order: number;
  is_correct?: boolean;
}

interface QuestionWithOptions extends KpQuestion {
  options?: KpQuestionOption[];
}

const QUESTION_CATEGORIES = [
  "investment_basics",
  "risk_management",
  "tax_planning",
  "portfolio_management",
  "market_analysis",
  "financial_products"
];

const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "single_select", label: "Single Select" },
  { value: "rating", label: "Rating Scale" }
];

export default function QMPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionWithOptions | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  // Form state for question
  const [questionForm, setQuestionForm] = useState({
    question_text: "",
    question_category: "investment_basics",
    question_type: "multiple_choice",
    question_level: "basic", // 'basic' (Q1-Q5), 'intermediate' or 'advanced' (Q6-Q15)
    display_order: 1,
    is_active: true,
    is_required: true,
    help_text: ""
  });

  // Form state for options (multiple options when creating question)
  const [questionOptions, setQuestionOptions] = useState<Array<{
    option_text: string;
    option_value: string;
    weightage: number;
    display_order: number;
    is_correct: boolean;
  }>>([]);

  // Form state for option (single option when editing)
  const [optionForm, setOptionForm] = useState({
    option_text: "",
    option_value: "",
    weightage: 0,
    display_order: 1,
    is_correct: false
  });

  // Fetch questions
  const { data: questions = [], isLoading } = useQuery<KpQuestion[]>({
    queryKey: ["/api/kp/questions"],
    queryFn: async () => {
      const response = await fetch("/api/kp/questions");
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    }
  });

  // Fetch options for a question
  const fetchQuestionWithOptions = async (questionId: number): Promise<QuestionWithOptions> => {
    const [questionRes, optionsRes] = await Promise.all([
      fetch(`/api/kp/questions/${questionId}`, {
        credentials: "include"
      }),
      fetch(`/api/kp/questions/${questionId}/options`, {
        credentials: "include"
      })
    ]);

    if (!questionRes.ok) {
      const errorText = await questionRes.text();
      console.error(`Failed to fetch question ${questionId}:`, questionRes.status, errorText);
      throw new Error(`Failed to fetch question: ${questionRes.status} ${errorText}`);
    }
    
    if (!optionsRes.ok) {
      const errorText = await optionsRes.text();
      console.error(`Failed to fetch options for question ${questionId}:`, optionsRes.status, errorText);
      throw new Error(`Failed to fetch options: ${optionsRes.status} ${errorText}`);
    }

    const question = await questionRes.json();
    const options = await optionsRes.json();

    return { ...question, options: options || [] };
  };

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/kp/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create question");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kp/questions"] });
      setIsQuestionDialogOpen(false);
      resetQuestionForm();
      toast({ title: "Success", description: "Question created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/kp/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update question");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kp/questions"] });
      setIsQuestionDialogOpen(false);
      setSelectedQuestion(null);
      resetQuestionForm();
      toast({ title: "Success", description: "Question updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/kp/questions/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete question");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kp/questions"] });
      toast({ title: "Success", description: "Question deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Create option mutation
  const createOptionMutation = useMutation({
    mutationFn: async ({ questionId, data }: { questionId: number; data: any }) => {
      const response = await fetch(`/api/kp/questions/${questionId}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create option");
      return response.json();
    },
    onSuccess: () => {
      if (selectedQuestion) {
        fetchQuestionWithOptions(selectedQuestion.id).then(setSelectedQuestion);
      }
      setIsOptionDialogOpen(false);
      resetOptionForm();
      toast({ title: "Success", description: "Option added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update option mutation
  const updateOptionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/kp/options/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update option");
      return response.json();
    },
    onSuccess: () => {
      if (selectedQuestion) {
        fetchQuestionWithOptions(selectedQuestion.id).then(setSelectedQuestion);
      }
      setIsOptionDialogOpen(false);
      resetOptionForm();
      toast({ title: "Success", description: "Option updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete option mutation
  const deleteOptionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/kp/options/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete option");
      return response.json();
    },
    onSuccess: () => {
      if (selectedQuestion) {
        fetchQuestionWithOptions(selectedQuestion.id).then(setSelectedQuestion);
      }
      toast({ title: "Success", description: "Option deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const resetQuestionForm = () => {
    setQuestionForm({
      question_text: "",
      question_category: "investment_basics",
      question_type: "multiple_choice",
      question_level: "basic",
      display_order: 1,
      is_active: true,
      is_required: true,
      help_text: ""
    });
    setQuestionOptions([]);
  };

  const addQuestionOption = () => {
    setQuestionOptions(prev => [...prev, {
      option_text: "",
      option_value: "",
      weightage: 0,
      display_order: prev.length + 1, // Start from 1, not 0
      is_correct: false
    }]);
  };

  const removeQuestionOption = (index: number) => {
    setQuestionOptions(prev => prev.filter((_, i) => i !== index).map((opt, i) => ({
      ...opt,
      display_order: i + 1 // Start from 1, not 0
    })));
  };

  const updateQuestionOption = (index: number, field: string, value: any) => {
    setQuestionOptions(prev => prev.map((opt, i) => 
      i === index ? { ...opt, [field]: value } : opt
    ));
  };

  const resetOptionForm = () => {
    setOptionForm({
      option_text: "",
      option_value: "",
      weightage: 0,
      display_order: 1,
      is_correct: false
    });
  };

  const handleEditQuestion = async (question: KpQuestion) => {
    const questionWithOptions = await fetchQuestionWithOptions(question.id);
    setSelectedQuestion(questionWithOptions);
    setQuestionForm({
      question_text: question.question_text,
      question_category: question.question_category,
      question_type: question.question_type,
      question_level: (question as any).question_level || "basic",
      display_order: question.display_order,
      is_active: question.is_active,
      is_required: question.is_required,
      help_text: question.help_text || ""
    });
    setIsQuestionDialogOpen(true);
  };

  const handleAddOption = (question: QuestionWithOptions) => {
    setSelectedQuestion(question);
    resetOptionForm();
    // Set display order to next available number (starting from 1)
    setOptionForm(prev => ({ ...prev, display_order: (question.options?.length || 0) + 1 }));
    setIsOptionDialogOpen(true);
  };

  const handleEditOption = (question: QuestionWithOptions, option: KpQuestionOption) => {
    setSelectedQuestion(question);
    setOptionForm({
      option_text: option.option_text,
      option_value: option.option_value,
      weightage: option.weightage,
      display_order: option.display_order,
      is_correct: option.is_correct || false
    });
    setIsOptionDialogOpen(true);
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestion) {
      // Updating existing question - no options included
      updateQuestionMutation.mutate({ id: selectedQuestion.id, data: questionForm });
    } else {
      // Creating new question - include options if provided
      const questionData = {
        ...questionForm,
        options: questionOptions.filter(opt => opt.option_text.trim() !== "")
      };
      createQuestionMutation.mutate(questionData);
    }
  };

  const handleSubmitOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion) return;

    const optionData = {
      ...optionForm,
      option_value: optionForm.option_value || optionForm.option_text
    };

    // Check if editing (we'd need to track this, for now assume new)
    createOptionMutation.mutate({ questionId: selectedQuestion.id, data: optionData });
  };

  const toggleQuestionExpansion = async (questionId: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
      setExpandedQuestions(newExpanded);
    } else {
      newExpanded.add(questionId);
      setExpandedQuestions(newExpanded);
      // Fetch options when expanding
      const questionWithOptions = await fetchQuestionWithOptions(questionId);
      setSelectedQuestion(questionWithOptions);
    }
  };

  // Check if user is QM or admin (role can be "Question Manager" or "question_manager" or "admin")
  const isAuthorized = user?.role === "Question Manager" || 
                       user?.role === "question_manager" || 
                       user?.role === "admin" || 
                       user?.role === "Administrator";

  if (!isAuthorized) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need Question Manager or Admin access to use this portal.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Question Manager Portal</h1>
            <p className="text-muted-foreground mt-1">Manage Knowledge Profiling questions and scoring</p>
          </div>
          <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { 
                setSelectedQuestion(null); 
                resetQuestionForm();
                // Add one default option when creating new question
                setQuestionOptions([{
                  option_text: "",
                  option_value: "",
                  weightage: 0,
                  display_order: 1,
                  is_correct: false
                }]);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedQuestion ? "Edit Question" : "Create New Question"}</DialogTitle>
                <DialogDescription>Configure the question text, category, and settings</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question_text">Question Text *</Label>
                  <Textarea
                    id="question_text"
                    value={questionForm.question_text}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, question_text: e.target.value }))}
                    placeholder="Enter the question text..."
                    required
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="question_category">Category *</Label>
                    <Select
                      value={questionForm.question_category}
                      onValueChange={(value) => setQuestionForm(prev => ({ ...prev, question_category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question_type">Question Type *</Label>
                    <Select
                      value={questionForm.question_type}
                      onValueChange={(value) => setQuestionForm(prev => ({ ...prev, question_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="question_level">Question Level *</Label>
                    <Select
                      value={questionForm.question_level}
                      onValueChange={(value) => setQuestionForm(prev => ({ ...prev, question_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (Q1-Q5)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (Q6-Q15)</SelectItem>
                        <SelectItem value="advanced">Advanced (Q6-Q15)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Basic: Q1-Q5, Intermediate/Advanced: Q6-Q15
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={questionForm.display_order}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 1 }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Order: 1-5 (Basic), 6-15 (Intermediate/Advanced)
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="help_text">Help Text (Optional)</Label>
                  <Textarea
                    id="help_text"
                    value={questionForm.help_text}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, help_text: e.target.value }))}
                    placeholder="Additional guidance for answering this question..."
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={questionForm.is_active}
                      onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_required"
                      checked={questionForm.is_required}
                      onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, is_required: checked }))}
                    />
                    <Label htmlFor="is_required">Required</Label>
                  </div>
                </div>

                {/* Options Section - Only show when creating new question */}
                {!selectedQuestion && (
                  <div className="space-y-4 border-t pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Answer Options</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addQuestionOption}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Option
                      </Button>
                    </div>
                    {questionOptions.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Add at least one answer option for this question. Users will select from these options.
                      </p>
                    )}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {questionOptions.map((option, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Option {index + 1}</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestionOption(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`option_text_${index}`} className="text-xs">Option Text *</Label>
                              <Input
                                id={`option_text_${index}`}
                                value={option.option_text}
                                onChange={(e) => updateQuestionOption(index, "option_text", e.target.value)}
                                placeholder="Enter option text..."
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor={`weightage_${index}`} className="text-xs">Option Score *</Label>
                                <Select
                                  value={option.weightage.toString()}
                                  onValueChange={(value) => updateQuestionOption(index, "weightage", parseInt(value))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">0 points (Incorrect / Not Sure)</SelectItem>
                                    <SelectItem value="1">1 point (Partially correct)</SelectItem>
                                    <SelectItem value="3">3 points (Fully correct / Ideal)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                  Score: 0 (wrong), 1 (partial), 3 (correct)
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`display_order_${index}`} className="text-xs">Display Order</Label>
                                <Input
                                  id={`display_order_${index}`}
                                  type="number"
                                  value={option.display_order}
                                  onChange={(e) => updateQuestionOption(index, "display_order", parseInt(e.target.value) || (index + 1))}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsQuestionDialogOpen(false);
                    resetQuestionForm();
                    setSelectedQuestion(null);
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={
                      createQuestionMutation.isPending || 
                      updateQuestionMutation.isPending ||
                      (!selectedQuestion && questionOptions.length === 0)
                    }
                  >
                    {selectedQuestion ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading questions...</div>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No questions yet. Create your first question to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => {
              const isExpanded = expandedQuestions.has(question.id);
              const questionWithOptions = selectedQuestion?.id === question.id ? selectedQuestion : null;

              return (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{question.question_text}</CardTitle>
                          {!question.is_active && <Badge variant="secondary">Inactive</Badge>}
                          {question.is_required && <Badge variant="outline">Required</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Category: {question.question_category.replace(/_/g, " ")}</span>
                          <span>Type: {question.question_type}</span>
                          <span>Order: {question.display_order}</span>
                        </div>
                        {question.help_text && (
                          <div className="mt-2 text-sm text-muted-foreground flex items-start gap-1">
                            <HelpCircle className="h-4 w-4 mt-0.5" />
                            <span>{question.help_text}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleQuestionExpansion(question.id)}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {(user?.role === "admin" || user?.role === "Question Manager" || user?.role === "question_manager") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this question? This will also delete all associated options and cannot be undone.")) {
                                deleteQuestionMutation.mutate(question.id);
                              }
                            }}
                            disabled={deleteQuestionMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Answer Options</h3>
                        <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => handleAddOption(questionWithOptions || question as any)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Option
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Option</DialogTitle>
                              <DialogDescription>Configure the answer option and its weightage</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmitOption} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="option_text">Option Text *</Label>
                                <Input
                                  id="option_text"
                                  value={optionForm.option_text}
                                  onChange={(e) => setOptionForm(prev => ({ ...prev, option_text: e.target.value }))}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="option_value">Option Value</Label>
                                <Input
                                  id="option_value"
                                  value={optionForm.option_value}
                                  onChange={(e) => setOptionForm(prev => ({ ...prev, option_value: e.target.value }))}
                                  placeholder="Leave empty to use option text"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="weightage">Option Score *</Label>
                                  <Select
                                    value={optionForm.weightage.toString()}
                                    onValueChange={(value) => setOptionForm(prev => ({ ...prev, weightage: parseInt(value) }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="0">0 points (Incorrect / Not Sure)</SelectItem>
                                      <SelectItem value="1">1 point (Partially correct)</SelectItem>
                                      <SelectItem value="3">3 points (Fully correct / Ideal)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground">
                                    Score: 0 (wrong), 1 (partial), 3 (correct)
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="display_order">Display Order</Label>
                                  <Input
                                    id="display_order"
                                    type="number"
                                    value={optionForm.display_order}
                                    onChange={(e) => setOptionForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 1 }))}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsOptionDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={createOptionMutation.isPending}>
                                  Add Option
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {questionWithOptions?.options && questionWithOptions.options.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Option Text</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Order</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {questionWithOptions.options.map((option) => (
                              <TableRow key={option.id}>
                                <TableCell>{option.option_text}</TableCell>
                                <TableCell>{option.weightage} points</TableCell>
                                <TableCell>{option.display_order}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditOption(questionWithOptions, option)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        if (confirm("Are you sure you want to delete this option? This action cannot be undone.")) {
                                          deleteOptionMutation.mutate(option.id);
                                        }
                                      }}
                                      disabled={deleteOptionMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-muted-foreground">No options added yet. Add options to enable responses.</p>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
