import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Users, 
  TrendingUp,
  Target,
  Award,
  Clock,
  Building
} from "lucide-react";
// Avatar will use fallback initials

interface BusinessMetrics {
  totalAum: number;
  totalClients: string;
  revenueMonthToDate: number;
  pipelineValue: number;
  platinumClients: string;
  goldClients: string;
  silverClients: string;
}

interface Incentives {
  earned: number;
  projected: number;
}

export default function Profile() {
  const { user } = useAuth();
  
  // Set page title
  useEffect(() => {
    document.title = "My Profile | Intellect WealthForce";
  }, []);

  // Fetch user performance metrics
  const { data: performanceMetrics } = useQuery({
    queryKey: ['/api/performance-metrics'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch business metrics for user context
  const { data: businessMetrics } = useQuery<BusinessMetrics>({
    queryKey: ['/api/business-metrics/1'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user incentives
  const { data: incentives } = useQuery<Incentives>({
    queryKey: ['/api/performance/incentives/1'],
    staleTime: 5 * 60 * 1000,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Unable to load profile information. Please try logging in again.</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="animate-in slide-in-from-top-4 duration-500">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Profile</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            View your profile information and performance metrics
          </p>
        </div>

        {/* Profile Header Card */}
        <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Image */}
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarFallback className="text-xl font-semibold">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              
              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-foreground">{user.fullName}</h2>
                <p className="text-lg text-muted-foreground mb-2">Relationship Manager</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
                    Wealth Management
                  </Badge>
                  <Badge variant="outline">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card className="animate-in slide-in-from-left-4 duration-700 delay-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
              <CardDescription>Your professional contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Ujjivan Small Finance Bank</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Mumbai, Maharashtra</span>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card className="animate-in slide-in-from-right-4 duration-700 delay-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Professional Details
              </CardTitle>
              <CardDescription>Your role and responsibilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Employee ID</span>
                  <span className="text-sm font-medium">WM{user.id?.toString().padStart(4, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Department</span>
                  <span className="text-sm font-medium">Wealth Management</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Designation</span>
                  <span className="text-sm font-medium">Relationship Manager</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Join Date</span>
                  <span className="text-sm font-medium">March 2022</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Experience</span>
                  <span className="text-sm font-medium">3+ Years</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        {businessMetrics && (
          <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Current Performance
              </CardTitle>
              <CardDescription>Your key business metrics and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{businessMetrics?.totalClients || '0'}</div>
                  <div className="text-sm text-muted-foreground">Total Clients</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    ₹{businessMetrics?.totalAum ? (businessMetrics.totalAum / 10000000).toFixed(1) : '0.0'} Cr
                  </div>
                  <div className="text-sm text-muted-foreground">Assets Under Management</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    ₹{businessMetrics?.revenueMonthToDate ? (businessMetrics.revenueMonthToDate / 100000).toFixed(1) : '0.0'} L
                  </div>
                  <div className="text-sm text-muted-foreground">Revenue MTD</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    ₹{businessMetrics?.pipelineValue ? (businessMetrics.pipelineValue / 10000000).toFixed(1) : '0.0'} Cr
                  </div>
                  <div className="text-sm text-muted-foreground">Pipeline Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Client Portfolio Breakdown */}
        {businessMetrics && (
          <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Client Portfolio Breakdown
              </CardTitle>
              <CardDescription>Distribution of clients by tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                        {businessMetrics?.platinumClients || '0'}
                      </div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">Platinum Clients</div>
                    </div>
                    <Award className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {businessMetrics?.goldClients || '0'}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">Gold Clients</div>
                    </div>
                    <Award className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                        {businessMetrics?.silverClients || '0'}
                      </div>
                      <div className="text-sm text-orange-700 dark:text-orange-300">Silver Clients</div>
                    </div>
                    <Award className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Incentives Information */}
        {incentives && (
          <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Incentive Tracking
              </CardTitle>
              <CardDescription>Your current incentive status and projections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Earned This Month</span>
                    <span className="text-lg font-semibold text-green-600">
                      ₹{incentives?.earned?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: incentives?.projected && incentives?.earned ? `${Math.min((incentives.earned / incentives.projected) * 100, 100)}%` : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Projected This Month</span>
                    <span className="text-lg font-semibold text-blue-600">
                      ₹{incentives?.projected?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {incentives?.projected && incentives?.earned 
                      ? `${((incentives.earned / incentives.projected) * 100).toFixed(1)}% of monthly target achieved`
                      : 'Target data unavailable'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-700">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => window.location.hash = '/clients'}
              >
                <Users className="h-4 w-4" />
                View Clients
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => window.location.hash = '/prospects'}
              >
                <TrendingUp className="h-4 w-4" />
                Prospects
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => window.location.hash = '/calendar'}
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => window.location.hash = '/tasks'}
              >
                <Clock className="h-4 w-4" />
                Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}