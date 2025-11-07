import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface RpQuestion {
  id: number;
  question_text: string;
  section: string; // 'capacity', 'horizon', 'attitude'
  order_index: number;
  created_at?: string;
}

interface RpQuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  score: number;
  order_index: number;
  created_at?: string;
}

interface QuestionWithOptions extends RpQuestion {
  options?: RpQuestionOption[];
}

const QUESTION_SECTIONS = [
  { value: "capacity", label: "Personal & Financial Capacity" },
  { value: "horizon", label: "Investment Goals & Horizon" },
  { value: "attitude", label: "Risk Attitude & Behavior" }
];

export function RiskProfilingQuestions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionWithOptions | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [editingOptionId, setEditingOptionId] = useState<number | null>(null);
  const [deleteQuestionDialogOpen, setDeleteQuestionDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const [deleteOptionDialogOpen, setDeleteOptionDialogOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<number | null>(null);

  // Form state for question
  const [questionForm, setQuestionForm] = useState({
    question_text: "",
    section: "capacity",
    order_index: 1,
  });

  // Form state for options (multiple options when creating question)
  const [questionOptions, setQuestionOptions] = useState<Array<{
    option_text: string;
    score: number;
    order_index: number;
  }>>([]);

  // Form state for option (single option when editing)
  const [optionForm, setOptionForm] = useState({
    option_text: "",
    score: 0,
    order_index: 1,
  });

  // Fetch questions
  const { data: questions = [], isLoading } = useQuery<RpQuestion[]>({
    queryKey: ["/api/rp/questions"],
    queryFn: async () => {
      const response = await fetch("/api/rp/questions", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    }
  });

  // Fetch options for a question
  const fetchQuestionWithOptions = async (questionId: number): Promise<QuestionWithOptions> => {
    const [questionRes, optionsRes] = await Promise.all([
      fetch(`/api/rp/questions/${questionId}`, {
        credentials: "include"
      }),
      fetch(`/api/rp/questions/${questionId}/options`, {
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
      const response = await fetch("/api/rp/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to create question" }));
        throw new Error(errorData.message || errorData.error || "Failed to create question");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rp/questions"] });
      setIsQuestionDialogOpen(false);
      resetQuestionForm();
      toast({ title: "Success", description: "Question created successfully" });
    },
    onError: (error: Error) => {
      console.error("Create question error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/rp/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to update question" }));
        throw new Error(errorData.message || errorData.error || "Failed to update question");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rp/questions"] });
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
      const response = await fetch(`/api/rp/questions/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to delete question" }));
        throw new Error(errorData.message || errorData.error || "Failed to delete question");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rp/questions"] });
      toast({ title: "Success", description: "Question deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Create option mutation
  const createOptionMutation = useMutation({
    mutationFn: async ({ questionId, data }: { questionId: number; data: any }) => {
      const response = await fetch(`/api/rp/questions/${questionId}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to create option" }));
        throw new Error(errorData.message || errorData.error || "Failed to create option");
      }
      return response.json();
    },
    onSuccess: () => {
      if (selectedQuestion) {
        fetchQuestionWithOptions(selectedQuestion.id).then(setSelectedQuestion);
      }
      setIsOptionDialogOpen(false);
      resetOptionForm();
      setEditingOptionId(null);
      toast({ title: "Success", description: "Option added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update option mutation
  const updateOptionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/rp/options/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to update option" }));
        throw new Error(errorData.message || errorData.error || "Failed to update option");
      }
      return response.json();
    },
    onSuccess: () => {
      if (selectedQuestion) {
        fetchQuestionWithOptions(selectedQuestion.id).then(setSelectedQuestion);
      }
      setIsOptionDialogOpen(false);
      resetOptionForm();
      setEditingOptionId(null);
      toast({ title: "Success", description: "Option updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete option mutation
  const deleteOptionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/rp/options/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to delete option" }));
        throw new Error(errorData.message || errorData.error || "Failed to delete option");
      }
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
      section: "capacity",
      order_index: 1,
    });
    setQuestionOptions([]);
  };

  const addQuestionOption = () => {
    setQuestionOptions(prev => [...prev, {
      option_text: "",
      score: 0,
      order_index: prev.length + 1,
    }]);
  };

  const removeQuestionOption = (index: number) => {
    setQuestionOptions(prev => prev.filter((_, i) => i !== index).map((opt, i) => ({
      ...opt,
      order_index: i + 1
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
      score: 0,
      order_index: 1,
    });
  };

  const handleEditQuestion = async (question: RpQuestion) => {
    const questionWithOptions = await fetchQuestionWithOptions(question.id);
    setSelectedQuestion(questionWithOptions);
    setQuestionForm({
      question_text: question.question_text,
      section: question.section,
      order_index: question.order_index,
    });
    setIsQuestionDialogOpen(true);
  };

  const handleAddOption = (question: QuestionWithOptions) => {
    setSelectedQuestion(question);
    setEditingOptionId(null);
    resetOptionForm();
    setOptionForm(prev => ({ ...prev, order_index: (question.options?.length || 0) + 1 }));
    setIsOptionDialogOpen(true);
  };

  const handleEditOption = (question: QuestionWithOptions, option: RpQuestionOption) => {
    setSelectedQuestion(question);
    setEditingOptionId(option.id);
    setOptionForm({
      option_text: option.option_text,
      score: option.score,
      order_index: option.order_index,
    });
    setIsOptionDialogOpen(true);
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestion) {
      updateQuestionMutation.mutate({ id: selectedQuestion.id, data: questionForm });
    } else {
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

    const optionData = { ...optionForm };

    if (editingOptionId) {
      updateOptionMutation.mutate({ id: editingOptionId, data: optionData });
    } else {
      createOptionMutation.mutate({ questionId: selectedQuestion.id, data: optionData });
    }
  };

  const toggleQuestionExpansion = async (questionId: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
      setExpandedQuestions(newExpanded);
    } else {
      newExpanded.add(questionId);
      setExpandedQuestions(newExpanded);
      const questionWithOptions = await fetchQuestionWithOptions(questionId);
      setSelectedQuestion(questionWithOptions);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Risk Profiling Questions</h2>
          <p className="text-muted-foreground mt-1">Manage Risk Profiling questions and scoring</p>
        </div>
        <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
          <DialogTrigger asChild>
              <Button onClick={() => { 
              setSelectedQuestion(null); 
              resetQuestionForm();
              setQuestionOptions([{
                option_text: "",
                score: 0,
                order_index: 1,
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
                  <Label htmlFor="section">Section *</Label>
                  <Select
                    value={questionForm.section}
                    onValueChange={(value) => setQuestionForm(prev => ({ ...prev, section: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_SECTIONS.map(section => (
                        <SelectItem key={section.value} value={section.value}>{section.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order_index">Display Order</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={questionForm.order_index}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, order_index: parseInt(e.target.value) || 1 }))}
                  />
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
                              <Label htmlFor={`score_${index}`} className="text-xs">Score *</Label>
                              <Select
                                value={option.score.toString()}
                                onValueChange={(value) => updateQuestionOption(index, "score", parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">0 points</SelectItem>
                                  <SelectItem value="1">1 point</SelectItem>
                                  <SelectItem value="2">2 points</SelectItem>
                                  <SelectItem value="3">3 points</SelectItem>
                                  <SelectItem value="4">4 points</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                Score: 0-4 (higher = more risk tolerance)
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`order_index_${index}`} className="text-xs">Display Order</Label>
                              <Input
                                id={`order_index_${index}`}
                                type="number"
                                value={option.order_index}
                                onChange={(e) => updateQuestionOption(index, "order_index", parseInt(e.target.value) || (index + 1))}
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
                      </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Section: {QUESTION_SECTIONS.find(s => s.value === question.section)?.label || question.section}</span>
                          <span>Order: {question.order_index}</span>
                        </div>
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
                            setQuestionToDelete(question.id);
                            setDeleteQuestionDialogOpen(true);
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
                            <DialogTitle>{editingOptionId ? "Edit Option" : "Add Option"}</DialogTitle>
                            <DialogDescription>Configure the answer option and its score</DialogDescription>
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
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="score">Score *</Label>
                                <Select
                                  value={optionForm.score.toString()}
                                  onValueChange={(value) => setOptionForm(prev => ({ ...prev, score: parseInt(value) }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">0 points</SelectItem>
                                    <SelectItem value="1">1 point</SelectItem>
                                    <SelectItem value="2">2 points</SelectItem>
                                    <SelectItem value="3">3 points</SelectItem>
                                    <SelectItem value="4">4 points</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                  Score: 0-4 (higher = more risk tolerance)
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="order_index">Display Order</Label>
                                <Input
                                  id="order_index"
                                  type="number"
                                  value={optionForm.order_index}
                                  onChange={(e) => setOptionForm(prev => ({ ...prev, order_index: parseInt(e.target.value) || 1 }))}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => {
                                setIsOptionDialogOpen(false);
                                resetOptionForm();
                                setEditingOptionId(null);
                              }}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={createOptionMutation.isPending || updateOptionMutation.isPending}>
                                {editingOptionId ? "Update" : "Add"} Option
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
                                <TableCell>{option.score} points</TableCell>
                                <TableCell>{option.order_index}</TableCell>
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
                                      setOptionToDelete(option.id);
                                      setDeleteOptionDialogOpen(true);
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

      {/* Delete Question Confirmation Dialog */}
      <AlertDialog open={deleteQuestionDialogOpen} onOpenChange={setDeleteQuestionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This will also delete all associated options and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (questionToDelete !== null) {
                  deleteQuestionMutation.mutate(questionToDelete);
                  setQuestionToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Option Confirmation Dialog */}
      <AlertDialog open={deleteOptionDialogOpen} onOpenChange={setDeleteOptionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Option</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this option? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (optionToDelete !== null) {
                  deleteOptionMutation.mutate(optionToDelete);
                  setOptionToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

