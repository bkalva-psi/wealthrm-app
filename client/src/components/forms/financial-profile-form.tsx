import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, TrendingUp, TrendingDown, Home, Car, Building2, Wallet, 
  CreditCard, PiggyBank, Briefcase, PieChart, Target, Shield, AlertCircle,
  Plus, X, Calculator, ChevronLeft, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { PieChart as RechartsPieChart, Pie, Cell as PieCell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell as BarCell, LineChart, Line, AreaChart, Area, ComposedChart } from "recharts";

interface IncomeData {
  salary: string;
  businessIncome: string;
  rentalIncome: string;
  dividendIncome: string;
  interestIncome: string;
  otherIncome: string;
  totalMonthlyIncome: string;
  totalAnnualIncome: string;
}

interface ExpenseData {
  householdExpenses: string;
  emi: string;
  insurancePremiums: string;
  educationExpenses: string;
  healthcareExpenses: string;
  lifestyleExpenses: string;
  otherExpenses: string;
  totalMonthlyExpenses: string;
  totalAnnualExpenses: string;
}

interface AssetItem {
  id: string;
  category: "existing" | "external"; // "existing" = ABC Bank, "external" = Other banks/institutions
  type: string;
  description: string;
  currentValue: string;
}

interface LiabilityItem {
  id: string;
  category: "existing" | "external"; // "existing" = ABC Bank, "external" = Other banks/institutions
  type: string;
  description: string;
  outstandingAmount: string;
  emi: string;
}

interface FinancialProfileFormData {
  // Income
  income: IncomeData;
  
  // Expenses
  expenses: ExpenseData;
  
  // Assets
  assets: AssetItem[];
  
  // Liabilities
  liabilities: LiabilityItem[];
}

interface FinancialProfileFormProps {
  clientId: number;
  onSubmit: (data: FinancialProfileFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  onNavigateToRiskProfiling?: () => void;
}

const assetTypes = [
  "Real Estate (Residential)",
  "Real Estate (Commercial)",
  "Mutual Funds",
  "Equity Stocks",
  "Fixed Deposits",
  "PPF/EPF",
  "Gold/Jewelry",
  "Bonds",
  "Provident Fund",
  "Savings Account",
  "Current Account",
  "Cryptocurrency",
  "Other"
];

const liabilityTypes = [
  "Home Loan",
  "Personal Loan",
  "Credit Card Debt",
  "Car Loan",
  "Education Loan",
  "Business Loan",
  "Other Loan",
  "Other"
];

const investmentObjectives = [
  "Wealth Creation",
  "Retirement Planning",
  "Children's Education",
  "Tax Savings",
  "Income Generation",
  "Capital Appreciation",
  "Asset Protection",
  "Business Expansion",
  "Emergency Fund",
  "Other"
];

export function FinancialProfileForm({ 
  clientId, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  onNavigateToRiskProfiling
}: FinancialProfileFormProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FinancialProfileFormData>({
    income: {
      salary: "",
      businessIncome: "",
      rentalIncome: "",
      dividendIncome: "",
      interestIncome: "",
      otherIncome: "",
      totalMonthlyIncome: "",
      totalAnnualIncome: "",
    },
    expenses: {
      householdExpenses: "",
      emi: "",
      insurancePremiums: "",
      educationExpenses: "",
      healthcareExpenses: "",
      lifestyleExpenses: "",
      otherExpenses: "",
      totalMonthlyExpenses: "",
      totalAnnualExpenses: "",
    },
    assets: [],
    liabilities: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string>("income");

  // Track if we've loaded initial data to prevent overwriting user input
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  // Load existing financial data
  const { data: clientData } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !!clientId,
  });

  useEffect(() => {
    // Only load data once when component mounts and data is available
    if (!hasLoadedInitialData && clientData && clientId) {
      console.log("[FinancialProfileForm] Client data received:", {
        clientId,
        hasIncomeData: !!clientData.incomeData,
        hasExpensesData: !!clientData.expensesData,
        hasAssetsData: Array.isArray(clientData.assetsData) && clientData.assetsData.length > 0,
        hasLiabilitiesData: Array.isArray(clientData.liabilitiesData) && clientData.liabilitiesData.length > 0,
        incomeData: clientData.incomeData,
        expensesData: clientData.expensesData,
        assetsData: clientData.assetsData,
        liabilitiesData: clientData.liabilitiesData,
      });

      const defaultIncome = {
        salary: "",
        businessIncome: "",
        rentalIncome: "",
        dividendIncome: "",
        interestIncome: "",
        otherIncome: "",
        totalMonthlyIncome: "",
        totalAnnualIncome: "",
      };
      const defaultExpenses = {
        householdExpenses: "",
        emi: "",
        insurancePremiums: "",
        educationExpenses: "",
        healthcareExpenses: "",
        lifestyleExpenses: "",
        otherExpenses: "",
        totalMonthlyExpenses: "",
        totalAnnualExpenses: "",
      };
      
      // Only set form data if we have financial data to load
      if (clientData.incomeData || clientData.expensesData || clientData.assetsData || clientData.liabilitiesData) {
        console.log("[FinancialProfileForm] Setting form data with existing financial data");
        // Ensure assets and liabilities have category field (for backward compatibility)
        const assetsWithCategory = (clientData.assetsData || []).map((asset: any) => ({
          ...asset,
          category: asset.category || "external",
        }));
        const liabilitiesWithCategory = (clientData.liabilitiesData || []).map((liability: any) => ({
          ...liability,
          category: liability.category || "external",
        }));
        
        setFormData({
          income: clientData.incomeData || defaultIncome,
          expenses: clientData.expensesData || defaultExpenses,
          assets: assetsWithCategory,
          liabilities: liabilitiesWithCategory,
        });
        setHasLoadedInitialData(true);
        console.log("[FinancialProfileForm] Loaded existing financial data from client:", clientId);
      } else {
        // Mark as loaded even if no data exists, so we don't keep checking
        console.log("[FinancialProfileForm] No existing financial data found for client:", clientId);
        setHasLoadedInitialData(true);
      }
    }
  }, [clientData, clientId, hasLoadedInitialData]);

  // Helper function to parse numeric value, removing commas and currency symbols
  const parseNumericValue = (value: string): number => {
    if (!value) return 0;
    // Remove currency symbols, commas, and whitespace
    const cleaned = value.toString().replace(/[₹,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Calculate totals automatically - accepts optional income data to avoid stale closure
  const calculateIncomeTotal = (incomeData?: IncomeData) => {
    const income = incomeData || formData.income;
    const values = [
      parseNumericValue(income.salary || "0"),
      parseNumericValue(income.businessIncome || "0"),
      parseNumericValue(income.rentalIncome || "0"),
      parseNumericValue(income.dividendIncome || "0"),
      parseNumericValue(income.interestIncome || "0"),
      parseNumericValue(income.otherIncome || "0"),
    ];
    const total = values.reduce((sum, val) => sum + val, 0);
    setFormData(prev => ({
      ...prev,
      income: {
        ...prev.income,
        totalMonthlyIncome: total.toFixed(2),
        totalAnnualIncome: (total * 12).toFixed(2),
      },
    }));
  };

  const calculateExpenseTotal = (expenseData?: ExpenseData) => {
    const expenses = expenseData || formData.expenses;
    const values = [
      parseNumericValue(expenses.householdExpenses || "0"),
      parseNumericValue(expenses.emi || "0"),
      parseNumericValue(expenses.insurancePremiums || "0"),
      parseNumericValue(expenses.educationExpenses || "0"),
      parseNumericValue(expenses.healthcareExpenses || "0"),
      parseNumericValue(expenses.lifestyleExpenses || "0"),
      parseNumericValue(expenses.otherExpenses || "0"),
    ];
    const total = values.reduce((sum, val) => sum + val, 0);
    setFormData(prev => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        totalMonthlyExpenses: total.toFixed(2),
        totalAnnualExpenses: (total * 12).toFixed(2),
      },
    }));
  };

  const handleIncomeChange = (field: keyof IncomeData, value: string) => {
    setFormData(prev => {
      const newIncome = { ...prev.income, [field]: value };
      // Calculate totals with the updated income data immediately
      const salary = parseNumericValue(newIncome.salary || "0");
      const businessIncome = parseNumericValue(newIncome.businessIncome || "0");
      const rentalIncome = parseNumericValue(newIncome.rentalIncome || "0");
      const dividendIncome = parseNumericValue(newIncome.dividendIncome || "0");
      const interestIncome = parseNumericValue(newIncome.interestIncome || "0");
      const otherIncome = parseNumericValue(newIncome.otherIncome || "0");
      
      const values = [salary, businessIncome, rentalIncome, dividendIncome, interestIncome, otherIncome];
      const total = values.reduce((sum, val) => sum + val, 0);
      
      // Debug log
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Income Calculation] Field: ${field}, Value: ${value}, Parsed: ${parseNumericValue(value)}`);
        console.log(`[Income Calculation] Values:`, { salary, businessIncome, rentalIncome, dividendIncome, interestIncome, otherIncome });
        console.log(`[Income Calculation] Total:`, total);
      }
      
      return {
        ...prev,
        income: {
          ...newIncome,
          totalMonthlyIncome: total.toFixed(2),
          totalAnnualIncome: (total * 12).toFixed(2),
        },
      };
    });
  };

  const handleExpenseChange = (field: keyof ExpenseData, value: string) => {
    setFormData(prev => {
      const newExpenses = { ...prev.expenses, [field]: value };
      // Calculate totals with the updated expense data immediately
      const householdExpenses = parseNumericValue(newExpenses.householdExpenses || "0");
      const emi = parseNumericValue(newExpenses.emi || "0");
      const insurancePremiums = parseNumericValue(newExpenses.insurancePremiums || "0");
      const educationExpenses = parseNumericValue(newExpenses.educationExpenses || "0");
      const healthcareExpenses = parseNumericValue(newExpenses.healthcareExpenses || "0");
      const lifestyleExpenses = parseNumericValue(newExpenses.lifestyleExpenses || "0");
      const otherExpenses = parseNumericValue(newExpenses.otherExpenses || "0");
      
      const values = [householdExpenses, emi, insurancePremiums, educationExpenses, healthcareExpenses, lifestyleExpenses, otherExpenses];
      const total = values.reduce((sum, val) => sum + val, 0);
      
      // Debug log
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Expense Calculation] Field: ${field}, Value: ${value}, Parsed: ${parseNumericValue(value)}`);
        console.log(`[Expense Calculation] Values:`, { householdExpenses, emi, insurancePremiums, educationExpenses, healthcareExpenses, lifestyleExpenses, otherExpenses });
        console.log(`[Expense Calculation] Total:`, total);
      }
      
      return {
        ...prev,
        expenses: {
          ...newExpenses,
          totalMonthlyExpenses: total.toFixed(2),
          totalAnnualExpenses: (total * 12).toFixed(2),
        },
      };
    });
  };

  const addAsset = () => {
    setFormData(prev => ({
      ...prev,
      assets: [
        ...prev.assets,
        {
          id: Date.now().toString(),
          category: "external" as const,
          type: "",
          description: "",
          currentValue: "",
        },
      ],
    }));
  };

  const removeAsset = (id: string) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.filter(asset => asset.id !== id),
    }));
  };

  const updateAsset = (id: string, field: keyof AssetItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map(asset =>
        asset.id === id ? { ...asset, [field]: value } : asset
      ),
    }));
  };

  const addLiability = () => {
    setFormData(prev => ({
      ...prev,
      liabilities: [
        ...prev.liabilities,
        {
          id: Date.now().toString(),
          category: "external" as const,
          type: "",
          description: "",
          outstandingAmount: "",
          emi: "",
        },
      ],
    }));
  };

  const removeLiability = (id: string) => {
    setFormData(prev => ({
      ...prev,
      liabilities: prev.liabilities.filter(liability => liability.id !== id),
    }));
  };

  const updateLiability = (id: string, field: keyof LiabilityItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      liabilities: prev.liabilities.map(liability =>
        liability.id === id ? { ...liability, [field]: value } : liability
      ),
    }));
  };

  const calculateNetWorth = () => {
    const totalAssets = formData.assets.reduce(
      (sum, asset) => sum + parseNumericValue(asset.currentValue || "0"),
      0
    );
    const totalLiabilities = formData.liabilities.reduce(
      (sum, liability) => sum + parseNumericValue(liability.outstandingAmount || "0"),
      0
    );
    return totalAssets - totalLiabilities;
  };

  // Generate net worth projection data for the line chart
  const generateNetWorthProjection = () => {
    const currentAge = 30; // Default age, can be made dynamic later
    const currentNetWorth = calculateNetWorth();
    const monthlySavings = parseNumericValue(formData.income.totalMonthlyIncome || "0") - 
                           parseNumericValue(formData.expenses.totalMonthlyExpenses || "0");
    const annualSavings = monthlySavings * 12;
    
    // Conservative growth rate: 7% annual return during accumulation
    const growthRate = 0.07;
    const retirementAge = 65;
    
    const growthData = [];
    const declineData = [];
    let projectedNetWorth = currentNetWorth;
    let peakNetWorth = currentNetWorth;
    let peakAge = currentAge;
    
    // Generate growth phase data
    for (let age = 20; age <= retirementAge; age += 5) {
      if (age < currentAge) {
        // Historical projection (simplified)
        growthData.push({
          age,
          netWorth: Math.max(0, currentNetWorth * (age / currentAge) * 0.5)
        });
      } else if (age === currentAge) {
        // Current net worth
        growthData.push({
          age,
          netWorth: currentNetWorth
        });
        peakNetWorth = currentNetWorth;
        peakAge = age;
      } else {
        // Accumulation phase: compound growth + savings
        const yearsFromNow = age - currentAge;
        projectedNetWorth = currentNetWorth * Math.pow(1 + growthRate, yearsFromNow) +
                           annualSavings * ((Math.pow(1 + growthRate, yearsFromNow) - 1) / growthRate);
        peakNetWorth = Math.max(peakNetWorth, projectedNetWorth);
        peakAge = age;
        growthData.push({
          age,
          netWorth: Math.max(0, projectedNetWorth)
        });
      }
    }
    
    // Generate decline phase data (retirement drawdown)
    if (growthData.length > 0) {
      const lastGrowthPoint = growthData[growthData.length - 1];
      peakNetWorth = lastGrowthPoint.netWorth;
      peakAge = lastGrowthPoint.age;
      
      // Add the peak point to decline data to connect the lines
      declineData.push({
        age: peakAge,
        netWorth: peakNetWorth
      });
      
      for (let age = Math.min(peakAge + 5, retirementAge + 5); age <= 80; age += 5) {
        // Retirement phase: drawdown (assuming 4% withdrawal rate + 5% growth)
        const yearsInRetirement = age - retirementAge;
        // Simplified: 4% annual withdrawal, 5% growth on remaining
        const annualWithdrawal = peakNetWorth * 0.04;
        const netGrowthRate = 0.02; // Lower growth rate in retirement
        
        // Compound decline during retirement - more realistic drawdown
        projectedNetWorth = peakNetWorth * Math.pow(1 - 0.03, Math.max(0, yearsInRetirement - 2));
        
        declineData.push({
          age,
          netWorth: Math.max(0, projectedNetWorth)
        });
      }
    }
    
    return { growthData, declineData };
  };

  // Format value for display (in Lakhs or Crores)
  const formatNetWorth = (value: number): string => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `${(value / 100000).toFixed(0)}L`;
    }
    return `${(value / 1000).toFixed(0)}K`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation: require liabilities to be reviewed/entered
    const incomeOk = parseNumericValue(formData.income.totalMonthlyIncome || "0") >= 0;
    const expensesOk = parseNumericValue(formData.expenses.totalMonthlyExpenses || "0") >= 0;
    const assetsOk = formData.assets.length >= 0; // assets can be zero
    const liabilitiesOk = formData.liabilities.length > 0 || formData.assets.reduce((s,a)=> s + parseNumericValue(a.currentValue||"0"), 0) === 0; // if user has assets, ensure liabilities reviewed

    if (!incomeOk) {
      toast({ title: "Add income details", description: "Please enter income to continue.", variant: "destructive" });
      setActiveSection("income");
      return;
    }
    if (!expensesOk) {
      toast({ title: "Add expense details", description: "Please enter expenses to continue.", variant: "destructive" });
      setActiveSection("expenses");
      return;
    }
    if (!assetsOk) {
      toast({ title: "Review assets", description: "Please review assets section.", variant: "destructive" });
      setActiveSection("assets");
      return;
    }
    if (!liabilitiesOk) {
      toast({ title: "Add liabilities", description: "Please add at least one liability or set amounts to 0.", variant: "destructive" });
      setActiveSection("liabilities");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Financial Profile
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete the client's financial profile with income, expenses, assets, liabilities, and investment preferences.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-4 border-b">
              {["income", "expenses", "assets", "liabilities", "summary"].map((section) => (
                <Button
                  key={section}
                  type="button"
                  variant={activeSection === section ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveSection(section)}
                  className="whitespace-nowrap"
                >
                  {section === "summary" ? "Summary" : section.charAt(0).toUpperCase() + section.slice(1)}
                </Button>
              ))}
            </div>

            {/* Income Section */}
            {activeSection === "income" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Income Details (Monthly)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary/Wages</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.income.salary || ""}
                      onChange={(e) => handleIncomeChange("salary", e.target.value)}
                      placeholder="Enter monthly salary"
                      prefix="₹"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessIncome">Business Income</Label>
                    <Input
                      id="businessIncome"
                      type="number"
                      value={formData.income.businessIncome || ""}
                      onChange={(e) => handleIncomeChange("businessIncome", e.target.value)}
                      placeholder="Enter monthly business income"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rentalIncome">Rental Income</Label>
                    <Input
                      id="rentalIncome"
                      type="number"
                      value={formData.income.rentalIncome || ""}
                      onChange={(e) => handleIncomeChange("rentalIncome", e.target.value)}
                      placeholder="Enter monthly rental income"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dividendIncome">Dividend Income</Label>
                    <Input
                      id="dividendIncome"
                      type="number"
                      value={formData.income.dividendIncome || ""}
                      onChange={(e) => handleIncomeChange("dividendIncome", e.target.value)}
                      placeholder="Enter monthly dividend income"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interestIncome">Interest Income</Label>
                    <Input
                      id="interestIncome"
                      type="number"
                      value={formData.income.interestIncome || ""}
                      onChange={(e) => handleIncomeChange("interestIncome", e.target.value)}
                      placeholder="Enter monthly interest income"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherIncome">Other Income</Label>
                    <Input
                      id="otherIncome"
                      type="number"
                      value={formData.income.otherIncome || ""}
                      onChange={(e) => handleIncomeChange("otherIncome", e.target.value)}
                      placeholder="Enter other monthly income"
                    />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Total Monthly Income</Label>
                    <p className="text-2xl font-bold text-green-600">₹{parseNumericValue(formData.income.totalMonthlyIncome || "0").toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Total Annual Income</Label>
                    <p className="text-2xl font-bold text-green-600">₹{parseNumericValue(formData.income.totalAnnualIncome || "0").toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Expenses Section */}
            {activeSection === "expenses" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Expense Details (Monthly)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="householdExpenses">Household Expenses</Label>
                    <Input
                      id="householdExpenses"
                      type="number"
                      value={formData.expenses.householdExpenses || ""}
                      onChange={(e) => handleExpenseChange("householdExpenses", e.target.value)}
                      placeholder="Enter monthly household expenses"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emi">EMI/Installments</Label>
                    <Input
                      id="emi"
                      type="number"
                      value={formData.expenses.emi || ""}
                      onChange={(e) => handleExpenseChange("emi", e.target.value)}
                      placeholder="Enter total monthly EMI"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurancePremiums">Insurance Premiums</Label>
                    <Input
                      id="insurancePremiums"
                      type="number"
                      value={formData.expenses.insurancePremiums || ""}
                      onChange={(e) => handleExpenseChange("insurancePremiums", e.target.value)}
                      placeholder="Enter monthly insurance premiums"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="educationExpenses">Education Expenses</Label>
                    <Input
                      id="educationExpenses"
                      type="number"
                      value={formData.expenses.educationExpenses || ""}
                      onChange={(e) => handleExpenseChange("educationExpenses", e.target.value)}
                      placeholder="Enter monthly education expenses"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="healthcareExpenses">Healthcare Expenses</Label>
                    <Input
                      id="healthcareExpenses"
                      type="number"
                      value={formData.expenses.healthcareExpenses || ""}
                      onChange={(e) => handleExpenseChange("healthcareExpenses", e.target.value)}
                      placeholder="Enter monthly healthcare expenses"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lifestyleExpenses">Lifestyle Expenses</Label>
                    <Input
                      id="lifestyleExpenses"
                      type="number"
                      value={formData.expenses.lifestyleExpenses || ""}
                      onChange={(e) => handleExpenseChange("lifestyleExpenses", e.target.value)}
                      placeholder="Enter monthly lifestyle expenses"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherExpenses">Other Expenses</Label>
                    <Input
                      id="otherExpenses"
                      type="number"
                      value={formData.expenses.otherExpenses || ""}
                      onChange={(e) => handleExpenseChange("otherExpenses", e.target.value)}
                      placeholder="Enter other monthly expenses"
                    />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Total Monthly Expenses</Label>
                    <p className="text-2xl font-bold text-red-600">₹{parseNumericValue(formData.expenses.totalMonthlyExpenses || "0").toLocaleString()}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Total Annual Expenses</Label>
                    <p className="text-2xl font-bold text-red-600">₹{parseNumericValue(formData.expenses.totalAnnualExpenses || "0").toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <Label className="text-sm text-muted-foreground">Monthly Savings (Income - Expenses)</Label>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{(
                      parseNumericValue(formData.income.totalMonthlyIncome || "0") - 
                      parseNumericValue(formData.expenses.totalMonthlyExpenses || "0")
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Assets Section */}
            {activeSection === "assets" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Assets
                  </h3>
                  <Button type="button" onClick={addAsset} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </div>
                
                {formData.assets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No assets added yet. Click "Add Asset" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.assets.map((asset, index) => (
                      <Card key={asset.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">Asset #{index + 1}</h4>
                              <Badge variant={asset.category === "existing" ? "default" : "secondary"}>
                                {asset.category === "existing" ? "ABC Bank" : "External"}
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAsset(asset.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Category</Label>
                              <Select
                                value={asset.category}
                                onValueChange={(value) => updateAsset(asset.id, "category", value as "existing" | "external")}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="existing">Existing Assets (ABC Bank)</SelectItem>
                                  <SelectItem value="external">External Assets (Other)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Asset Type</Label>
                              <Select
                                value={asset.type}
                                onValueChange={(value) => updateAsset(asset.id, "type", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select asset type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {assetTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Input
                                value={asset.description}
                                onChange={(e) => updateAsset(asset.id, "description", e.target.value)}
                                placeholder="Brief description"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Current Value (₹)</Label>
                              <Input
                                type="number"
                                value={asset.currentValue}
                                onChange={(e) => updateAsset(asset.id, "currentValue", e.target.value)}
                                placeholder="Enter current value"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <div className="space-y-3">
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-sm font-medium text-muted-foreground">Existing Assets (ABC Bank)</Label>
                          <p className="text-xl font-bold text-primary">
                            ₹{formData.assets
                              .filter(asset => asset.category === "existing")
                              .reduce((sum, asset) => sum + parseNumericValue(asset.currentValue || "0"), 0)
                              .toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-sm font-medium text-muted-foreground">External Assets (Other Banks/Institutions)</Label>
                          <p className="text-xl font-bold text-blue-600">
                            ₹{formData.assets
                              .filter(asset => asset.category === "external")
                              .reduce((sum, asset) => sum + parseNumericValue(asset.currentValue || "0"), 0)
                              .toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary">
                        <div className="flex justify-between items-center">
                          <Label className="text-lg font-medium">Total Assets Value</Label>
                          <p className="text-2xl font-bold text-primary">
                            ₹{formData.assets
                              .reduce((sum, asset) => sum + parseNumericValue(asset.currentValue || "0"), 0)
                              .toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Liabilities Section */}
            {activeSection === "liabilities" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                    Liabilities
                  </h3>
                  <Button type="button" onClick={addLiability} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Liability
                  </Button>
                </div>
                
                {formData.liabilities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No liabilities added yet. Click "Add Liability" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.liabilities.map((liability, index) => (
                      <Card key={liability.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">Liability #{index + 1}</h4>
                              <Badge variant={liability.category === "existing" ? "default" : "secondary"}>
                                {liability.category === "existing" ? "ABC Bank" : "External"}
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLiability(liability.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="space-y-2">
                              <Label>Category</Label>
                              <Select
                                value={liability.category}
                                onValueChange={(value) => updateLiability(liability.id, "category", value as "existing" | "external")}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="existing">Existing Liabilities (ABC Bank)</SelectItem>
                                  <SelectItem value="external">External Liabilities (Other)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Liability Type</Label>
                              <Select
                                value={liability.type}
                                onValueChange={(value) => updateLiability(liability.id, "type", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select liability type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {liabilityTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Input
                                value={liability.description}
                                onChange={(e) => updateLiability(liability.id, "description", e.target.value)}
                                placeholder="Brief description"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Outstanding Amount (₹)</Label>
                              <Input
                                type="number"
                                value={liability.outstandingAmount}
                                onChange={(e) => updateLiability(liability.id, "outstandingAmount", e.target.value)}
                                placeholder="Outstanding amount"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Monthly EMI (₹)</Label>
                              <Input
                                type="number"
                                value={liability.emi}
                                onChange={(e) => updateLiability(liability.id, "emi", e.target.value)}
                                placeholder="Monthly EMI"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <div className="space-y-3">
                      <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-sm font-medium text-muted-foreground">Existing Liabilities (ABC Bank)</Label>
                          <p className="text-xl font-bold text-orange-600">
                            ₹{formData.liabilities
                              .filter(liability => liability.category === "existing")
                              .reduce((sum, liability) => sum + parseNumericValue(liability.outstandingAmount || "0"), 0)
                              .toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-sm font-medium text-muted-foreground">External Liabilities (Other Banks/Institutions)</Label>
                          <p className="text-xl font-bold text-red-600">
                            ₹{formData.liabilities
                              .filter(liability => liability.category === "external")
                              .reduce((sum, liability) => sum + parseNumericValue(liability.outstandingAmount || "0"), 0)
                              .toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border-2 border-orange-500">
                        <div className="flex justify-between items-center">
                          <Label className="text-lg font-medium">Total Liabilities</Label>
                          <p className="text-2xl font-bold text-orange-600">
                            ₹{formData.liabilities
                              .reduce((sum, liability) => sum + parseNumericValue(liability.outstandingAmount || "0"), 0)
                              .toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Net Worth Calculation */}
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border-2 border-primary">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-medium">Net Worth (Assets - Liabilities)</Label>
                    <p className="text-3xl font-bold text-primary">
                      ₹{calculateNetWorth().toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Summary Section - Charts and Visualizations */}
            {activeSection === "summary" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                    <PieChart className="h-5 w-5 text-primary" />
                    Financial Overview
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Visual summary of your financial position, cashflow, and net worth
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Asset Allocation Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Asset Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {formData.assets.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Add assets to see allocation chart</p>
                        </div>
                      ) : (
                        <div>
                          {/* Pie Chart */}
                          <div className="h-64 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={formData.assets.map(asset => ({
                                    name: asset.type || 'Unnamed Asset',
                                    value: parseNumericValue(asset.currentValue || "0")
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  paddingAngle={2}
                                  dataKey="value"
                                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                  labelLine={false}
                                >
                                  {formData.assets.map((_, index) => {
                                    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
                                    return <PieCell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                  })}
                                </Pie>
                                <Tooltip 
                                  formatter={(value: number, name: string) => [
                                    `₹${value.toLocaleString()} (${((value / formData.assets.reduce((sum, a) => sum + parseNumericValue(a.currentValue || "0"), 0)) * 100).toFixed(1)}%)`,
                                    name || 'Asset'
                                  ]}
                                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                />
                                <Legend 
                                  verticalAlign="bottom" 
                                  height={36}
                                  iconType="circle"
                                  wrapperStyle={{ paddingTop: '10px' }}
                                  formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                                />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                          
                          {/* Asset Breakdown List */}
                          <div className="space-y-2 mt-4">
                            <Label className="text-sm font-medium">Asset Breakdown</Label>
                            {formData.assets.map((asset, index) => {
                              const total = formData.assets.reduce((sum, a) => sum + parseNumericValue(a.currentValue || "0"), 0);
                              const percentage = total > 0 ? (parseNumericValue(asset.currentValue || "0") / total) * 100 : 0;
                              const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
                              
                              return (
                                <div key={asset.id} className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center">
                                      <span 
                                        className="inline-block w-3 h-3 mr-2 rounded-full" 
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                      ></span>
                                      {asset.type || 'Unnamed Asset'} {asset.category === 'existing' && '(ABC Bank)'}
                                    </span>
                                    <span className="font-medium">{percentage.toFixed(1)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                    <div 
                                      className="h-2 rounded-full transition-all duration-300"
                                      style={{ 
                                        backgroundColor: colors[index % colors.length],
                                        width: `${percentage}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Cashflow Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Monthly Cashflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {parseNumericValue(formData.income.totalMonthlyIncome || "0") === 0 && 
                       parseNumericValue(formData.expenses.totalMonthlyExpenses || "0") === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Add income and expenses to see cashflow</p>
                        </div>
                      ) : (
                        <div>
                          {/* Bar Chart */}
                          <div className="h-64 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  {
                                    name: 'Income',
                                    value: parseNumericValue(formData.income.totalMonthlyIncome || "0"),
                                    fill: '#10B981'
                                  },
                                  {
                                    name: 'Expenses',
                                    value: parseNumericValue(formData.expenses.totalMonthlyExpenses || "0"),
                                    fill: '#EF4444'
                                  },
                                  {
                                    name: 'Savings',
                                    value: parseNumericValue(formData.income.totalMonthlyIncome || "0") - 
                                           parseNumericValue(formData.expenses.totalMonthlyExpenses || "0"),
                                    fill: '#3B82F6'
                                  }
                                ]}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis 
                                  tick={{ fontSize: 12 }}
                                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                                />
                                <Tooltip 
                                  formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                  {[
                                    { name: 'Income', fill: '#10B981' },
                                    { name: 'Expenses', fill: '#EF4444' },
                                    { name: 'Savings', fill: '#3B82F6' }
                                  ].map((entry, index) => (
                                    <BarCell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          
                          {/* Cashflow Summary */}
                          <div className="grid grid-cols-3 gap-3 mt-4">
                            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                              <Label className="text-xs text-muted-foreground">Monthly Income</Label>
                              <p className="text-lg font-bold text-green-600">
                                ₹{parseNumericValue(formData.income.totalMonthlyIncome || "0").toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                              <Label className="text-xs text-muted-foreground">Monthly Expenses</Label>
                              <p className="text-lg font-bold text-red-600">
                                ₹{parseNumericValue(formData.expenses.totalMonthlyExpenses || "0").toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                              <Label className="text-xs text-muted-foreground">Monthly Savings</Label>
                              <p className={`text-lg font-bold ${
                                (parseNumericValue(formData.income.totalMonthlyIncome || "0") - 
                                 parseNumericValue(formData.expenses.totalMonthlyExpenses || "0")) >= 0 
                                  ? 'text-blue-600' 
                                  : 'text-red-600'
                              }`}>
                                ₹{(
                                  parseNumericValue(formData.income.totalMonthlyIncome || "0") - 
                                  parseNumericValue(formData.expenses.totalMonthlyExpenses || "0")
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Net Worth Projection Chart */}
                <Card className="col-span-1 lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Future: Navigate to previous chart view if needed
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <CardTitle className="text-base">Net Worth</CardTitle>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Future: Navigate to next chart view if needed
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {calculateNetWorth() === 0 && 
                     parseNumericValue(formData.income.totalMonthlyIncome || "0") === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Add financial data to see net worth projection</p>
                      </div>
                    ) : (() => {
                      const projectionData = generateNetWorthProjection();
                      
                      // Create combined dataset with growth and decline phases
                      // Note: The peak point (last growth point) is included in both to ensure seamless connection
                      const allData = [
                        ...projectionData.growthData,
                        ...(projectionData.declineData.length > 0 ? projectionData.declineData : [])
                      ];
                      
                      // Create chart data with separate keys for growth and decline phases
                      // This allows us to show blue for growth and red for decline
                      const chartData = allData.map((d: any) => {
                        const isInGrowth = projectionData.growthData.some((gd: any) => gd.age === d.age);
                        const isInDecline = projectionData.declineData.some((dd: any) => dd.age === d.age);
                        return {
                          ...d,
                          netWorthGrowth: isInGrowth ? d.netWorth : null,
                          netWorthDecline: isInDecline ? d.netWorth : null
                        };
                      });
                      
                      return (
                        <div>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={chartData}>
                                <defs>
                                  <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="netWorthGradientDecline" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="age" 
                                  tick={{ fontSize: 11, fill: '#6b7280' }}
                                  axisLine={{ stroke: '#e5e7eb' }}
                                  domain={[20, 80]}
                                  ticks={[20, 30, 40, 50, 60, 70, 80]}
                                />
                                <YAxis 
                                  tick={{ fontSize: 11, fill: '#6b7280' }}
                                  axisLine={{ stroke: '#e5e7eb' }}
                                  tickFormatter={(value) => formatNetWorth(value)}
                                  domain={[0, 'dataMax']}
                                />
                                <Tooltip 
                                  formatter={(value: number) => value !== null ? [`₹${value.toLocaleString()} (${formatNetWorth(value)})`, 'Net Worth'] : null}
                                  labelFormatter={(label) => `Age: ${label}`}
                                  contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #e5e7eb', 
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                                {/* Growth phase area */}
                                <Area
                                  type="monotone"
                                  dataKey="netWorthGrowth"
                                  stroke="none"
                                  fill="url(#netWorthGradient)"
                                  dot={false}
                                  connectNulls={false}
                                />
                                {/* Decline phase area */}
                                {projectionData.declineData.length > 0 && (
                                  <Area
                                    type="monotone"
                                    dataKey="netWorthDecline"
                                    stroke="none"
                                    fill="url(#netWorthGradientDecline)"
                                    dot={false}
                                    connectNulls={false}
                                  />
                                )}
                                {/* Growth phase line */}
                                <Line
                                  type="monotone"
                                  dataKey="netWorthGrowth"
                                  stroke="#3B82F6"
                                  strokeWidth={2}
                                  dot={false}
                                  activeDot={{ r: 5, fill: '#3B82F6' }}
                                  connectNulls={false}
                                />
                                {/* Decline phase line */}
                                {projectionData.declineData.length > 0 && (
                                  <Line
                                    type="monotone"
                                    dataKey="netWorthDecline"
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#EF4444' }}
                                    connectNulls={false}
                                  />
                                )}
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-4 text-xs text-muted-foreground text-center">
                            <p>Projection based on 7% annual growth, retirement at 65 with 4% annual withdrawal</p>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Net Worth Summary Card */}
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Net Worth Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <Label className="text-xs text-muted-foreground">Total Assets</Label>
                        <p className="text-2xl font-bold text-primary">
                          ₹{formData.assets
                            .reduce((sum, asset) => sum + parseNumericValue(asset.currentValue || "0"), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                        <Label className="text-xs text-muted-foreground">Existing Assets (ABC Bank)</Label>
                        <p className="text-2xl font-bold text-blue-600">
                          ₹{formData.assets
                            .filter(asset => asset.category === "existing")
                            .reduce((sum, asset) => sum + parseNumericValue(asset.currentValue || "0"), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                        <Label className="text-xs text-muted-foreground">Total Liabilities</Label>
                        <p className="text-2xl font-bold text-orange-600">
                          ₹{formData.liabilities
                            .reduce((sum, liability) => sum + parseNumericValue(liability.outstandingAmount || "0"), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border-2 border-green-500">
                        <Label className="text-xs text-muted-foreground">Net Worth</Label>
                        <p className={`text-2xl font-bold ${
                          calculateNetWorth() >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ₹{calculateNetWorth().toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Net Worth Breakdown Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Assets vs Liabilities</span>
                        <span className="font-medium">
                          {formData.assets.reduce((sum, a) => sum + parseNumericValue(a.currentValue || "0"), 0) > 0
                            ? Math.round((calculateNetWorth() / formData.assets.reduce((sum, a) => sum + parseNumericValue(a.currentValue || "0"), 0)) * 100)
                            : 0}% of Assets
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                          style={{ 
                            width: `${Math.min(100, Math.max(0, 
                              formData.assets.reduce((sum, a) => sum + parseNumericValue(a.currentValue || "0"), 0) > 0
                                ? (calculateNetWorth() / formData.assets.reduce((sum, a) => sum + parseNumericValue(a.currentValue || "0"), 0)) * 100
                                : 0
                            ))}%` 
                          }}
                        >
                          {calculateNetWorth() > 0 && 'Net Worth'}
                        </div>
                        <div 
                          className="absolute right-0 top-0 h-full bg-orange-500 flex items-center justify-end pr-2 text-white text-xs font-medium"
                          style={{ 
                            width: `${Math.min(100, Math.max(0,
                              formData.assets.reduce((sum, a) => sum + parseNumericValue(a.currentValue || "0"), 0) > 0
                                ? (formData.liabilities.reduce((sum, l) => sum + parseNumericValue(l.outstandingAmount || "0"), 0) / 
                                   formData.assets.reduce((sum, a) => sum + parseNumericValue(a.currentValue || "0"), 0)) * 100
                                : 0
                            ))}%` 
                          }}
                        >
                          {formData.liabilities.reduce((sum, l) => sum + parseNumericValue(l.outstandingAmount || "0"), 0) > 0 && 'Liabilities'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Risk Profile Section */}
            {activeSection === "risk" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Risk Profile Assessment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="riskProfile">Risk Profile</Label>
                    <Select
                      value={formData.riskProfile}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, riskProfile: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk profile" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="riskAssessmentScore">Risk Assessment Score (1-10)</Label>
                    <Input
                      id="riskAssessmentScore"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.riskAssessmentScore}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        riskAssessmentScore: parseInt(e.target.value) || 5 
                      }))}
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.riskAssessmentScore}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          riskAssessmentScore: parseInt(e.target.value) 
                        }))}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium">{formData.riskAssessmentScore}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Investment Profile Section */}
            {activeSection === "investment" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Investment Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="investmentHorizon">Investment Horizon</Label>
                    <Select
                      value={formData.investmentHorizon}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, investmentHorizon: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select investment horizon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short-term">Short-term (Less than 1 year)</SelectItem>
                        <SelectItem value="medium-term">Medium-term (1-5 years)</SelectItem>
                        <SelectItem value="long-term">Long-term (5+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="investmentExperience">Investment Experience</Label>
                    <Select
                      value={formData.investmentExperience}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, investmentExperience: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (Less than 2 years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                        <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
                        <SelectItem value="expert">Expert (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-base mb-3 block">Preferred Investment Types</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Equity", "Debt", "Mutual Funds", "Bonds", "Real Estate", "Gold", "Fixed Deposits", "Other"].map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`investment-${type}`}
                          checked={formData.preferredInvestmentTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                preferredInvestmentTypes: [...prev.preferredInvestmentTypes, type]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                preferredInvestmentTypes: prev.preferredInvestmentTypes.filter(t => t !== type)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`investment-${type}`} className="cursor-pointer">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-base mb-3 block">Asset Allocation Preferences (%)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="equity">Equity</Label>
                      <Input
                        id="equity"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.assetAllocationEquity}
                        onChange={(e) => setFormData(prev => ({ ...prev, assetAllocationEquity: e.target.value }))}
                        placeholder="%"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="debt">Debt</Label>
                      <Input
                        id="debt"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.assetAllocationDebt}
                        onChange={(e) => setFormData(prev => ({ ...prev, assetAllocationDebt: e.target.value }))}
                        placeholder="%"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cash">Cash</Label>
                      <Input
                        id="cash"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.assetAllocationCash}
                        onChange={(e) => setFormData(prev => ({ ...prev, assetAllocationCash: e.target.value }))}
                        placeholder="%"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alternative">Alternative</Label>
                      <Input
                        id="alternative"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.assetAllocationAlternative}
                        onChange={(e) => setFormData(prev => ({ ...prev, assetAllocationAlternative: e.target.value }))}
                        placeholder="%"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Total: {(
                      parseFloat(formData.assetAllocationEquity || "0") +
                      parseFloat(formData.assetAllocationDebt || "0") +
                      parseFloat(formData.assetAllocationCash || "0") +
                      parseFloat(formData.assetAllocationAlternative || "0")
                    )}%
                  </div>
                </div>
              </div>
            )}

            {/* Investment Objectives Section */}
            {activeSection === "objectives" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Investment Objectives & Preferences
                </h3>
                
                <div>
                  <Label className="text-base mb-3 block">Investment Objectives (Select all that apply)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {investmentObjectives.map(objective => (
                      <div key={objective} className="flex items-center space-x-2">
                        <Checkbox
                          id={`objective-${objective}`}
                          checked={formData.investmentObjectives.includes(objective)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                investmentObjectives: [...prev.investmentObjectives, objective]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                investmentObjectives: prev.investmentObjectives.filter(o => o !== objective)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`objective-${objective}`} className="cursor-pointer">{objective}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="liquidityRequirements">Liquidity Requirements</Label>
                    <Textarea
                      id="liquidityRequirements"
                      value={formData.liquidityRequirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, liquidityRequirements: e.target.value }))}
                      placeholder="Describe liquidity needs..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxPlanningPreferences">Tax Planning Preferences</Label>
                    <Textarea
                      id="taxPlanningPreferences"
                      value={formData.taxPlanningPreferences}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxPlanningPreferences: e.target.value }))}
                      placeholder="Describe tax planning preferences..."
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retirementGoals">Retirement Goals</Label>
                  <Textarea
                    id="retirementGoals"
                    value={formData.retirementGoals}
                    onChange={(e) => setFormData(prev => ({ ...prev, retirementGoals: e.target.value }))}
                    placeholder="Describe retirement planning goals..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <div className="flex gap-2">
                {activeSection === "summary" ? (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setActiveSection("liabilities")}
                    >
                      Previous
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => {
                        if (onNavigateToRiskProfiling) {
                          onNavigateToRiskProfiling();
                        }
                      }}
                    >
                      Next to Risk Profiling
                    </Button>
                  </>
                ) : activeSection !== "income" && activeSection !== "summary" ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      const sections = ["income", "expenses", "assets", "liabilities"];
                      const currentIndex = sections.indexOf(activeSection);
                      if (currentIndex > 0) {
                        setActiveSection(sections[currentIndex - 1]);
                      }
                    }}
                  >
                    Previous
                  </Button>
                ) : null}
                {activeSection !== "liabilities" && activeSection !== "summary" ? (
                  <Button 
                    type="button" 
                    onClick={() => {
                      const sections = ["income", "expenses", "assets", "liabilities", "summary"];
                      const currentIndex = sections.indexOf(activeSection);
                      if (currentIndex < sections.length - 1) {
                        setActiveSection(sections[currentIndex + 1]);
                      }
                    }}
                  >
                    Next Section
                  </Button>
                ) : activeSection === "liabilities" ? (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Financial Profile"}
                  </Button>
                ) : null}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
