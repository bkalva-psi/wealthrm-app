import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { insertProspectSchema } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";

type ServerValidationError = {
  message: string;
  errors: Record<string, { _errors: string[] }>;
};

type ProspectFormValues = z.infer<typeof insertProspectSchema>;

// This component can be used for both adding and viewing prospects
export default function AddProspect({ prospectId, readOnly = false }: { prospectId?: number; readOnly?: boolean }) {
  // Using hash-based navigation
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(prospectId ? true : false);

  // Set page title
  useEffect(() => {
    document.title = readOnly ? "Prospect Details | Wealth RM" : "Add Prospect | Wealth RM";
  }, [readOnly]);
  
  // Fetch prospect data if in view/edit mode
  useEffect(() => {
    const fetchProspectData = async () => {
      if (prospectId) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/prospects/${prospectId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch prospect details");
          }
          const prospectData = await response.json();
          
          // Set form values
          form.reset(prospectData);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching prospect:", error);
          toast({
            title: "Error",
            description: "Could not load prospect details. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      }
    };
    
    if (prospectId) {
      fetchProspectData();
    }
  }, [prospectId, toast]);

  // Set up form with default values
  const form = useForm<ProspectFormValues>({
    resolver: zodResolver(insertProspectSchema),
    defaultValues: {
      fullName: "",
      initials: "",
      email: "",
      phone: "",
      potentialAum: "",
      potentialAumValue: 0,
      stage: "new", // Use valid stage from schema
      probabilityScore: 20,
      notes: "",
      productsOfInterest: [],
    },
    mode: "onChange", // Validate on change for immediate feedback
  });

  // Calculate initials when full name changes
  const watchFullName = form.watch("fullName");
  useEffect(() => {
    if (watchFullName && !form.getValues("initials")) {
      const words = watchFullName.trim().split(/\s+/);
      const initials = words
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
      
      if (initials) {
        form.setValue("initials", initials);
      }
    }
  }, [watchFullName, form]);

  // Create prospect mutation
  const createProspect = useMutation({
    mutationFn: async (prospectData: ProspectFormValues) => {
      // Clear previous errors
      setServerErrors({});
      setGeneralError(null);

      // Assign the current user as the RM
      const prospectWithRM = {
        ...prospectData,
        assignedTo: user?.id
      };

      const response = await fetch("/api/prospects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prospectWithRM),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from the server
        if (response.status === 400 && data.errors) {
          const validationErrors: ServerValidationError = data;
          
          // Format errors for display
          const formattedErrors: Record<string, string[]> = {};
          
          Object.entries(validationErrors.errors).forEach(([field, error]) => {
            if (field !== "_errors" && error._errors && error._errors.length > 0) {
              formattedErrors[field] = error._errors;
              
              // Also set the error in the form state
              if (field in form.formState.dirtyFields) {
                form.setError(field as any, {
                  type: "server",
                  message: error._errors[0]
                });
              }
            }
          });
          
          setServerErrors(formattedErrors);
          
          // Set general error if there's a top-level error
          if (validationErrors.errors._errors && validationErrors.errors._errors.length > 0) {
            setGeneralError(validationErrors.errors._errors[0]);
          } else {
            setGeneralError(data.message || "Please correct the errors in the form");
          }
          
          throw new Error("Validation failed");
        }
        
        throw new Error(data.message || "Failed to create prospect");
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate prospects cache
      queryClient.invalidateQueries({ queryKey: ['/api/prospects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/prospects/stage'] });
      
      // Show success message
      toast({
        title: "Prospect Created",
        description: "The prospect has been successfully added to your pipeline.",
      });
      
      // Navigate back to prospects page
      window.location.hash = "/prospects";
    },
    onError: (error: Error) => {
      if (error.message !== "Validation failed") {
        // Only show the toast for non-validation errors
        // (validation errors are shown inline)
        toast({
          title: "Error Creating Prospect",
          description: error.message,
          variant: "destructive",
        });
      }
      setIsSubmitting(false);
    },
  });

  // Update prospect mutation
  const updateProspect = useMutation({
    mutationFn: async (prospectData: ProspectFormValues) => {
      // Clear previous errors
      setServerErrors({});
      setGeneralError(null);

      if (!prospectId) {
        throw new Error("Missing prospect ID");
      }

      const response = await fetch(`/api/prospects/${prospectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prospectData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from the server
        if (response.status === 400 && data.errors) {
          const validationErrors: ServerValidationError = data;
          
          // Format errors for display
          const formattedErrors: Record<string, string[]> = {};
          
          Object.entries(validationErrors.errors).forEach(([field, error]) => {
            if (field !== "_errors" && error._errors && error._errors.length > 0) {
              formattedErrors[field] = error._errors;
              
              // Also set the error in the form state
              if (field in form.formState.dirtyFields) {
                form.setError(field as any, {
                  type: "server",
                  message: error._errors[0]
                });
              }
            }
          });
          
          setServerErrors(formattedErrors);
          
          // Set general error if there's a top-level error
          if (validationErrors.errors._errors && validationErrors.errors._errors.length > 0) {
            setGeneralError(validationErrors.errors._errors[0]);
          } else {
            setGeneralError(data.message || "Please correct the errors in the form");
          }
          
          throw new Error("Validation failed");
        }
        
        throw new Error(data.message || "Failed to update prospect");
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate prospects cache
      queryClient.invalidateQueries({ queryKey: ['/api/prospects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/prospects/stage'] });
      
      // Show success message
      toast({
        title: "Prospect Updated",
        description: "The prospect has been successfully updated.",
      });
      
      // Navigate back to prospect detail page
      window.location.hash = `/prospect-detail/${prospectId}`;
    },
    onError: (error: Error) => {
      if (error.message !== "Validation failed") {
        // Only show the toast for non-validation errors
        // (validation errors are shown inline)
        toast({
          title: "Error Updating Prospect",
          description: error.message,
          variant: "destructive",
        });
      }
      setIsSubmitting(false);
    },
  });

  // Handle form submission
  const onSubmit = async (data: ProspectFormValues) => {
    setIsSubmitting(true);
    console.log("Form submitted", { data, prospectId, readOnly });
    console.log("Form validation state:", form.formState.errors);
    console.log("Form data being submitted:", data);
    
    try {
      if (prospectId && !readOnly) {
        // Update existing prospect directly using fetch to bypass react-query issues
        console.log("Updating prospect", prospectId);
        
        const response = await fetch(`/api/prospects/${prospectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          credentials: "include",
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.message || "Failed to update prospect");
        }
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['/api/prospects'] });
        queryClient.invalidateQueries({ queryKey: ['/api/prospects/stage'] });
        
        // Show success message
        toast({
          title: "Prospect Updated",
          description: "The prospect has been successfully updated.",
        });
        
        // Navigate back to prospect detail page
        window.location.hash = `/prospect-detail/${prospectId}`;
      } else {
        // Create new prospect
        console.log("Creating new prospect");
        await createProspect.mutateAsync(data);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format potential AUM as currency when input changes
  const handleAumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value) {
      const numericValue = parseInt(value, 10);
      form.setValue("potentialAumValue", numericValue);
      form.setValue("potentialAum", `₹${numericValue.toLocaleString("en-IN")}`);
    } else {
      form.setValue("potentialAumValue", 0);
      form.setValue("potentialAum", "");
    }
  };

  // Help display server errors for nested fields
  const getServerErrorsForField = (fieldName: string) => {
    return serverErrors[fieldName] || [];
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        {readOnly ? "Prospect Details" : "Add New Prospect"}
      </h1>

      <Card className="max-w-3xl mx-auto">
        <CardContent>
          {generalError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex">
                        Full Name <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter full name" 
                          {...field} 
                          disabled={readOnly || isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                      {getServerErrorsForField("fullName").map((error, i) => (
                        <p key={i} className="text-sm font-medium text-destructive">
                          {error}
                        </p>
                      ))}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex">
                        Email <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="example@company.com" 
                          type="email" 
                          {...field} 
                          disabled={readOnly || isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                      {getServerErrorsForField("email").map((error, i) => (
                        <p key={i} className="text-sm font-medium text-destructive">
                          {error}
                        </p>
                      ))}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex">
                        Phone <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+91 98765 43210" 
                          {...field} 
                          disabled={readOnly || isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Format: Country code and number (e.g., +91 98765 43210)
                      </FormDescription>
                      <FormMessage />
                      {getServerErrorsForField("phone").map((error, i) => (
                        <p key={i} className="text-sm font-medium text-destructive">
                          {error}
                        </p>
                      ))}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="potentialAum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex">
                        Potential AUM <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="₹0"
                          {...field}
                          onChange={handleAumChange}
                          disabled={readOnly || isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                      {getServerErrorsForField("potentialAum").map((error, i) => (
                        <p key={i} className="text-sm font-medium text-destructive">
                          {error}
                        </p>
                      ))}
                      {getServerErrorsForField("potentialAumValue").map((error, i) => (
                        <p key={i} className="text-sm font-medium text-destructive">
                          {error}
                        </p>
                      ))}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex">
                        Stage <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={readOnly || isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {getServerErrorsForField("stage").map((error, i) => (
                        <p key={i} className="text-sm font-medium text-destructive">
                          {error}
                        </p>
                      ))}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="probabilityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex">
                        Probability (%) <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          disabled={readOnly || isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                      {getServerErrorsForField("probabilityScore").map((error, i) => (
                        <p key={i} className="text-sm font-medium text-destructive">
                          {error}
                        </p>
                      ))}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productsOfInterest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Products of Interest</FormLabel>
                      <div className="border rounded-md p-4 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { id: "mutual-funds", label: "Mutual Funds" },
                            { id: "fixed-deposits", label: "Fixed Deposits" },
                            { id: "equities", label: "Equities" },
                            { id: "bonds", label: "Bonds" },
                            { id: "insurance", label: "Insurance" },
                            { id: "tax-planning", label: "Tax Planning" },
                            { id: "retirement-planning", label: "Retirement Planning" },
                            { id: "estate-planning", label: "Estate Planning" }
                          ].map(product => (
                            <div key={product.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={product.id}
                                checked={
                                  field.value && field.value.includes(product.label)
                                }
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  
                                  const newValue = checked
                                    ? [...currentValue, product.label]
                                    : currentValue.filter(v => v !== product.label);
                                  
                                  field.onChange(newValue);
                                }}
                                disabled={readOnly || isSubmitting}
                              />
                              <label 
                                htmlFor={product.id}
                                className="text-sm cursor-pointer"
                              >
                                {product.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional information about the prospect"
                        className="min-h-[100px]"
                        {...field}
                        disabled={readOnly || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.hash = "/prospects"}
                >
                  {readOnly ? "Back" : "Cancel"}
                </Button>
                {!readOnly && (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={(e) => {
                      e.preventDefault();
                      
                      // For existing prospects, handle updates directly
                      if (prospectId) {
                        setIsSubmitting(true);
                        const formData = form.getValues();
                        
                        // Process products of interest to ensure it works with the schema
                        const processedFormData = {
                          ...formData,
                          // Make sure productsOfInterest is handled correctly
                          productsOfInterest: Array.isArray(formData.productsOfInterest) 
                            ? formData.productsOfInterest 
                            : formData.productsOfInterest ? [formData.productsOfInterest] : []
                        };
                        
                        console.log("Sending update with data:", processedFormData);
                        
                        // Direct API call to update the prospect with credentials
                        fetch(`/api/prospects/${prospectId}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(processedFormData),
                          credentials: "include"
                        })
                        .then(response => response.json())
                        .then(data => {
                          setIsSubmitting(false);
                          
                          if (data.error) {
                            toast({
                              title: "Error",
                              description: data.error || "Failed to update prospect",
                              variant: "destructive"
                            });
                          } else {
                            // Success - invalidate queries and navigate
                            queryClient.invalidateQueries({ queryKey: ['/api/prospects'] });
                            queryClient.invalidateQueries({ queryKey: ['/api/prospects/stage'] });
                            
                            toast({
                              title: "Success",
                              description: "Prospect updated successfully"
                            });
                            
                            // Navigate back to prospect detail view
                            window.location.hash = `/prospect-detail/${prospectId}`;
                          }
                        })
                        .catch(error => {
                          setIsSubmitting(false);
                          toast({
                            title: "Error",
                            description: "Failed to update prospect",
                            variant: "destructive"
                          });
                        });
                      } else {
                        // For new prospects, use the normal form submission
                        form.handleSubmit(onSubmit)();
                      }
                    }}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {prospectId ? "Update Prospect" : "Add Prospect"}
                  </Button>
                )}
                {readOnly && (
                  <Button 
                    type="button" 
                    onClick={() => {
                      window.location.hash = `/prospect-edit/${prospectId}`;
                    }}
                  >
                    Edit Prospect
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}