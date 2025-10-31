import { useState, useEffect } from "react";
import { CACHE_KEYS, clearCache } from "@/lib/offlineCache";
import { PersonalInfoForm } from "@/components/forms/personal-info-form";
import { ArrowLeft, UserPlus, CheckCircle, X as CloseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PersonalInfoFormData {
  fullName: string;
  initials: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  anniversaryDate: string;
  preferredContactMethod: string;
  preferredContactTime: string;
  communicationFrequency: string;
  homeAddress: string;
  homeCity: string;
  homeState: string;
  homePincode: string;
  workAddress: string;
  workCity: string;
  workState: string;
  workPincode: string;
  profession: string;
  sectorOfEmployment: string;
  designation: string;
  companyName: string;
  annualIncome: string;
  workExperience: string;
}

export default function AddClientPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<Partial<PersonalInfoFormData> | null>(null);
  const [nextClient, setNextClient] = useState<{ id: number; name: string } | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);

  useEffect(() => {
    document.title = "Add New Client | Wealth Management System";
    const storedDraft = sessionStorage.getItem("clientDraftId");
    if (storedDraft) {
      setDraftId(storedDraft);
      fetch(`/api/client-drafts/${storedDraft}`, { credentials: "include" })
        .then(async (r) => { if (!r.ok) return; const d = await r.json(); if (d?.data) setInitialValues(d.data); })
        .catch(() => {});
    }
  }, []);

  const handleSaveDraft = async (formData: PersonalInfoFormData) => {
    try {
      const response = await fetch("/api/client-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ draftId, data: formData })
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to save draft");
      }
      const result = await response.json();
      if (result.draftId) {
        setDraftId(result.draftId);
        sessionStorage.setItem("clientDraftId", result.draftId);
      }
      setShowDraftModal(true);
    } catch (e) {
      toast({ title: "Draft save failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    }
  };

  const handleSubmit = async (formData: PersonalInfoFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add client");
      }
      const result = await response.json();
      toast({ title: "Saved", description: `Client ${result.client.fullName} created successfully.` });
      // Clear cached clients so the list refetches from the DB
      try { clearCache(CACHE_KEYS.CLIENTS); } catch {}
      if (draftId) sessionStorage.removeItem("clientDraftId");
      sessionStorage.setItem("newClientId", result.client.id.toString());
      sessionStorage.setItem("newClientName", result.client.fullName);
      setNextClient({ id: result.client.id, name: result.client.fullName });
    } catch (error) {
      console.error("Error adding client:", error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to add client", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => { window.location.hash = "/clients"; };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Clients
            </Button>
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-primary" />
              Add New Client
            </h1>
            <p className="text-muted-foreground mt-2">Create a new client profile by filling in their personal information.</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">1</div>
            <span className="font-medium text-primary">Personal Information</span>
          </div>
          <div className="flex-1 h-px bg-border"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">2</div>
            <span className="text-muted-foreground">Financial Profile</span>
          </div>
          <div className="flex-1 h-px bg-border"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">3</div>
            <span className="text-muted-foreground">Family Information</span>
          </div>
          <div className="flex-1 h-px bg-border"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">4</div>
            <span className="text-muted-foreground">KYC & Compliance</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {nextClient && (
          <div className="mb-4">
            <Card className="border-primary/30">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Client {nextClient.name} created successfully.</p>
                    <p className="text-sm text-muted-foreground">Choose what you want to do next.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => window.location.hash = `/clients/${nextClient.id}/financial-profile`}>Open Client Profiling</Button>
                  <Button variant="outline" onClick={() => window.location.hash = `/clients/${nextClient.id}/personal`}>Go to Personal Profile</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Draft success modal */}
        {showDraftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
              <CardHeader className="flex items-center justify-between py-3 px-4">
                <CardTitle className="text-lg">Draft saved</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowDraftModal(false)}>
                  <CloseIcon className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-sm text-muted-foreground mb-4">You can continue later or proceed to create the client’s Financial Profile now.</p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDraftModal(false)}>Close</Button>
                  {draftId && (
                    <Button onClick={() => { setShowDraftModal(false); /* open financial profile creation flow */ window.location.hash = "/clients/add"; }}>Continue Later</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonalInfoForm onSubmit={handleSubmit} onSaveDraft={handleSaveDraft} initialValues={initialValues || undefined} isLoading={isLoading} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
