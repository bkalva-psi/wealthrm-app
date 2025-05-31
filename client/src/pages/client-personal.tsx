import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, Briefcase, Home, Building, 
  CreditCard, Shield, Users, Wallet, PieChart, MessageCircle, Clock, Heart,
  FileBarChart, CheckCircle, XCircle, AlertCircle, Lightbulb, Receipt, TrendingUp, TrendingDown, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { clientApi } from "@/lib/api";
import { generateAvatar, svgToDataURL } from "@/lib/avatarGenerator";
import { getTierColor } from "@/lib/utils";

export default function ClientPersonalPage() {
  const [clientId, setClientId] = useState<number | null>(null);
  const [isPersonalOpen, setIsPersonalOpen] = useState(true);
  const [isFinancialOpen, setIsFinancialOpen] = useState(false);
  const [isFamilyOpen, setIsFamilyOpen] = useState(false);
  const [isKycOpen, setIsKycOpen] = useState(false);
  
  // Set page title
  useEffect(() => {
    document.title = "Client Information | Wealth RM";
  }, []);

  // Extract client ID from URL path
  useEffect(() => {
    const path = window.location.hash;
    const match = path.match(/\/clients\/(\d+)/);
    if (match) {
      setClientId(parseInt(match[1]));
    }
  }, []);

  const { data: client, isLoading, error } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !!clientId,
  });

  // Utility functions
  const formatDate = (date: string | Date | null): string => {
    if (!date) return "Not specified";
    try {
      const parsedDate = typeof date === 'string' ? new Date(date) : date;
      return parsedDate.toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  const parseJsonData = (data: string | null): any => {
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  const getKycStatusBadge = (status: string | null) => {
    if (!status) return { color: "secondary", icon: <AlertCircle className="h-3 w-3" /> };
    
    switch (status.toLowerCase()) {
      case "completed":
        return { color: "default", icon: <CheckCircle className="h-3 w-3" /> };
      case "pending":
        return { color: "secondary", icon: <Clock className="h-3 w-3" /> };
      case "expired":
        return { color: "destructive", icon: <XCircle className="h-3 w-3" /> };
      default:
        return { color: "secondary", icon: <AlertCircle className="h-3 w-3" /> };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-6">
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-6">
          <div className="text-center py-8 text-slate-500">
            <p>Could not load client information.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Client Header */}
      <div className={`bg-white border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm border-l-4 ${getTierColor(client.tier).border.replace('border-', 'border-l-')}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center min-w-0 flex-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.hash = `/clients`}
              className="mr-2 sm:mr-4 p-1 sm:p-2 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <div className="min-w-0 flex-1">
              <button 
                onClick={() => window.location.hash = `/clients/${clientId}/personal`}
                className="text-left truncate hover:text-blue-600 transition-colors"
              >
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  {client.fullName}
                </h1>
              </button>
              
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(client.tier).bg} ${getTierColor(client.tier).text}`}>
                  {client.tier}
                </span>
              </div>

              {client.phone && (
                <div className="mt-1">
                  <a 
                    href={`tel:${client.phone}`}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    {client.phone}
                  </a>
                </div>
              )}

              {client.email && (
                <div className="mt-1">
                  <a 
                    href={`mailto:${client.email}`}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    {client.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page Title Band with Navigation */}
      <div className="bg-white border-b border-gray-200 px-1 py-4">
        <div className="flex justify-between items-center px-5 mb-3">
          <h2 className="text-2xl font-bold text-gray-900">Personal Details</h2>
        </div>
        
        <div className="grid grid-cols-7 gap-1 px-1">
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg bg-blue-50 border border-blue-200 h-12 w-full"
            title="Personal Profile"
          >
            <User className="h-6 w-6 text-blue-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/portfolio`}
            title="Portfolio"
          >
            <PieChart className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/transactions`}
            title="Transactions"
          >
            <Receipt className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/appointments`}
            title="Appointments"
          >
            <Calendar className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/communications`}
            title="Communications"
          >
            <MessageCircle className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/portfolio-report`}
            title="Portfolio Report"
          >
            <FileBarChart className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/recommendations`}
            title="Investment Ideas"
          >
            <Lightbulb className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Summary Card */}
        <Card>
          <CardContent className="px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={svgToDataURL(generateAvatar(client.initials || client.fullName))} />
                    <AvatarFallback>{client.initials || client.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm text-slate-500">Client</p>
                    <p className="font-medium">{client.fullName}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div>
                  <p className="text-sm text-slate-500">Age</p>
                  <p>{client.dateOfBirth ? new Date().getFullYear() - new Date(client.dateOfBirth).getFullYear() : "Not provided"}</p>
                </div>
              </div>
              
              <div className="text-center">
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <p>{client.maritalStatus || "Not provided"}</p>
                </div>
              </div>
              
              <div className="text-center">
                <div>
                  <p className="text-sm text-slate-500">Company</p>
                  <p>{client.companyName || "Not provided"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details Collapsible Card */}
        <Collapsible 
          open={isPersonalOpen} 
          onOpenChange={setIsPersonalOpen}
          className="space-y-2"
        >
          <Card className="overflow-hidden">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  {isPersonalOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Basic Details</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Date of Birth</dt>
                        <dd className="text-sm font-medium">{formatDate(client.dateOfBirth)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Age</dt>
                        <dd className="text-sm font-medium">
                          {client.dateOfBirth ? `${new Date().getFullYear() - new Date(client.dateOfBirth).getFullYear()} years` : "Not specified"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Gender</dt>
                        <dd className="text-sm font-medium">{client.gender || "Not specified"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Marital Status</dt>
                        <dd className="text-sm font-medium">{client.maritalStatus || "Not specified"}</dd>
                      </div>
                      {client.maritalStatus === "Married" && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-slate-500">Anniversary</dt>
                          <dd className="text-sm font-medium">{formatDate(client.anniversaryDate)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Contact Preferences</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Preferred Contact Method</dt>
                        <dd className="text-sm font-medium">{client.preferredContactMethod || "Not specified"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Preferred Time</dt>
                        <dd className="text-sm font-medium">{client.preferredContactTime || "Not specified"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Communication Frequency</dt>
                        <dd className="text-sm font-medium">{client.communicationFrequency || "Not specified"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Last Contact</dt>
                        <dd className="text-sm font-medium">{formatDate(client.lastContactDate)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Home Address</h3>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="mb-1">{client.homeAddress || "Address not provided"}</p>
                      <p className="text-sm">
                        {client.homeCity && <span>{client.homeCity}, </span>}
                        {client.homeState && <span>{client.homeState}, </span>}
                        {client.homePincode && <span>PIN: {client.homePincode}</span>}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Work Address</h3>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="mb-1">{client.workAddress || "Address not provided"}</p>
                      <p className="text-sm">
                        {client.workCity && <span>{client.workCity}, </span>}
                        {client.workState && <span>{client.workState}, </span>}
                        {client.workPincode && <span>PIN: {client.workPincode}</span>}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Professional Information</h3>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <p className="text-sm text-slate-500">Profession</p>
                        <p className="font-medium">{client.profession || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Designation</p>
                        <p className="font-medium">{client.designation || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Company</p>
                        <p className="font-medium">{client.companyName || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Work Experience</p>
                        <p className="font-medium">{client.workExperience ? `${client.workExperience} years` : "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Sector</p>
                        <p className="font-medium">{client.sectorOfEmployment || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Annual Income</p>
                        <p className="font-medium">{client.annualIncome || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Financial Information Collapsible Card */}
        <Collapsible 
          open={isFinancialOpen} 
          onOpenChange={setIsFinancialOpen}
          className="space-y-2"
        >
          <Card className="overflow-hidden">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Financial Profile
                  </CardTitle>
                  {isFinancialOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">AUM</p>
                    <p className="font-medium text-lg">{client.aum}</p>
                    <p className="text-xs text-slate-500">Tier: {client.tier.toUpperCase()}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">Risk Profile</p>
                    <p className="font-medium text-lg">{client.riskProfile ? client.riskProfile.charAt(0).toUpperCase() + client.riskProfile.slice(1) : "Not specified"}</p>
                    <p className="text-xs text-slate-500">Score: {client.riskAssessmentScore || "N/A"}/10</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">Performance</p>
                    <p className="font-medium text-lg">N/A</p>
                    <p className="text-xs text-slate-500">1 Year Returns</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Investment Profile</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Investment Horizon</dt>
                        <dd className="text-sm font-medium">{client.investmentHorizon || "Not specified"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Source of Wealth</dt>
                        <dd className="text-sm font-medium">{client.sourceOfWealth || "Not specified"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Net Worth</dt>
                        <dd className="text-sm font-medium">{client.netWorth || "Not specified"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Liquidity Requirements</dt>
                        <dd className="text-sm font-medium">{client.liquidityRequirements || "Not specified"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Foreign Investments</dt>
                        <dd className="text-sm font-medium">{client.foreignInvestments || "No"}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Transaction Information</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Last Transaction Date</dt>
                        <dd className="text-sm font-medium">{formatDate(client.lastTransactionDate)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Total Transactions (YTD)</dt>
                        <dd className="text-sm font-medium">{client.totalTransactionCount || "0"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Average Transaction Value</dt>
                        <dd className="text-sm font-medium">
                          {client.averageTransactionValue ? `₹${(client.averageTransactionValue/100000).toFixed(2)} L` : "N/A"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Investment Objectives</h3>
                    <div className="flex flex-wrap gap-2">
                      {client.investmentObjectives ? client.investmentObjectives.split(",").map((objective, i) => (
                        <Badge key={i} variant="outline" className="py-1">
                          {objective.trim()}
                        </Badge>
                      )) : <p className="text-sm text-slate-500">No objectives specified</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Preferred Products</h3>
                    <div className="flex flex-wrap gap-2">
                      {client.preferredProducts ? client.preferredProducts.split(",").map((product, i) => (
                        <Badge key={i} variant="outline" className="py-1">
                          {product.trim()}
                        </Badge>
                      )) : <p className="text-sm text-slate-500">No preferred products specified</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Financial Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {client.financialInterests ? client.financialInterests.split(",").map((interest, i) => (
                        <Badge key={i} variant="outline" className="py-1">
                          {interest.trim()}
                        </Badge>
                      )) : <p className="text-sm text-slate-500">No financial interests specified</p>}
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Family Information Collapsible Card */}
        <Collapsible 
          open={isFamilyOpen} 
          onOpenChange={setIsFamilyOpen}
          className="space-y-2"
        >
          <Card className="overflow-hidden">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Family Information
                  </CardTitle>
                  {isFamilyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Family Details</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Marital Status</dt>
                        <dd className="text-sm font-medium">{client.maritalStatus || "Not specified"}</dd>
                      </div>
                      {client.maritalStatus === "Married" && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-slate-500">Spouse</dt>
                          <dd className="text-sm font-medium">{client.spouseName || "Not specified"}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Dependents</dt>
                        <dd className="text-sm font-medium">{client.dependentsCount !== null ? client.dependentsCount : "Not specified"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Family Financial Goals</dt>
                        <dd className="text-sm font-medium">{client.familyFinancialGoals || "Not specified"}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Nominee Information</h3>
                    {client.nomineeDetails ? (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        {(() => {
                          const nominee = parseJsonData(client.nomineeDetails);
                          return nominee ? (
                            <>
                              <p className="font-medium">{nominee.name}</p>
                              <p className="text-sm text-slate-500">Relation: {nominee.relation}</p>
                              <p className="text-sm text-slate-500">Share: {nominee.sharePercentage}%</p>
                            </>
                          ) : <p className="text-sm text-slate-500">Nominee details not available</p>
                        })()}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No nominee information</p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Children Details</h3>
                  {client.childrenDetails ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Gender</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Age</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parseJsonData(client.childrenDetails)?.map((child: any, i: number) => (
                            <tr key={i} className="border-b">
                              <td className="px-4 py-2 text-sm">{child.name}</td>
                              <td className="px-4 py-2 text-sm">{child.gender}</td>
                              <td className="px-4 py-2 text-sm">{child.age} years</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No children details available</p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Insurance Coverage</h3>
                  {client.insuranceCoverage ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Type</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Cover Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parseJsonData(client.insuranceCoverage)?.map((insurance: any, i: number) => (
                            <tr key={i} className="border-b">
                              <td className="px-4 py-2 text-sm">{insurance.type}</td>
                              <td className="px-4 py-2 text-sm">{insurance.coverAmount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No insurance coverage details available</p>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* KYC & Compliance Collapsible Card */}
        <Collapsible 
          open={isKycOpen} 
          onOpenChange={setIsKycOpen}
          className="space-y-2"
        >
          <Card className="overflow-hidden">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    KYC & Compliance
                  </CardTitle>
                  {isKycOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">KYC Status</h3>
                  <Badge variant={getKycStatusBadge(client.kycStatus).color as any} className="flex items-center gap-1">
                    {getKycStatusBadge(client.kycStatus).icon}
                    {client.kycStatus || "Unknown"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">KYC Details</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">KYC Date</dt>
                        <dd className="text-sm font-medium">{formatDate(client.kycDate)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">PAN Number</dt>
                        <dd className="text-sm font-medium">{client.panNumber || "Not available"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Tax Residency Status</dt>
                        <dd className="text-sm font-medium">{client.taxResidencyStatus || "Not specified"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">FATCA Status</dt>
                        <dd className="text-sm font-medium">{client.fatcaStatus || "Not specified"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-slate-500">Risk Assessment Score</dt>
                        <dd className="text-sm font-medium">{client.riskAssessmentScore ? `${client.riskAssessmentScore}/10` : "Not assessed"}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Identity Proof</h3>
                    <div className="bg-slate-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-slate-500">Document Type</p>
                      <p className="font-medium">{client.identityProofType || "Not available"}</p>
                      <p className="text-sm font-medium mt-2">{client.identityProofNumber || "Document number not available"}</p>
                    </div>
                    
                    <h3 className="font-medium mb-3">Address Proof</h3>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-500">Document Type</p>
                      <p className="font-medium">{client.addressProofType || "Not available"}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Tax Planning</h3>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">Tax Planning Preferences</p>
                    <p className="font-medium">{client.taxPlanningPreferences || "Not specified"}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Retirement Planning</h3>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">Retirement Goals</p>
                    <p className="font-medium">{client.retirementGoals || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
}