import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, Briefcase, Home, Building, 
  CreditCard, Shield, Users, Wallet, BarChart4, MessageCircle, Clock, Heart,
  FileText, CheckCircle, XCircle, AlertCircle, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { clientApi } from "@/lib/api";
import { generateAvatar, svgToDataURL } from "@/lib/avatarGenerator";
import { getTierColor } from "@/lib/utils";

export default function ClientPersonalPage() {
  const [clientId, setClientId] = useState<number | null>(null);
  
  // Set page title
  useEffect(() => {
    document.title = "Client Information | Wealth RM";
    
    // Get client ID from URL - handle both direct client click and section click
    const hash = window.location.hash;
    let match = hash.match(/\/clients\/(\d+)\/personal/);
    
    // If not found with /personal, try just /clients/id
    if (!match) {
      match = hash.match(/\/clients\/(\d+)/);
    }
    
    if (match && match[1]) {
      setClientId(Number(match[1]));
    }
  }, []);
  
  // Fetch client data
  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientId ? clientApi.getClient(clientId) : null,
    enabled: !!clientId,
  });
  
  const handleBackClick = () => {
    window.location.hash = "/clients";
  };
  
  // Format dates for display
  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate relationship duration
  const calculateDuration = (startDate?: string | Date | null) => {
    if (!startDate) return "N/A";
    
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
  };

  // Parse JSON data
  const parseJsonData = (jsonString?: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return null;
    }
  };

  // Get KYC status badge color
  const getKycStatusBadge = (status?: string | null) => {
    if (!status) return { color: "default", icon: <AlertCircle className="h-3 w-3" /> };
    
    switch (status.toLowerCase()) {
      case 'verified':
        return { color: "success", icon: <CheckCircle className="h-3 w-3" /> };
      case 'pending':
        return { color: "warning", icon: <Clock className="h-3 w-3" /> };
      case 'expired':
        return { color: "destructive", icon: <XCircle className="h-3 w-3" /> };
      default:
        return { color: "default", icon: <AlertCircle className="h-3 w-3" /> };
    }
  };
  
  if (!clientId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Client not found</h1>
        <Button onClick={handleBackClick}>Back to Clients</Button>
      </div>
    );
  }
  
  return (
    <div>
      {/* New Consistent Header */}
      <div className={`bg-white border rounded-lg p-4 mb-6 shadow-sm border-l-4 ${client ? getTierColor(client.tier).border.replace('border-', 'border-l-') : 'border-l-slate-300'}`}>
        <div className="flex items-center justify-between">
          {/* Left side - Back arrow and client info */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackClick}
              className="mr-4 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div>
              {isLoading ? (
                <div className="space-y-1">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  {/* Line 1: Client Name */}
                  <button 
                    onClick={() => window.location.hash = `/clients/${clientId}/personal`}
                    className="text-xl font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {client?.fullName}
                  </button>
                  
                  {/* Line 2: Phone Number */}
                  {client?.phone && (
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <a 
                        href={`tel:${client.phone}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        title="Call client"
                      >
                        {client.phone}
                      </a>
                    </div>
                  )}
                  
                  {/* Line 3: Email */}
                  {client?.email && (
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <a 
                        href={`mailto:${client.email}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        title="Send email to client"
                      >
                        {client.email}
                      </a>
                    </div>
                  )}
                  
                  {/* Line 4: Navigation Icons */}
                  <div className="flex items-center gap-4 mt-2">
                    <button 
                      onClick={() => window.location.hash = `/clients/${clientId}/portfolio`}
                      className="p-1 hover:bg-slate-100 rounded"
                      title="Portfolio"
                    >
                      <BarChart4 className="h-5 w-5 text-slate-600" />
                    </button>
                    <button 
                      onClick={() => window.location.hash = `/clients/${clientId}/transactions`}
                      className="p-1 hover:bg-slate-100 rounded"
                      title="Transactions"
                    >
                      <Wallet className="h-5 w-5 text-slate-600" />
                    </button>
                    <button 
                      onClick={() => window.location.hash = `/clients/${clientId}/appointments`}
                      className="p-1 hover:bg-slate-100 rounded"
                      title="Appointments"
                    >
                      <Calendar className="h-5 w-5 text-slate-600" />
                    </button>
                    <button 
                      onClick={() => window.location.hash = `/clients/${clientId}/communications`}
                      className="p-1 hover:bg-slate-100 rounded"
                      title="Communications"
                    >
                      <MessageCircle className="h-5 w-5 text-slate-600" />
                    </button>
                    <button 
                      className="p-1 hover:bg-slate-100 rounded"
                      title="Portfolio Report"
                    >
                      <FileText className="h-5 w-5 text-slate-600" />
                    </button>
                    <button 
                      className="p-1 hover:bg-slate-100 rounded"
                      title="Investment Recommendations"
                    >
                      <Target className="h-5 w-5 text-slate-600" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>


        </div>
      </div>

      {/* Page Description */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personal Profile</h2>
        </div>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : client ? (
          <>
            {/* Client Summary Card */}
            <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-center gap-4 md:w-1/2">
                  {/* Smaller Avatar */}
                  <div className="h-20 w-20 flex-shrink-0">
                    <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                      <AvatarImage 
                        src={svgToDataURL(generateAvatar(client.fullName, client.tier))} 
                        alt={client.fullName} 
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xl">{client.initials}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Name and Category */}
                  <div className="flex-1">
                    <h2 className="text-xl font-medium">{client.fullName}</h2>
                    <Badge className="mt-1" variant="outline">{client.tier.toUpperCase()} Tier Client</Badge>
                    
                    {/* KYC and AUM in compact layout */}
                    <div className="flex gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span className="text-sm text-slate-600">KYC {client.kycStatus || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wallet className="h-3 w-3 text-orange-500" />
                        <span className="text-sm font-medium text-orange-600">{client.aum}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Client Since</p>
                        <p>{formatDate(client.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Relationship Duration</p>
                        <p>{calculateDuration(client.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Home City</p>
                        <p>{client.homeCity || "Not provided"}, {client.homeState || ""}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Date of Birth</p>
                        <p>{formatDate(client.dateOfBirth)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Profession</p>
                        <p>{client.profession || "Not provided"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Company</p>
                        <p>{client.companyName || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="personal" className="mb-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="family">Family</TabsTrigger>
              <TabsTrigger value="kyc">KYC & Compliance</TabsTrigger>
            </TabsList>
            
            {/* Personal Information Tab */}
            <TabsContent value="personal" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-medium flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">Basic Details</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-slate-500">Full Name</dt>
                          <dd className="text-sm font-medium">{client.fullName}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-slate-500">Date of Birth</dt>
                          <dd className="text-sm font-medium">{formatDate(client.dateOfBirth)}</dd>
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
                        <div className="flex justify-between">
                          <dt className="text-sm text-slate-500">Client Since</dt>
                          <dd className="text-sm font-medium">{formatDate(client.clientSince) || formatDate(client.createdAt)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-slate-500">Acquisition Source</dt>
                          <dd className="text-sm font-medium">{client.clientAcquisitionSource || "Direct"}</dd>
                        </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-500">Profession</p>
                        <p className="font-medium">{client.profession || "Not specified"}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-500">Designation</p>
                        <p className="font-medium">{client.designation || "Not specified"}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-500">Work Experience</p>
                        <p className="font-medium">{client.workExperience ? `${client.workExperience} years` : "Not specified"}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-500">Company</p>
                        <p className="font-medium">{client.companyName || "Not specified"}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-500">Sector</p>
                        <p className="font-medium">{client.sectorOfEmployment || "Not specified"}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-500">Annual Income</p>
                        <p className="font-medium">{client.annualIncome || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Financial Information Tab */}
            <TabsContent value="financial" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-medium flex items-center gap-2">
                    <BarChart4 className="h-5 w-5" />
                    Financial Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
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
                      <p className="text-sm text-slate-500">Yearly Performance</p>
                      <p className={`font-medium text-lg ${(client.yearlyPerformance && client.yearlyPerformance > 0) ? 'text-green-600' : 'text-red-600'}`}>
                        {client.yearlyPerformance ? `${client.yearlyPerformance > 0 ? '+' : ''}${client.yearlyPerformance.toFixed(2)}%` : "N/A"}
                      </p>
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
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-3">Recurring Investments</h3>
                    {client.recurringInvestments ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Type</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Amount</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Frequency</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parseJsonData(client.recurringInvestments)?.map((investment: any, i: number) => (
                              <tr key={i} className="border-b">
                                <td className="px-4 py-2 text-sm">{investment.type}</td>
                                <td className="px-4 py-2 text-sm">{investment.amount}</td>
                                <td className="px-4 py-2 text-sm">{investment.frequency}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No recurring investments</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Major Life Events Planning</h3>
                    {client.majorLifeEvents ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Event</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Timeframe</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parseJsonData(client.majorLifeEvents)?.map((event: any, i: number) => (
                              <tr key={i} className="border-b">
                                <td className="px-4 py-2 text-sm">{event.event}</td>
                                <td className="px-4 py-2 text-sm">{event.timeframe}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No major life events planned</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Family Information Tab */}
            <TabsContent value="family" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-medium flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Family Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
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
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* KYC & Compliance Tab */}
            <TabsContent value="kyc" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-medium flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    KYC & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <p>Could not load client information.</p>
        </div>
      )}
      </div>
    </div>
  );
}