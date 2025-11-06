import { useState, useEffect } from "react";
import { FinancialProfileForm } from "@/components/forms/financial-profile-form";
import { RiskProfilingForm } from "@/components/forms/risk-profiling-form";
import { ArrowLeft, PieChart, Shield, GraduationCap } from "lucide-react";
import { ArrowLeft, PieChart, Shield, GraduationCap, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface FinancialProfileFormData {
  income: any;
  expenses: any;
  assets: any[];
  liabilities: any[];
  riskProfile: string;
  riskAssessmentScore: number;
  investmentHorizon: string;
  investmentExperience: string;
  preferredInvestmentTypes: string[];
  assetAllocationEquity: string;
  assetAllocationDebt: string;
  assetAllocationCash: string;
  assetAllocationAlternative: string;
  investmentObjectives: string[];
  liquidityRequirements: string;
  taxPlanningPreferences: string;
  retirementGoals: string;
}

export default function AddFinancialProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'financial' | 'risk' | 'knowledge'>('financial');

  useEffect(() => {
    document.title = "Client Profiling | Wealth Management System";
    
    // Extract client ID from URL
    const path = window.location.hash;
    const match = path.match(/\/clients\/(\d+)\/financial-profile/);
    if (match) {
      setClientId(parseInt(match[1]));
    }
  }, []);

  const handleSubmit = async (formData: FinancialProfileFormData) => {
    if (!clientId) {
      toast({
        title: "Error",
        description: "Client ID not found",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Helper function to parse numeric value, removing commas and currency symbols
      const parseNumericValue = (value: string): number => {
        if (!value) return 0;
        const cleaned = value.toString().replace(/[₹,\s]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Calculate totals
      const totalAssets = formData.assets.reduce(
        (sum, asset) => sum + parseNumericValue(asset.currentValue || "0"),
        0
      );
      const totalLiabilities = formData.liabilities.reduce(
        (sum, liability) => sum + parseNumericValue(liability.outstandingAmount || "0"),
        0
      );
      const netWorth = totalAssets - totalLiabilities;

      // Prepare data for API - Only Income, Expenses, Assets, Liabilities
      const payload = {
        clientId,
        // Income & Expenses
        annualIncome: formData.income.totalAnnualIncome,
        annualExpenses: formData.expenses.totalAnnualExpenses,
        monthlyIncome: formData.income.totalMonthlyIncome,
        monthlyExpenses: formData.expenses.totalMonthlyExpenses,
        // Assets & Liabilities
        totalAssets: totalAssets.toString(),
        totalLiabilities: totalLiabilities.toString(),
        netWorth: netWorth.toString(),
        // Detailed data - ensure these are always included
        income: formData.income,
        expenses: formData.expenses,
        assets: formData.assets,
        liabilities: formData.liabilities,
      };

      console.log("[Frontend] Sending financial profile payload:", JSON.stringify(payload, null, 2));
      console.log("[Frontend] Income data:", formData.income);
      console.log("[Frontend] Expenses data:", formData.expenses);
      console.log("[Frontend] Assets count:", formData.assets.length);
      console.log("[Frontend] Liabilities count:", formData.liabilities.length);

      const response = await fetch(`/api/clients/${clientId}/financial-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Frontend] Error response:", errorData);
        throw new Error(errorData.message || "Failed to save financial profile");
      }

      const responseData = await response.json();
      console.log("[Frontend] Response from server:", responseData);
      console.log("[Frontend] Response before:", responseData.before);
      console.log("[Frontend] Response after:", responseData.after);
      
      // Check if data was actually saved
      if (responseData.saved) {
        console.log("[Frontend] Save verification:", {
          incomeData: responseData.saved.incomeData,
          expensesData: responseData.saved.expensesData,
          assetsData: responseData.saved.assetsData,
          liabilitiesData: responseData.saved.liabilitiesData,
        });
      }

      // Invalidate queries to force refetch of client data
      if (clientId) {
        queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      }

      toast({
        title: "Success!",
        description: "Financial profile saved successfully!",
      });
      
      // Navigate to client profile
      window.location.hash = `/clients/${clientId}/personal`;
      
    } catch (error) {
      console.error("Error saving financial profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save financial profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (clientId) {
      window.location.hash = `/clients/${clientId}/personal`;
    } else {
      window.location.hash = "/clients";
    }
  };

  if (!clientId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Personal Information
            </Button>
          </div>
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <PieChart className="h-8 w-8 text-primary" />
              Client Profiling
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete the client's profiling. Start with Financial Profiling, then proceed to Risk and Knowledge Profiling.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
              1
            </div>
            <span className="text-muted-foreground">Personal Information</span>
          </div>
          
          <div className="flex-1 h-px bg-border"></div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
              2
            </div>
            <span className="font-medium text-primary">Client Profiling</span>
          </div>
          
          <div className="flex-1 h-px bg-border"></div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span className="text-muted-foreground">Family Information</span>
          </div>
          
          <div className="flex-1 h-px bg-border"></div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
              4
            </div>
            <span className="text-muted-foreground">KYC & Compliance</span>
          </div>
        </div>
      </div>

      {/* Tabs for Client Profiling */}
      <div className="px-6 pt-6">
        <div className="flex gap-2 mb-4">
          <Button variant={activeTab === 'financial' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('financial')}>
            <PieChart className="h-4 w-4 mr-2" /> Financial Profiling
          </Button>
          <Button variant={activeTab === 'risk' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('risk')}>
            <Shield className="h-4 w-4 mr-2" /> Risk Profiling
          </Button>
          <Button variant={activeTab === 'knowledge' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('knowledge')}>
            <GraduationCap className="h-4 w-4 mr-2" /> Knowledge Profiling
          </Button>
        </div>
      </div>

      {activeTab === 'financial' && (
        <FinancialProfileForm
          clientId={clientId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'risk' && (
        <RiskProfilingForm
          clientId={clientId}
          onSubmit={async (data) => {
            setIsLoading(true);
            try {
              // TODO: Implement API call to save risk profiling data
              console.log("Risk Profiling Data:", data);
              toast({
                title: "Success!",
                description: `Risk Profile: ${data.category} (Score: ${data.totalScore}/75)`,
              });
              // Navigate back or refresh data
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to save risk profile",
                variant: "destructive",
              });
            } finally {
              setIsLoading(false);
            }
          }}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'knowledge' && (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <Card className="max-w-xl w-full">
            <CardContent className="p-6 text-center space-y-4">
              <GraduationCap className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Knowledge Profiling Assessment</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Assess the client's financial knowledge through a comprehensive questionnaire. 
                This will help determine their understanding of investment concepts, risk management, 
                and financial planning.
              </p>
              {clientId ? (
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto"
                  onClick={() => {
                    window.location.hash = `/knowledge-profiling?clientId=${clientId}`;
                  }}
                >
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Start Questionnaire
                </Button>
              ) : (
                <Button size="lg" disabled>
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Start Questionnaire
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
