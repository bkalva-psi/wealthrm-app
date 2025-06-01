import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function ProspectDetail() {
  // Extract prospect ID from the hash
  const [prospectId, setProspectId] = useState<number | null>(null);
  
  useEffect(() => {
    const path = window.location.hash.replace(/^#/, '');
    const matches = path.match(/\/prospects\/(\d+)/);
    if (matches && matches[1]) {
      setProspectId(parseInt(matches[1]));
    }
  }, []);

  // Set page title
  useEffect(() => {
    document.title = "Prospect Details | Wealth RM";
  }, []);

  // Fetch prospect data
  const { data: prospect, isLoading, error } = useQuery({
    queryKey: ['/api/prospects', prospectId],
    queryFn: async () => {
      if (!prospectId) throw new Error("No prospect ID provided");
      const response = await fetch(`/api/prospects/${prospectId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch prospect details");
      }
      return response.json();
    },
    enabled: prospectId !== null,
  });

  // Navigate back to prospects page
  const handleBackClick = () => {
    window.location.hash = "/prospects";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">Prospect Details</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !prospect) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">Prospect Details</h1>
        </div>
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Could not find prospect details. The prospect may have been deleted or you may not have permission to view it.</p>
              <Button 
                className="mt-4" 
                onClick={handleBackClick}
              >
                Return to Prospects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={handleBackClick}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Prospect Details</h1>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-lg">
              {prospect.initials || (prospect.fullName ? prospect.fullName.substring(0, 2).toUpperCase() : 'PR')}
            </div>
            <div>
              <CardTitle className="text-xl">{prospect.fullName}</CardTitle>
              <p className="text-sm text-muted-foreground">{prospect.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{prospect.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{prospect.email}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Potential Value</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Potential AUM</p>
                  <p className="text-sm font-medium">{prospect.potentialAum || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Probability Score</p>
                  <p className="text-sm font-medium">{prospect.probabilityScore}%</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Sales Pipeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Current Stage</p>
                  <p className="text-sm font-medium capitalize">{prospect.stage}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Contact</p>
                  <p className="text-sm font-medium">
                    {prospect.lastContactDate 
                      ? formatRelativeDate(prospect.lastContactDate) 
                      : "Not contacted yet"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Products & Source</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Products of Interest</p>
                  <p className="text-sm font-medium">{prospect.productsOfInterest || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="text-sm font-medium capitalize">{prospect.source || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Notes</h3>
            <div className="bg-slate-50 p-3 rounded-md">
              <p className="text-sm">{prospect.notes || "No notes added yet."}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row gap-3 justify-end">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none"
              onClick={handleBackClick}
            >
              Return to Prospects
            </Button>
            <Button 
              className="flex-1 sm:flex-none"
              onClick={() => {
                // In a real app, you would have an edit route
                alert("Edit functionality would be implemented here");
              }}
            >
              Edit Prospect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}